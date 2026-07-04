"use server";

import { prisma } from "../lib/prisma";

export async function validateCoupon(code: string, cartTotal: number) {
  try {
    const coupon = await prisma.coupons.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) {
      return { error: "Invalid coupon code." };
    }

    if (!coupon.is_active) {
      return { error: "This coupon is no longer active." };
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return { error: "This coupon has expired." };
    }

    if (cartTotal < coupon.min_order_amount) {
      return { error: `Minimum order amount for this coupon is ৳${coupon.min_order_amount}.` };
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (cartTotal * coupon.discount_value) / 100;
    } else {
      discountAmount = coupon.discount_value;
    }

    // Prevent discount from exceeding total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    return { 
      success: true, 
      discountAmount: Math.round(discountAmount),
      couponId: coupon.id
    };
  } catch (error) {
    console.error("COUPON VALIDATION ERROR:", error);
    return { error: "Failed to validate coupon." };
  }
}

export async function getCoupons() {
  try {
    const coupons = await prisma.coupons.findMany({
      orderBy: { created_at: 'desc' }
    });
    return { success: true, coupons };
  } catch (error) {
    console.error("GET COUPONS ERROR:", error);
    return { success: false, coupons: [] };
  }
}

export async function createCoupon(data: {
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
}) {
  try {
    const newCoupon = await prisma.coupons.create({
      data: {
        code: data.code.toUpperCase(),
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        min_order_amount: data.min_order_amount,
        is_active: true
      }
    });
    return { success: true, coupon: newCoupon };
  } catch (error: any) {
    console.error("CREATE COUPON ERROR:", error);
    if (error.code === 'P2002') {
      return { error: "A coupon with this code already exists." };
    }
    return { error: "Failed to create coupon." };
  }
}

export async function toggleCouponStatus(id: string, isActive: boolean) {
  try {
    await prisma.coupons.update({
      where: { id },
      data: { is_active: isActive }
    });
    return { success: true };
  } catch (error) {
    return { error: "Failed to update coupon status." };
  }
}
