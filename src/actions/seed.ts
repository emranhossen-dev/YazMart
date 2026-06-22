"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function seedDemoDatabaseAction() {
  try {
    // 1. Reset Database Safely (in reverse dependency order)
    try {
      await prisma.productVariants.deleteMany({});
      await prisma.pimProducts.deleteMany({});
      await prisma.categoryMatrix.deleteMany({});
      await prisma.brandMatrix.deleteMany({});
    } catch (dbResetErr) {
      console.warn("⚠️ Database reset partial warning:", dbResetErr);
    }

    // 2. Seed Parent Categories
    const parentCategories = [
      { name: "Chronicles & Co", slug: "watches-leather", image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop", is_featured: true, status: "ACTIVE" },
      { name: "Sound & Acoustics", slug: "audio", image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&auto=format&fit=crop", is_featured: true, status: "ACTIVE" },
      { name: "Living Space", slug: "living", image_url: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=300&auto=format&fit=crop", is_featured: true, status: "ACTIVE" },
      { name: "Digital & Gears", slug: "digital", image_url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=300&auto=format&fit=crop", is_featured: true, status: "ACTIVE" },
      { name: "Aesthetics & Beauty", slug: "beauty", image_url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=300&auto=format&fit=crop", is_featured: true, status: "ACTIVE" },
      { name: "Apparel & Frame", slug: "fashion", image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=300&auto=format&fit=crop", is_featured: true, status: "ACTIVE" }
    ];

    const seededParents: Record<string, any> = {};
    for (const cat of parentCategories) {
      const created = await prisma.categoryMatrix.create({ data: cat });
      seededParents[cat.slug] = created;
    }

    // 3. Seed Child Subcategories
    const subCategoriesData = [
      { name: "Mechanical Watches", slug: "mechanical-watches", parent_id: seededParents["watches-leather"].id, is_featured: true, status: "ACTIVE" },
      { name: "Leather Wallets", slug: "leather-wallets", parent_id: seededParents["watches-leather"].id, is_featured: true, status: "ACTIVE" },
      
      { name: "ANC Headphones", slug: "anc-headphones", parent_id: seededParents["audio"].id, is_featured: true, status: "ACTIVE" },
      { name: "Wireless Earbuds", slug: "wireless-earbuds", parent_id: seededParents["audio"].id, is_featured: true, status: "ACTIVE" },
      
      { name: "Espresso Machines", slug: "espresso-machines", parent_id: seededParents["living"].id, is_featured: true, status: "ACTIVE" },
      { name: "Air Purifiers", slug: "air-purifiers", parent_id: seededParents["living"].id, is_featured: true, status: "ACTIVE" },
      
      { name: "Smartphones", slug: "smartphones", parent_id: seededParents["digital"].id, is_featured: true, status: "ACTIVE" },
      { name: "Mechanical Keyboards", slug: "mechanical-keyboards", parent_id: seededParents["digital"].id, is_featured: true, status: "ACTIVE" },
      
      { name: "Parfums", slug: "parfums", parent_id: seededParents["beauty"].id, is_featured: true, status: "ACTIVE" },
      { name: "Skincare Sets", slug: "skincare-sets", parent_id: seededParents["beauty"].id, is_featured: true, status: "ACTIVE" },
      
      { name: "Designer Eyewear", slug: "designer-eyewear", parent_id: seededParents["fashion"].id, is_featured: true, status: "ACTIVE" },
      { name: "Luxury Sneakers", slug: "luxury-sneakers", parent_id: seededParents["fashion"].id, is_featured: true, status: "ACTIVE" }
    ];

    const seededSubs: Record<string, any> = {};
    for (const sub of subCategoriesData) {
      const created = await prisma.categoryMatrix.create({ data: sub });
      seededSubs[sub.slug] = created;
    }

    // 4. Seed Brands
    const brandsData = [
      { name: "Rolex", logo_url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=100&fit=crop&q=60", status: "ACTIVE" },
      { name: "Sony", logo_url: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=100&fit=crop&q=60", status: "ACTIVE" },
      { name: "Apple", logo_url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&fit=crop&q=60", status: "ACTIVE" },
      { name: "Samsung", logo_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100&fit=crop&q=60", status: "ACTIVE" }
    ];

    const seededBrands: Record<string, any> = {};
    for (const b of brandsData) {
      const created = await prisma.brandMatrix.create({ data: b });
      seededBrands[b.name] = created;
    }

    // 5. Seed Products
    const productsData = [
      {
        name: "Zenith ANC Wireless Headphones",
        slug: "zenith-anc-headphones",
        sku: "SKU-ZEN-ANC",
        buying_price: 150.00,
        selling_price: 299.00,
        compare_price: 399.00,
        current_stock: 45,
        featured_image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
        short_desc: "Industry-leading active noise cancellation with high-fidelity acoustics.",
        full_desc: "Immerse yourself in pure silence and audio perfection. Features hybrid active noise cancellation, custom equalizers, and up to 30 hours of play time.",
        is_featured: true,
        is_flash_sale: true,
        is_trending: true,
        is_new_arrival: true,
        is_best_seller: false,
        category_id: seededSubs["anc-headphones"].id,
        brand_id: seededBrands["Sony"].id
      },
      {
        name: "Chronos Automatic Watch",
        slug: "chronos-automatic-watch",
        sku: "SKU-CHR-AUT",
        buying_price: 300.00,
        selling_price: 599.00,
        compare_price: 799.00,
        current_stock: 12,
        featured_image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop",
        short_desc: "Timeless luxury mechanical movement with premium leather straps.",
        full_desc: "A masterful blend of legacy design and high precision mechanical caliber. Features scratch-resistant sapphire glass and premium genuine Italian leather strap.",
        is_featured: true,
        is_flash_sale: false,
        is_trending: true,
        is_new_arrival: false,
        is_best_seller: true,
        category_id: seededSubs["mechanical-watches"].id,
        brand_id: seededBrands["Rolex"].id
      },
      {
        name: "Barista Pro Espresso Machine",
        slug: "barista-pro-espresso",
        sku: "SKU-BAR-PRO",
        buying_price: 450.00,
        selling_price: 899.00,
        compare_price: 1199.00,
        current_stock: 18,
        featured_image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=600&auto=format&fit=crop",
        short_desc: "Professional-grade home espresso system with integrated grinder.",
        full_desc: "Brew barista-quality specialty coffee at home. Delivers rich espresso extraction, automatic milk frothing, and precise temperature regulation.",
        is_featured: true,
        is_flash_sale: true,
        is_trending: false,
        is_new_arrival: true,
        is_best_seller: true,
        category_id: seededSubs["espresso-machines"].id,
        brand_id: null
      },
      {
        name: "Vanguard Leather Wallet",
        slug: "vanguard-leather-wallet",
        sku: "SKU-VAN-WAL",
        buying_price: 50.00,
        selling_price: 120.00,
        compare_price: 180.00,
        current_stock: 50,
        featured_image: "https://images.unsplash.com/photo-1627124718015-74477811af9f?q=80&w=600&auto=format&fit=crop",
        short_desc: "Handcrafted full-grain leather wallet with secure RFID blocking.",
        full_desc: "A sleek, minimalist wallet designed for the modern connoisseur. Features multiple card slots, cash sleeve, and a hidden compartment.",
        is_featured: false,
        is_flash_sale: true,
        is_trending: false,
        is_new_arrival: true,
        is_best_seller: false,
        category_id: seededSubs["leather-wallets"].id,
        brand_id: null
      },
      {
        name: "Apex Mechanical Keyboard",
        slug: "apex-mechanical-keyboard",
        sku: "SKU-APE-KEY",
        buying_price: 90.00,
        selling_price: 199.00,
        compare_price: 249.00,
        current_stock: 25,
        featured_image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=600&auto=format&fit=crop",
        short_desc: "Hot-swappable mechanical switches with solid brass frame plates.",
        full_desc: "A typing masterpiece designed for enthusiasts. Features linear quiet switches, PBT double-shot keycaps, and customizable brass acoustics.",
        is_featured: true,
        is_flash_sale: false,
        is_trending: true,
        is_new_arrival: true,
        is_best_seller: false,
        category_id: seededSubs["mechanical-keyboards"].id,
        brand_id: null
      },
      {
        name: "Aura Amber Parfum",
        slug: "aura-amber-parfum",
        sku: "SKU-AUR-AMB",
        buying_price: 60.00,
        selling_price: 150.00,
        compare_price: 210.00,
        current_stock: 30,
        featured_image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop",
        short_desc: "Exclusive amber and woody formulation with 12-hour projection.",
        full_desc: "An enchanting luxury fragrance featuring warm amber, smooth sandalwood, and fresh citrus notes. Crafted for sensory elegance.",
        is_featured: true,
        is_flash_sale: true,
        is_trending: true,
        is_new_arrival: false,
        is_best_seller: false,
        category_id: seededSubs["parfums"].id,
        brand_id: null
      },
      {
        name: "Luminous Skincare Set",
        slug: "luminous-skincare-set",
        sku: "SKU-LUM-SKI",
        buying_price: 35.00,
        selling_price: 85.00,
        compare_price: 110.00,
        current_stock: 40,
        featured_image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop",
        short_desc: "Organic botanical hydration formula for radiant skin texture.",
        full_desc: "Revitalize your skin with our premium organic skincare set. Includes soothing facial cleanser, hyaluronic acid serum, and deep moisturizing lotion.",
        is_featured: false,
        is_flash_sale: false,
        is_trending: false,
        is_new_arrival: true,
        is_best_seller: true,
        category_id: seededSubs["skincare-sets"].id,
        brand_id: null
      },
      {
        name: "iPhone 15 Pro Max Titanium",
        slug: "iphone-15-pro-max",
        sku: "SKU-IPH-15PM",
        buying_price: 950.00,
        selling_price: 1299.00,
        compare_price: 1399.00,
        current_stock: 15,
        featured_image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600&auto=format&fit=crop",
        short_desc: "Forged in aerospace titanium with advanced 5x zoom camera.",
        full_desc: "Super Retina XDR display, A17 Pro high-performance chip, custom Action button, and professional camera system.",
        is_featured: true,
        is_flash_sale: false,
        is_trending: true,
        is_new_arrival: false,
        is_best_seller: true,
        category_id: seededSubs["smartphones"].id,
        brand_id: seededBrands["Apple"].id
      },
      {
        name: "Galaxy S24 Ultra Slate",
        slug: "galaxy-s24-ultra",
        sku: "SKU-SAM-S24U",
        buying_price: 850.00,
        selling_price: 1199.00,
        compare_price: 1299.00,
        current_stock: 20,
        featured_image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop",
        short_desc: "Integrated S-Pen stylus with advanced live translations AI engines.",
        full_desc: "Snapdragon 8 Gen 3 chipset, 200MP detail camera sensor, long battery performance, and durable Corning Gorilla armor.",
        is_featured: true,
        is_flash_sale: false,
        is_trending: true,
        is_new_arrival: true,
        is_best_seller: false,
        category_id: seededSubs["smartphones"].id,
        brand_id: seededBrands["Samsung"].id
      },
      {
        name: "Aero ANC Earbuds",
        slug: "aero-anc-earbuds",
        sku: "SKU-AER-EAR",
        buying_price: 120.00,
        selling_price: 249.00,
        compare_price: 299.00,
        current_stock: 35,
        featured_image: "https://images.unsplash.com/photo-1588449668338-d1348257535d?q=80&w=600&auto=format&fit=crop",
        short_desc: "Studio-tuned true wireless earbuds with custom acoustic venting.",
        full_desc: "Deliver pure bass impact and clean trebles. Features double active noise cancellation power, touch gestures, and wireless fast charging.",
        is_featured: false,
        is_flash_sale: true,
        is_trending: true,
        is_new_arrival: false,
        is_best_seller: false,
        category_id: seededSubs["wireless-earbuds"].id,
        brand_id: seededBrands["Apple"].id
      },
      {
        name: "Classic Amber Eyewear",
        slug: "classic-amber-eyewear",
        sku: "SKU-CLA-AMB",
        buying_price: 70.00,
        selling_price: 180.00,
        compare_price: 260.00,
        current_stock: 28,
        featured_image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop",
        short_desc: "Hand-polished cellulose acetate frame with premium UV400 lenses.",
        full_desc: "Vintage aesthetics meet modern craftsmanship. Solid metal hinges, lightweight temples, and anti-reflective optical coating.",
        is_featured: true,
        is_flash_sale: false,
        is_trending: false,
        is_new_arrival: false,
        is_best_seller: true,
        category_id: seededSubs["designer-eyewear"].id,
        brand_id: null
      },
      {
        name: "Zenith Room Air Purifier",
        slug: "zenith-air-purifier",
        sku: "SKU-ZEN-PUR",
        buying_price: 180.00,
        selling_price: 349.00,
        compare_price: 449.00,
        current_stock: 14,
        featured_image: "https://images.unsplash.com/photo-1585338114002-9592360f6c26?q=80&w=600&auto=format&fit=crop",
        short_desc: "Triple filtration medical HEPA filter for sterile breathing space.",
        full_desc: "Quiet operation motor, real-time air quality indexing, smart auto-mode, and removes 99.97% of airborne microparticles.",
        is_featured: false,
        is_flash_sale: false,
        is_trending: false,
        is_new_arrival: true,
        is_best_seller: false,
        category_id: seededSubs["air-purifiers"].id,
        brand_id: null
      }
    ];

    for (const prod of productsData) {
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

    // 6. Update default Config
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
      section_order: ["hero", "categories", "quick_deal", "promo_banner", "featured", "brands", "testimonials", "newsletter"],
      disabled_sections: [],
      colors: {
        primary: "#2563eb",
        background: "#ffffff",
        cardBg: "#f8fafc",
        secondary: "#4f46e5"
      },
      brand_logos: [
        { name: "Rolex", logoUrl: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=100&fit=crop&q=60", brandId: "" },
        { name: "Sony", logoUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=100&fit=crop&q=60", brandId: "" },
        { name: "Apple", logoUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&fit=crop&q=60", brandId: "" },
        { name: "Samsung", logoUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100&fit=crop&q=60", brandId: "" }
      ],
      testimonials: [
        { name: "Mahmud Hasan", text: "Absolutely phenomenal quality! Sourcing was incredibly smooth.", rating: 5, role: "Regular Shopper" },
        { name: "Farhana Yasmin", text: "The noise cancellation headset is top tier. Fast dispatch delivery.", rating: 5, role: "Corporate Sourcing" },
        { name: "Tahmid Alom", text: "Exceptional luxury watches, exact details and fast shipping.", rating: 5, role: "Connoisseur" }
      ]
    };

    const existingConfig = await prisma.homepageConfig.findUnique({ where: { id: "default" } });
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
      console.warn("⚠️ Revalidation skipped:", revalErr);
    }
    return { success: "Demo production-ready catalog and homepage dataset seeded successfully!" };
  } catch (error: any) {
    console.error("❌ DEMO SEED ERROR:", error);
    return { error: `Failed to seed demo database: ${error?.message || "Prisma query validation error."}` };
  }
}
