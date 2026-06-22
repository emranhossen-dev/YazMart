"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const parent_id = formData.get("parent_id") as string || null;
  const image_url = formData.get("image_url") as string || null;
  const status = formData.get("status") as string || "ACTIVE";
  const is_featured = formData.get("is_featured") === "true";

  if (!name) {
    return { error: "Category name is strictly required." };
  }

  const cleanSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  try {
    await prisma.categoryMatrix.create({
      data: {
        name,
        slug: `${cleanSlug}-${Math.floor(1000 + Math.random() * 9000)}`, // avoid duplicate slugs for similar names
        description: description || "",
        parent_id: parent_id || null,
        image_url,
        status,
        is_featured,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: "Category registered successfully!" };
  } catch (error: any) {
    console.error("❌ CATEGORY CREATE ERROR:", error);
    return { error: `Database Error: ${error?.message || "Failed to create category."}` };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const parent_id = formData.get("parent_id") as string || null;
  const image_url = formData.get("image_url") as string || null;
  const status = formData.get("status") as string || "ACTIVE";
  const is_featured = formData.get("is_featured") === "true";

  if (!name) {
    return { error: "Category name is required." };
  }

  try {
    // Avoid setting self as parent
    if (parent_id === id) {
      return { error: "Category cannot be its own parent." };
    }

    await prisma.categoryMatrix.update({
      where: { id },
      data: {
        name,
        description: description || "",
        parent_id: parent_id || null,
        image_url,
        status,
        is_featured,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: "Category updated successfully!" };
  } catch (error: any) {
    console.error("❌ CATEGORY UPDATE ERROR:", error);
    return { error: `Database Error: ${error?.message || "Failed to update category."}` };
  }
}

export async function getCategories() {
  try {
    const categories = await prisma.categoryMatrix.findMany({
      include: {
        parent: true,
        sub_categories: true,
      },
      orderBy: { name: "asc" },
    });
    return { categories };
  } catch (error) {
    console.error("❌ FETCH CATEGORIES ERROR:", error);
    return { error: "Failed to load categories.", categories: [] };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.categoryMatrix.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: "Category purged successfully." };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete category (it may be linked to products or subcategories)." };
  }
}