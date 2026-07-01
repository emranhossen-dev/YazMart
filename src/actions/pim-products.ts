"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ১. প্রোডাক্ট ক্রিয়েশন এবং এডিট (Upsert) ইঞ্জিন
export async function createEnterpriseProduct(data: any) {
  try {
    const cleanSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);
    const finalSku = data.sku || `PROD-${Math.floor(100000 + Math.random() * 900000)}`;

    const productData = {
      name: data.name,
      sku: finalSku,
      barcode: data.barcode || null,
      product_code: data.product_code || null,
      product_type: data.product_type || "PHYSICAL",
      status: data.status || "PUBLISHED",
      featured_image: data.featured_image || null,
      gallery_images: data.gallery_images || [],
      video_url: data.video_url || null,
      buying_price: parseFloat(data.buying_price) || 0,
      selling_price: parseFloat(data.selling_price) || 0,
      compare_price: data.compare_price ? parseFloat(data.compare_price) : null,
      current_stock: parseInt(data.current_stock) || 0,
      low_stock_alert: parseInt(data.low_stock_alert) || 5,
      stock_status: parseInt(data.current_stock) > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
      weight: data.weight ? parseFloat(data.weight) : null,
      shipping_charge: data.shipping_charge ? parseFloat(data.shipping_charge) : null,
      cod_available: data.cod_available ?? true,
      short_desc: data.short_desc || "",
      full_desc: data.full_desc || "",
      meta_title: data.meta_title || data.name,
      meta_desc: data.meta_desc || data.short_desc || "",
      is_featured: data.is_featured === true || data.is_featured === "true",
      is_trending: data.is_trending === true || data.is_trending === "true",
      is_best_seller: data.is_best_seller === true || data.is_best_seller === "true",
      is_flash_sale: data.is_flash_sale === true || data.is_flash_sale === "true",
      is_new_arrival: data.is_new_arrival === true || data.is_new_arrival === "true",
      specifications: data.specifications || null,
      warranty: data.warranty || null,
    };

    if (data.id) {
      await prisma.pimProducts.update({
        where: { id: data.id },
        data: {
          ...productData,
          slug: data.slug || undefined, // keep existing slug if edit doesn't change it
          category: { connect: { id: data.category_id } },
          brand: data.brand_id ? { connect: { id: data.brand_id } } : { disconnect: true },
        }
      });
    } else {
      await prisma.pimProducts.create({
        data: {
          ...productData,
          slug: cleanSlug,
          category: { connect: { id: data.category_id } },
          brand: data.brand_id ? { connect: { id: data.brand_id } } : undefined,
        }
      });
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: "Product database record saved successfully!" };
  } catch (error: any) {
    console.error("❌ PIM ENGINE ERROR:", error);
    return { error: `PIM Failure: ${error?.message || "DB Pipeline blocked."}` };
  }
}

