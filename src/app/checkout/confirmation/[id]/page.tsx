import React, { Suspense } from "react";
import OrderConfirmationPageClient from "./OrderConfirmationPageClient";

export const unstable_instant = false;

export default async function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] font-sans text-xs font-bold uppercase tracking-wider">
        Loading Order Confirmation...
      </div>
    }>
      <OrderConfirmationPageClient />
    </Suspense>
  );
}
