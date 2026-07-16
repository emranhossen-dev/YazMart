import React from "react";
import { notFound } from "next/navigation";
import { getActiveSellerStore } from "@/actions/seller-session";
import { getStoreCoupons } from "@/actions/seller";
import CouponsClient from "./CouponsClient";

export const unstable_instant = false;

export default async function SellerCouponsPage({
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
  const couponsRes = await getStoreCoupons(store.slug);

  return (
    <CouponsClient
      storeSlug={store.slug}
      initialCoupons={couponsRes.coupons || []}
    />
  );
}
