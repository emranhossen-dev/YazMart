"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminTab } from "@/hooks/use-admin-tab";
import { BarChart3, LineChart, PieChart, Users, ArrowUpRight, TrendingUp, AlertTriangle } from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();
  const tab = useAdminTab("sales");

  const selectTab = (tabName: string) => {
    if (tabName === "sales") {
      router.push("/admin/reports");
    } else {
      router.push(`/admin/reports/${tabName}`);
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Business Reports</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Evaluate conversion rates, turnover intervals, sales forecasts, and registered customer behavior profiles.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-px">
        <button 
          onClick={() => selectTab("sales")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "sales" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Sales Report
        </button>
        <button 
          onClick={() => selectTab("inventory")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "inventory" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Inventory Report
        </button>
        <button 
          onClick={() => selectTab("finance")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "finance" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Finance Report
        </button>
        <button 
          onClick={() => selectTab("customers")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "customers" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Customer Report
        </button>
      </div>

      {/* Reports Details */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-6">
        {tab === "sales" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <LineChart className="h-4 w-4 text-blue-500" /> Sales Turnover & Conversion Report
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border border-[var(--border)] bg-[var(--background)]/60 rounded-lg space-y-2">
                <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Shopping Cart Conversion Ratio</p>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-black">3.42%</p>
                  <span className="text-[10px] font-bold text-emerald-500 flex items-center">▲ +0.8% MoM</span>
                </div>
              </div>
              <div className="p-4 border border-[var(--border)] bg-[var(--background)]/60 rounded-lg space-y-2">
                <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Average Order Value (AOV)</p>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-black">৳3,450</p>
                  <span className="text-[10px] font-bold text-emerald-500 flex items-center">▲ +12% MoM</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-[var(--border)] bg-[var(--background)]/30 rounded-lg text-xs font-medium">
              <p className="font-bold text-[var(--foreground)] mb-2 uppercase text-[9px] tracking-wider text-[var(--muted-foreground)] text-left">Top Selling Categories</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span>1. Premium Fashion Clothing</span>
                  <span className="font-bold">42% of total sales</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span>2. Smart Home Electronics</span>
                  <span className="font-bold">28% of total sales</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "inventory" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <PieChart className="h-4 w-4 text-blue-500" /> Stock Valuation & Aging Analysis
            </h3>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border border-[var(--border)] bg-[var(--background)]/60 rounded-lg space-y-1">
                <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Total Stock Asset Valuation</p>
                <p className="text-xl font-black text-blue-500">৳24,50,000</p>
              </div>
              <div className="p-4 border border-[var(--border)] bg-[var(--background)]/60 rounded-lg space-y-1">
                <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Stock Turnover Rate</p>
                <p className="text-xl font-black text-[var(--foreground)]">4.8x / year</p>
              </div>
              <div className="p-4 border border-[var(--border)] bg-[var(--background)]/60 rounded-lg space-y-1">
                <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Out of Stock Alert SKUs</p>
                <p className="text-xl font-black text-rose-500 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> 4 Items
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "finance" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" /> Margins, Tax, and Cost Centers Summary
            </h3>
            
            <div className="space-y-3 font-medium text-xs">
              <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                <span>Gross Realized Margin</span>
                <span className="font-bold text-emerald-500">63.4%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                <span>Estimated VAT & Tax Liability (15%)</span>
                <span className="font-bold text-rose-500">৳2,06,295</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Operational Sourcing Overhead Costs</span>
                <span className="font-bold">৳1,80,000</span>
              </div>
            </div>
          </div>
        )}

        {tab === "customers" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" /> Retention Ratio & Customer Lifetime Value (CLV)
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border border-[var(--border)] bg-[var(--background)]/60 rounded-lg space-y-2">
                <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Customer Retention Index</p>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-black">68.5%</p>
                  <span className="text-[10px] font-bold text-emerald-500">▲ +2.4% YoY</span>
                </div>
              </div>
              <div className="p-4 border border-[var(--border)] bg-[var(--background)]/60 rounded-lg space-y-2">
                <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Average Customer Lifetime Value (CLV)</p>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-black">৳18,200</p>
                  <span className="text-[10px] font-bold text-emerald-500">▲ +8.1% YoY</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
