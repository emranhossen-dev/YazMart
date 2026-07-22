"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function ensureReviewTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."ProductReview" (
        "id" TEXT NOT NULL,
        "product_id" TEXT NOT NULL,
        "user_id" UUID NOT NULL,
        "user_name" TEXT NOT NULL,
        "user_email" TEXT,
        "order_id" TEXT,
        "rating" INTEGER NOT NULL DEFAULT 5,
        "comment" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ProductReview_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."PimProducts"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "public"."ProductReview" ADD COLUMN IF NOT EXISTS "order_id" TEXT;
    `);
  } catch (err: any) {
    console.warn("⚠️ Review Table Migration Note:", err?.message);
  }
}

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

    await ensureReviewTable();

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

export async function adminCreateReview(data: {
  productId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  comment: string;
}) {
  try {
    if (!data.productId || !data.userName || !data.comment) {
      return { error: "Product, Reviewer Name, and Comment are required." };
    }

    await ensureReviewTable();

    // Get a valid system user UUID or fallback
    const systemUser = await prisma.profiles.findFirst();
    const fallbackUserId = systemUser?.id || "00000000-0000-0000-0000-000000000000";

    const review = await prisma.productReview.create({
      data: {
        product_id: data.productId,
        user_id: fallbackUserId,
        user_name: data.userName.trim(),
        user_email: data.userEmail?.trim() || null,
        order_id: `ADMIN-${Math.floor(100000 + Math.random() * 900000)}`,
        rating: Number(data.rating || 5),
        comment: data.comment.trim(),
      },
    });

    revalidatePath(`/products/${data.productId}`);
    revalidatePath("/admin/reviews");
    revalidatePath("/");

    return { success: true, review };
  } catch (error: any) {
    console.error("❌ ADMIN CREATE REVIEW ERROR:", error);
    return { error: error?.message || "Failed to create admin review." };
  }
}

export async function getProductReviews(productId: string) {
  try {
    await ensureReviewTable();

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
    await ensureReviewTable();

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
    await ensureReviewTable();

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
