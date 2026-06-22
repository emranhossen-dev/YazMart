import React, { Suspense } from "react";
import { getAllProducts } from "@/actions/shop";
import ProductsPageClient from "./ProductsPageClient";

export const unstable_instant = { 
  prefetch: "static",
  unstable_disableValidation: true,
};

export default async function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] font-sans text-xs font-bold uppercase tracking-wider">Loading YazMart Catalog...</div>}>
      <ProductsLoader />
    </Suspense>
  );
}

async function ProductsLoader() {
  const { products, categories } = await getAllProducts();

  return (
    <ProductsPageClient
      initialProducts={products || []}
      initialCategories={categories || []}
    />
  );
}
