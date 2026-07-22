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

  const roleLower = session.role?.toLowerCase() || "";
  const isAdminOrStaff = roleLower.includes("admin") || roleLower.includes("staff");

  if (!isAdminOrStaff) {
    redirect("/auth");
  }

  return (
    <Suspense fallback={null}>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </Suspense>
  );
}