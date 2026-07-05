import React, { Suspense } from "react";
import OnlinePaymentPageClient from "./OnlinePaymentPageClient";

export default function OnlinePaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="h-8 w-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OnlinePaymentPageClient />
    </Suspense>
  );
}
