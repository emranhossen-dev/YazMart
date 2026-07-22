import React, { Suspense } from "react";
import { getEnterpriseUserSession } from "@/actions/auth-enterprise";
import AdminLayoutClient from "./AdminLayoutClient";

export const unstable_instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getEnterpriseUserSession();

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-sm font-bold">Loading Admin Dashboard...</div>}>
      <AdminLayoutClient session={session}>{children}</AdminLayoutClient>
    </Suspense>
  );
}