"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function serializePimProduct(p: any) {
  if (!p) return p;
  const toNum = (val: any) => {
    if (val === null || val === undefined) return null;
    if (typeof val === "object" && typeof val.toNumber === "function") {
      return val.toNumber();
    }
    const num = Number(val);
    return isNaN(num) ? null : num;
  };
  return {
    ...p,
    buying_price: toNum(p.buying_price),
    selling_price: toNum(p.selling_price),
    compare_price: toNum(p.compare_price),
    discount_amount: toNum(p.discount_amount),
    weight: toNum(p.weight),
    length: toNum(p.length),
    width: toNum(p.width),
    height: toNum(p.height),
    shipping_charge: toNum(p.shipping_charge),
    current_stock: p.current_stock !== undefined && p.current_stock !== null ? Number(p.current_stock) : 0,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt),
  };
}

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
      meta_keywords: data.meta_keywords || "",
      is_featured: data.is_featured === true || data.is_featured === "true",
      is_trending: data.is_trending === true || data.is_trending === "true",
      is_best_seller: data.is_best_seller === true || data.is_best_seller === "true",
      is_flash_sale: data.is_flash_sale === true || data.is_flash_sale === "true",
      is_new_arrival: data.is_new_arrival === true || data.is_new_arrival === "true",
      specifications: data.specifications || null,
      warranty: data.warranty || null,
      usability: data.usability || null,
      package_includes: data.package_includes || null,
      store_id: data.store_id || null,
    };

    let savedProduct;
    if (data.id) {
      savedProduct = await prisma.pimProducts.update({
        where: { id: data.id },
        data: {
          ...productData,
          slug: data.slug || undefined, // keep existing slug if edit doesn't change it
          category: { connect: { id: data.category_id } },
          brand: data.brand_id ? { connect: { id: data.brand_id } } : { disconnect: true },
        }
      });
    } else {
      savedProduct = await prisma.pimProducts.create({
        data: {
          ...productData,
          slug: cleanSlug,
          category: { connect: { id: data.category_id } },
          brand: data.brand_id ? { connect: { id: data.brand_id } } : undefined,
        }
      });
    }

    revalidatePath("/admin/products");
    revalidatePath("/seller/products");
    revalidatePath("/");
    if (savedProduct.store_id) {
      const store = await prisma.store.findUnique({ where: { id: savedProduct.store_id } });
      if (store) revalidatePath(`/stores/${store.slug}`);
    }
    return { success: "Product database record saved successfully!", product: serializePimProduct(savedProduct) };
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
        meta_keywords: original.meta_keywords,
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

    const products = rawProducts.map(serializePimProduct);

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
          meta_keywords: p.meta_keywords || "",
          is_featured: isFeatured,
          is_trending: isTrending,
          is_best_seller: isBestSeller,
          is_flash_sale: isFlashSale,
          is_new_arrival: isNewArrival,
          specifications: specs,
          warranty: p.warranty || null,
          usability: p.usability || null,
          package_includes: p.package_includes || null,
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
    const rawBrands = await prisma.brandMatrix.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    const brands = rawBrands.map(b => ({
      id: b.id,
      name: b.name,
      logo_url: b.logo_url || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=80&fit=crop&q=60",
      banner_url: b.banner_url || null,
      website: b.website || null,
      description: b.description || null,
      status: b.status,
      meta_title: b.meta_title || null,
      meta_desc: b.meta_desc || null,
      productCount: b._count.products,
      featured: b.status === "ACTIVE",
      createdAt: b.createdAt.toISOString(),
    }));
    return { brands };
  } catch (error) {
    console.error("❌ FETCH BRANDS ERROR:", error);
    return { brands: [] };
  }
}

// ७. ব্র্যান্ড ক্রিয়েট
export async function createBrand(nameOrData: any) {
  try {
    const name = typeof nameOrData === "string" ? nameOrData : nameOrData.name;
    const status = typeof nameOrData === "object" ? nameOrData.status : "ACTIVE";
    const brand = await prisma.brandMatrix.create({
      data: { name, status: status || "ACTIVE" }
    });
    revalidatePath("/admin/products");
    return { success: true, brand };
  } catch (error: any) {
    return { error: `Failed to create brand: ${error?.message}` };
  }
}

// ৭.১ ব্র্যান্ড আপডেট
export async function updateBrand(id: string, nameOrData: any) {
  try {
    const name = typeof nameOrData === "string" ? nameOrData : nameOrData.name;
    const status = typeof nameOrData === "object" ? nameOrData.status : "ACTIVE";
    const brand = await prisma.brandMatrix.update({
      where: { id },
      data: { name, status }
    });
    revalidatePath("/admin/products");
    return { success: true, brand };
  } catch (error: any) {
    return { error: `Failed to update brand: ${error?.message}` };
  }
}

