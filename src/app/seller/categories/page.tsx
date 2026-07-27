import React from "react";
import { notFound } from "next/navigation";
import { getActiveSellerStore } from "@/actions/seller-session";
import { prisma } from "@/lib/prisma";
import SellerCategoriesClient from "./SellerCategoriesClient";

export default async function SellerCategoriesPage({
  searchParams
}: {
  searchParams: Promise<{ store_id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const storeSession = await getActiveSellerStore(resolvedParams.store_id);

  if (!storeSession) {
    notFound();
  }

  const storeId = storeSession.store.id;

  // Fetch categories created by this seller store
  const sellerCategories = await prisma.categoryMatrix.findMany({
    where: { store_id: storeId },
    include: {
      parent: true,
      products: { select: { id: true } }
    },
    orderBy: { name: "asc" }
  });

  // Fetch global categories for parent selection
  const globalCategories = await prisma.categoryMatrix.findMany({
    where: { store_id: null, status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  const serializedSellerCategories = sellerCategories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parent_id: c.parent_id,
    parent_name: c.parent?.name || null,
    description: c.description,
    status: c.status,
    image_url: c.image_url,
    is_featured: c.is_featured,
    product_count: c.products?.length || 0,
    createdAt: c.createdAt ? c.createdAt.toISOString() : String(new Date())
  }));

  return (
    <SellerCategoriesClient 
      storeId={storeId} 
      storeName={storeSession.store.name}
      initialCategories={serializedSellerCategories} 
      globalCategories={globalCategories}
    />
  );
}
