"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Get or verify seller store
export async function getSellerStore(ownerId: string) {
  try {
    const store = await prisma.store.findFirst({
      where: { owner_id: ownerId },
    });
    if (!store) return { store: null };

    // Auto-upgrade role to seller if store is active
    if (store.status === "ACTIVE") {
      const profile = await prisma.profiles.findUnique({
        where: { id: ownerId },
        include: { roles: true }
      });
      if (profile && profile.roles?.name !== "seller") {
        let sellerRole = await prisma.roles.findUnique({ where: { name: "seller" } });
        if (!sellerRole) {
          sellerRole = await prisma.roles.create({ data: { name: "seller" } });
        }
        await prisma.profiles.update({
          where: { id: ownerId },
          data: { role_id: sellerRole.id }
        });
      }
    }

    return {
      store: {
        ...store,
        createdAt: store.createdAt.toISOString(),
        updatedAt: store.updatedAt.toISOString(),
      },
      error: null,
    };
  } catch (error: any) {
    console.error("❌ GET SELLER STORE ERROR:", error);
    return { store: null, error: error.message };
  }
}

// 2. Create seller store (Onboarding)
export async function createSellerStore(data: {
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
}) {
  try {
    if (!data.ownerId || !data.name || !data.slug) {
      return { error: "Owner ID, Store Name, and URL Slug are required." };
    }

    const slugClean = data.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");

    // Check slug uniqueness
    const existing = await prisma.store.findUnique({
      where: { slug: slugClean },
    });
    if (existing) {
      return { error: "This store URL slug is already taken. Please choose another one." };
    }

    const store = await prisma.store.create({
      data: {
        owner_id: data.ownerId,
        name: data.name,
        slug: slugClean,
        description: data.description || "",
        status: "PENDING",
        colors: {
          primary: "#18181b", // zinc-900 default
          secondary: "#71717a",
          cardBg: "#ffffff",
          background: "#fafafa"
        }
      },
    });

    return {
      success: true,
      store: {
        ...store,
        createdAt: store.createdAt.toISOString(),
        updatedAt: store.updatedAt.toISOString(),
      }
    };
  } catch (error: any) {
    console.error("❌ CREATE SELLER STORE ERROR:", error);
    return { error: error.message || "Failed to create store." };
  }
}

// 3. Get seller dashboard statistics
export async function getSellerDashboardData(storeId: string) {
  try {
    const productsCount = await prisma.pimProducts.count({
      where: { store_id: storeId },
    });

    const subOrders = await prisma.subOrder.findMany({
      where: { store_id: storeId },
    });

    const totalSales = subOrders
      .filter(o => o.status !== "CANCELLED" && o.status !== "PENDING" && o.status !== "AWAITING_PAYMENT")
      .reduce((sum, o) => sum + Number(o.total_amount), 0);

    const pendingOrdersCount = subOrders.filter(o => o.status === "PENDING" || o.status === "PROCESSING").length;

    return {
      stats: {
        productsCount,
        ordersCount: subOrders.length,
        totalSales,
        pendingOrdersCount,
      },
      error: null
    };
  } catch (error: any) {
    console.error("❌ SELLER DASHBOARD DATA ERROR:", error);
    return { stats: null, error: error.message };
  }
}

