"use client";

import React from "react";
import { useParams } from "next/navigation";
import { 
  Sliders, ShieldCheck, Database, FileText, 
  Layers, Settings, ShoppingBag, TrendingUp, Users 
} from "lucide-react";

export default function AdminCatchAllPage() {
  const params = useParams();
  const slug = (params.slug as string[]) || [];

  // Format header titles based on path segments
  const pathTitle = slug
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " "))
    .join(" > ");

  const primarySection = slug[0] || "operations";
  const subSection = slug[1] || "";

  // Dynamic contextual dummy records based on route prefix
  const getMockData = () => {
    if (primarySection === "finance") {
      return {
        metric: "Net Assets Ledger",
        value: "৳84,250",
        change: "+12.4% MoM",
        cols: ["Tx ID", "Description", "Value", "Billing Type"],
        rows: [
          ["TXN-8742", "Stripe Checkout Deposit", "৳4,520", "Credit"],
          ["TXN-8699", "Amazon AWS Cloud Hosting", "-৳480", "Debit"],
          ["TXN-8622", "Premium Supplier Purchase", "-৳2,100", "Debit"],
          ["TXN-8511", "Customer Cart Checkout", "৳850", "Credit"]
        ]
      };
    } else if (primarySection === "orders") {
      return {
        metric: "Operational Dispatch Logs",
        value: "45 Items",
        change: "99.2% success rate",
        cols: ["Order Ref", "Customer", "Item Detail", "Dispatch Status"],
        rows: [
          ["ORD-9801", "Mahmud Hasan", "Noise Cancelling Headphones", "Pending Delivery"],
          ["ORD-9754", "Farhana Yasmin", "Minimalist Chronograph Watch", "In Transit"],
          ["ORD-9721", "Tanvir Ahmed", "RGB Mechanical Keyboard", "Completed"],
          ["ORD-9699", "Sajid Khan", "Leather Backpack", "Cancelled"]
        ]
      };
    } else if (primarySection === "marketing") {
      return {
        metric: "Campaign Engagement",
        value: "8 Active Campaigns",
        change: "2,420 Coupon redemptions",
        cols: ["Campaign Code", "Discount Value", "Start Date", "Status"],
        rows: [
          ["FLASH50", "50% Off Flash Sale", "2026-06-20", "Active"],
          ["APP1ST", "Free Shipping on App", "2026-06-18", "Active"],
          ["EID2026", "20% Festive Coupon", "2026-06-10", "Expired"],
          ["WELCOME10", "10% Sign Up Discount", "2026-05-01", "Active"]
        ]
      };
    } else {
      return {
        metric: "System Node Metrics",
        value: "Operational",
        change: "100% database health sync",
        cols: ["Record ID", "Module Node", "Last Checked", "System Status"],
        rows: [
          ["ND-901", `${primarySection} ${subSection}`.trim(), "Just now", "ACTIVE"],
          ["ND-882", "Postgres Master Cluster", "5 mins ago", "HEALTHY"],
          ["ND-741", "Prisma Client Engine", "10 mins ago", "STABLE"],
          ["ND-654", "Upload Asset CDN Node", "30 mins ago", "STANDBY"]
        ]
      };
    }
  };

  const mock = getMockData();

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">{pathTitle || "Console Workspace"}</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">System operational ledger node. Dummy dataset mapped dynamically.</p>
      </div>

      {/* Metric Callout Card */}
      <div className="p-5 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xs max-w-sm space-y-2">
        <div className="flex justify-between items-center text-[var(--muted-foreground)]">
          <span className="text-[10px] font-bold uppercase tracking-wider">{mock.metric}</span>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </div>
        <div>
          <h3 className="text-2xl font-black">{mock.value}</h3>
          <p className="text-[9px] text-emerald-500 font-bold mt-1">▲ {mock.change}</p>
        </div>
      </div>

      {/* Operational Table Card */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] mb-4 flex items-center gap-2">
          <Database className="h-4 w-4 text-blue-500" /> Operational Matrix Ledger
        </h3>

        <div className="overflow-x-auto text-xs font-medium">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                {mock.cols.map((col, idx) => (
                  <th key={idx} className="pb-3">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {mock.rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-[var(--background)]/40 transition-colors">
                  {row.map((val, valIdx) => (
                    <td key={valIdx} className={`py-3.5 ${valIdx === 0 ? "font-mono text-[10px] text-[var(--muted-foreground)]" : ""}`}>
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
