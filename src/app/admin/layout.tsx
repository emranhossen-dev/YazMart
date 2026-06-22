import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getEnterpriseUserSession } from "@/actions/auth-enterprise";
import AdminLayoutClient from "./AdminLayoutClient";

export const unstable_instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getEnterpriseUserSession();

  if (!session.authenticated || !session.user) {
    redirect("/auth");
  }

  if (session.role !== "admin" && session.role !== "Super Admin") {
    redirect("/");
  }

  return (
    <Suspense fallback={<div className="p-6 text-xs text-[var(--muted-foreground)]">Loading Admin Workspace...</div>}>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </Suspense>
  );
}