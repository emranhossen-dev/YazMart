import React from "react";
import { notFound } from "next/navigation";
import { getEnterpriseUserSession } from "@/actions/auth-enterprise";

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const session = await getEnterpriseUserSession();

  if (!session || !session.authenticated || !session.role) {
    notFound();
  }

  return <>{children}</>;
}
