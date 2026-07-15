import React from "react";
import { notFound, redirect } from "next/navigation";
import { getEnterpriseUserSession } from "@/actions/auth-enterprise";
import { getSellerStore } from "@/actions/seller";
import SettingsClient from "./SettingsClient";

export const unstable_instant = false;

export default async function SellerSettingsPage() {
  const session = await getEnterpriseUserSession();

  if (!session.authenticated || !session.user) {
    notFound();
  }

  const storeRes = await getSellerStore(session.user.id);
  const store = storeRes.store;

  if (!store) {
    redirect("/seller");
  }

  return <SettingsClient store={store} />;
}
