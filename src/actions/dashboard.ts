"use server";

import { prisma } from "../lib/prisma";

// ১. ড্যাশবোর্ডের রিয়াল-টাইম পরিসংখ্যান বা স্ট্যাটস নিয়ে আসা
export async function getDashboardStats() {
  try {
    const [productCount, categoryCount, customerCount] = await Promise.all([
      prisma.products.count(),
      prisma.categories.count(),
      prisma.profiles.count(), // টোটাল রেজিস্টার্ড প্রোফাইল/কাস্টমার সংখ্যা
    ]);

    return {
      products: productCount,
      categories: categoryCount,
      customers: customerCount,
      revenue: 45231.89, // ডেমো রেভিনিউ ভ্যালু ট্র্যাকিং
    };
  } catch (error) {
    console.error("❌ DASHBOARD STATS ERROR:", error);
    return { products: 0, categories: 0, customers: 0, revenue: 0 };
  }
}

// ২. সব কাস্টমারদের প্রোফাইল লিস্ট নিয়ে আসা
export async function getCustomersList() {
  try {
    const customers = await prisma.profiles.findMany({
      orderBy: { id: "desc" }
    });
    return { customers };
  } catch (error) {
    console.error("❌ FETCH CUSTOMERS ERROR:", error);
    return { error: "Failed to load customers.", customers: [] };
  }
}
