import React from "react";
import { notFound } from "next/navigation";
import { getActiveSellerStore } from "@/actions/seller-session";
import { prisma } from "@/lib/prisma";
import { Award } from "lucide-react";

import SellerBrandsClient from "./SellerBrandsClient";

export const unstable_instant = false;

export default async function SellerBrandsPage({
  searchParams
}: {
  searchParams: Promise<{ store_id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const storeSession = await getActiveSellerStore(resolvedParams.store_id);

  if (!storeSession) {
    notFound();
  }

  // Fetch active brands
  const brands = await prisma.brandMatrix.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" }
  });

  const serializedBrands = brands.map(b => ({
    id: b.id,
    name: b.name,
    logo_url: b.logo_url,
    status: b.status,
  }));

  return <SellerBrandsClient initialBrands={serializedBrands} />;
}
