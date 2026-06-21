"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

// ১. নতুন প্রোডাক্ট তৈরি করা (Create)
export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string);
  const categoryId = formData.get("categoryId") as string; // আমাদের আইডি স্ট্রিং ফর্মে আছে

  if (!name || isNaN(price) || isNaN(stock) || !categoryId) {
    return { error: "All required fields must be filled correctly." };
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + Math.floor(Math.random() * 1000);
  const sku = "SKU-" + name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) + "-" + Math.floor(Math.random() * 10000);

  try {
    await prisma.products.create({
      data: {
        name,
        slug,
        sku,
        description: description || "",
        price,
        stock_quantity: stock,
        category_id: categoryId, // ডাটাবেজ কলামের নাম অনুযায়ী সিঙ্ক
      }
    });

    revalidatePath("/admin/products");
    return { success: "Product added successfully!" };
  } catch (error: any) {
    console.error("❌ PRODUCT CREATE ERROR:", error);
    return { error: `Database Error: ${error?.message || "Failed to add product."}` };
  }
}

// ২. সব প্রোডাক্ট একসাথে নিয়ে আসা (Read)
export async function getProducts() {
  try {
    const products = await prisma.products.findMany({
      include: {
        categories: true, // প্রোডাক্টের সাথে তার ক্যাটাগরির নামও রিড করার জন্য
      },
      orderBy: { id: "desc" }
    });
    return { products };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch products.", products: [] };
  }
}

// ৩. প্রোডাক্ট ডিলিট করা (Delete)
export async function deleteProduct(id: string) {
  try {
    await prisma.products.delete({
      where: { id }
    });

    revalidatePath("/admin/products");
    return { success: "Product deleted successfully!" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete product." };
  }
}