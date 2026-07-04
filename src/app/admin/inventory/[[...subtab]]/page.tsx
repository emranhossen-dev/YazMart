"use client";

import React, { startTransition, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Warehouse, ArrowLeftRight, Layers, FileText, Search, AlertCircle, Printer, Save, Plus } from "lucide-react";
import { getEnterpriseProducts, runSchemaMigration, updateProductStock } from "@/actions/pim-products";
import { handlePrintMemo } from "@/utils/print-memo";
import { toast } from "react-hot-toast";

// Warehouses configuration
const INITIAL_WAREHOUSES = [
  { id: "WH-01", name: "Dhaka Central WH", manager: "Farhan Ahmed", capacity: "85% utilized", status: "ACTIVE", location: "Tejgaon, Dhaka" },
  { id: "WH-02", name: "Chittagong Outlet Hub", manager: "Jamil Khan", capacity: "40% utilized", status: "ACTIVE", location: "Agrabad, Chittagong" },
  { id: "WH-03", name: "Sylhet Logistics Node", manager: "Zahid Hasan", capacity: "12% utilized", status: "ACTIVE", location: "Subidbazar, Sylhet" }
];

export default function Page() {
  const router = useRouter();
  
  const pathname = usePathname();
  const activeTab = pathname.split("/").filter(Boolean)[2] || "matrix";
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Local state for stock adjustments
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<number>(0);
  const [savingStock, setSavingStock] = useState(false);

  // Logistics state
  const [warehouses] = useState(INITIAL_WAREHOUSES);
  const [transfers, setTransfers] = useState<any[]>([
    { ref: "TR-9081", from: "Dhaka Central WH", to: "Chittagong Outlet Hub", qty: 25, item: "Mechanical Keyboard RGB", date: "2026-06-20", status: "COMPLETED" },
    { ref: "TR-9077", from: "Dhaka Central WH", to: "Sylhet Logistics Node", qty: 10, item: "Minimalist Chronograph Watch", date: "2026-06-18", status: "IN_TRANSIT" }
  ]);
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: "LOG-01", action: "Stock Adjustment", item: "Premium Leather Shoes", qty: "+30 items", staff: "Emran Admin", time: "2026-06-22 09:30" },
    { id: "LOG-02", action: "Inventory Dispatch", item: "Noise Cancelling Headphones", qty: "-2 items", staff: "System Checkout", time: "2026-06-22 08:45" }
  ]);

  // Transfer form state
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferFrom, setTransferFrom] = useState("WH-01");
  const [transferTo, setTransferTo] = useState("WH-02");
  const [transferProduct, setTransferProduct] = useState("");
  const [transferQty, setTransferQty] = useState(1);
  const [executingTransfer, setExecutingTransfer] = useState(false);

  // Sync tab with URL parameter if it changes via sidebar navigation
  
  const selectTab = (tabName: string) => { startTransition(() => { router.push(`/admin/inventory/${tabName}`); }); };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      await runSchemaMigration();
      const res = await getEnterpriseProducts({ limit: 100 });
      if (res.products) {
        setProducts(res.products);
      }
    } catch (err) {
      console.error("Fetch inventory error:", err);
      toast.error("Failed to load database inventory records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStartEdit = (id: string, currentVal: number) => {
    setEditingStockId(id);
    setEditingValue(currentVal);
  };

  const handleSaveStock = async (id: string, productName: string) => {
    if (editingValue < 0) {
      toast.error("Stock count cannot be negative.");
      return;
    }
    try {
      setSavingStock(true);
      const res = await updateProductStock(id, editingValue);
      if (res.success) {
        const diff = editingValue - (products.find(p => p.id === id)?.current_stock || 0);
        const diffText = diff >= 0 ? `+${diff}` : `${diff}`;
        
        toast.success(`Updated ${productName} stock count to ${editingValue}.`);
        
        // Log to audit trial
        const newLog = {
          id: `LOG-${Date.now().toString().slice(-4)}`,
          action: "Manual Stock Edit",
          item: productName,
          qty: `${diffText} items`,
          staff: "YazMart Manager",
          time: new Date().toLocaleString()
        };
        setAuditLogs(prev => [newLog, ...prev]);

        // Reset state & refresh
        setEditingStockId(null);
        fetchInventory();
      } else {
        toast.error(res.error || "Could not update stock.");
      }
    } catch (err) {
      toast.error("Stock adjustment transaction failed.");
    } finally {
      setSavingStock(false);
    }
  };

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferProduct || transferQty <= 0) {
      toast.error("Please select a valid product and quantity.");
      return;
    }

    const prod = products.find(p => p.id === transferProduct);
    if (!prod) return;

    if (prod.current_stock < transferQty) {
      toast.error(`Insufficient stock! ${prod.name} only has ${prod.current_stock} available.`);
      return;
    }

    try {
      setExecutingTransfer(true);
      const fromName = warehouses.find(w => w.id === transferFrom)?.name || "Source WH";
      const toName = warehouses.find(w => w.id === transferTo)?.name || "Dest WH";

      // 1. Deduct stock from source (database update)
      const res = await updateProductStock(prod.id, prod.current_stock - transferQty);
      if (res.success) {
        // 2. Log transfer order
        const newTransfer = {
          ref: `TR-${Date.now().toString().slice(-4)}`,
          from: fromName,
          to: toName,
          qty: transferQty,
          item: prod.name,
          date: new Date().toISOString().split("T")[0],
          status: "COMPLETED"
        };
        
        const newLog = {
          id: `LOG-${Date.now().toString().slice(-4)}`,
          action: "Warehouse Dispatch",
          item: prod.name,
          qty: `-${transferQty} items`,
          staff: "YazMart Manager",
          time: new Date().toLocaleString()
        };

        setTransfers(prev => [newTransfer, ...prev]);
        setAuditLogs(prev => [newLog, ...prev]);
        toast.success(`Dispatched ${transferQty} units of ${prod.name} successfully.`);
        
        // Reset state
        setTransferProduct("");
        setTransferQty(1);
        setShowTransferForm(false);
        fetchInventory();
      } else {
        toast.error(res.error || "Failed to dispatch stock.");
      }
    } catch (err) {
      toast.error("Execution error during stock transfer.");
    } finally {
      setExecutingTransfer(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 select-none font-sans text-slate-100">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Inventory & Logistics Deck</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Supervise storage node hubs, monitor low stocks, execute warehouse dispatches, and audit adjustment logs.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-px">
        <Link href={`/admin/inventory/matrix`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "matrix" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Stock Matrix
        </Link>
        <Link href={`/admin/inventory/warehouses`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "warehouses" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Warehouses
        </Link>
        <Link href={`/admin/inventory/transfer`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "transfer" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Stock Transfer
        </Link>
        <Link href={`/admin/inventory/history`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "history" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Stock History
        </Link>
      </div>

      {/* Main Tab Content Cards */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        {activeTab === "matrix" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
              <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-500" /> General Stock Ledger
              </h3>
              
              {/* Search */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  placeholder="Filter by SKU or Product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded pl-8 pr-3 py-1 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">SKU Identifier</th>
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">Current Stock</th>
                    <th className="pb-3">Warehouse Node</th>
                    <th className="pb-3">Status Flag</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[var(--muted-foreground)]">
                        Syncing database stock matrices...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[var(--muted-foreground)]">
                        No product entries committed in database matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((item) => {
                      const isLowStock = item.current_stock <= (item.low_stock_alert || 5);
                      const isOut = item.current_stock <= 0;
                      const statusLabel = isOut ? "OUT OF STOCK" : isLowStock ? "LOW STOCK" : "IN STOCK";
                      const statusColor = isOut ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : isLowStock ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";

                      return (
                        <tr key={item.id} className="hover:bg-[var(--background)]/50 transition-colors">
                          <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{item.sku}</td>
                          <td className="py-3.5 font-bold text-[var(--foreground)]">{item.name}</td>
                          <td className="py-3.5">
                            {editingStockId === item.id ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(parseInt(e.target.value) || 0)}
                                  className="w-16 bg-[var(--background)] border border-[var(--border)] rounded px-1.5 py-0.5 text-xs text-slate-200 outline-none focus:border-blue-500 font-mono font-bold"
                                />
                                <button
                                  onClick={() => handleSaveStock(item.id, item.name)}
                                  disabled={savingStock}
                                  className="p-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                                >
                                  <Save className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[var(--foreground)]">{item.current_stock} Units</span>
                                <button
                                  onClick={() => handleStartEdit(item.id, item.current_stock)}
                                  className="text-[9px] font-bold text-blue-400 hover:underline uppercase"
                                >
                                  Adjust
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 text-[var(--muted-foreground)]">Dhaka Central WH</td>
                          <td className="py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </td>
                          <td className="py-3.5 text-right flex gap-1 justify-end">
                            <button
                              onClick={() => handlePrintMemo(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-[10px] font-bold uppercase transition-colors cursor-pointer border border-[var(--border)]"
                            >
                              <Printer className="h-3.5 w-3.5 text-blue-500" /> Print
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "warehouses" && (
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
                    <th className="pb-3">Location Address</th>
                    <th className="pb-3">Volumetric Capacity</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {warehouses.map((wh) => (
                    <tr key={wh.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{wh.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{wh.name}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{wh.manager}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{wh.location}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)] font-mono text-[10px] font-bold">{wh.capacity}</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
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

        {activeTab === "transfer" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4 text-blue-500" /> Stock Transfer Orders
              </h3>
              <button
                onClick={() => setShowTransferForm(!showTransferForm)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-bold uppercase transition-all cursor-pointer shadow-xs"
              >
                <Plus className="h-3 w-3" /> New Dispatch
              </button>
            </div>

            {showTransferForm && (
              <form onSubmit={handleExecuteTransfer} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/35 space-y-3 max-w-xl">
                <h4 className="text-xs font-bold uppercase text-blue-400">Create Stock Dispatch Order</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Source Node</label>
                    <select
                      value={transferFrom}
                      onChange={(e) => setTransferFrom(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
                    >
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Destination Node</label>
                    <select
                      value={transferTo}
                      onChange={(e) => setTransferTo(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
                    >
                      {warehouses.filter(w => w.id !== transferFrom).map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Catalog Product</label>
                    <select
                      required
                      value={transferProduct}
                      onChange={(e) => setTransferProduct(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select Product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.current_stock})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Dispatch Units Qty</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={transferQty}
                      onChange={(e) => setTransferQty(parseInt(e.target.value) || 1)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors font-mono"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowTransferForm(false)}
                    className="px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--accent)]/50 text-[9px] font-bold uppercase transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={executingTransfer}
                    className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] uppercase transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {executingTransfer ? "Processing..." : "Dispatch Stock"}
                  </button>
                </div>
              </form>
            )}

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
                  {transfers.map((tr) => (
                    <tr key={tr.ref} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{tr.ref}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{tr.item}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{tr.from}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{tr.to}</td>
                      <td className="py-3.5 text-[var(--foreground)] font-bold">{tr.qty} Units</td>
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{tr.date}</td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          tr.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
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

        {activeTab === "history" && (
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
                  {auditLogs.map((log) => (
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
