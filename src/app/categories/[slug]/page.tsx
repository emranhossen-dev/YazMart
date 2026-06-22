import React, { Suspense } from "react";
import { getCategoryProducts } from "@/actions/shop";
import CategoryProductsPageClient from "./CategoryProductsPageClient";

export const unstable_instant = { 
  prefetch: "static",
  unstable_disableValidation: true,
};

export default async function CategoryProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] font-sans text-xs font-bold uppercase tracking-wider">Loading YazMart Category...</div>}>
      <CategoryProductsLoader params={params} />
    </Suspense>
  );
}

async function CategoryProductsLoader({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { category, products } = await getCategoryProducts(slug);

  return (
    <CategoryProductsPageClient
      slug={slug}
      initialCategory={category}
      initialProducts={products || []}
    />
  );
}
