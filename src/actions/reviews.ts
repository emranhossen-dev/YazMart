"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitProductReview(data: {
  productId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  orderId: string;
  rating: number;
  comment: string;
}) {
  try {
    if (!data.productId || !data.userId || !data.orderId || !data.comment) {
      return { error: "Missing required fields for submitting review." };
    }

    // Check if review already submitted for this order item
    const existing = await prisma.productReview.findFirst({
      where: {
        product_id: data.productId,
        user_id: data.userId,
        order_id: data.orderId,
      },
    });

    if (existing) {
      return { error: "You have already reviewed this product for this order." };
    }

    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.productReview.create({
        data: {
          product_id: data.productId,
          user_id: data.userId,
          user_name: data.userName || "Customer",
          user_email: data.userEmail || null,
          order_id: data.orderId,
          rating: Number(data.rating || 5),
          comment: data.comment,
        },
      });

      // Award 50 bonus coins to user profile
      const REWARD_COINS = 50;
      await tx.profiles.update({
        where: { id: data.userId },
        data: {
          coins: { increment: REWARD_COINS },
        },
      });

      return newReview;
    });

    revalidatePath(`/products/${data.productId}`);
    revalidatePath("/profile");
    revalidatePath("/admin/reviews");

    return {
      success: true,
      review,
      coinsEarned: 50,
    };
  } catch (error: any) {
    console.error("❌ SUBMIT REVIEW ERROR:", error);
    return { error: error?.message || "Failed to submit review." };
  }
}

export async function getProductReviews(productId: string) {
  try {
    const reviews = await prisma.productReview.findMany({
      where: { product_id: productId },
      orderBy: { createdAt: "desc" },
    });

    const total = reviews.length;
    const avgRating =
      total > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
        : 5.0;

    return {
      reviews,
      avgRating: Number(avgRating.toFixed(1)),
      totalReviews: total,
    };
  } catch (error: any) {
    console.error("❌ GET PRODUCT REVIEWS ERROR:", error);
    return { reviews: [], avgRating: 5, totalReviews: 0 };
  }
}

export async function getAdminReviews() {
  try {
    const reviews = await prisma.productReview.findMany({
      include: {
        product: {
          select: {
            name: true,
            featured_image: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { reviews };
  } catch (error: any) {
    console.error("❌ GET ADMIN REVIEWS ERROR:", error);
    return { reviews: [], error: "Failed to fetch reviews." };
  }
}

export async function deleteReview(reviewId: string) {
  try {
    await prisma.productReview.delete({
      where: { id: reviewId },
    });
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error: any) {
    console.error("❌ DELETE REVIEW ERROR:", error);
    return { error: "Failed to delete review." };
  }
}

export async function getUserCoins(userId: string) {
  try {
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { coins: true },
    });
    return { coins: profile?.coins || 0 };
  } catch (error) {
    return { coins: 0 };
  }
}
