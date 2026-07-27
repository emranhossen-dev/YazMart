"use server";

import { prisma } from "../lib/prisma";

function serializeProduct(p: any) {
  if (!p) return p;

  const toNum = (val: any) => {
    if (val === null || val === undefined) return null;
    if (typeof val === "object" && typeof val.toNumber === "function") {
      return val.toNumber();
    }
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  const serialized = {
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
  };

  if (p.createdAt instanceof Date) {
    serialized.createdAt = p.createdAt.toISOString();
  } else if (p.createdAt) {
    serialized.createdAt = String(p.createdAt);
  }

  if (p.updatedAt instanceof Date) {
    serialized.updatedAt = p.updatedAt.toISOString();
  } else if (p.updatedAt) {
    serialized.updatedAt = String(p.updatedAt);
  }

  if (p.variants && Array.isArray(p.variants)) {
    serialized.variants = p.variants.map((v: any) => ({
      ...v,
      price: toNum(v.price),
      createdAt: v.createdAt instanceof Date ? v.createdAt.toISOString() : (v.createdAt ? String(v.createdAt) : undefined)
    }));
  }

  return serialized;
}

// ১. ন্যাভিগেশন এবং হোম পেজ সেকশন ডেটা
export async function getShopData(selectedCategorySlug?: string) {
  try {
    let categories: any[] = [];
    try {
      categories = await prisma.categoryMatrix.findMany({
        where: { status: "ACTIVE", parent_id: null, store_id: null },
        include: {
          sub_categories: {
            where: { status: "ACTIVE" }
          }
        },
        orderBy: { name: "asc" },
      });
    } catch {
      try {
        await prisma.$executeRawUnsafe('ALTER TABLE "public"."CategoryMatrix" ADD COLUMN IF NOT EXISTS "store_id" TEXT;');
      } catch {}
      categories = await prisma.categoryMatrix.findMany({
        where: { status: "ACTIVE", parent_id: null },
        include: {
          sub_categories: {
            where: { status: "ACTIVE" }
          }
        },
        orderBy: { name: "asc" },
      });
    }

    const baseWhere: any = { status: "PUBLISHED" };
    if (selectedCategorySlug && selectedCategorySlug !== "all") {
      baseWhere.category = { slug: selectedCategorySlug };
    }

    const allProducts = await prisma.pimProducts.findMany({
      where: baseWhere,
      include: { category: true, brand: true },
      orderBy: { createdAt: "desc" },
    });

    const formattedAll = allProducts.map(serializeProduct);

    const featured = formattedAll.filter(p => p.is_featured);
    const newArrivals = formattedAll.filter(p => p.is_new_arrival);
    const bestSelling = formattedAll.filter(p => p.is_best_seller);
    const trending = formattedAll.filter(p => p.is_trending);
    const flashSale = formattedAll.filter(p => p.is_flash_sale);

    return { 
      categories, 
      products: formattedAll, 
      sections: {
        featured,
        newArrivals,
        bestSelling,
        trending,
        flashSale,
      },
      error: null 
    };
  } catch (error: any) {
    console.error("❌ SHOP DATA FETCH ERROR:", error);
    return { 
      categories: [], 
      products: [], 
      sections: { featured: [], newArrivals: [], bestSelling: [], trending: [], flashSale: [] }, 
      error: "Failed to load shop data." 
    };
  }
}

// ২. ক্যাটাগরি ভিত্তিক ব্রাউজিং ও মাল্টি-লেভেল ক্যাটাগরি সাপোর্ট
export async function getCategoryProducts(categorySlug: string, filters?: {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}) {
  try {
    // ১. মূল ক্যাটাগরি এবং তার সাব-ক্যাটাগরি রিলেশন আনা
    const category = await prisma.categoryMatrix.findUnique({
      where: { slug: categorySlug },
      include: { sub_categories: true }
    });

    if (!category) {
      return { error: "Category not found.", products: [], category: null };
    }

    // ২. ক্যাটাগরি আইডি কালেকশন (সাব ও চাইল্ড ক্যাটাগরিসহ)
    const categoryIds = [category.id];
    if (category.sub_categories && category.sub_categories.length > 0) {
      const subIds = category.sub_categories.map(s => s.id);
      categoryIds.push(...subIds);

      // ৩. চাইল্ড ক্যাটাগরি লেভেল নিয়ে আসা
      const childCats = await prisma.categoryMatrix.findMany({
        where: { parent_id: { in: subIds } },
        select: { id: true }
      });
      childCats.forEach(c => categoryIds.push(c.id));
    }

    // ৪. ফিল্টারিং কোয়েরি স্ট্রাকচার
    const where: any = {
      category_id: { in: categoryIds },
      status: "PUBLISHED"
    };

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { short_desc: { contains: filters.search, mode: "insensitive" } }
      ];
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.selling_price = {};
      if (filters.minPrice !== undefined) where.selling_price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.selling_price.lte = filters.maxPrice;
    }

    // ৫. সর্টিং রুলস
    let orderBy: any = { createdAt: "desc" };
    if (filters?.sortBy === "price_asc") orderBy = { selling_price: "asc" };
    else if (filters?.sortBy === "price_desc") orderBy = { selling_price: "desc" };
    else if (filters?.sortBy === "name_asc") orderBy = { name: "asc" };

    const rawProducts = await prisma.pimProducts.findMany({
      where,
      include: { category: true, brand: true },
      orderBy
    });

    const products = rawProducts.map(serializeProduct);

    return { products, category, error: null };
  } catch (error: any) {
    console.error("❌ CATEGORY PRODUCTS FETCH ERROR:", error);
    return { error: `Database failed: ${error?.message}`, products: [], category: null };
  }
}

