"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

const DEFAULT_CONFIG = {
  slider_images: [
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop"
  ],
  right_banners: [
    { title: "Smart Gadgets Campaign", sub: "Instant 15% cashback inside", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop", link: "/categories" },
    { title: "Download App", sub: "Scan to shop anywhere", url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=600&auto=format&fit=crop", link: "#" }
  ],
  promo_banners: [
    "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1600&auto=format&fit=crop"
  ],
  section_order: ["hero", "categories", "quick_deal", "promo_banner", "featured", "brands", "testimonials", "newsletter"],
  disabled_sections: [],
  colors: {
    primary: "#3b82f6",
    secondary: "#10b981",
    cardBg: "#f8fafc",
    background: "#ffffff"
  },
  brand_logos: [
    { name: "Casio", logoUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=200&auto=format&fit=crop", brandId: "" },
    { name: "Sony", logoUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=200&auto=format&fit=crop", brandId: "" },
    { name: "Apple", logoUrl: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=200&auto=format&fit=crop", brandId: "" }
  ],
  testimonials: [
    { name: "Anisur Rahman", text: "Amazing purchase experience. Extremely smooth and professional delivery.", rating: 5, role: "Tech Lead" },
    { name: "Sultana Kamal", text: "Premium products. Customer service responded in minutes.", rating: 5, role: "Regular Shopper" }
  ]
};

export async function getHomepageConfig() {
  "use cache";
  try {
    let config = await prisma.homepageConfig.findUnique({
      where: { id: "default" }
    });

    if (!config) {
      config = await prisma.homepageConfig.create({
        data: {
          id: "default",
          ...DEFAULT_CONFIG
        }
      });
    }

    return {
      config: {
        ...config,
        right_banners: config.right_banners as any[],
        colors: config.colors as any,
        brand_logos: config.brand_logos as any[],
        testimonials: config.testimonials as any[]
      }
    };
  } catch (error: any) {
    console.error("❌ FETCH HOMEPAGE CONFIG ERROR:", error);
    return { error: `Fetch failed: ${error?.message}` };
  }
}

export async function updateHomepageConfig(data: any) {
  try {
    await prisma.homepageConfig.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        slider_images: data.slider_images || [],
        right_banners: data.right_banners || [],
        promo_banners: data.promo_banners || [],
        section_order: data.section_order || [],
        disabled_sections: data.disabled_sections || [],
        colors: data.colors || {},
        brand_logos: data.brand_logos || [],
        testimonials: data.testimonials || []
      },
      update: {
        slider_images: data.slider_images,
        right_banners: data.right_banners,
        promo_banners: data.promo_banners,
        section_order: data.section_order,
        disabled_sections: data.disabled_sections,
        colors: data.colors,
        brand_logos: data.brand_logos,
        testimonials: data.testimonials
      }
    });

    revalidatePath("/");
    return { success: "Homepage configuration saved successfully!" };
  } catch (error: any) {
    console.error("❌ UPDATE HOMEPAGE CONFIG ERROR:", error);
    return { error: `Update failed: ${error?.message}` };
  }
}
