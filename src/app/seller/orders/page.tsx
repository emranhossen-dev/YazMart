import React from "react";
import { notFound, redirect } from "next/navigation";
import { getEnterpriseUserSession } from "@/actions/auth-enterprise";
import { getSellerStore, getSellerOrders } from "@/actions/seller";
import SellerOrdersClient from "./SellerOrdersClient";

export const unstable_instant = false;

export default async function SellerOrdersPage() {
  const session = await getEnterpriseUserSession();

  if (!session.authenticated || !session.user) {
    notFound();
  }

  const storeRes = await getSellerStore(session.user.id);
  const store = storeRes.store;

  if (!store) {
    redirect("/seller");
  }

  // Fetch store's sub-orders
  const ordersRes = await getSellerOrders(store.id);

  return (
    <SellerOrdersClient
      initialOrders={ordersRes.orders || []}
    />
  );
}
