"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  
  if (!name) return { error: "Category name is required." };

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  try {
    const existing = await prisma.categories.findFirst({
      where: { slug }
    });

    if (existing) return { error: "A category with this name or slug already exists." };

    await prisma.categories.create({
      data: { name, slug }
    });

    revalidatePath("/admin/categories");
    return { success: "Category created successfully!" };
  } catch (error: any) {
    console.error("❌ CRITICAL PRISMA ERROR:", error?.message || error);
    return { error: `Database Error: ${error?.message || "Failed to create category."}` };
  }
}

export async function getCategories() {
  try {
    const categories = await prisma.categories.findMany({
      orderBy: { id: "desc" }
    });
    return { categories };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch categories.", categories: [] };
  }
}

// ফিক্সড: id এর টাইপ number থেকে string করা হলো
export async function updateCategory(id: string, name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  if (!name) return { error: "Category name is required." };

  try {
    await prisma.categories.update({
      where: { id },
      data: { name, slug }
    });

    revalidatePath("/admin/categories");
    return { success: "Category updated successfully!" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update category." };
  }
}

// ফিক্সড: id এর টাইপ number থেকে string করা হলো
export async function deleteCategory(id: string) {
  try {
    await prisma.categories.delete({
      where: { id }
    });

    revalidatePath("/admin/categories");
    return { success: "Category deleted successfully!" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete category." };
  }
}