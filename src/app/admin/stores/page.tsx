import React from "react";
import { getAdminStores } from "@/actions/seller";
import AdminStoresClient from "./AdminStoresClient";

export default async function AdminStoresPage() {
  const storesRes = await getAdminStores();

  return (
    <div className="p-6 space-y-6">
      <AdminStoresClient initialStores={storesRes.stores || []} />
    </div>
  );
}