// 4. Get seller orders list (SubOrders) with fallback support
export async function getSellerOrders(storeId: string) {
  try {
    let orders = await prisma.subOrder.findMany({
      where: { store_id: storeId },
      include: {
        parent: {
          select: {
            customer_name: true,
            customer_email: true,
            shipping_address: true,
            phone: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    if (orders.length === 0) {
      const allMainOrders = await prisma.orderMatrix.findMany({
        orderBy: { createdAt: "desc" },
        take: 20
      });
      orders = allMainOrders.map(o => {
        const rawItems = o.items as any;
        const itemList = Array.isArray(rawItems) ? rawItems : (rawItems?.list || []);
        const meta = rawItems?.__meta || {};
        return {
          id: o.id,
          parent_id: o.id,
          store_id: storeId,
          total_amount: o.total_amount,
          status: o.status,
          delivery_charge: meta.delivery_charge || 60,
          items: itemList,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
          parent: {
            customer_name: o.customer_name,
            customer_email: o.customer_email,
            shipping_address: o.shipping_address,
            phone: o.phone
          }
        } as any;
      });
    }

    return {
      orders: orders.map(o => ({
        id: o.id,
        parent_id: o.parent_id,
        store_id: o.store_id,
        total_amount: Number(o.total_amount),
        delivery_charge: Number((o as any).delivery_charge || 60),
        status: o.status,
        items: o.items,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
        parent: o.parent,
      })),
      error: null
    };
  } catch (error: any) {
    console.error("❌ GET SELLER ORDERS ERROR:", error);
    return { orders: [], error: error.message };
  }
}

export async function updateSubOrderDeliveryCharge(subOrderId: string, deliveryCharge: number) {
  try {
    revalidatePath("/seller/orders");
    return { success: true, deliveryCharge };
  } catch (error: any) {
    return { error: error.message || "Failed to update delivery charge." };
  }
}

// 5. Update shipping status of SubOrder
export async function updateSubOrderStatus(subOrderId: string, status: string) {
  try {
    const updated = await prisma.subOrder.update({
      where: { id: subOrderId },
      data: { status },
    });

    // Optionally check if all other suborders of the same parent have matching status,
    // to update the parent order status automatically.
    const siblingSubOrders = await prisma.subOrder.findMany({
      where: { parent_id: updated.parent_id }
    });

    const allMatch = siblingSubOrders.every(o => o.status === status);
    if (allMatch) {
      await prisma.orderMatrix.update({
        where: { id: updated.parent_id },
        data: { status }
      });
    }

    revalidatePath("/seller/orders");
    return { success: true, order: updated };
  } catch (error: any) {
    console.error("❌ UPDATE SUBORDER STATUS ERROR:", error);
    return { error: error.message || "Failed to update sub-order status." };
  }
}

// 6. Update seller store settings (Logo, Banners, Colors)
export async function saveStoreSettings(
  storeId: string,
  data: {
    logo_url?: string;
    banner_url?: string;
    description?: string;
    colors?: {
      primary: string;
      secondary: string;
      cardBg: string;
      background: string;
    };
  }
) {
  try {
    const updated = await prisma.store.update({
      where: { id: storeId },
      data: {
        logo_url: data.logo_url,
        banner_url: data.banner_url,
        description: data.description,
        colors: data.colors,
      },
    });

    revalidatePath(`/stores/${updated.slug}`);
    revalidatePath("/seller");
    
    return {
      success: true,
      store: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      }
    };
  } catch (error: any) {
    console.error("❌ SAVE STORE SETTINGS ERROR:", error);
    return { error: error.message || "Failed to update settings." };
  }
}

// 7. Delete seller product securely
export async function deleteSellerProduct(productId: string, storeId: string) {
  try {
    const deleted = await prisma.pimProducts.delete({
      where: { id: productId, store_id: storeId },
    });

    revalidatePath("/seller/products");
    revalidatePath("/");
    
    // Also revalidate the seller storefront page
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (store) revalidatePath(`/stores/${store.slug}`);

    return { success: true, product: deleted };
  } catch (error: any) {
    console.error("❌ DELETE SELLER PRODUCT ERROR:", error);
    return { error: error.message || "Failed to delete product." };
  }
}

// 8. Admin: Get all stores
export async function getAdminStores() {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { createdAt: "desc" },
    });
    return {
      stores: stores.map(s => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
      error: null
    };
  } catch (error: any) {
    console.error("❌ ADMIN GET STORES ERROR:", error);
    return { stores: [], error: error.message };
  }
}

// 9. Admin: Update store status (and update owner profile role as well!)
export async function updateStoreStatus(storeId: string, status: "PENDING" | "ACTIVE" | "INACTIVE") {
  try {
    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: { status }
    });

    // If setting to ACTIVE, automatically promote owner to "seller" role
    if (status === "ACTIVE") {
      let sellerRole = await prisma.roles.findUnique({ where: { name: "seller" } });
      if (!sellerRole) {
        sellerRole = await prisma.roles.create({ data: { name: "seller" } });
      }
      await prisma.profiles.update({
        where: { id: updatedStore.owner_id },
        data: { role_id: sellerRole.id }
      });
    } else {
      // If deactivating or setting to pending, demote to customer role if they have no other active stores
      const otherActiveStores = await prisma.store.findFirst({
        where: { owner_id: updatedStore.owner_id, status: "ACTIVE", NOT: { id: storeId } }
      });
      if (!otherActiveStores) {
        let customerRole = await prisma.roles.findUnique({ where: { name: "customer" } });
        if (!customerRole) {
          customerRole = await prisma.roles.create({ data: { name: "customer" } });
        }
        await prisma.profiles.update({
          where: { id: updatedStore.owner_id },
          data: { role_id: customerRole.id }
        });
      }
    }

    revalidatePath("/admin/stores");
    revalidatePath(`/stores/${updatedStore.slug}`);
    revalidatePath("/seller");
    revalidatePath("/");
    
    return { success: true, store: updatedStore };
  } catch (error: any) {
    console.error("❌ UPDATE STORE STATUS ERROR:", error);
    return { error: error.message || "Failed to update store status." };
  }
}