// ৭.২ ব্র্যান্ড ডিলিট
export async function deleteBrand(id: string) {
  try {
    await prisma.pimProducts.updateMany({
      where: { brand_id: id },
      data: { brand_id: null }
    });
    await prisma.brandMatrix.delete({
      where: { id }
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    return { error: `Failed to delete brand: ${error?.message}` };
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

export async function getEnterpriseProduct(id: string) {
  try {
    const rawProduct = await prisma.pimProducts.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true
      }
    });
    if (!rawProduct) return { error: "Product not found." };
    const product = serializePimProduct(rawProduct);
    return { product };
  } catch (error: any) {
    console.error("❌ FETCH PRODUCT DETAIL ERROR:", error);
    return { error: `Failed to load product details: ${error.message}` };
  }
}

// ৪. ইনভেন্টরি ডাটাবেজ সেলফ-হিলিং মাইগ্রেশন রানার
export async function runSchemaMigration() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."StockItem" (
        "id" TEXT NOT NULL,
        "product_id" TEXT NOT NULL,
        "serial_number" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
        "order_id" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "StockItem_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "StockItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."PimProducts"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "StockItem_serial_number_key" ON "public"."StockItem"("serial_number");
    `);
    return { success: true };
  } catch (err: any) {
    console.error("Migration pipeline error:", err);
    return { error: err?.message || "SQL Error" };
  }
}

// ৫. সিরিয়াল নম্বর ট্র্যাকিং এন্ট্রি জেনারেটর
export async function updateProductStockItems(productId: string, serialNumbers: string[]) {
  try {
    await prisma.$transaction(async (tx) => {
      // Create items if not exist
      for (const sn of serialNumbers) {
        if (!sn.trim()) continue;
        await tx.stockItem.upsert({
          where: { serial_number: sn.trim() },
          update: { status: "AVAILABLE" },
          create: {
            product_id: productId,
            serial_number: sn.trim(),
            status: "AVAILABLE"
          }
        });
      }

      // Recalculate current active stock
      const count = await tx.stockItem.count({
        where: { product_id: productId, status: "AVAILABLE" }
      });

      await tx.pimProducts.update({
        where: { id: productId },
        data: {
          current_stock: count,
          stock_status: count > 0 ? "IN_STOCK" : "OUT_OF_STOCK"
        }
      });
    });
    return { success: true };
  } catch (err: any) {
    console.error("Stock item update error:", err);
    return { error: err.message || "Failed to save serialized stock units" };
  }
}

// ৬. সিরিয়াল স্ক্যান ভিত্তিক রি-স্টকিং এবং রিটার্ন
export async function restockItemBySerial(serialNumber: string) {
  try {
    const cleanSn = serialNumber.trim();
    if (!cleanSn) return { error: "Serial number cannot be blank." };

    const item = await prisma.stockItem.findUnique({
      where: { serial_number: cleanSn }
    });

    if (!item) {
      return { error: `Serial/Barcode "${cleanSn}" is not registered in system ledger.` };
    }

    await prisma.$transaction(async (tx) => {
      // Mark as available
      await tx.stockItem.update({
        where: { serial_number: cleanSn },
        data: { status: "AVAILABLE", order_id: null }
      });

      // Recalculate stock count
      const count = await tx.stockItem.count({
        where: { product_id: item.product_id, status: "AVAILABLE" }
      });

      await tx.pimProducts.update({
        where: { id: item.product_id },
        data: {
          current_stock: count,
          stock_status: count > 0 ? "IN_STOCK" : "OUT_OF_STOCK"
        }
      });
    });

    const prod = await prisma.pimProducts.findUnique({
      where: { id: item.product_id }
    });

    return { 
      success: true, 
      item: { 
        id: item.id,
        serial_number: item.serial_number,
        productName: prod?.name || "Product SKU Item",
        status: "RESTOCKED"
      } 
    };
  } catch (err: any) {
    console.error("Restock error:", err);
    return { error: err?.message || "Execution error" };
  }
}

// 8. Adjust stock for a product manually
export async function updateProductStock(productId: string, newStock: number) {
  try {
    const updated = await prisma.pimProducts.update({
      where: { id: productId },
      data: {
        current_stock: newStock,
        stock_status: newStock > 0 ? "IN_STOCK" : "OUT_OF_STOCK"
      }
    });
    return { success: true, product: updated };
  } catch (error: any) {
    console.error("❌ UPDATE PRODUCT STOCK ERROR:", error);
    return { error: error?.message || "Failed to update product stock." };
  }
}