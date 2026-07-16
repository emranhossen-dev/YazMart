import React from "react";
import { notFound } from "next/navigation";
import { getActiveSellerStore } from "@/actions/seller-session";
import { prisma } from "@/lib/prisma";
import { FolderHeart, Hash, HelpCircle } from "lucide-react";

import SellerCategoriesClient from "./SellerCategoriesClient";

export const unstable_instant = false;

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

  // Fetch active categories
  const categories = await prisma.categoryMatrix.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" }
  });

  const serializedCategories = categories.map(c => ({
    id: c.id,
    name: c.name,
    parent_id: c.parent_id,
    description: c.description,
    status: c.status,
  }));

  return <SellerCategoriesClient initialCategories={serializedCategories} />;
}
