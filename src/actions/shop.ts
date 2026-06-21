"use server";

import { prisma } from "../lib/prisma";

export async function getShopData(selectedCategorySlug?: string) {
  try {
    // ১. ন্যাভিগেশন বারের জন্য সব ক্যাটাগরি নিয়ে আসা
    const categories = await prisma.categories.findMany({
      orderBy: { name: "asc" },
    });

    // ২. ফিল্টারিং লজিকসহ প্রোডাক্ট নিয়ে আসা
    const products = await prisma.products.findMany({
      where: selectedCategorySlug && selectedCategorySlug !== "all" ? {
        categories: {
          slug: selectedCategorySlug
        }
      } : {},
      include: {
        categories: true,
      },
      orderBy: { id: "desc" },
    });

    return { categories, products, error: null };
  } catch (error: any) {
    console.error("❌ SHOP DATA FETCH ERROR:", error);
    return { categories: [], products: [], error: "Failed to load shop data." };
  }
}