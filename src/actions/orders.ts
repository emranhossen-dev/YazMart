"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOrder(data: {
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  phone: string;
  total_amount: number;
  payment_method?: string;
  delivery_charge?: number;
  items: any[];
}) {
  try {
    if (!data.customer_name || !data.customer_email || !data.shipping_address || !data.phone || !data.items || data.items.length === 0) {
      return { error: "Missing required fields or items list is empty." };
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.orderMatrix.create({
        data: {
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          shipping_address: data.shipping_address,
          phone: data.phone,
          total_amount: data.total_amount,
          // Store payment metadata inside items JSON blob
          items: {
            __meta: {
              payment_method: data.payment_method || "COD",
              delivery_charge: data.delivery_charge || 0,
            },
            list: data.items,
          },
          status: data.payment_method === "ONLINE" ? "AWAITING_PAYMENT" : "PENDING",
        },
      });

      // Group items by store_id and decrement stock
      const storeItemsMap = new Map<string | null, any[]>();

      for (const item of data.items) {
        if (item.id) {
          const product = await tx.pimProducts.findUnique({ where: { id: item.id } });
          if (product) {
            const newStock = Math.max(0, Number(product.current_stock) - Number(item.quantity));
            await tx.pimProducts.update({
              where: { id: item.id },
              data: {
                current_stock: newStock,
                stock_status: newStock > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
              },
            });

            const storeId = product.store_id || null;
            if (!storeItemsMap.has(storeId)) {
              storeItemsMap.set(storeId, []);
            }
            storeItemsMap.get(storeId)!.push({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              sku: product.sku,
            });
          }
        }
      }

      // Create SubOrders for each store
      for (const [storeId, itemsList] of storeItemsMap.entries()) {
        if (storeId) {
          const subTotal = itemsList.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          await tx.subOrder.create({
            data: {
              parent_id: order.id,
              store_id: storeId,
              total_amount: subTotal,
              status: order.status,
              items: itemsList,
            },
          });
        }
      }

      return order;
    });

    revalidatePath("/admin/products");
    return { success: true, orderId: result.id };
  } catch (error: any) {
    console.error("❌ CREATE ORDER ERROR:", error);
    return { error: `Failed to place order: ${error?.message || "Internal database error."}` };
  }
}

export async function submitOnlinePayment(orderId: string, trxId: string) {
  try {
    if (!orderId || !trxId) {
      return { error: "Order ID and Transaction ID are required." };
    }

    const order = await prisma.orderMatrix.findUnique({ where: { id: orderId } });
    if (!order) return { error: "Order not found." };

    const existingItems = order.items as any;
    const updatedItems = {
      ...existingItems,
      __meta: {
        ...(existingItems?.__meta || {}),
        trx_id: trxId,
        payment_verified_at: new Date().toISOString(),
      },
    };

    await prisma.$transaction(async (tx) => {
      await tx.orderMatrix.update({
        where: { id: orderId },
        data: {
          items: updatedItems,
          status: "PAYMENT_RECEIVED",
        },
      });

      await tx.subOrder.updateMany({
        where: { parent_id: orderId },
        data: {
          status: "PAYMENT_RECEIVED",
        },
      });
    });

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    console.error("❌ SUBMIT PAYMENT ERROR:", error);
    return { error: `Failed to submit payment: ${error?.message || "Internal error."}` };
  }
}

export async function getOrders() {
  try {
    const orders = await prisma.orderMatrix.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { orders: orders.map(o => ({ ...o, total_amount: Number(o.total_amount) })) };
  } catch (error) {
    console.error("❌ GET ORDERS ERROR:", error);
    return { error: "Failed to fetch orders ledger.", orders: [] };
  }
}

export async function getOrderById(id: string) {
  try {
    const order = await prisma.orderMatrix.findUnique({ where: { id } });
    if (!order) return { error: "Order not found." };

    // Flatten stored JSON — handle both old flat array and new { __meta, list } shape
    const raw = order.items as any;
    const itemList: any[] = Array.isArray(raw) ? raw : (raw?.list || []);
    const meta = raw?.__meta || {};

    return {
      order: {
        ...order,
        total_amount: Number(order.total_amount),
        items: itemList,
        payment_method: meta.payment_method || "COD",
        delivery_charge: meta.delivery_charge || 0,
        trx_id: meta.trx_id || null,
      },
    };
  } catch (error) {
    return { error: "Failed to fetch order details." };
  }
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.orderMatrix.update({
        where: { id },
        data: { status },
      });

      await tx.subOrder.updateMany({
        where: { parent_id: id },
        data: { status },
      });

      return updated;
    });
    revalidatePath("/admin/orders");
    return { success: true, order };
  } catch (error: any) {
    console.error("Update order status error:", error);
    return { error: error?.message || "Failed to update order status." };
  }
}
