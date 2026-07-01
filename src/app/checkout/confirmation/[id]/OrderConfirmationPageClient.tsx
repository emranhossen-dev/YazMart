"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getOrderById } from "@/actions/orders";
import { CheckCircle, ShoppingBag, ArrowRight, ShieldCheck, MapPin, Phone, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function OrderConfirmationPageClient() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    setLoading(true);
    const res = await getOrderById(id);
    if (res.order) setOrder(res.order);
    setLoading(false);
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] gap-3 text-xs font-bold">
        <p className="uppercase text-rose-500">Order record not found</p>
        <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg uppercase">Back to storefront</Link>
      </div>
    );
  }

  const items = order.items as any[];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans">
      {/* Header */}
      <header className="h-16 border-b border-[var(--border)] bg-[var(--card)] px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link href="/" className="text-xl font-black tracking-tight flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white">
            <ShoppingBag className="h-5 w-5" />
          </div>
          Yaz<span className="text-blue-500">Mart</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Success Splash */}
        <div className="p-6 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl text-center space-y-3 shadow-xs">
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto animate-bounce" />
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-emerald-500">Transaction Successful</h2>
          <p className="text-xs text-[var(--muted-foreground)]">Your order is being compiled and processed. We will notify you once dispatched.</p>
          <p className="text-xs font-mono bg-[var(--background)] border border-[var(--border)] w-fit mx-auto px-3 py-1 rounded font-bold">
            Order Reference ID: {order.id}
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column: Shipment Details */}
          <div className="p-5 border border-[var(--border)] bg-[var(--card)] rounded-xl shadow-xs space-y-3 text-xs text-[var(--foreground)]">
            <h3 className="font-black uppercase text-[var(--muted-foreground)] border-b border-[var(--border)] pb-2 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-blue-500" /> Customer & Shipment Ledger
            </h3>
            <div className="space-y-2">
              <p className="font-bold text-sm">{order.customer_name}</p>
              <p className="flex items-center gap-2 text-[var(--muted-foreground)]"><Mail className="h-3.5 w-3.5" /> {order.customer_email}</p>
              <p className="flex items-center gap-2 text-[var(--muted-foreground)]"><Phone className="h-3.5 w-3.5" /> {order.phone}</p>
              <p className="text-zinc-400 bg-[var(--background)] p-3 rounded-lg border border-[var(--border)] leading-relaxed mt-2 font-normal">
                {order.shipping_address}
              </p>
            </div>
          </div>

          {/* Right Column: Order Items */}
          <div className="p-5 border border-[var(--border)] bg-[var(--card)] rounded-xl shadow-xs space-y-3 text-xs text-[var(--foreground)]">
            <h3 className="font-black uppercase text-[var(--muted-foreground)] border-b border-[var(--border)] pb-2 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-500" /> Items purchased
            </h3>
            <div className="divide-y divide-[var(--border)] max-h-48 overflow-y-auto pr-1">
              {items.map((item, index) => (
                <div key={index} className="py-2 flex justify-between items-center">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold line-clamp-1">{item.name}</p>
                    <p className="text-[9px] text-[var(--muted-foreground)] font-mono">Qty: {item.quantity} x ৳{item.price}</p>
                  </div>
                  <span className="font-bold text-blue-500">৳{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-[var(--border)] flex justify-between font-black text-sm text-[var(--foreground)]">
              <span>Amount Paid</span>
              <span className="text-emerald-500">৳{order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-1.5 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-xs"
          >
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