// ৩. প্রোডাক্ট ডিটেল পেজ এবং রিলেটেড প্রোডাক্ট
export async function getProductDetails(slug: string) {
  try {
    const rawProduct = await prisma.pimProducts.findUnique({
      where: { slug },
      include: { category: true, brand: true, variants: true, store: true }
    });

    if (!rawProduct) {
      return { error: "Product not found." };
    }

    const product = serializeProduct(rawProduct);

    // ১. সেম ক্যাটাগরি প্রোডাক্ট (You May Also Like)
    const rawRelated = await prisma.pimProducts.findMany({
      where: {
        category_id: product.category_id,
        status: "PUBLISHED",
        id: { not: product.id }
      },
      take: 8,
      include: { category: true, store: true, brand: true }
    });

    const relatedProducts = rawRelated.map(serializeProduct);

    // ২. অনন্যা ক্যাটাগরির প্রোডাক্ট এবং অন্যান্য সমস্ত প্রোডাক্ট (Just For You - Limitless all products)
    const rawJustForYou = await prisma.pimProducts.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: product.id }
      },
      include: { category: true, store: true, brand: true },
      orderBy: { createdAt: "desc" }
    });

    const justForYouProducts = rawJustForYou.map(serializeProduct);

    return { product, relatedProducts, justForYouProducts };
  } catch (error: any) {
    console.error("❌ GET PRODUCT DETAILS ERROR:", error);
    return { error: "Failed to load product details." };
  }
}

// ৪. সব প্রোডাক্ট একসাথে নিয়ে আসা (ফিল্টারসহ)
export async function getAllProducts(filters?: {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  categoryId?: string;
}) {
  try {
    let categories: any[] = [];
    try {
      categories = await prisma.categoryMatrix.findMany({
        where: { status: "ACTIVE", store_id: null },
        orderBy: { name: "asc" },
      });
    } catch {
      try {
        await prisma.$executeRawUnsafe('ALTER TABLE "public"."CategoryMatrix" ADD COLUMN IF NOT EXISTS "store_id" TEXT;');
      } catch {}
      categories = await prisma.categoryMatrix.findMany({
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
      });
    }

    const where: any = {
      status: "PUBLISHED"
    };

    if (filters?.categoryId && filters.categoryId !== "all") {
      where.category_id = filters.categoryId;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { short_desc: { contains: filters.search, mode: "insensitive" } }
      ];
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.selling_price = {};
      if (filters.minPrice !== undefined) where.selling_price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.selling_price.lte = filters.maxPrice;
    }

    let orderBy: any = { createdAt: "desc" };
    if (filters?.sortBy === "price_asc") orderBy = { selling_price: "asc" };
    else if (filters?.sortBy === "price_desc") orderBy = { selling_price: "desc" };
    else if (filters?.sortBy === "name_asc") orderBy = { name: "asc" };

    const rawProducts = await prisma.pimProducts.findMany({
      where,
      include: { category: true, brand: true },
      orderBy
    });

    const products = rawProducts.map(serializeProduct);

    return { products, categories, error: null };
  } catch (error: any) {
    console.error("❌ ALL PRODUCTS FETCH ERROR:", error);
    return { error: `Database failed: ${error?.message}`, products: [], categories: [] };
  }
}

export async function getStoreData(slug: string) {
  try {
    const store = await prisma.store.findUnique({
      where: { slug },
    });

    if (!store) {
      return { store: null, products: [], storeCategories: [], error: "Store not found" };
    }

    const products = await prisma.pimProducts.findMany({
      where: {
        store_id: store.id,
        status: "PUBLISHED",
      },
      include: {
        category: true,
        brand: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const storeCategories = await prisma.categoryMatrix.findMany({
      where: { store_id: store.id, status: "ACTIVE" },
      orderBy: { name: "asc" }
    });

    const serializedStore = {
      ...store,
      createdAt: store.createdAt.toISOString(),
      updatedAt: store.updatedAt.toISOString(),
    };

    const formattedProducts = products.map(serializeProduct);

    return {
      store: serializedStore,
      products: formattedProducts,
      storeCategories,
      error: null,
    };
  } catch (error: any) {
    console.error("❌ STORE DATA FETCH ERROR:", error);
    return { store: null, products: [], storeCategories: [], error: error.message };
  }
}