"use client";

import React, { startTransition, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getOrders, updateOrderStatus, updateOrderDeliveryCharge } from "@/actions/orders";
import { restockItemBySerial } from "@/actions/pim-products";
import { ShoppingBag, ArrowLeftRight, CreditCard, Eye, ShieldAlert, Sparkles, Printer, X, Scan, AlertCircle, CheckCircle2, RotateCcw, Trash2, Phone, MessageSquare } from "lucide-react";
import { handlePrintOrderMemo } from "@/utils/print-order-memo";
import { toast } from "react-hot-toast";

interface DbOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  phone: string;
  total_amount: number;
  status: string;
  createdAt: Date;
  items: any;
}

const FALLBACK_RETURNS = [
  { id: "RET-201", customerName: "Mahmud Hasan", productName: "Premium Leather Shoes", reason: "Wrong Size", status: "PENDING" },
  { id: "RET-202", customerName: "Farhana Yasmin", productName: "Noise Cancelling Headphones", reason: "Damaged Package", status: "APPROVED" }
];

const FALLBACK_REFUNDS = [
  { id: "REF-301", customerName: "Sajid Khan", amount: "$850", method: "Bkash", status: "COMPLETED" },
  { id: "REF-302", customerName: "Tanvir Ahmed", amount: "$2,100", method: "Visa Card", status: "PROCESSING" }
];

