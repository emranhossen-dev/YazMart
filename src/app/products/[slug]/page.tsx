import React from "react";
import { Metadata } from "next";
import { headers } from "next/headers";
import { getProductDetails } from "@/actions/shop";
import ProductDetailPageClient from "./ProductDetailPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await getProductDetails(slug);
  if (!res || !res.product) {
    return {
      title: "Product Not Found",
    };
  }

  const product = res.product;
  const headerList = await headers();
  const host = headerList.get("host") || "";
  const siteName = host.toLowerCase().includes("gadgetbro") ? "GadgetBro" : "YazMart";

  const seoTitle = product.meta_title || `${product.name} | ${siteName}`;
  const seoDesc = product.meta_desc || product.short_desc || `Order ${product.name} online at the best price on ${siteName}.`;
  const image = product.featured_image ? [product.featured_image] : [];

  return {
    title: seoTitle,
    description: seoDesc,
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      images: image,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDesc,
      images: image,
    },
  };
}

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await getProductDetails(slug);

  if (!res || res.error || !res.product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] gap-3 text-[var(--foreground)] font-sans">
        <p className="text-sm font-bold uppercase">Product not found</p>
        <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase">Go to storefront</a>
      </div>
    );
  }

  return (
    <ProductDetailPageClient
      initialProduct={res.product}
      initialRelated={res.relatedProducts || []}
    />
  );
}
