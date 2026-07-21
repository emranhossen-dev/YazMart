import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { getEnterpriseUserSession } from "@/actions/auth-enterprise";
import { getSellerStore } from "@/actions/seller";
import SellerLayoutClient from "./SellerLayoutClient";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await getEnterpriseUserSession();

  if (!session.authenticated || !session.user) {
    notFound();
  }

  // Get seller store if it exists
  const storeRes = await getSellerStore(session.user.id);
  const store = storeRes.store;

  const isAdmin = session.role === "admin" || session.role === "Super Admin" || session.role === "Admin";

  // Access check: only admins or users with active stores can enter
  if (!isAdmin && (!store || store.status !== "ACTIVE")) {
    notFound();
  }

  // Fallback default structure for administrators who do not own a store yet
  const defaultStore = store || {
    id: "",
    owner_id: session.user.id,
    name: "Admin Audit Workspace",
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
    <Suspense fallback={null}>
      <SellerLayoutClient session={session} store={defaultStore}>
        {children}
      </SellerLayoutClient>
    </Suspense>
  );
}