export default function Page() {
  const router = useRouter();

  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DbOrder | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [callTarget, setCallTarget] = useState<{ name: string; phone: string } | null>(null);
  const [messageTarget, setMessageTarget] = useState<{ name: string; phone: string } | null>(null);

  // Return Scan Desk States
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scannedList, setScannedList] = useState<any[]>([]);
  const [lastMessage, setLastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [restockLoading, setRestockLoading] = useState(false);

  const playAlertSound = (type: "success" | "error") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn("Audio Context blocked:", e);
    }
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    setRestockLoading(true);
    setLastMessage(null);
    
    const res = await restockItemBySerial(code);
    if (res.error) {
      playAlertSound("error");
      setLastMessage({ type: "error", text: res.error });
      toast.error(res.error);
    } else if (res.item) {
      playAlertSound("success");
      const newItem = {
        serial_number: res.item.serial_number,
        productName: res.item.productName,
        timestamp: new Date().toLocaleTimeString(),
        status: "RESTOCKED & AVAILABLE"
      };
      setScannedList(prev => [newItem, ...prev]);
      setLastMessage({ type: "success", text: `Successfully restocked ${res.item.productName} (S/N: ${res.item.serial_number})` });
      toast.success("Item restocked successfully!");
      setBarcodeInput("");
    }
    setRestockLoading(false);
  };

  const clearFeed = () => {
    setScannedList([]);
    setLastMessage(null);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatusId(orderId);
    const res = await updateOrderStatus(orderId, newStatus);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Order status updated successfully!");
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    }
    setUpdatingStatusId(null);
  };

  const pathname = usePathname();

  const tab = React.useMemo(() => {
    if (pathname.includes("/returns")) return "returns";
    if (pathname.includes("/refunds")) return "refunds";
    return "list";
  }, [pathname]);

  useEffect(() => {
    if (tab === "list") {
      setLoading(true);
      getOrders().then(res => {
        if (res.orders) setOrders(res.orders as unknown as DbOrder[]);
        setLoading(false);
      });
    }
  }, [tab]);

  return (
    <div className="space-y-6 select-none font-sans">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Order Center</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Track customer transactions, dispatch states, returns, and billing adjustments.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-px">
        <Link href="/admin/orders"
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "list" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Orders List
        </Link>
        <Link href="/admin/orders/returns"
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "returns" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Returns Ledger
        </Link>
        <Link href="/admin/orders/refunds"
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "refunds" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Refunds Tracker
        </Link>
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
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] font-medium">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[var(--background)]/50 transition-colors">
                        <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)] font-bold">#{ord.id.substring(0, 8).toUpperCase()}</td>
                        <td className="py-3.5">
                          <button 
                            onClick={() => setSelectedOrder(ord)}
                            className="text-left font-bold text-[var(--foreground)] hover:text-blue-500 transition-colors cursor-pointer"
                          >
                            {ord.customer_name}
                          </button>
                          <p className="text-[10px] text-[var(--muted-foreground)]">{ord.customer_email}</p>
                          <p className="text-[10px] font-mono text-[var(--muted-foreground)] mt-0.5">{ord.phone}</p>
                        </td>
                        <td className="py-3.5 text-[var(--muted-foreground)]">{ord.shipping_address}</td>
                        <td className="py-3.5 font-bold text-blue-500">৳{ord.total_amount}</td>
                        <td className="py-3.5">
                          <select
                            value={ord.status}
                            disabled={updatingStatusId === ord.id}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-[var(--background)] border border-[var(--border)] focus:outline-none cursor-pointer ${
                              ord.status === "DELIVERED" || ord.status === "COMPLETED" ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" :
                              ord.status === "CANCELLED" ? "text-rose-500 border-rose-500/20 bg-rose-500/5" :
                              ord.status === "SHIPPED" || ord.status === "IN_TRANSIT" ? "text-indigo-500 border-indigo-500/20 bg-indigo-500/5" :
                              ord.status === "PROCESSED" || ord.status === "PROCESSING" ? "text-blue-500 border-blue-500/20 bg-blue-500/5" :
                              "text-amber-500 border-amber-500/20 bg-amber-500/5"
                            }`}
                          >
                            <option value="TAKEN" className="bg-[var(--card)] text-amber-500">1. TAKEN (Order Placed)</option>
                            <option value="CONFIRMED" className="bg-[var(--card)] text-amber-600">2. CONFIRMED</option>
                            <option value="PROCESSED" className="bg-[var(--card)] text-blue-500">3. PROCESSED (Packaged)</option>
                            <option value="SHIPPED" className="bg-[var(--card)] text-indigo-500">4. SHIPPED (Handed Over)</option>
                            <option value="IN_TRANSIT" className="bg-[var(--card)] text-indigo-600">5. IN_TRANSIT</option>
                            <option value="DELIVERED" className="bg-[var(--card)] text-emerald-500">6. DELIVERED</option>
                            <option value="CANCELLED" className="bg-[var(--card)] text-rose-500">CANCELLED</option>
                          </select>
                        </td>
                        <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 text-right space-x-1.5 flex justify-end items-center h-[52px]">
                          <button
                            onClick={() => setCallTarget({ name: ord.customer_name, phone: ord.phone })}
                            className="inline-flex items-center justify-center p-1.5 bg-neutral-800 hover:bg-neutral-700 text-blue-400 hover:text-blue-300 rounded transition-colors cursor-pointer"
                            title="Call Customer"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setMessageTarget({ name: ord.customer_name, phone: ord.phone })}
                            className="inline-flex items-center justify-center p-1.5 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 hover:text-emerald-300 rounded transition-colors cursor-pointer"
                            title="Message Customer"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[10px] font-bold uppercase transition-colors cursor-pointer"
                            title="View Order Details"
                          >
                            <Eye className="h-3 w-3" /> Details
                          </button>
                          <button
                            onClick={() => handlePrintOrderMemo(ord)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold uppercase transition-colors cursor-pointer"
                          >
                            <Printer className="h-3 w-3" /> Invoice
                          </button>
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
          <div className="space-y-6">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              {/* Scanner Form */}
              <div className="md:col-span-1 space-y-4">
                <div className="p-4 border border-[var(--border)] bg-[var(--background)]/30 rounded-xl space-y-4">
                  <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                    <Scan className="h-4 w-4 text-blue-500" /> Scanner Desk Input
                  </h3>

                  <form onSubmit={handleScanSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">
                        Scan Barcode / Serial / SKU
                      </label>
                      <input
                        type="text"
                        autoFocus
                        placeholder="Scan or type manually..."
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500 text-center font-bold text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={restockLoading}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      {restockLoading ? "Processing..." : "Submit Return"}
                    </button>
                  </form>

                  {lastMessage && (
                    <div className={`p-3 rounded-lg text-xs font-semibold flex items-start gap-2 ${
                      lastMessage.type === "success" 
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                        : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    }`}>
                      {lastMessage.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      )}
                      <span>{lastMessage.text}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Scanned Feed */}
              <div className="md:col-span-2 space-y-4">
                <div className="p-4 border border-[var(--border)] bg-[var(--background)]/30 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-blue-500" /> Scanned Return Log Feed
                    </h3>
                    {scannedList.length > 0 && (
                      <button
                        onClick={clearFeed}
                        className="text-[10px] text-rose-500 hover:text-rose-600 flex items-center gap-1 font-bold uppercase cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Clear Feed
                      </button>
                    )}
                  </div>

                  <div className="border border-[var(--border)] rounded-lg overflow-hidden text-xs bg-[var(--card)]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                          <th className="p-3">Barcode / Serial</th>
                          <th className="p-3">Product Name</th>
                          <th className="p-3">Time</th>
                          <th className="p-3 text-right">Inventory Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)] font-medium">
                        {scannedList.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-[var(--muted-foreground)] font-semibold">
                              No returns processed in this session. Start scanning above.
                            </td>
                          </tr>
                        ) : (
                          scannedList.map((item, idx) => (
                            <tr key={idx} className="hover:bg-[var(--background)]/30 transition-colors">
                              <td className="p-3 font-mono text-[10px] text-[var(--muted-foreground)]">{item.serial_number}</td>
                              <td className="p-3 font-bold text-[var(--foreground)]">{item.productName}</td>
                              <td className="p-3 text-[var(--muted-foreground)]">{item.timestamp}</td>
                              <td className="p-3 text-right">
                                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-500">
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
          <div className="w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--background)]/50">
              <div>
                <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)]">Order Detail Matrix</h3>
                <p className="text-[10px] font-mono text-blue-500 mt-0.5">Ref ID: #{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg hover:bg-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Status and date */}
              <div className="grid grid-cols-2 gap-4 bg-[var(--background)]/30 p-3 rounded-lg border border-[var(--border)]/50">
                <div>
                  <span className="block text-[9px] font-bold uppercase text-[var(--muted-foreground)]">Order Date</span>
                  <span className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Status Desk</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className={`px-2 py-1 rounded text-[10px] font-black uppercase bg-[var(--background)] border border-[var(--border)] focus:outline-none cursor-pointer ${
                      selectedOrder.status === "DELIVERED" || selectedOrder.status === "COMPLETED" ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" :
                      selectedOrder.status === "CANCELLED" ? "text-rose-500 border-rose-500/20 bg-rose-500/5" :
                      selectedOrder.status === "SHIPPED" || selectedOrder.status === "IN_TRANSIT" ? "text-indigo-500 border-indigo-500/20 bg-indigo-500/5" :
                      selectedOrder.status === "PROCESSED" || selectedOrder.status === "PROCESSING" ? "text-blue-500 border-blue-500/20 bg-blue-500/5" :
                      "text-amber-500 border-amber-500/20 bg-amber-500/5"
                    }`}
                  >
                    <option value="TAKEN">1. TAKEN (Order Placed)</option>
                    <option value="CONFIRMED">2. CONFIRMED</option>
                    <option value="PROCESSED">3. PROCESSED (Packaged)</option>
                    <option value="SHIPPED">4. SHIPPED (Handed Over)</option>
                    <option value="IN_TRANSIT">5. IN_TRANSIT</option>
                    <option value="DELIVERED">6. DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]">Customer Info</h4>
                  <p className="font-bold text-[var(--foreground)]">{selectedOrder.customer_name}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">{selectedOrder.customer_email}</p>
                  <p className="text-[10px] font-mono text-[var(--muted-foreground)]">Phone: {selectedOrder.phone}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]">Shipping Node</h4>
                  <p className="text-[10px] font-medium text-[var(--foreground)]">{selectedOrder.shipping_address}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]">Products Bundle</h4>
                <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                        <th className="p-3">Product Name</th>
                        <th className="p-3">Variant Details</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] font-medium">
                      {((): any[] => {
                        try {
                          const itemsJson = selectedOrder.items;
                          if (typeof itemsJson === "string") return JSON.parse(itemsJson);
                          if (Array.isArray(itemsJson)) return itemsJson;
                        } catch (e) {}
                        return [];
                      })().map((item: any, index: number) => (
                        <tr key={index} className="hover:bg-[var(--background)]/30">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-8 w-8 object-cover rounded bg-[var(--background)] border border-[var(--border)]"
                                />
                              )}
                              <div>
                                <p className="font-bold text-[var(--foreground)]">{item.name}</p>
                                <p className="text-[9px] font-mono text-[var(--muted-foreground)]">ID: {item.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-[var(--muted-foreground)]">
                            {item.variantName || item.color || item.size ? (
                              <span className="inline-flex gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[9px] font-bold uppercase">
                                {[item.variantName, item.color, item.size].filter(Boolean).join(" / ")}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-[var(--foreground)]">{item.quantity}</td>
                          <td className="p-3 text-right font-mono">৳{item.price}</td>
                          <td className="p-3 text-right font-mono font-bold text-blue-500">৳{Number(item.price) * Number(item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Delivery Charge Edit & Total */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]">Shipping / Delivery Fee:</span>
                  <span className="text-xs font-bold text-[var(--foreground)] font-mono">৳</span>
                  <input
                    type="number"
                    defaultValue={60}
                    id={`admin-del-charge-${selectedOrder.id}`}
                    className="w-20 px-2 py-1 text-xs font-mono font-bold bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const el = document.getElementById(`admin-del-charge-${selectedOrder.id}`) as HTMLInputElement;
                      const val = Number(el?.value || 60);
                      const res = await updateOrderDeliveryCharge(selectedOrder.id, val);
                      if (res.error) {
                        toast.error(res.error);
                      } else {
                        toast.success(`Shipping charge updated to ৳${val}`);
                      }
                    }}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold uppercase transition-colors cursor-pointer"
                  >
                    Save Fee
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]">Grand Checkout Total</span>
                  <span className="text-sm font-black text-blue-500 font-mono">৳{selectedOrder.total_amount}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]/30 flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[10px] font-bold uppercase transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handlePrintOrderMemo(selectedOrder)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call & WhatsApp Options Modal */}
      {callTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
          <div className="w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
              <div>
                <h3 className="text-xs font-black uppercase text-[var(--foreground)]">Contact Customer Desk</h3>
                <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Choose channel for: <strong className="text-blue-500">{callTarget.name}</strong></p>
              </div>
              <button
                onClick={() => setCallTarget(null)}
                className="p-1 rounded-lg hover:bg-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {/* Option 1: Direct phone dialer (Upay 2) */}
              <a
                href={`tel:${callTarget.phone}`}
                onClick={() => setCallTarget(null)}
                className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--background)]/60 text-xs font-semibold text-[var(--foreground)] transition-colors"
              >
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-[var(--foreground)]">Phone Dialer (SIM Call)</p>
                  <p className="text-[9px] text-[var(--muted-foreground)]">Send number to Chrome click-to-call or PC dialer app.</p>
                </div>
              </a>

              {/* Option 2: WhatsApp Web/Desktop Call (Upay 3) */}
              <a
                href={`https://wa.me/${callTarget.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(callTarget.name)},%20we%20are%20contacting%20you%20from%20YazMart%20regarding%20your%20recent%20order.`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setCallTarget(null)}
                className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--background)]/60 text-xs font-semibold text-[var(--foreground)] transition-colors"
              >
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 fill-current text-emerald-500" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.446L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.59 1.966 14.12 1.01 11.5 1.01c-5.433 0-9.858 4.37-9.863 9.8-.001 1.637.452 3.235 1.311 4.645L1.879 21.6l6.3-1.636c1.39.816 2.76 1.19 4.468 1.19z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-bold text-[var(--foreground)]">WhatsApp Chat & Call</p>
                  <p className="text-[9px] text-[var(--muted-foreground)]">Connect via WhatsApp for instant messaging or voice call.</p>
                </div>
              </a>
            </div>

            <button
              onClick={() => setCallTarget(null)}
              className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[10px] font-bold uppercase transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Message Options Modal */}
      {messageTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
          <div className="w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
              <div>
                <h3 className="text-xs font-black uppercase text-[var(--foreground)]">Send Message Desk</h3>
                <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Choose channel for: <strong className="text-emerald-500">{messageTarget.name}</strong></p>
              </div>
              <button
                onClick={() => setMessageTarget(null)}
                className="p-1 rounded-lg hover:bg-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {/* Option 1: Direct SMS (Text message) */}
              <a
                href={`sms:${messageTarget.phone}?body=Hello%20${encodeURIComponent(messageTarget.name)},%20this%20is%20YazMart%20regarding%20your%20order.`}
                onClick={() => setMessageTarget(null)}
                className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--background)]/60 text-xs font-semibold text-[var(--foreground)] transition-colors"
              >
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-[var(--foreground)]">Standard SMS (Text Message)</p>
                  <p className="text-[9px] text-[var(--muted-foreground)]">Send a traditional text message using your device's SMS app.</p>
                </div>
              </a>

              {/* Option 2: WhatsApp Web/Desktop message */}
              <a
                href={`https://wa.me/${messageTarget.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(messageTarget.name)},%20we%20are%20contacting%20you%20from%20YazMart%20regarding%20your%20recent%20order.`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMessageTarget(null)}
                className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--background)]/60 text-xs font-semibold text-[var(--foreground)] transition-colors"
              >
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 fill-current text-emerald-500" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.446L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.59 1.966 14.12 1.01 11.5 1.01c-5.433 0-9.858 4.37-9.863 9.8-.001 1.637.452 3.235 1.311 4.645L1.879 21.6l6.3-1.636c1.39.816 2.76 1.19 4.468 1.19z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-bold text-[var(--foreground)]">WhatsApp Direct Message</p>
                  <p className="text-[9px] text-[var(--muted-foreground)]">Send a free instant chat message via WhatsApp Web/App.</p>
                </div>
              </a>
            </div>

            <button
              onClick={() => setMessageTarget(null)}
              className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[10px] font-bold uppercase transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
