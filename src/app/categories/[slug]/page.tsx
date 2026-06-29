import React from "react";
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
