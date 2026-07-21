"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCoupons(storeId?: string) {
  try {
    const whereClause: any = {};
    if (storeId) {
      whereClause.OR = [
        { store_id: storeId },
        { store_id: null }
      ];
    }

    const coupons = await prisma.coupons.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" },
    });

    return { coupons };
  } catch (error: any) {
    console.error("❌ GET COUPONS ERROR:", error);
    return { error: "Failed to fetch coupons.", coupons: [] };
  }
}

export async function createCoupon(data: {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount?: number;
  store_id?: string;
  product_id?: string;
  valid_until?: string | Date;
}) {
  try {
    if (!data.code || !data.discount_value) {
      return { error: "Coupon code and discount value are required." };
    }

    const uppercaseCode = data.code.trim().toUpperCase();

    const existing = await prisma.coupons.findUnique({
      where: { code: uppercaseCode },
    });

    if (existing) {
      return { error: "Coupon code already exists." };
    }

    const coupon = await prisma.coupons.create({
      data: {
        code: uppercaseCode,
        discount_type: data.discount_type,
        discount_value: Number(data.discount_value),
        min_order_amount: Number(data.min_order_amount || 0),
        store_id: data.store_id || null,
        product_id: data.product_id || null,
        valid_until: data.valid_until ? new Date(data.valid_until) : null,
        is_active: true,
      },
    });

    revalidatePath("/admin/marketing/coupons");
    revalidatePath("/seller/marketing/coupons");
    return { success: true, coupon };
  } catch (error: any) {
    console.error("❌ CREATE COUPON ERROR:", error);
    return { error: error?.message || "Failed to create coupon." };
  }
}

export async function deleteCoupon(id: string) {
  try {
    await prisma.coupons.delete({
      where: { id },
    });
    revalidatePath("/admin/marketing/coupons");
    revalidatePath("/seller/marketing/coupons");
    return { success: true };
  } catch (error: any) {
    console.error("❌ DELETE COUPON ERROR:", error);
    return { error: "Failed to delete coupon." };
  }
}

export async function validateCoupon(code: string, subtotal: number) {
  try {
    if (!code) return { error: "Please enter a coupon code." };

    const uppercaseCode = code.trim().toUpperCase();
    const coupon = await prisma.coupons.findUnique({
      where: { code: uppercaseCode },
    });

    if (!coupon || !coupon.is_active) {
      return { error: "Invalid or inactive coupon code." };
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return { error: "This coupon code has expired." };
    }

    if (subtotal < Number(coupon.min_order_amount)) {
      return {
        error: `Minimum order amount of ৳${coupon.min_order_amount} required to use this coupon.`,
      };
    }

    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = (subtotal * coupon.discount_value) / 100;
    } else {
      discountAmount = coupon.discount_value;
    }

    discountAmount = Math.min(discountAmount, subtotal);

    return {
      success: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: Math.round(discountAmount),
      },
    };
  } catch (error: any) {
    console.error("❌ VALIDATE COUPON ERROR:", error);
    return { error: "Failed to validate coupon." };
  }
}
