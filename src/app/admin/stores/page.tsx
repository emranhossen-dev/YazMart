import React from "react";
import { notFound } from "next/navigation";
import { getEnterpriseUserSession } from "@/actions/auth-enterprise";
import { getAdminStores } from "@/actions/seller";
import AdminStoresClient from "./AdminStoresClient";

export const unstable_instant = false;

export default async function AdminStoresPage() {
  const session = await getEnterpriseUserSession();

  const isAdmin = session.role === "admin" || session.role === "Super Admin" || session.role === "Admin";
  if (!session.authenticated || !session.user || !isAdmin) {
    notFound();
  }

  const storesRes = await getAdminStores();

  return (
    <div className="p-6 space-y-6">
      <AdminStoresClient initialStores={storesRes.stores || []} />
    </div>
  );
}
