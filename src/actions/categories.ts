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
  const store_id = formData.get("store_id") as string || null;

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
        store_id,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/seller/categories");
    revalidatePath("/admin/products");
    revalidatePath("/seller/products");
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
  const store_id = formData.get("store_id") as string || undefined;

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
        ...(store_id ? { store_id } : {}),
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/seller/categories");
    revalidatePath("/admin/products");
    revalidatePath("/seller/products");
    revalidatePath("/");
    return { success: "Category updated successfully!" };
  } catch (error: any) {
    console.error("❌ CATEGORY UPDATE ERROR:", error);
    return { error: `Database Error: ${error?.message || "Failed to update category."}` };
  }
}

export async function getCategories(storeId?: string) {
  try {
    const whereCondition = storeId ? { store_id: storeId } : {};
    const categories = await prisma.categoryMatrix.findMany({
      where: whereCondition,
      include: {
        parent: true,
        sub_categories: true,
        store: true,
      },
      orderBy: { name: "asc" },
    });
    return { categories };
  } catch (error) {
    console.error("❌ FETCH CATEGORIES ERROR:", error);
    return { error: "Failed to load categories.", categories: [] };
  }
}

export async function getSellerCategories(storeId: string) {
  try {
    const categories = await prisma.categoryMatrix.findMany({
      where: { store_id: storeId },
      include: {
        parent: true,
        sub_categories: true,
        products: true,
      },
      orderBy: { name: "asc" },
    });
    return { categories };
  } catch (error) {
    console.error("❌ FETCH SELLER CATEGORIES ERROR:", error);
    return { error: "Failed to load seller categories.", categories: [] };
  }
}

export async function getMainStoreCategoriesWithSellerGroups() {
  try {
    const globalCategories = await prisma.categoryMatrix.findMany({
      where: { store_id: null, status: "ACTIVE" },
      include: { sub_categories: true },
      orderBy: { name: "asc" },
    });

    const sellerCategories = await prisma.categoryMatrix.findMany({
      where: { store_id: { not: null }, status: "ACTIVE" },
      include: { store: true },
      orderBy: { name: "asc" },
    });

    return { globalCategories, sellerCategories };
  } catch (error) {
    console.error("❌ FETCH STORE CATEGORIES GROUPED ERROR:", error);
    return { globalCategories: [], sellerCategories: [] };
  }
}

export async function getCategoryDeletionStats(id: string) {
  try {
    const productCount = await prisma.pimProducts.count({
      where: { category_id: id }
    });
    const subcategoryCount = await prisma.categoryMatrix.count({
      where: { parent_id: id }
    });
    return { success: true, productCount, subcategoryCount };
  } catch (error: any) {
    console.error("❌ GET DELETION STATS ERROR:", error);
    return { error: `Failed to retrieve details: ${error.message}` };
  }
}

export async function deleteCategory(id: string) {
  try {
    // 1. Find or create the "Uncategorized" category MATRIX node
    let uncategorized = await prisma.categoryMatrix.findFirst({
      where: { slug: "uncategorized" }
    });
    
    if (!uncategorized) {
      uncategorized = await prisma.categoryMatrix.create({
        data: {
          name: "Uncategorized",
          slug: "uncategorized",
          description: "Default fallback category for products without category mapping.",
          status: "ACTIVE",
          is_featured: false,
        }
      });
    }

    // Prevent deleting "Uncategorized" category itself!
    if (id === uncategorized.id) {
      return { error: "The system-wide fallback 'Uncategorized' category cannot be deleted." };
    }

    // 2. Reassign linked products to "Uncategorized"
    await prisma.pimProducts.updateMany({
      where: { category_id: id },
      data: { category_id: uncategorized.id }
    });

    // 3. Disconnect child categories (set parent_id = null)
    await prisma.categoryMatrix.updateMany({
      where: { parent_id: id },
      data: { parent_id: null }
    });

    // 4. Delete the category itself
    await prisma.categoryMatrix.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: "Category purged successfully. Products reassigned and children decoupled." };
  } catch (error: any) {
    console.error("❌ DELETE CATEGORY ERROR:", error);
    return { error: `Database Error: ${error?.message || "Failed to delete category."}` };
  }
}

export async function deleteMultipleCategories(ids: string[]) {
  try {
    // 1. Find or create the "Uncategorized" category MATRIX node
    let uncategorized = await prisma.categoryMatrix.findFirst({
      where: { slug: "uncategorized" }
    });
    
    if (!uncategorized) {
      uncategorized = await prisma.categoryMatrix.create({
        data: {
          name: "Uncategorized",
          slug: "uncategorized",
          description: "Default fallback category for products without category mapping.",
          status: "ACTIVE",
          is_featured: false,
        }
      });
    }

    // Filter out "Uncategorized" ID if it exists in the selection to prevent deletion
    const finalIds = ids.filter(id => id !== uncategorized!.id);
    if (finalIds.length === 0) {
      return { error: "No deletable categories selected." };
    }

    // 2. Reassign linked products to "Uncategorized"
    await prisma.pimProducts.updateMany({
      where: { category_id: { in: finalIds } },
      data: { category_id: uncategorized.id }
    });

    // 3. Disconnect child categories
    await prisma.categoryMatrix.updateMany({
      where: { parent_id: { in: finalIds } },
      data: { parent_id: null }
    });

    // 4. Bulk delete the categories
    await prisma.categoryMatrix.deleteMany({
      where: { id: { in: finalIds } },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: `Successfully purged ${finalIds.length} categories. Linked items reassigned.` };
  } catch (error: any) {
    console.error("❌ DELETE MULTIPLE CATEGORIES ERROR:", error);
    return { error: `Database Error: ${error?.message || "Failed to purge categories list."}` };
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