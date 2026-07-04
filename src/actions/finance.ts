"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- EXPENSES ACTIONS ---
export async function getExpenses() {
  try {
    const list: any[] = await prisma.$queryRaw`
      SELECT * FROM public.expenses ORDER BY date DESC;
    `;
    return { success: true, expenses: list };
  } catch (error: any) {
    console.error("❌ GET EXPENSES ERROR:", error);
    return { error: error?.message || "Failed to load expenses." };
  }
}

export async function createExpense(data: {
  id: string;
  category: string;
  supplier: string;
  amount: number;
  date: string;
  status: string;
}) {
  try {
    await prisma.$executeRaw`
      INSERT INTO public.expenses (id, category, supplier, amount, date, status)
      VALUES (${data.id}, ${data.category}, ${data.supplier}, ${data.amount}, ${data.date}, ${data.status});
    `;
    revalidatePath("/admin/finance");
    return { success: true };
  } catch (error: any) {
    console.error("❌ CREATE EXPENSE ERROR:", error);
    return { error: error?.message || "Failed to log expense." };
  }
}

// --- SUPPLIERS ACTIONS ---
export async function getSuppliers() {
  try {
    const list: any[] = await prisma.$queryRaw`
      SELECT * FROM public.suppliers ORDER BY name ASC;
    `;
    return { success: true, suppliers: list };
  } catch (error: any) {
    console.error("❌ GET SUPPLIERS ERROR:", error);
    return { error: error?.message || "Failed to load suppliers." };
  }
}

export async function createSupplier(data: {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  status: string;
}) {
  try {
    await prisma.$executeRaw`
      INSERT INTO public.suppliers (id, name, contact, email, phone, status)
      VALUES (${data.id}, ${data.name}, ${data.contact}, ${data.email}, ${data.phone}, ${data.status});
    `;
    revalidatePath("/admin/purchase");
    return { success: true };
  } catch (error: any) {
    console.error("❌ CREATE SUPPLIER ERROR:", error);
    return { error: error?.message || "Failed to register supplier." };
  }
}

// --- VOUCHERS ACTIONS ---
export async function getVouchers() {
  try {
    const list: any[] = await prisma.$queryRaw`
      SELECT * FROM public.vouchers ORDER BY code ASC;
    `;
    return { success: true, vouchers: list };
  } catch (error: any) {
    console.error("❌ GET VOUCHERS ERROR:", error);
    return { error: error?.message || "Failed to load vouchers." };
  }
}

export async function createVoucher(data: {
  code: string;
  discount: string;
  min_order: number;
  quota_limit: string;
  expiry: string;
  status: string;
}) {
  try {
    await prisma.$executeRaw`
      INSERT INTO public.vouchers (code, discount, min_order, quota_limit, expiry, status)
      VALUES (${data.code}, ${data.discount}, ${data.min_order}, ${data.quota_limit}, ${data.expiry}, ${data.status});
    `;
    revalidatePath("/admin/marketing");
    return { success: true };
  } catch (error: any) {
    console.error("❌ CREATE VOUCHER ERROR:", error);
    return { error: error?.message || "Failed to create voucher coupon." };
  }
}

// --- REVIEWS ACTIONS ---
export async function getReviews() {
  try {
    const list: any[] = await prisma.$queryRaw`
      SELECT * FROM public.reviews ORDER BY date DESC;
    `;
    return { success: true, reviews: list };
  } catch (error: any) {
    console.error("❌ GET REVIEWS ERROR:", error);
    return { error: error?.message || "Failed to load reviews." };
  }
}

export async function createReview(data: {
  id: string;
  customer_name: string;
  product_name: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
}) {
  try {
    await prisma.$executeRaw`
      INSERT INTO public.reviews (id, customer_name, product_name, rating, comment, date, approved)
      VALUES (${data.id}, ${data.customer_name}, ${data.product_name}, ${data.rating}, ${data.comment}, ${data.date}, ${data.approved});
    `;
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error: any) {
    console.error("❌ CREATE REVIEW ERROR:", error);
    return { error: error?.message || "Failed to create review." };
  }
}

export async function toggleReviewApproval(id: string, approved: boolean) {
  try {
    await prisma.$executeRaw`
      UPDATE public.reviews SET approved = ${approved} WHERE id = ${id};
    `;
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error: any) {
    console.error("❌ TOGGLE REVIEW ERROR:", error);
    return { error: error?.message || "Failed to toggle review." };
  }
}

export async function deleteReview(id: string) {
  try {
    await prisma.$executeRaw`
      DELETE FROM public.reviews WHERE id = ${id};
    `;
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error: any) {
    console.error("❌ DELETE REVIEW ERROR:", error);
    return { error: error?.message || "Failed to delete review." };
  }
}

// --- CONTENT PAGES ACTIONS ---
export async function getContentPages(type?: string) {
  try {
    let list: any[];
    if (type) {
      list = await prisma.$queryRaw`
        SELECT * FROM public.content_pages WHERE type = ${type} ORDER BY created_at DESC;
      `;
    } else {
      list = await prisma.$queryRaw`
        SELECT * FROM public.content_pages ORDER BY created_at DESC;
      `;
    }
    return { success: true, pages: list };
  } catch (error: any) {
    console.error("❌ GET CONTENT PAGES ERROR:", error);
    return { error: error?.message || "Failed to load content pages." };
  }
}

export async function createContentPage(data: {
  id: string;
  type: string;
  title: string;
  body: string;
  author: string;
  meta: string;
  status: string;
  created_at: string;
}) {
  try {
    await prisma.$executeRaw`
      INSERT INTO public.content_pages (id, type, title, body, author, meta, status, created_at)
      VALUES (${data.id}, ${data.type}, ${data.title}, ${data.body}, ${data.author}, ${data.meta}, ${data.status}, ${data.created_at});
    `;
    revalidatePath("/admin/content");
    return { success: true };
  } catch (error: any) {
    console.error("❌ CREATE CONTENT PAGE ERROR:", error);
    return { error: error?.message || "Failed to create content page." };
  }
}

export async function deleteContentPage(id: string) {
  try {
    await prisma.$executeRaw`
      DELETE FROM public.content_pages WHERE id = ${id};
    `;
    revalidatePath("/admin/content");
    return { success: true };
  } catch (error: any) {
    console.error("❌ DELETE CONTENT PAGE ERROR:", error);
    return { error: error?.message || "Failed to delete content page." };
  }
}

