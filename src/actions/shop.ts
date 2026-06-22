"use server";

import { prisma } from "../lib/prisma";

// ১. ন্যাভিগেশন এবং হোম পেজ সেকশন ডেটা
export async function getShopData(selectedCategorySlug?: string) {
  try {
    const categories = await prisma.categoryMatrix.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
    });

    const baseWhere: any = { status: "PUBLISHED" };
    if (selectedCategorySlug && selectedCategorySlug !== "all") {
      baseWhere.category = { slug: selectedCategorySlug };
    }

    const allProducts = await prisma.pimProducts.findMany({
      where: baseWhere,
      include: { category: true, brand: true },
      orderBy: { createdAt: "desc" },
    });

    const formatProducts = (list: any[]) => list.map(p => ({
      ...p,
      buying_price: Number(p.buying_price),
      selling_price: Number(p.selling_price),
      compare_price: p.compare_price ? Number(p.compare_price) : null,
      current_stock: Number(p.current_stock),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    const formattedAll = formatProducts(allProducts);

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

    const products = rawProducts.map(p => ({
      ...p,
      buying_price: Number(p.buying_price),
      selling_price: Number(p.selling_price),
      compare_price: p.compare_price ? Number(p.compare_price) : null,
      current_stock: Number(p.current_stock),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

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
      include: { category: true, brand: true, variants: true }
    });

    if (!rawProduct) {
      return { error: "Product not found." };
    }

    const product = {
      ...rawProduct,
      buying_price: Number(rawProduct.buying_price),
      selling_price: Number(rawProduct.selling_price),
      compare_price: rawProduct.compare_price ? Number(rawProduct.compare_price) : null,
      current_stock: Number(rawProduct.current_stock),
      createdAt: rawProduct.createdAt.toISOString(),
      updatedAt: rawProduct.updatedAt.toISOString(),
    };

    // রিলেটেড প্রোডাক্টসমূহ (সেম ক্যাটাগরি, ড্রাফট বা হিডেন বাদে)
    const rawRelated = await prisma.pimProducts.findMany({
      where: {
        category_id: product.category_id,
        status: "PUBLISHED",
        id: { not: product.id }
      },
      take: 4,
      include: { category: true }
    });

    const relatedProducts = rawRelated.map(p => ({
      ...p,
      buying_price: Number(p.buying_price),
      selling_price: Number(p.selling_price),
      compare_price: p.compare_price ? Number(p.compare_price) : null,
      current_stock: Number(p.current_stock),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return { product, relatedProducts };
  } catch (error: any) {
    console.error("❌ GET PRODUCT DETAILS ERROR:", error);
    return { error: "Failed to load product details." };
  }
}