// ২. ডুপ্লিকেট প্রোডাক্ট অ্যাকশন
export async function duplicateEnterpriseProduct(id: string) {
  try {
    const original = await prisma.pimProducts.findUnique({
      where: { id }
    });

    if (!original) {
      return { error: "Original product record not found." };
    }

    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const newSku = `${original.sku}-COPY-${uniqueSuffix}`;
    const newSlug = `${original.slug}-copy-${uniqueSuffix}`;

    await prisma.pimProducts.create({
      data: {
        name: `${original.name} (Copy)`,
        slug: newSlug,
        sku: newSku,
        barcode: original.barcode,
        product_code: original.product_code,
        product_type: original.product_type,
        status: "DRAFT", // default to draft on duplicate
        featured_image: original.featured_image,
        gallery_images: original.gallery_images,
        video_url: original.video_url,
        buying_price: original.buying_price,
        selling_price: original.selling_price,
        compare_price: original.compare_price,
        current_stock: original.current_stock,
        low_stock_alert: original.low_stock_alert,
        stock_status: original.stock_status,
        weight: original.weight,
        shipping_charge: original.shipping_charge,
        cod_available: original.cod_available,
        short_desc: original.short_desc,
        full_desc: original.full_desc,
        meta_title: original.meta_title,
        meta_desc: original.meta_desc,
        is_featured: original.is_featured,
        is_trending: original.is_trending,
        is_best_seller: original.is_best_seller,
        is_flash_sale: original.is_flash_sale,
        is_new_arrival: original.is_new_arrival,
        category: { connect: { id: original.category_id } },
        brand: original.brand_id ? { connect: { id: original.brand_id } } : undefined,
        specifications: original.specifications || undefined,
        warranty: original.warranty,
      }
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: "Product record duplicated successfully as a DRAFT!" };
  } catch (error: any) {
    console.error("❌ PRODUCT DUPLICATION ERROR:", error);
    return { error: `Failed to duplicate: ${error?.message || "Internal error"}` };
  }
}

// ৩. মাস্টার ইনভেন্টরি ফিল্টারিং ও পেজিনেশন সহ
export async function getEnterpriseProducts(filters?: {
  search?: string;
  category_id?: string;
  brand_id?: string;
  status?: string;
  stock_status?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const search = filters?.search || "";
    const category_id = filters?.category_id || "";
    const brand_id = filters?.brand_id || "";
    const status = filters?.status || "";
    const stock_status = filters?.stock_status || "";
    const sortBy = filters?.sortBy || "newest";
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { short_desc: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category_id && category_id !== "all") {
      whereClause.category_id = category_id;
    }

    if (brand_id && brand_id !== "all") {
      whereClause.brand_id = brand_id;
    }

    if (status && status !== "all") {
      whereClause.status = status;
    }

    if (stock_status && stock_status !== "all") {
      whereClause.stock_status = stock_status;
    }

    let orderByClause: any = { createdAt: "desc" };
    if (sortBy === "price_asc") orderByClause = { selling_price: "asc" };
    else if (sortBy === "price_desc") orderByClause = { selling_price: "desc" };
    else if (sortBy === "name_asc") orderByClause = { name: "asc" };
    else if (sortBy === "name_desc") orderByClause = { name: "desc" };

    const [rawProducts, totalCount] = await Promise.all([
      prisma.pimProducts.findMany({
        where: whereClause,
        include: { category: true, brand: true },
        orderBy: orderByClause,
        skip,
        take: limit,
      }),
      prisma.pimProducts.count({ where: whereClause })
    ]);

    const products = rawProducts.map((p) => ({
      ...p,
      buying_price: Number(p.buying_price),
      selling_price: Number(p.selling_price),
      compare_price: p.compare_price ? Number(p.compare_price) : null,
      current_stock: Number(p.current_stock),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return { products, totalCount, totalPages: Math.ceil(totalCount / limit) };
  } catch (error) {
    console.error("❌ GET PRODUCTS ERROR:", error);
    return { error: "Failed to read products ledger.", products: [], totalCount: 0, totalPages: 0 };
  }
}

// ৪. বাল্ক ইম্পোর্ট প্রসেসর (সহ প্রি-ভ্যালিডেশন)
export async function bulkImportEnterpriseProducts(productsList: any[]) {
  try {
    const validationErrors: string[] = [];
    const existingSkus = new Set(
      (await prisma.pimProducts.findMany({ select: { sku: true } })).map((p) => p.sku)
    );

    const categories = await prisma.categoryMatrix.findMany({ select: { id: true } });
    const categoryIds = new Set(categories.map((c) => c.id));

    const brands = await prisma.brandMatrix.findMany({ select: { id: true } });
    const brandIds = new Set(brands.map((b) => b.id));

    const validatedProducts: any[] = [];
    const listSkus = new Set<string>();

    for (let i = 0; i < productsList.length; i++) {
      const p = productsList[i];
      const rowNum = i + 1;

      // Check required fields
      if (!p.name) {
        validationErrors.push(`Row ${rowNum}: Product Name is missing.`);
      }
      if (!p.sku) {
        validationErrors.push(`Row ${rowNum}: SKU is missing.`);
      }
      if (!p.category_id) {
        validationErrors.push(`Row ${rowNum}: Category ID is missing.`);
      }
      
      // Check invalid price
      const buyPrice = parseFloat(p.buying_price);
      const sellPrice = parseFloat(p.selling_price);
      if (isNaN(buyPrice) || buyPrice < 0) {
        validationErrors.push(`Row ${rowNum}: Invalid buying price.`);
      }
      if (isNaN(sellPrice) || sellPrice <= 0) {
        validationErrors.push(`Row ${rowNum}: Invalid selling price.`);
      }

      // Check missing category node in DB
      if (p.category_id && !categoryIds.has(p.category_id)) {
        validationErrors.push(`Row ${rowNum}: Category ID '${p.category_id}' does not exist in the taxonomy.`);
      }

      // Check missing brand node in DB
      if (p.brand_id && !brandIds.has(p.brand_id)) {
        validationErrors.push(`Row ${rowNum}: Brand ID '${p.brand_id}' does not exist in the database.`);
      }

      // Check duplicate SKU in DB or in this bulk list
      if (p.sku) {
        if (existingSkus.has(p.sku)) {
          validationErrors.push(`Row ${rowNum}: Duplicate SKU '${p.sku}' matches an existing product in the database.`);
        }
        if (listSkus.has(p.sku)) {
          validationErrors.push(`Row ${rowNum}: Duplicate SKU '${p.sku}' is specified multiple times in this import list.`);
        }
        listSkus.add(p.sku);
      }

      if (validationErrors.length === 0) {
        const cleanSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);
        
        let galleryImgs: string[] = [];
        if (Array.isArray(p.gallery_images)) {
          galleryImgs = p.gallery_images;
        } else if (typeof p.gallery_images === "string") {
          try {
            const parsed = JSON.parse(p.gallery_images);
            if (Array.isArray(parsed)) galleryImgs = parsed;
            else galleryImgs = [p.gallery_images];
          } catch {
            galleryImgs = p.gallery_images.split(",").map((s: string) => s.trim()).filter(Boolean);
          }
        }

        let specs: any = null;
        if (p.specifications) {
          if (typeof p.specifications === "object") {
            specs = p.specifications;
          } else if (typeof p.specifications === "string") {
            try {
              specs = JSON.parse(p.specifications);
            } catch {
              specs = { info: p.specifications };
            }
          }
        }

        const isFeatured = p.is_featured === true || p.is_featured === "true" || p.is_featured === 1 || p.is_featured === "1";
        const isTrending = p.is_trending === true || p.is_trending === "true" || p.is_trending === 1 || p.is_trending === "1";
        const isBestSeller = p.is_best_seller === true || p.is_best_seller === "true" || p.is_best_seller === 1 || p.is_best_seller === "1";
        const isFlashSale = p.is_flash_sale === true || p.is_flash_sale === "true" || p.is_flash_sale === 1 || p.is_flash_sale === "1";
        const isNewArrival = p.is_new_arrival === true || p.is_new_arrival === "true" || p.is_new_arrival === 1 || p.is_new_arrival === "1";
        const codAvailable = p.cod_available !== undefined ? (p.cod_available === true || p.cod_available === "true" || p.cod_available === 1 || p.cod_available === "1") : true;

        validatedProducts.push({
          name: p.name,
          slug: p.slug || cleanSlug,
          sku: p.sku,
          barcode: p.barcode || null,
          product_code: p.product_code || null,
          product_type: p.product_type || "PHYSICAL",
          status: p.status || "PUBLISHED",
          featured_image: p.featured_image || null,
          gallery_images: galleryImgs,
          video_url: p.video_url || null,
          buying_price: buyPrice,
          selling_price: sellPrice,
          compare_price: p.compare_price ? parseFloat(p.compare_price) : null,
          current_stock: parseInt(p.current_stock) || 0,
          low_stock_alert: parseInt(p.low_stock_alert) || 5,
          stock_status: (parseInt(p.current_stock) || 0) > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
          weight: p.weight ? parseFloat(p.weight) : null,
          shipping_charge: p.shipping_charge ? parseFloat(p.shipping_charge) : null,
          cod_available: codAvailable,
          short_desc: p.short_desc || "",
          full_desc: p.full_desc || "",
          meta_title: p.meta_title || p.name,
          meta_desc: p.meta_desc || p.short_desc || "",
          is_featured: isFeatured,
          is_trending: isTrending,
          is_best_seller: isBestSeller,
          is_flash_sale: isFlashSale,
          is_new_arrival: isNewArrival,
          specifications: specs,
          warranty: p.warranty || null,
          category_id: p.category_id,
          brand_id: p.brand_id || null,
        });
      }
    }

    if (validationErrors.length > 0) {
      return { error: "Validation Failed", details: validationErrors };
    }

    if (validatedProducts.length > 0) {
      await prisma.pimProducts.createMany({
        data: validatedProducts,
        skipDuplicates: true
      });
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: `Successfully bulk imported ${validatedProducts.length} product records.` };
    revalidatePath("/");
    return { success: `Bulk imported ${validatedProducts.length} products successfully!` };
  } catch (error: any) {
    console.error("❌ BULK IMPORT CRASH:", error);
    return { error: `Bulk crash: ${error?.message || "Execution pipeline failed"}` };
  }
}

// ৫. ক্যাটাগরি রিড
export async function getPimCategories() {
  try {
    const categories = await prisma.categoryMatrix.findMany({ orderBy: { name: "asc" } });
    return { categories: categories.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })) };
  } catch (error) {
    return { categories: [] };
  }
}

// ৬. ব্র্যান্ড রিড
export async function getBrands() {
  try {
    const brands = await prisma.brandMatrix.findMany({ orderBy: { name: "asc" } });
    return { brands };
  } catch (error) {
    console.error("❌ FETCH BRANDS ERROR:", error);
    return { brands: [] };
  }
}

// ৭. ব্র্যান্ড ক্রিয়েট
export async function createBrand(name: string) {
  try {
    const brand = await prisma.brandMatrix.create({
      data: { name, status: "ACTIVE" }
    });
    return { success: true, brand };
  } catch (error: any) {
    return { error: `Failed to create brand: ${error?.message}` };
  }
}

// ৮. ডিলিট অ্যাকশন
export async function deleteEnterpriseProduct(id: string) {
  try {
    await prisma.pimProducts.delete({ where: { id } });
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: "Product record purged successfully." };
  } catch (error) {
    return { error: "Failed to delete product." };
  }
}

export async function deleteMultipleProducts(ids: string[]) {
  try {
    await prisma.pimProducts.deleteMany({
      where: {
        id: { in: ids }
      }
    });
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: `Successfully deleted ${ids.length} products.` };
  } catch (error: any) {
    console.error(error);
    return { error: `Failed to delete products: ${error?.message}` };
  }
}