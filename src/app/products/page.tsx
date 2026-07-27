import React from "react";
import { getAllProducts } from "@/actions/shop";
import ProductsPageClient from "./ProductsPageClient";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const { products, categories } = await getAllProducts();

  return (
    <ProductsPageClient
      initialProducts={products || []}
      initialCategories={categories || []}
    />
  );
}
