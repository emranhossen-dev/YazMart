"use client";

import React, { useState, useEffect } from "react";
import { 
  DollarSign, Package, ShoppingCart, Layers, 
  TrendingUp, TrendingDown, Clock, AlertCircle, RefreshCw 
} from "lucide-react";

export default function AdvancedAdminDashboard() {
  const [loading, setLoading] = useState(false);

  // স্ট্যাটস কার্ডের ডেটা স্ট্রাকচার
  const salesStats = [
    { name: "Today's Sales", value: "$2,450.00", icon: DollarSign, change: "+12.5%", isPositive: true },
    { name: "Monthly Sales", value: "$45,231.89", icon: DollarSign, change: "+20.1%", isPositive: true },
    { name: "Total Net Profit", value: "$18,450.00", icon: TrendingUp, change: "+5.4%", isPositive: true },
    { name: "Total Expense", value: "$4,120.00", icon: TrendingDown, change: "-2.1%", isPositive: false },
  ];

  const orderStats = [
    { name: "Pending Orders", value: "14", type: "warning" },
    { name: "Processing", value: "28", type: "info" },
    { name: "Delivered Items", value: "1,205", type: "success" },
    { name: "Returned/Refunds", value: "3", type: "danger" },
  ];

  const stockStats = [
    { name: "Total Products", value: "2,405" },
    { name: "Out of Stock", value: "8", alert: true },
    { name: "Low Stock Alert", value: "19", alert: true },
    { name: "Total Taxonomies", value: "48" },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase">Command Control Center</h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Real-time enterprise metrics & core application ledger mapping.</p>
        </div>
        <button type="button" className="flex items-center gap-2 px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)] text-xs font-semibold transition-all shadow-xs cursor-pointer">
          <RefreshCw className="h-3.5 w-3.5" /> Re-Sync Matrix
        </button>
      </div>

      {/* Grid Block 1: Sales & Financial Engine */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold tracking-wider uppercase text-[var(--muted-foreground)]">Financial Engine & Sales Metrics</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {salesStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="p-5 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-xs relative overflow-hidden group">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wide">{stat.name}</span>
                  <Icon className={`h-4 w-4 ${stat.isPositive ? "text-blue-500" : "text-rose-500"}`} />
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-black tracking-tight">{stat.value}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    stat.isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                  }`}>{stat.change}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Block 2: Operational Orders & Stock Inventory */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Orders Status Log */}
        <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--card)] space-y-4 shadow-xs">
          <h3 className="text-xs font-bold tracking-wider uppercase text-[var(--muted-foreground)]">Order Pipeline Operations</h3>
          <div className="grid grid-cols-2 gap-3">
            {orderStats.map((ord, i) => (
              <div key={i} className="p-4 rounded border border-[var(--border)] bg-[var(--background)]/50">
                <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-tight">{ord.name}</p>
                <p className={`text-lg font-black mt-1 ${
                  ord.type === "warning" ? "text-amber-500" : ord.type === "info" ? "text-blue-500" : ord.type === "success" ? "text-emerald-500" : "text-rose-500"
                }`}>{ord.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Catalog & Inventory Matrix */}
        <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--card)] space-y-4 shadow-xs">
          <h3 className="text-xs font-bold tracking-wider uppercase text-[var(--muted-foreground)]">Stock & Inventory Matrix</h3>
          <div className="grid grid-cols-2 gap-3">
            {stockStats.map((stk, i) => (
              <div key={i} className="p-4 rounded border border-[var(--border)] bg-[var(--background)]/50">
                <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-tight">{stk.name}</p>
                <p className={`text-lg font-black mt-1 ${stk.alert ? "text-rose-500 flex items-center gap-1.5" : ""}`}>
                  {stk.alert && <AlertCircle className="h-4 w-4 shrink-0" />}
                  {stk.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Widgets & Logs Panel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders Widget */}
        <div className="lg:col-span-2 p-5 rounded-lg border border-[var(--border)] bg-[var(--card)] space-y-4 shadow-xs">
          <h3 className="text-xs font-bold tracking-wider uppercase text-[var(--muted-foreground)]">Recent Operational Invoices</h3>
          <div className="divide-y divide-[var(--border)] text-xs">
            {[
              { id: "INV-9042", user: "Rahat Karim", price: "$120.00", status: "Processing" },
              { id: "INV-9041", user: "Zayan Ahmed", price: "$45.50", status: "Pending" },
              { id: "INV-9040", user: "Mitu Asraf", price: "$320.00", status: "Delivered" },
            ].map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div>
                  <p className="font-bold">{inv.id} — <span className="font-normal text-[var(--muted-foreground)]">{inv.user}</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{inv.price}</span>
                  <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold ${
                    inv.status === "Delivered" ? "bg-emerald-500/10 text-emerald-500" : inv.status === "Pending" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                  }`}>{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live System Logs / Activity Widget */}
        <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--card)] space-y-4 shadow-xs">
          <h3 className="text-xs font-bold tracking-wider uppercase text-[var(--muted-foreground)]">Live System Audit Stream</h3>
          <div className="space-y-3 text-[11px]">
            {[
              { time: "Just Now", text: "Super Admin changed catalog config structure.", user: "Emran H." },
              { time: "5 mins ago", text: "Database connection auto-synced with Supabase pool.", user: "System" },
              { time: "12 mins ago", text: "Product 'Wrader X808 Smartwatch' updated stock count.", user: "Staff Manager" },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-2 border-l-2 border-blue-500/40 pl-3">
                <div className="space-y-0.5">
                  <p className="text-[var(--muted-foreground)] font-medium text-[10px] flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> {log.time} by <span className="text-blue-500 font-bold">{log.user}</span>
                  </p>
                  <p className="font-medium text-[var(--foreground)] leading-tight">{log.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}