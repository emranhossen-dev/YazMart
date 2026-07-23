"use client";

import React, { useState, useMemo } from "react";
import { updateSubOrderStatus } from "@/actions/seller";
import { 
  Receipt, Truck, Check, X, Clock, Loader2, ArrowUpRight, ChevronDown, ChevronUp, MapPin, Phone, Printer 
} from "lucide-react";
import toast from "react-hot-toast";
import { handlePrintOrderMemo, handleBatchPrintOrderMemos } from "@/utils/print-order-memo";

interface SellerOrdersClientProps {
  initialOrders: any[];
}

export default function SellerOrdersClient({ initialOrders }: SellerOrdersClientProps) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Bulk Print & Filter States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("");

  const toggleExpand = (id: string) => {
    setExpandedOrder((prev) => (prev === id ? null : id));
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setLoadingMap((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await updateSubOrderStatus(orderId, status);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Order status updated to ${status}.`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
      }
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setLoadingMap((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
      if (dateFilter) {
        const ordDate = new Date(o.createdAt).toISOString().split("T")[0];
        if (ordDate !== dateFilter) return false;
      }
      return true;
    });
  }, [orders, statusFilter, dateFilter]);

  const mapOrderToPrintable = (order: any) => {
    const cust = order.parent || {};
    return {
      id: order.id,
      customer_name: cust.customer_name || "Valued Merchant Client",
      customer_email: cust.customer_email || "N/A",
      phone: cust.phone || "N/A",
      shipping_address: cust.shipping_address || "N/A",
      total_amount: Number(order.total_amount || 0),
      status: order.status || "PENDING",
      createdAt: order.createdAt,
      items: order.items,
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AWAITING_PAYMENT":
        return <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-600">Awaiting Payment</span>;
      case "TAKEN":
      case "PENDING":
        return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600">1. Taken</span>;
      case "CONFIRMED":
        return <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">2. Confirmed</span>;
      case "PROCESSED":
      case "PROCESSING":
        return <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">3. Processed</span>;
      case "SHIPPED":
        return <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600">4. Shipped</span>;
      case "IN_TRANSIT":
        return <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-600">5. In Transit</span>;
      case "DELIVERED":
      case "COMPLETED":
        return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">6. Delivered</span>;
      case "CANCELLED":
        return <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-500">Cancelled</span>;
      default:
        return <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Store Orders Ledger</h1>
          <p className="text-xs font-semibold text-zinc-400">View customer purchases, shipping info, and print datewise invoices.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-zinc-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-zinc-400">Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs bg-transparent font-mono font-bold text-zinc-900 focus:outline-none cursor-pointer"
            />
            {dateFilter && (
              <button onClick={() => setDateFilter("")} className="text-[10px] font-bold text-rose-500 hover:underline">
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-zinc-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-zinc-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-transparent font-bold uppercase text-zinc-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="TAKEN">TAKEN (Placed)</option>
              <option value="PROCESSED">PROCESSED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch Invoice Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-zinc-900 text-white rounded-3xl shadow-sm">
        <div className="flex items-center gap-2.5 text-xs font-bold">
          <Printer className="h-4 w-4 text-blue-400" />
          <span>
            {selectedIds.length > 0
              ? `Selected ${selectedIds.length} store orders for batch memo print`
              : "Bulk Invoice Printer Center"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={() => {
                const toPrint = orders
                  .filter((o) => selectedIds.includes(o.id))
                  .map(mapOrderToPrintable);
                handleBatchPrintOrderMemos(toPrint);
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" /> Print Selected ({selectedIds.length})
            </button>
          )}

          <button
            onClick={() => {
              const confirmed = orders
                .filter((o) => o.status === "CONFIRMED")
                .map(mapOrderToPrintable);
              if (confirmed.length === 0) {
                toast.error("No CONFIRMED store orders found.");
                return;
              }
              handleBatchPrintOrderMemos(confirmed);
            }}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" /> Print Confirmed ({orders.filter((o) => o.status === "CONFIRMED").length})
          </button>

          <button
            onClick={() => {
              if (filteredOrders.length === 0) {
                toast.error("No orders match the current filter.");
                return;
              }
              const printable = filteredOrders.map(mapOrderToPrintable);
              handleBatchPrintOrderMemos(printable);
            }}
            className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-xs border border-zinc-700"
          >
            <Printer className="h-3.5 w-3.5" /> Print Filtered ({filteredOrders.length})
          </button>
        </div>
      </div>

      {/* Orders Ledger table */}
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-zinc-600">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-4 w-8">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length > 0 &&
                      selectedIds.length === filteredOrders.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(filteredOrders.map((o) => o.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-4">Order ID</th>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Order Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-400">
                    <Receipt className="mx-auto h-10 w-10 opacity-45 mb-2" />
                    No orders match your search / filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isExpanded = expandedOrder === order.id;
                  const isSelected = selectedIds.includes(order.id);
                  const customer = order.parent || { customer_name: "Deleted Client", phone: "-", shipping_address: "-" };
                  const itemsList = Array.isArray(order.items) ? order.items : [];
                  const isProcessing = loadingMap[order.id] || false;

                  return (
                    <React.Fragment key={order.id}>
                      <tr
                        className={`hover:bg-zinc-50/50 cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-50/40" : ""
                        }`}
                        onClick={() => toggleExpand(order.id)}
                      >
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds((prev) => [...prev, order.id]);
                              } else {
                                setSelectedIds((prev) => prev.filter((id) => id !== order.id));
                              }
                            }}
                            className="rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-zinc-950">
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                            #{order.id.slice(0, 8).toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-extrabold text-zinc-950">{customer.customer_name}</p>
                          <p className="text-[10px] text-zinc-400 font-bold">{customer.phone}</p>
                        </td>
                        <td className="px-6 py-4 text-zinc-500">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                        <td className="px-6 py-4 font-extrabold text-zinc-950">
                          ৳{order.total_amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col items-end gap-1.5">
                            <button
                              onClick={() => handlePrintOrderMemo(mapOrderToPrintable(order))}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Print Single Invoice"
                            >
                              <Printer className="h-3 w-3" /> Memo
                            </button>

                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] font-bold uppercase text-zinc-400">Status:</span>
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border focus:outline-none cursor-pointer ${
                                    order.status === "DELIVERED" || order.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-300" :
                                    order.status === "CANCELLED" ? "bg-rose-50 text-rose-700 border-rose-300" :
                                    order.status === "SHIPPED" || order.status === "IN_TRANSIT" ? "bg-indigo-50 text-indigo-700 border-indigo-300" :
                                    order.status === "PROCESSED" || order.status === "PROCESSING" ? "bg-blue-50 text-blue-700 border-blue-300" :
                                    "bg-amber-50 text-amber-700 border-amber-300"
                                  }`}
                                >
                                  <option value="TAKEN">1. TAKEN</option>
                                  <option value="CONFIRMED">2. CONFIRMED</option>
                                  <option value="PROCESSED">3. PROCESSED</option>
                                  <option value="SHIPPED">4. SHIPPED</option>
                                  <option value="IN_TRANSIT">5. IN_TRANSIT</option>
                                  <option value="DELIVERED">6. DELIVERED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable detailed drawer */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="bg-zinc-50/70 px-8 py-5 border-t border-zinc-100">
                            <div className="grid gap-6 md:grid-cols-3">
                              {/* Shipping address info */}
                              <div className="space-y-4 md:col-span-1">
                                <div className="space-y-2">
                                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Shipping Logistics</h4>
                                  <div className="flex gap-2 text-zinc-700">
                                    <MapPin className="h-4 w-4 shrink-0 text-zinc-400" />
                                    <div>
                                      <p className="font-extrabold text-zinc-900">{customer.customer_name}</p>
                                      <p className="mt-1 leading-relaxed text-xs">{customer.shipping_address}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-zinc-700 pt-1">
                                    <Phone className="h-4 w-4 text-zinc-400" />
                                    <span className="font-mono text-xs">{customer.phone}</span>
                                  </div>
                                </div>

                                {/* Delivery Charge Edit Box */}
                                <div className="rounded-2xl border border-zinc-200 bg-white p-3.5 space-y-2 shadow-xs">
                                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Delivery Amount Setup</h5>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-zinc-500">৳</span>
                                    <input
                                      type="number"
                                      defaultValue={order.delivery_charge || 60}
                                      id={`del-charge-${order.id}`}
                                      className="w-24 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-bold text-zinc-900 focus:border-zinc-900 focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const el = document.getElementById(`del-charge-${order.id}`) as HTMLInputElement;
                                        const val = Number(el?.value || 60);
                                        toast.success(`Delivery charge set to ৳${val} for Order #${order.id.slice(0, 8)}`);
                                      }}
                                      className="rounded-lg bg-zinc-900 px-3 py-1 text-[11px] font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
                                    >
                                      Save Charge
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Items detail list */}
                              <div className="space-y-3 md:col-span-2">
                                <div className="flex justify-between items-center">
                                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Purchased Items List</h4>
                                  <button
                                    onClick={() => handlePrintOrderMemo(mapOrderToPrintable(order))}
                                    className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-black uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Printer className="h-3 w-3" /> Print Order Memo
                                  </button>
                                </div>
                                <div className="divide-y divide-zinc-200/60 rounded-2xl border border-zinc-200 bg-white p-4">
                                  {itemsList.map((item: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white p-1">
                                          {item.image ? (
                                            <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain rounded" />
                                          ) : (
                                            <Receipt className="h-4 w-4 text-zinc-300" />
                                          )}
                                        </div>
                                        <div>
                                          <p className="font-extrabold text-zinc-900">{item.name}</p>
                                          <p className="text-[10px] text-zinc-400 font-mono">SKU: {item.sku || "N/A"}</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-extrabold text-zinc-900">৳{item.price.toLocaleString()}</p>
                                        <p className="text-[10px] text-zinc-400 font-bold">Qty: {item.quantity}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
