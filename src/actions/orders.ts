"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOrder(data: {
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  phone: string;
  total_amount: number;
  items: any[];
}) {
  try {
    if (!data.customer_name || !data.customer_email || !data.shipping_address || !data.phone || !data.items || data.items.length === 0) {
      return { error: "Missing required fields or items list is empty." };
    }

    // Start a transaction to create the order and decrement stock
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create order record
      const order = await tx.orderMatrix.create({
        data: {
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          shipping_address: data.shipping_address,
          phone: data.phone,
          total_amount: data.total_amount,
          items: data.items, // JSON array
          status: "PENDING",
        },
      });

      // 2. Decrement stock for each product
      for (const item of data.items) {
        if (item.id) {
          const product = await tx.pimProducts.findUnique({
            where: { id: item.id }
          });
          if (product) {
            const newStock = Math.max(0, Number(product.current_stock) - Number(item.quantity));
            await tx.pimProducts.update({
              where: { id: item.id },
              data: {
                current_stock: newStock,
                stock_status: newStock > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
              }
            });
          }
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
    const order = await prisma.orderMatrix.findUnique({
      where: { id },
    });
    if (!order) return { error: "Order not found." };
    return { order: { ...order, total_amount: Number(order.total_amount) } };
  } catch (error) {
    return { error: "Failed to fetch order details." };
  }
}
