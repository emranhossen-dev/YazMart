"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getOrders } from "@/actions/orders";
import { ShoppingBag, ArrowLeftRight, CreditCard, Eye, ShieldAlert, Sparkles } from "lucide-react";

interface DbOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  phone: string;
  total_amount: number;
  status: string;
  createdAt: Date;
}

const FALLBACK_RETURNS = [
  { id: "RET-201", customerName: "Mahmud Hasan", productName: "Premium Leather Shoes", reason: "Wrong Size", status: "PENDING" },
  { id: "RET-202", customerName: "Farhana Yasmin", productName: "Noise Cancelling Headphones", reason: "Damaged Package", status: "APPROVED" }
];

const FALLBACK_REFUNDS = [
  { id: "REF-301", customerName: "Sajid Khan", amount: "$850", method: "Bkash", status: "COMPLETED" },
  { id: "REF-302", customerName: "Tanvir Ahmed", amount: "$2,100", method: "Visa Card", status: "PROCESSING" }
];

function AdminOrdersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams ? searchParams.get("tab") || "list" : "list";

  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === "list") {
      setLoading(true);
      getOrders().then(res => {
        if (res.orders) setOrders(res.orders as unknown as DbOrder[]);
        setLoading(false);
      });
    }
  }, [tab]);

  const selectTab = (tabName: string) => {
    if (tabName === "list") {
      router.push("/admin/orders");
    } else {
      router.push(`/admin/orders?tab=${tabName}`);
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Order Center</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Track customer transactions, dispatch states, returns, and billing adjustments.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-px">
        <button 
          onClick={() => selectTab("list")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "list" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Orders List
        </button>
        <button 
          onClick={() => selectTab("returns")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "returns" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Returns Ledger
        </button>
        <button 
          onClick={() => selectTab("refunds")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "refunds" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Refunds Tracker
        </button>
      </div>

      {/* Content */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        {tab === "list" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-blue-500" /> System Purchases
            </h3>
            {loading ? (
              <p className="text-xs font-semibold py-4 text-center">Loading orders ledger stack...</p>
            ) : orders.length === 0 ? (
              <p className="text-xs font-semibold py-4 text-center text-[var(--muted-foreground)]">No purchase records registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                      <th className="pb-3">Reference ID</th>
                      <th className="pb-3">Customer Info</th>
                      <th className="pb-3">Shipping Address</th>
                      <th className="pb-3">Bill Total</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Placed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] font-medium">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[var(--background)]/50 transition-colors">
                        <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{ord.id}</td>
                        <td className="py-3.5">
                          <p className="font-bold text-[var(--foreground)]">{ord.customer_name}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)]">{ord.customer_email}</p>
                        </td>
                        <td className="py-3.5 text-[var(--muted-foreground)]">{ord.shipping_address}</td>
                        <td className="py-3.5 font-bold text-blue-500">৳{ord.total_amount}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ord.status === "DELIVERED" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "returns" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-blue-500" /> Customer Return Claims
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Claim ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Returned Product</th>
                    <th className="pb-3">Claim Reason</th>
                    <th className="pb-3 text-right">Approval Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {FALLBACK_RETURNS.map((ret) => (
                    <tr key={ret.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{ret.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{ret.customerName}</td>
                      <td className="py-3.5 text-blue-500 font-semibold">{ret.productName}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{ret.reason}</td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ret.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                        }`}>
                          {ret.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "refunds" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-500" /> Payout & Refund Ledgers
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Refund Ref</th>
                    <th className="pb-3">Recipient</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Payment Channel</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {FALLBACK_REFUNDS.map((ref) => (
                    <tr key={ref.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{ref.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{ref.customerName}</td>
                      <td className="py-3.5 font-black text-rose-500">{ref.amount}</td>
                      <td className="py-3.5 font-semibold text-[var(--muted-foreground)]">{ref.method}</td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ref.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                        }`}>
                          {ref.status}
                        </span>
                      </td>
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

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-[var(--muted-foreground)]">Loading Orders Matrix...</div>}>
      <AdminOrdersPageContent />
    </Suspense>
  );
}
