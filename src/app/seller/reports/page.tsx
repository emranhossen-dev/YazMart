import React from "react";
import { notFound } from "next/navigation";
import { getActiveSellerStore } from "@/actions/seller-session";
import { prisma } from "@/lib/prisma";
import { FileBarChart2, Download, Table, FileText, ChevronRight } from "lucide-react";

export const unstable_instant = false;

export default async function SellerReportsPage({
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

  // Gather stats for reports overview
  const productsCount = await prisma.pimProducts.count({ where: { store_id: store.id } });
  const subOrders = await prisma.subOrder.findMany({ where: { store_id: store.id } });
  
  const ordersCount = subOrders.length;
  const totalSales = subOrders.reduce((sum, so) => sum + Number(so.total_amount), 0);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Analytics & Reports</h1>
        <p className="text-xs font-semibold text-zinc-400">Generate, view, and export CSV/PDF summaries of your store performance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Report Cards */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-zinc-400">Available Report Types</h3>
          
          <div className="space-y-2">
            {/* Sales Ledger */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-100 hover:border-zinc-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-50 text-zinc-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-zinc-900">Sales ledger report</h4>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Logs all orders, dates, and payout amounts.</p>
                </div>
              </div>
              <button className="flex items-center justify-center p-2 rounded-xl border border-zinc-200 text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-colors cursor-pointer">
                <Download className="h-4 w-4" />
              </button>
            </div>

            {/* Inventory Valuation */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-100 hover:border-zinc-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-50 text-zinc-600">
                  <Table className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-zinc-900">Inventory valuation report</h4>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Summary of total units, buying prices, and assets value.</p>
                </div>
              </div>
              <button className="flex items-center justify-center p-2 rounded-xl border border-zinc-200 text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-colors cursor-pointer">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Scoped Valuation Overview */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-zinc-400">Store Valuation Summary</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 rounded-2xl">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Catalog Size</span>
                <span className="text-lg font-black text-zinc-950">{productsCount} Items</span>
              </div>
              <div className="p-4 bg-zinc-50 rounded-2xl">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Orders Processed</span>
                <span className="text-lg font-black text-zinc-950">{ordersCount} orders</span>
              </div>
            </div>

            <div className="p-4 border border-zinc-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Gross Sales Volume</span>
                <span className="text-xl font-black text-zinc-950">৳{totalSales.toLocaleString()}</span>
              </div>
              <FileBarChart2 className="h-8 w-8 text-zinc-300" />
            </div>
          </div>

          <p className="text-[10px] text-zinc-400 leading-relaxed pt-4 border-t border-zinc-100">
            * Reports are compiled live from your database and transaction logs. Platforms commissions of 10% are excluded from gross valuation listings.
          </p>
        </div>
      </div>
    </div>
  );
}
