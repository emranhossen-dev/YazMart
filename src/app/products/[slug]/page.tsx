import React from "react";
import { getProductDetails } from "@/actions/shop";
import ProductDetailPageClient from "./ProductDetailPageClient";

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
