import React from "react";
import { getAllProducts } from "@/actions/shop";
import ProductsPageClient from "./ProductsPageClient";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

export default async function ProductsPage() {
  const { products, categories } = await getAllProducts();

  return (
    <ProductsPageClient
      initialProducts={products || []}
      initialCategories={categories || []}
    />
  );
}
