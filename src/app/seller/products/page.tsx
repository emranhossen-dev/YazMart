import React from "react";
import { notFound } from "next/navigation";
import { getActiveSellerStore } from "@/actions/seller-session";
import { prisma } from "@/lib/prisma";
import SellerProductsClient from "./SellerProductsClient";

export const unstable_instant = false;

function serializePimProduct(p: any) {
  const toNum = (val: any) => {
    if (val === null || val === undefined) return null;
    if (typeof val === "object" && typeof val.toNumber === "function") {
      return val.toNumber();
    }
    return Number(val);
  };
  return {
    ...p,
    buying_price: toNum(p.buying_price),
    selling_price: toNum(p.selling_price),
    compare_price: toNum(p.compare_price),
    current_stock: Number(p.current_stock),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export default async function SellerProductsPage({
  searchParams
}: {
  searchParams: Promise<{ store_id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const storeSession = await getActiveSellerStore(resolvedParams.store_id);

  if (!storeSession) {
    notFound();
  }

  const { store } = storeSession;

  // Fetch store's products
  const products = await prisma.pimProducts.findMany({
    where: { store_id: store.id },
    include: {
      category: true,
      brand: true
    },
    orderBy: { createdAt: "desc" }
  });

  // Fetch categories and brands for add/edit form
  const categories = await prisma.categoryMatrix.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true }
  });

  const brands = await prisma.brandMatrix.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true }
  });

  const serializedProducts = products.map(serializePimProduct);

  return (
    <SellerProductsClient
      storeId={store.id}
      initialProducts={serializedProducts}
      categories={categories}
      brands={brands}
    />
  );
}
