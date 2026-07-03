"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminTab } from "@/hooks/use-admin-tab";
import { Factory, Truck, ClipboardList, ArrowLeftRight, CheckCircle, Plus } from "lucide-react";

const SUPPLIERS = [
  { id: "SPL-771", name: "Global Tech Electronics", contact: "John Doe", email: "john@globaltech.com", phone: "+8801711223344", status: "ACTIVE" },
  { id: "SPL-772", name: "Apex Fashion Sourcing", contact: "Rashedul Bari", email: "sourcing@apex.com", phone: "+8801811556677", status: "ACTIVE" },
  { id: "SPL-773", name: "Modern Leather Co.", contact: "Anisur Rahman", email: "sales@modernleather.com", phone: "+8801911998877", status: "SUSPENDED" }
];

const PURCHASE_ORDERS = [
  { poNum: "PO-2026-001", supplier: "Global Tech Electronics", amount: "৳4,85,000", items: "120x RGB Keyboards, 50x ANC Headphones", date: "2026-06-20", status: "RECEIVED" },
  { poNum: "PO-2026-002", supplier: "Apex Fashion Sourcing", amount: "৳1,20,000", items: "300x Canvas Backpacks", date: "2026-06-21", status: "PENDING_DELIVERY" }
];

const PURCHASE_RETURNS = [
  { ref: "PR-401", poNum: "PO-2026-001", supplier: "Global Tech Electronics", qty: 5, reason: "Defective switch matrix", date: "2026-06-22", status: "PENDING_CREDIT" }
];

export default function PurchasePage() {
  const router = useRouter();
  const tab = useAdminTab("orders");

  const selectTab = (tabName: string) => {
    if (tabName === "orders") {
      router.push("/admin/purchase");
    } else {
      router.push(`/admin/purchase/${tabName}`);
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Procurement Center</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Manage vendor directory nodes, create purchase orders, and monitor procurement return transactions.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-px">
        <button 
          onClick={() => selectTab("orders")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "orders" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Purchase Orders
        </button>
        <button 
          onClick={() => selectTab("suppliers")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "suppliers" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Suppliers
        </button>
        <button 
          onClick={() => selectTab("returns")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "returns" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Purchase Returns
        </button>
      </div>

      {/* Table Card */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        {tab === "orders" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-500" /> Procurement Ledgers
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">PO Number</th>
                    <th className="pb-3">Vendor Supplier</th>
                    <th className="pb-3">Estimated Cost</th>
                    <th className="pb-3">Procured items</th>
                    <th className="pb-3">PO Date</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {PURCHASE_ORDERS.map((po) => (
                    <tr key={po.poNum} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{po.poNum}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{po.supplier}</td>
                      <td className="py-3.5 font-black text-blue-500">{po.amount}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)] font-semibold">{po.items}</td>
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{po.date}</td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          po.status === "RECEIVED" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                        }`}>
                          {po.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "suppliers" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-500" /> Vendor Registry Nodes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Supplier ID</th>
                    <th className="pb-3">Enterprise Title</th>
                    <th className="pb-3">Contact Person</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Phone Line</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {SUPPLIERS.map((sp) => (
                    <tr key={sp.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{sp.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{sp.name}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{sp.contact}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)] font-mono text-[10px]">{sp.email}</td>
                      <td className="py-3.5 font-mono text-[10px]">{sp.phone}</td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          sp.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        }`}>
                          {sp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "returns" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-blue-500" /> Supplier Return Tickets
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Return Ref</th>
                    <th className="pb-3">PO Reference</th>
                    <th className="pb-3">Supplier Name</th>
                    <th className="pb-3">Qty Returned</th>
                    <th className="pb-3">Ticket Reason</th>
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3 text-right">Refund Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {PURCHASE_RETURNS.map((pr) => (
                    <tr key={pr.ref} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{pr.ref}</td>
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{pr.poNum}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{pr.supplier}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{pr.qty} Units</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{pr.reason}</td>
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{pr.date}</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase">
                          {pr.status.replace("_", " ")}
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
