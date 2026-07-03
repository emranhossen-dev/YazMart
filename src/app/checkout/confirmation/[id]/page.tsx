import React, { Suspense } from "react";
import OrderConfirmationPageClient from "./OrderConfirmationPageClient";

export const unstable_instant = false;

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OrderConfirmationPageClient />
    </Suspense>
  );
}
