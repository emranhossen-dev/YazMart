import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getEnterpriseUserSession } from "@/actions/auth-enterprise";
import { getSellerStore } from "@/actions/seller";
import SellerLayoutClient from "./SellerLayoutClient";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await getEnterpriseUserSession();

  const userId = session.user?.id || "";
  const storeRes = userId ? await getSellerStore(userId) : { store: null };
  const store = storeRes.store;

  const defaultStore = store || {
    id: "",
    owner_id: userId,
    name: "Seller Hub Workspace",
    slug: "",
    status: "ACTIVE",
    colors: {
      primary: "#18181b",
      secondary: "#71717a",
      cardBg: "#ffffff",
      background: "#fafafa"
    }
  };

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-sm font-bold">Loading Seller Hub...</div>}>
      <SellerLayoutClient session={session} store={defaultStore}>
        {children}
      </SellerLayoutClient>
    </Suspense>
  );
}
