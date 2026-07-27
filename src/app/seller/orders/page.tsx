import React from "react";
import { notFound } from "next/navigation";
import { getActiveSellerStore } from "@/actions/seller-session";
import { getSellerOrders } from "@/actions/seller";
import SellerOrdersClient from "./SellerOrdersClient";

export default async function SellerOrdersPage({
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

  // Fetch store's sub-orders
  const ordersRes = await getSellerOrders(store.id);

  return (
    <SellerOrdersClient
      initialOrders={ordersRes.orders || []}
    />
  );
}
