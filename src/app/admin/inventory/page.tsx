"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Warehouse, ArrowLeftRight, Layers, FileText, CheckCircle, Search, AlertCircle } from "lucide-react";

const STOCK_MATRIX = [
  { sku: "SKU-PROD-A1", name: "Premium Leather Shoes", stock: 124, status: "IN_STOCK", location: "Dhaka Central WH" },
  { sku: "SKU-PROD-B2", name: "Noise Cancelling Headphones", stock: 45, status: "IN_STOCK", location: "Dhaka Central WH" },
  { sku: "SKU-PROD-C3", name: "Mechanical Keyboard RGB", stock: 12, status: "LOW_STOCK", location: "Chittagong Outlet" },
  { sku: "SKU-PROD-D4", name: "Minimalist Chronograph Watch", stock: 0, status: "OUT_OF_STOCK", location: "Sylhet Hub" }
];

const WAREHOUSES = [
  { id: "WH-01", name: "Dhaka Central WH", manager: "Farhan Ahmed", capacity: "85% utilized", status: "ACTIVE" },
  { id: "WH-02", name: "Chittagong Outlet Hub", manager: "Jamil Khan", capacity: "40% utilized", status: "ACTIVE" },
  { id: "WH-03", name: "Sylhet Logistics Node", manager: "Zahid Hasan", capacity: "12% utilized", status: "ACTIVE" }
];

const TRANSFERS = [
  { ref: "TR-9081", from: "Dhaka Central WH", to: "Chittagong Outlet", qty: 25, item: "Mechanical Keyboard RGB", date: "2026-06-20", status: "COMPLETED" },
  { ref: "TR-9077", from: "Dhaka Central WH", to: "Sylhet Hub", qty: 10, item: "Minimalist Chronograph Watch", date: "2026-06-18", status: "IN_TRANSIT" }
];

const LOGS = [
  { id: "LOG-01", action: "Stock Adjustment", item: "Premium Leather Shoes", qty: "+30 items", staff: "Emran Admin", time: "2026-06-22 09:30" },
  { id: "LOG-02", action: "Inventory Dispatch", item: "Noise Cancelling Headphones", qty: "-2 items", staff: "System Checkout", time: "2026-06-22 08:45" }
];

function InventoryPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams ? searchParams.get("tab") || "matrix" : "matrix";

  const selectTab = (tabName: string) => {
    if (tabName === "matrix") {
      router.push("/admin/inventory");
    } else {
      router.push(`/admin/inventory?tab=${tabName}`);
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Inventory Matrix</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Supervise logistics, stock alerts, warehousing assignments, and internal stock transfer ledgers.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-px">
        <button 
          onClick={() => selectTab("matrix")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "matrix" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Stock Matrix
        </button>
        <button 
          onClick={() => selectTab("warehouses")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "warehouses" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Warehouses
        </button>
        <button 
          onClick={() => selectTab("transfer")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "transfer" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Stock Transfer
        </button>
        <button 
          onClick={() => selectTab("history")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "history" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Stock History
        </button>
      </div>

      {/* Table Card */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        {tab === "matrix" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-500" /> General Stock Ledger
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">SKU Identifier</th>
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">Current Stock</th>
                    <th className="pb-3">Warehouse Node</th>
                    <th className="pb-3 text-right">Status Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {STOCK_MATRIX.map((item) => (
                    <tr key={item.sku} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{item.sku}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{item.name}</td>
                      <td className="py-3.5 text-[var(--foreground)] font-bold">{item.stock} Units</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{item.location}</td>
                      <td className="py-3.5 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.status === "IN_STOCK" ? "bg-emerald-500/10 text-emerald-500" :
                          item.status === "LOW_STOCK" ? "bg-amber-500/10 text-amber-500" :
                          "bg-rose-500/10 text-rose-500"
                        }`}>
                          {item.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "warehouses" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-blue-500" /> Active Storage Hubs
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Storage ID</th>
                    <th className="pb-3">Hub Name</th>
                    <th className="pb-3">Logistics Manager</th>
                    <th className="pb-3">Volumetric Capacity</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {WAREHOUSES.map((wh) => (
                    <tr key={wh.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{wh.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{wh.name}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{wh.manager}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)] font-mono text-[10px] font-bold">{wh.capacity}</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase">
                          {wh.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "transfer" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-blue-500" /> Stock Transfer Orders
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Ref ID</th>
                    <th className="pb-3">Item Details</th>
                    <th className="pb-3">From Warehouse</th>
                    <th className="pb-3">To Warehouse</th>
                    <th className="pb-3">Qty</th>
                    <th className="pb-3">Created Date</th>
                    <th className="pb-3 text-right">Dispatch Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {TRANSFERS.map((tr) => (
                    <tr key={tr.ref} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{tr.ref}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{tr.item}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{tr.from}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{tr.to}</td>
                      <td className="py-3.5 text-[var(--foreground)] font-bold">{tr.qty} Units</td>
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{tr.date}</td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tr.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                        }`}>
                          {tr.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" /> Stock Audit logs
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Log Reference</th>
                    <th className="pb-3">Action Type</th>
                    <th className="pb-3">Target SKU / Product</th>
                    <th className="pb-3">Qty Adjustment</th>
                    <th className="pb-3">Staff Operator</th>
                    <th className="pb-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {LOGS.map((log) => (
                    <tr key={log.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{log.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{log.action}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{log.item}</td>
                      <td className={`py-3.5 font-black font-mono text-[10px] ${log.qty.startsWith("+") ? "text-emerald-500" : "text-rose-500"}`}>
                        {log.qty}
                      </td>
                      <td className="py-3.5 text-[var(--muted-foreground)] font-bold">{log.staff}</td>
                      <td className="py-3.5 text-right font-mono text-[10px] text-[var(--muted-foreground)]">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-[var(--muted-foreground)]">Loading Inventory Matrix...</div>}>
      <InventoryPageContent />
    </Suspense>
  );
}
