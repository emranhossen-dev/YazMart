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
        status: "ACTIVE",
        colors: {
          primary: "#18181b", // zinc-900 default
          secondary: "#71717a",
          cardBg: "#ffffff",
          background: "#fafafa"
        }
      },
    });

    // Make sure user profile is updated to represent "seller" role if not already
    const profile = await prisma.profiles.findUnique({
      where: { id: data.ownerId }
    });
    if (profile) {
      let sellerRole = await prisma.roles.findUnique({ where: { name: "seller" } });
      if (!sellerRole) {
        sellerRole = await prisma.roles.create({ data: { name: "seller" } });
      }
      await prisma.profiles.update({
        where: { id: data.ownerId },
        data: { role_id: sellerRole.id }
      });
    }

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

// 4. Get seller orders list (SubOrders)
export async function getSellerOrders(storeId: string) {
  try {
    const orders = await prisma.subOrder.findMany({
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

    return {
      orders: orders.map(o => ({
        ...o,
        total_amount: Number(o.total_amount),
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      })),
      error: null
    };
  } catch (error: any) {
    console.error("❌ GET SELLER ORDERS ERROR:", error);
    return { orders: [], error: error.message };
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
