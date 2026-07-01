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

export async function deleteMultipleCategories(ids: string[]) {
  try {
    await prisma.categoryMatrix.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: `Successfully deleted ${ids.length} categories.` };
  } catch (error: any) {
    console.error(error);
    return { error: `Failed to delete categories. Ensure none are linked to active products or child subcategories.` };
  }
}

export async function bulkImportCategories(categoriesList: any[]) {
  try {
    const validationErrors: string[] = [];
    
    // Fetch all existing categories to validate parent_id
    const existing = await prisma.categoryMatrix.findMany({ select: { id: true } });
    const existingIds = new Set(existing.map((c) => c.id));

    const validatedCategories: any[] = [];

    for (let i = 0; i < categoriesList.length; i++) {
      const cat = categoriesList[i];
      const rowNum = i + 1;

      if (!cat.name) {
        validationErrors.push(`Row ${rowNum}: Category Name is missing.`);
      }

      // Check if parent_id is valid
      if (cat.parent_id && !existingIds.has(cat.parent_id)) {
        validationErrors.push(`Row ${rowNum}: Parent Category ID '${cat.parent_id}' does not exist in the taxonomy database.`);
      }

      if (validationErrors.length === 0) {
        const cleanSlug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);
        validatedCategories.push({
          name: cat.name,
          slug: cat.slug || cleanSlug,
          description: cat.description || "",
          parent_id: cat.parent_id || null,
          image_url: cat.image_url || null,
          status: cat.status || "ACTIVE",
          is_featured: cat.is_featured === true || cat.is_featured === "true" || cat.is_featured === 1 || cat.is_featured === "1",
        });
      }
    }

    if (validationErrors.length > 0) {
      return { error: "Validation Failed", details: validationErrors };
    }

    if (validatedCategories.length > 0) {
      await prisma.categoryMatrix.createMany({
        data: validatedCategories,
        skipDuplicates: true
      });
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: `Successfully bulk imported ${validatedCategories.length} category records.` };
  } catch (error: any) {
    console.error("❌ CATEGORY BULK IMPORT ERROR:", error);
    return { error: `Bulk crash: ${error?.message || "Database validation error"}` };
  }
}