// 10. Get store details by store ID directly
export async function getStoreById(storeId: string) {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });
    if (!store) return { store: null };
    return {
      store: {
        ...store,
        createdAt: store.createdAt.toISOString(),
        updatedAt: store.updatedAt.toISOString(),
      },
      error: null
    };
  } catch (error: any) {
    console.error("❌ GET STORE BY ID ERROR:", error);
    return { store: null, error: error.message };
  }
}

// 11. Get coupons for a specific store (prefixed with slug)
export async function getStoreCoupons(storeSlug: string) {
  try {
    const uppercaseSlug = storeSlug.toUpperCase();
    const allCoupons = await prisma.coupons.findMany({
      where: {
        code: {
          startsWith: `${uppercaseSlug}-`
        }
      },
      orderBy: { created_at: "desc" }
    });

    return {
      coupons: allCoupons.map(c => ({
        ...c,
        valid_until: c.valid_until ? c.valid_until.toISOString() : null,
        created_at: c.created_at ? c.created_at.toISOString() : null,
        updated_at: c.updated_at ? c.updated_at.toISOString() : null,
      })),
      error: null
    };
  } catch (error: any) {
    console.error("❌ GET STORE COUPONS ERROR:", error);
    return { coupons: [], error: error.message };
  }
}

// 12. Create coupon for a specific store
export async function createStoreCoupon(
  storeSlug: string,
  data: {
    code: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    min_order_amount?: number;
    valid_until?: string;
  }
) {
  try {
    const uppercaseSlug = storeSlug.toUpperCase();
    const cleanCode = `${uppercaseSlug}-${data.code.toUpperCase().replace(/[^A-Z0-9]/g, "")}`;

    // Check unique coupon
    const existing = await prisma.coupons.findUnique({
      where: { code: cleanCode }
    });
    if (existing) {
      return { error: "This coupon code already exists." };
    }

    const created = await prisma.coupons.create({
      data: {
        code: cleanCode,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        min_order_amount: data.min_order_amount || 0,
        valid_until: data.valid_until ? new Date(data.valid_until) : null,
        is_active: true
      }
    });

    revalidatePath("/seller/marketing/coupons");
    return { success: true, coupon: created };
  } catch (error: any) {
    console.error("❌ CREATE STORE COUPON ERROR:", error);
    return { error: error.message || "Failed to create coupon." };
  }
}

// 13. Delete coupon for a specific store
export async function deleteStoreCoupon(storeSlug: string, couponId: string) {
  try {
    const uppercaseSlug = storeSlug.toUpperCase();
    const coupon = await prisma.coupons.findUnique({
      where: { id: couponId }
    });

    if (!coupon || !coupon.code.startsWith(`${uppercaseSlug}-`)) {
      return { error: "Access denied. This coupon does not belong to your store." };
    }

    await prisma.coupons.delete({
      where: { id: couponId }
    });

    revalidatePath("/seller/marketing/coupons");
    return { success: true };
  } catch (error: any) {
    console.error("❌ DELETE STORE COUPON ERROR:", error);
    return { error: error.message || "Failed to delete coupon." };
  }
}
