import React from "react";
import { notFound } from "next/navigation";
import { getActiveSellerStore } from "@/actions/seller-session";
import { prisma } from "@/lib/prisma";
import { 
  CircleDollarSign, ArrowUpRight, Clock, ShieldCheck, Wallet, ArrowDownRight 
} from "lucide-react";

export default async function SellerFinancePage({
  searchParams
}: {
  searchParams: Promise<{ store_id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const storeSession = await getActiveSellerStore(resolvedParams.store_id);

  if (!storeSession) {
    notFound();
  }

  const { store } = storeSession;

  // Fetch store's sub-orders
  const subOrders = await prisma.subOrder.findMany({
    where: { store_id: store.id },
    include: {
      parent: true
    },
    orderBy: { createdAt: "desc" }
  });

  // Calculate metrics
  let totalSales = 0;
  let pendingClearance = 0;
  let availablePayout = 0;

  subOrders.forEach((so) => {
    const val = Number(so.total_amount);
    if (so.status === "CANCELLED") return;

    totalSales += val;

    if (so.status === "COMPLETED") {
      // 90% goes to seller, 10% marketplace commission
      availablePayout += val * 0.9;
    } else {
      pendingClearance += val;
    }
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Earnings & Finance</h1>
        <p className="text-xs font-semibold text-zinc-400">Track store revenues, payouts, commissions, and transaction summaries.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Earnings */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Revenue</span>
            <div className="rounded-lg bg-zinc-100 p-1.5 text-zinc-600">
              <CircleDollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-zinc-950">৳{totalSales.toLocaleString()}</h3>
            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Platform Commission: 10%</p>
          </div>
        </div>

        {/* Pending Payout */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Pending Clearance</span>
            <div className="rounded-lg bg-amber-50 p-1.5 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-amber-600">৳{pendingClearance.toLocaleString()}</h3>
            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Awaiting delivery completion</p>
          </div>
        </div>

        {/* Ready for payout */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Available Payout</span>
            <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-emerald-600">৳{availablePayout.toLocaleString()}</h3>
            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Cleared net revenue</p>
          </div>
        </div>
      </div>

      {/* Transaction log */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-extrabold uppercase text-zinc-400">Recent Earnings Logs</h3>

        <div className="divide-y divide-zinc-100">
          {subOrders.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <Wallet className="mx-auto h-10 w-10 opacity-45 mb-2" />
              No sales transactions have been logged.
            </div>
          ) : (
            subOrders.map((so) => (
              <div key={so.id} className="flex items-center justify-between py-4.5 first:pt-0 last:pb-0">
                <div className="space-y-1">
                  <p className="font-extrabold text-sm text-zinc-950">
                    Order Payment Scoped
                  </p>
                  <p className="text-[10px] text-zinc-400 font-semibold">
                    Ref: #{so.id.slice(0, 8).toUpperCase()} • Customer: {so.parent?.customer_name || "Client"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm text-zinc-950">
                    +৳{Number(so.total_amount).toLocaleString()}
                  </p>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase">
                    Status: {so.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
