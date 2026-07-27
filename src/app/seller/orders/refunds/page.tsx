import React from "react";
import { notFound } from "next/navigation";
import { getActiveSellerStore } from "@/actions/seller-session";
import { HelpCircle, RefreshCw } from "lucide-react";

export default async function SellerRefundsPage({
  searchParams
}: {
  searchParams: Promise<{ store_id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const storeSession = await getActiveSellerStore(resolvedParams.store_id);

  if (!storeSession) {
    notFound();
  }

  return (
    <div className="space-y-6 font-sans select-none">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Refund Requests</h1>
        <p className="text-xs font-semibold text-zinc-400">Review refund tickets and compensation requests requested by buyers.</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white py-16 text-center text-zinc-400 shadow-sm">
        <RefreshCw className="mx-auto h-12 w-12 opacity-35 mb-2.5" />
        <p className="text-sm font-extrabold text-zinc-800">No active refund claims</p>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-1">When buyers initiate purchase claims on your items, they will appear here for audit approvals.</p>
      </div>
    </div>
  );
}
