"use client";

import React, { startTransition, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getSuppliers, createSupplier } from "@/actions/finance";
import { Factory, Truck, ClipboardList, ArrowLeftRight, Plus, HelpCircle } from "lucide-react";
import { toast } from "react-hot-toast";

// Purchase orders list
const INITIAL_PURCHASE_ORDERS = [
  { poNum: "PO-2026-001", supplier: "Global Tech Electronics", amount: "৳4,85,000", items: "120x RGB Keyboards, 50x ANC Headphones", date: "2026-06-20", status: "RECEIVED" },
  { poNum: "PO-2026-002", supplier: "Apex Fashion Sourcing", amount: "৳1,20,000", items: "300x Canvas Backpacks", date: "2026-06-21", status: "PENDING_DELIVERY" }
];

export default function Page() {
  const router = useRouter();
  
  const pathname = usePathname();
  const activeTab = pathname.split("/").filter(Boolean)[2] || "orders";

  // States
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [orders, setOrders] = useState(INITIAL_PURCHASE_ORDERS);
  const [returns, setReturns] = useState([
    { ref: "PR-401", poNum: "PO-2026-001", supplier: "Global Tech Electronics", qty: 5, reason: "Defective switch matrix", date: "2026-06-22", status: "PENDING_CREDIT" }
  ]);

  // Forms states
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [supName, setSupName] = useState("");
  const [supContact, setSupContact] = useState("");
  const [supEmail, setSupEmail] = useState("");
  const [supPhone, setSupPhone] = useState("");

  const [showAddOrder, setShowAddOrder] = useState(false);
  const [orderSupplier, setOrderSupplier] = useState("");
  const [orderAmount, setOrderAmount] = useState("");
  const [orderItems, setOrderItems] = useState("");

  // Sync tab with URL parameter if it changes via sidebar navigation
  
  const selectTab = (tabName: string) => { startTransition(() => { router.push(`/admin/purchase/${tabName}`); }); };

  const fetchSuppliersList = async () => {
    try {
      const res = await getSuppliers();
      if (res.success && res.suppliers) {
        setSuppliers(res.suppliers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSuppliersList();
  }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName || !supContact || !supEmail || !supPhone) {
      toast.error("Please fill in all supplier fields.");
      return;
    }
    const newSup = {
      id: `SPL-${Math.floor(100 + Math.random() * 900)}`,
      name: supName,
      contact: supContact,
      email: supEmail,
      phone: supPhone,
      status: "ACTIVE"
    };

    try {
      const res = await createSupplier(newSup);
      if (res.success) {
        toast.success(`Supplier "${supName}" registered successfully!`);
        
        // Reset form
        setSupName("");
        setSupContact("");
        setSupEmail("");
        setSupPhone("");
        setShowAddSupplier(false);
        fetchSuppliersList();
      } else {
        toast.error(res.error || "Failed to register supplier.");
      }
    } catch (err) {
      toast.error("Transaction failed.");
    }
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderSupplier || !orderAmount || !orderItems) {
      toast.error("Please fill in all order details.");
      return;
    }
    const amountVal = parseFloat(orderAmount) || 0;
    const formattedAmount = `৳${amountVal.toLocaleString("en-IN")}`;

    const newPO = {
      poNum: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
      supplier: orderSupplier,
      amount: formattedAmount,
      items: orderItems,
      date: new Date().toISOString().split("T")[0],
      status: "PENDING_DELIVERY"
    };

    setOrders(prev => [newPO, ...prev]);
    toast.success(`Purchase Order created successfully!`);

    // Reset form
    setOrderSupplier("");
    setOrderAmount("");
    setOrderItems("");
    setShowAddOrder(false);
  };

  return (
    <div className="space-y-6 select-none font-sans text-slate-100">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Procurement & Vendor Center</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Manage supplier vendor directories, create procurement purchase logs, and file return refund claims.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-px">
        <Link href={`/admin/purchase/orders`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "orders" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Purchase Orders
        </Link>
        <Link href={`/admin/purchase/suppliers`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "suppliers" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Suppliers
        </Link>
        <Link href={`/admin/purchase/returns`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "returns" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Purchase Returns
        </Link>
      </div>

      {/* Content Container */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-blue-500" /> Procurement Ledgers
              </h3>
              <button
                onClick={() => setShowAddOrder(!showAddOrder)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-bold uppercase transition-all cursor-pointer shadow-xs"
              >
                <Plus className="h-3 w-3" /> Create Purchase Order
              </button>
            </div>

            {/* Create PO Form */}
            {showAddOrder && (
              <form onSubmit={handleAddOrder} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/35 space-y-3 max-w-xl">
                <h4 className="text-xs font-bold uppercase text-blue-400">Issue Purchase Order (PO)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Select Supplier Vendor</label>
                    <select
                      required
                      value={orderSupplier}
                      onChange={(e) => setOrderSupplier(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors cursor-pointer"
                    >
                      <option value="">Select Supplier...</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Estimated PO Cost (BDT)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 150000"
                      value={orderAmount}
                      onChange={(e) => setOrderAmount(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors font-mono"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Items Description Specification</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 50x Premium Keyboards, 100x Mousepads"
                      value={orderItems}
                      onChange={(e) => setOrderItems(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddOrder(false)}
                    className="px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--accent)]/50 text-[9px] font-bold uppercase transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] uppercase transition-all cursor-pointer shadow-sm"
                  >
                    Issue PO
                  </button>
                </div>
              </form>
            )}

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
                  {orders.map((po) => (
                    <tr key={po.poNum} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{po.poNum}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{po.supplier}</td>
                      <td className="py-3.5 font-black text-blue-450">{po.amount}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)] font-semibold">{po.items}</td>
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{po.date}</td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          po.status === "RECEIVED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
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

        {activeTab === "suppliers" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-500" /> Vendor Registry Nodes
              </h3>
              <button
                onClick={() => setShowAddSupplier(!showAddSupplier)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-bold uppercase transition-all cursor-pointer shadow-xs"
              >
                <Plus className="h-3 w-3" /> Add Supplier
              </button>
            </div>

            {/* Add Supplier Form */}
            {showAddSupplier && (
              <form onSubmit={handleAddSupplier} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/35 space-y-3 max-w-xl">
                <h4 className="text-xs font-bold uppercase text-blue-400">Register Procurement Vendor</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Supplier Enterprise Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Tech Ltd"
                      value={supName}
                      onChange={(e) => setSupName(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Representative Contact Person</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Doe"
                      value={supContact}
                      onChange={(e) => setSupContact(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sales@apextech.com"
                      value={supEmail}
                      onChange={(e) => setSupEmail(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Phone Line</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +8801700000000"
                      value={supPhone}
                      onChange={(e) => setSupPhone(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors font-mono"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddSupplier(false)}
                    className="px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--accent)]/50 text-[9px] font-bold uppercase transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] uppercase transition-all cursor-pointer shadow-sm"
                  >
                    Register Vendor
                  </button>
                </div>
              </form>
            )}

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
                  {suppliers.map((sp) => (
                    <tr key={sp.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{sp.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{sp.name}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{sp.contact}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)] font-mono text-[10px]">{sp.email}</td>
                      <td className="py-3.5 font-mono text-[10px]">{sp.phone}</td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          sp.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-450 border border-rose-500/20"
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

        {activeTab === "returns" && (
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
                  {returns.map((pr) => (
                    <tr key={pr.ref} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{pr.ref}</td>
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{pr.poNum}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{pr.supplier}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{pr.qty} Units</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{pr.reason}</td>
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{pr.date}</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
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
