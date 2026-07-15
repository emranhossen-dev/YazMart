"use client";

import React, { useState } from "react";
import { updateSubOrderStatus } from "@/actions/seller";
import { 
  Receipt, Truck, Check, X, Clock, Loader2, ArrowUpRight, ChevronDown, ChevronUp, MapPin, Phone 
} from "lucide-react";
import toast from "react-hot-toast";

interface SellerOrdersClientProps {
  initialOrders: any[];
}

export default function SellerOrdersClient({ initialOrders }: SellerOrdersClientProps) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrder(prev => (prev === id ? null : id));
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setLoadingMap(prev => ({ ...prev, [orderId]: true }));
    try {
      const res = await updateSubOrderStatus(orderId, status);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Order status updated to ${status}.`);
        setOrders(prev => 
          prev.map(o => o.id === orderId ? { ...o, status } : o)
        );
      }
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setLoadingMap(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AWAITING_PAYMENT":
        return <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-600">Awaiting Payment</span>;
      case "PENDING":
        return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600">Pending</span>;
      case "PROCESSING":
        return <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">Processing</span>;
      case "SHIPPED":
        return <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600">Shipped</span>;
      case "COMPLETED":
        return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">Completed</span>;
      case "CANCELLED":
        return <span className="rounded-full bg-rose-50/10 px-2.5 py-1 text-[10px] font-bold text-rose-500">Cancelled</span>;
      default:
        return <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Orders Ledger</h1>
        <p className="text-xs font-semibold text-zinc-400">View customer purchases, shipping info, and process order fulfillments.</p>
      </div>

      {/* Orders Ledger table */}
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-zinc-600">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Order Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    <Receipt className="mx-auto h-10 w-10 opacity-45 mb-2" />
                    No orders have been received yet.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isExpanded = expandedOrder === order.id;
                  const customer = order.parent || { customer_name: "Deleted Client", phone: "-", shipping_address: "-" };
                  const itemsList = Array.isArray(order.items) ? order.items : [];
                  const isProcessing = loadingMap[order.id] || false;

                  return (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-zinc-50/50 cursor-pointer" onClick={() => toggleExpand(order.id)}>
                        <td className="px-6 py-4">
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
                          <div className="flex items-center justify-end gap-2">
                            {isProcessing ? (
                              <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                            ) : (
                              <>
                                {order.status === "PENDING" && (
                                  <button
                                    onClick={() => handleUpdateStatus(order.id, "PROCESSING")}
                                    className="flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                                  >
                                    Accept
                                  </button>
                                )}
                                {order.status === "PROCESSING" && (
                                  <button
                                    onClick={() => handleUpdateStatus(order.id, "SHIPPED")}
                                    className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-950 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:opacity-90 cursor-pointer"
                                  >
                                    <Truck className="h-3 w-3" /> Ship Order
                                  </button>
                                )}
                                {order.status === "SHIPPED" && (
                                  <button
                                    onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
                                    className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-emerald-700 cursor-pointer"
                                  >
                                    <Check className="h-3 w-3" /> Complete
                                  </button>
                                )}
                                {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                                  <button
                                    onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                                    className="rounded-xl border border-zinc-200 p-2 text-zinc-400 transition-colors hover:border-rose-500 hover:text-rose-500 cursor-pointer"
                                    aria-label="Cancel order"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable detailed drawer */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-zinc-50/70 px-8 py-5 border-t border-zinc-100">
                            <div className="grid gap-6 md:grid-cols-3">
                              {/* Shipping address info */}
                              <div className="space-y-2 md:col-span-1">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Shipping Logistics</h4>
                                <div className="flex gap-2 text-zinc-700">
                                  <MapPin className="h-4 w-4 shrink-0 text-zinc-400" />
                                  <div>
                                    <p className="font-extrabold text-zinc-900">{customer.customer_name}</p>
                                    <p className="mt-1 leading-relaxed">{customer.shipping_address}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-700 pt-1">
                                  <Phone className="h-4 w-4 text-zinc-400" />
                                  <span className="font-mono">{customer.phone}</span>
                                </div>
                              </div>

                              {/* Items detail list */}
                              <div className="space-y-3 md:col-span-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Purchased Items List</h4>
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
