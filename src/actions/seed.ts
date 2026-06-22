"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function seedDemoDatabaseAction() {
  try {
    // 1. Seed Categories
    const categoriesData = [
      { name: "Smart Devices", slug: "smart-devices", image_url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=300&auto=format&fit=crop", is_featured: true },
      { name: "Premium Leatherwear", slug: "leatherwear", image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop", is_featured: true },
      { name: "High-End Audio", slug: "audio", image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&auto=format&fit=crop", is_featured: true },
      { name: "Men's Luxury Wear", slug: "mens-wear", image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=300&auto=format&fit=crop", is_featured: true },
      { name: "Gaming Gears", slug: "gaming-gears", image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=300&auto=format&fit=crop", is_featured: true },
      { name: "Elite Backpacks", slug: "elite-backpacks", image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=300&auto=format&fit=crop", is_featured: true }
    ];

    const seededCategories: any[] = [];
    for (const cat of categoriesData) {
      const existing = await prisma.categoryMatrix.findUnique({ where: { slug: cat.slug } });
      if (existing) {
        seededCategories.push(existing);
      } else {
        const created = await prisma.categoryMatrix.create({ data: cat });
        seededCategories.push(created);
      }
    }

    // 2. Seed Brands
    const brandsData = [
      { name: "Sony", logo_url: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=80&fit=crop&q=60" },
      { name: "Casio", logo_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&fit=crop&q=60" },
      { name: "Apple", logo_url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=80&fit=crop&q=60" },
      { name: "Samsung", logo_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=80&fit=crop&q=60" }
    ];

    const seededBrands: any[] = [];
    for (const b of brandsData) {
      const existing = await prisma.brandMatrix.findFirst({ where: { name: b.name } });
      if (existing) {
        seededBrands.push(existing);
      } else {
        const created = await prisma.brandMatrix.create({ data: b });
        seededBrands.push(created);
      }
    }

    // Find category ID maps
    const getCatId = (slug: string) => seededCategories.find(c => c.slug === slug)?.id || seededCategories[0].id;
    const getBrandId = (name: string) => seededBrands.find(b => b.name === name)?.id || null;

    // 3. Seed Products
    const productsData = [
      {
        name: "Pro ANC Wireless Headphones",
        slug: "pro-anc-headphones",
        sku: "SKU-ANC-100",
        buying_price: 100,
        selling_price: 180,
        compare_price: 250,
        current_stock: 45,
        featured_image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop",
        short_desc: "Industry leading active noise cancellation headphones with premium sound codecs.",
        full_desc: "Enjoy complete silence and high-fidelity audio with these premium wireless headphones. Features up to 30 hours of battery life, custom equalizer settings, and smart touch controls.",
        is_featured: true,
        is_flash_sale: true,
        is_trending: true,
        category_id: getCatId("audio"),
        brand_id: getBrandId("Sony")
      },
      {
        name: "Minimalist Leather Watch",
        slug: "minimalist-leather-watch",
        sku: "SKU-MIN-200",
        buying_price: 60,
        selling_price: 110,
        compare_price: 160,
        current_stock: 32,
        featured_image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop",
        short_desc: "Crafted with Italian leather straps and premium gold alloy dial frames.",
        full_desc: "A timeless masterpiece designed for both style and durability. Water-resistant up to 50 meters, analog layout with Japanese quartz mechanics.",
        is_featured: true,
        is_best_seller: true,
        category_id: getCatId("leatherwear"),
        brand_id: getBrandId("Casio")
      },
      {
        name: "RGB Hot-Swap Mechanical Keyboard",
        slug: "rgb-hotswap-keyboard",
        sku: "SKU-RGB-100",
        buying_price: 50,
        selling_price: 95,
        compare_price: 130,
        current_stock: 18,
        featured_image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=400&auto=format&fit=crop",
        short_desc: "Smooth linear switches with fully customizable RGB backlight mapping.",
        full_desc: "Engineered for creators and gamers. Multi-mode wireless connection (Bluetooth, 2.4Ghz, Type-C) with sound dampening foams.",
        is_new_arrival: true,
        is_trending: true,
        category_id: getCatId("gaming-gears"),
        brand_id: null
      },
      {
        name: "Waterproof Leather Commute Pack",
        slug: "waterproof-commute-pack",
        sku: "SKU-BAG-200",
        buying_price: 70,
        selling_price: 130,
        compare_price: 195,
        current_stock: 12,
        featured_image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=400&auto=format&fit=crop",
        short_desc: "Ergonomic shoulder straps and hidden secure passport compartments.",
        full_desc: "Travel in comfort and secure your premium gadgets. Features ballistic nylon composites, heavy-duty zippers, and a dedicated 16-inch laptop pocket.",
        is_featured: true,
        is_flash_sale: true,
        category_id: getCatId("elite-backpacks"),
        brand_id: null
      },
      {
        name: "iPhone 15 Pro Max Titanium",
        slug: "iphone-15-pro-max",
        sku: "SKU-IPH-15PM",
        buying_price: 950,
        selling_price: 1299,
        compare_price: 1399,
        current_stock: 15,
        featured_image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=400&auto=format&fit=crop",
        short_desc: "Forged in titanium with 5x telephoto optical camera system.",
        full_desc: "Super Retina XDR display, A17 Pro high-performance chip, Action button customization, and professional-grade focal lengths.",
        is_featured: true,
        is_best_seller: true,
        category_id: getCatId("smart-devices"),
        brand_id: getBrandId("Apple")
      },
      {
        name: "Galaxy S24 Ultra Slate",
        slug: "galaxy-s24-ultra",
        sku: "SKU-SAM-S24U",
        buying_price: 850,
        selling_price: 1199,
        compare_price: 1299,
        current_stock: 20,
        featured_image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400&auto=format&fit=crop",
        short_desc: "Integrated S-Pen stylus with advanced live translations AI engines.",
        full_desc: "Snapdragon 8 Gen 3 chipset, 200MP detail camera sensor, long battery performance, and durable Corning Gorilla armor.",
        is_new_arrival: true,
        is_trending: true,
        category_id: getCatId("smart-devices"),
        brand_id: getBrandId("Samsung")
      }
    ];

    for (const prod of productsData) {
      const existing = await prisma.pimProducts.findUnique({ where: { slug: prod.slug } });
      if (!existing) {
        await prisma.pimProducts.create({
          data: {
            ...prod,
            buying_price: Number(prod.buying_price),
            selling_price: Number(prod.selling_price),
            compare_price: Number(prod.compare_price),
            status: "PUBLISHED"
          }
        });
      }
    }

    // 4. Update default Config if required
    const existingConfig = await prisma.homepageConfig.findUnique({ where: { id: "default" } });
    const configData = {
      slider_images: [
        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1200&auto=format&fit=crop"
      ],
      right_banners: [
        { title: "Smart Campaign", sub: "Up to 50% Off Electronics", url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400&auto=format&fit=crop", link: "/products/galaxy-s24-ultra" },
        { title: "Holiday Sourcing", sub: "Premium Fashion Deals", url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop", link: "/products/minimalist-leather-watch" }
      ],
      promo_banners: [
        "https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=1200&auto=format&fit=crop"
      ],
      section_order: ["hero", "categories", "quick_deal", "promo_banner", "featured", "brands", "testimonials"],
      disabled_sections: [],
      colors: {
        primary: "#2563eb",
        background: "#f8fafc",
        cardBg: "#ffffff",
        secondary: "#4f46e5"
      },
      brand_logos: [
        { name: "Sony", logoUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=80&fit=crop&q=60", brandId: "" },
        { name: "Casio", logoUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&fit=crop&q=60", brandId: "" },
        { name: "Apple", logoUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=80&fit=crop&q=60", brandId: "" },
        { name: "Samsung", logoUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=80&fit=crop&q=60", brandId: "" }
      ],
      testimonials: [
        { name: "Mahmud Hasan", text: "Absolutely phenomenal quality! Sourcing was incredibly smooth.", rating: 5, role: "Regular Shopper" },
        { name: "Farhana Yasmin", text: "The noise cancellation headset is top tier. Fast dispatch delivery.", rating: 5, role: "Corporate Sourcing" }
      ]
    };

    if (existingConfig) {
      await prisma.homepageConfig.update({
        where: { id: "default" },
        data: configData
      });
    } else {
      await prisma.homepageConfig.create({
        data: {
          id: "default",
          ...configData
        }
      });
    }

    try {
      revalidatePath("/");
      revalidatePath("/admin/products");
      revalidatePath("/admin/categories");
    } catch (revalErr) {
      console.warn("⚠️ Revalidation skipped (non-Next context):", revalErr);
    }
    return { success: "Demo production-ready catalog and homepage dataset seeded successfully!" };
  } catch (error: any) {
    console.error("❌ DEMO SEED ERROR:", error);
    return { error: `Failed to seed demo database: ${error?.message || "Prisma query validation error."}` };
  }
}
