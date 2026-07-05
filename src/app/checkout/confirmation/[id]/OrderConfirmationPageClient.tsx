"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getOrderById } from "@/actions/orders";
import {
  CheckCircle2, ShoppingBag, MapPin, Phone, Mail, Truck,
  Banknote, Smartphone, PackageCheck, ArrowRight, Home,
  Clock, PhoneCall, ShieldCheck, Star, Copy, Check
} from "lucide-react";

export default function OrderConfirmationPageClient() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await getOrderById(id);
      if (res.order) setOrder(res.order);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(order?.id || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--background)]">
        <div className="h-10 w-10 rounded-full border-[3px] border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-[var(--muted-foreground)] animate-pulse uppercase tracking-widest">Fetching your order…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--background)]">
        <p className="text-rose-500 font-bold text-sm uppercase">Order not found</p>
        <Link href="/" className="px-5 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-xs font-bold uppercase">
          Back to Store
        </Link>
      </div>
    );
  }

  const items = order.items as any[];
  const isCOD = !order.payment_method || order.payment_method === "COD";
  const subtotal = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
  const deliveryCharge = order.total_amount - subtotal;
  const shortId = order.id.slice(-8).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans">
      {/* Navbar */}
      <header className="h-16 border-b border-[var(--border)] bg-[var(--card)] px-6 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center bg-[var(--foreground)] text-[var(--background)]">
            <ShoppingBag className="h-4 w-4" />
          </span>
          Yaz<span style={{ color: "var(--primary)" }}>Mart</span>
        </Link>
        <span className="text-[10px] uppercase tracking-widest font-semibold text-[var(--muted-foreground)]">Order Confirmation</span>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-10 space-y-6">

        {/* ── Hero Success Banner ── */}
        <div className={`relative overflow-hidden rounded-2xl p-8 text-center space-y-4 border ${
          isCOD
            ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50"
            : "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50"
        }`}>
          {/* confetti-like dots */}
          <div className="absolute inset-0 pointer-events-none opacity-30" style={{
            backgroundImage: "radial-gradient(circle, #10b981 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }} />

          <div className="relative">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
              isCOD ? "bg-emerald-100" : "bg-blue-100"
            }`}>
              <CheckCircle2 className={`h-9 w-9 ${isCOD ? "text-emerald-600" : "text-blue-600"}`} />
            </div>

            <h1 className={`text-2xl font-bold ${isCOD ? "text-emerald-700" : "text-blue-700"}`}>
              🎉 Order Placed Successfully!
            </h1>
            <p className="text-sm text-zinc-600 mt-1">
              {isCOD
                ? "Your order has been confirmed. No advance payment needed!"
                : "Payment received! Your order is now confirmed."}
            </p>

            {/* Order ID badge */}
            <button
              onClick={handleCopyId}
              className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono font-bold cursor-pointer transition-all ${
                isCOD
                  ? "border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50"
                  : "border-blue-300 bg-white text-blue-700 hover:bg-blue-50"
              }`}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              Order ID: #{shortId}
              <span className="text-[9px] text-zinc-400 ml-1">(tap to copy)</span>
            </button>

            {/* Payment method badge */}
            <div className="mt-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                isCOD
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
              }`}>
                {isCOD
                  ? <><Banknote className="h-3.5 w-3.5" /> Cash on Delivery (COD)</>
                  : <><Smartphone className="h-3.5 w-3.5" /> Online Payment</>
                }
              </span>
            </div>
          </div>
        </div>

        {/* ── Order Summary ── */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center gap-2">
            <PackageCheck className="h-4 w-4 text-[var(--muted-foreground)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Order Summary</h2>
          </div>

          <div className="p-5 space-y-3">
            {items.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                {item.image ? (
                  <div className="w-12 h-12 shrink-0 rounded-xl border border-[var(--border)] bg-white flex items-center justify-center overflow-hidden p-1">
                    <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="w-12 h-12 shrink-0 rounded-xl border border-[var(--border)] bg-[var(--accent)] flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-[var(--muted-foreground)]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)] font-mono mt-0.5">
                    {item.quantity} × ৳{Number(item.price).toFixed(2)}
                  </p>
                </div>
                <span className="text-sm font-bold shrink-0">
                  ৳{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div className="px-5 pb-5 space-y-2 border-t border-[var(--border)] pt-4">
            <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
              <span>Subtotal</span>
              <span className="font-semibold text-[var(--foreground)]">৳{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
              <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Delivery Charge</span>
              <span className="font-semibold text-[var(--foreground)]">৳{deliveryCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-[var(--border)] mt-2">
              <span>Total Paid</span>
              <span style={{ color: "var(--primary)" }} className="text-base">৳{Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ── Delivery Information ── */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center gap-2">
            <Truck className="h-4 w-4 text-[var(--muted-foreground)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Delivery Information</h2>
          </div>
          <div className="p-5 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
              <p className="text-[var(--foreground)] font-medium leading-relaxed">{order.shipping_address}</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
              <p className="text-[var(--foreground)] font-medium">{order.phone}</p>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
              <p className="text-[var(--muted-foreground)] text-xs">{order.customer_email}</p>
            </div>

            <div className="mt-2 pt-3 border-t border-[var(--border)] grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-center">
                <Clock className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                <p className="text-[10px] text-amber-700 font-semibold">Estimated Delivery</p>
                <p className="text-xs font-bold text-amber-800 mt-0.5">2 – 5 Working Days</p>
              </div>
              <div className="rounded-xl bg-purple-50 border border-purple-200 p-3 text-center">
                <Truck className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                <p className="text-[10px] text-purple-700 font-semibold">Courier Partner</p>
                <p className="text-xs font-bold text-purple-800 mt-0.5">Steadfast / Pathao</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Confirmation Note ── */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <PhoneCall className="h-5 w-5" />
            <span>You will receive a confirmation call shortly</span>
          </div>
          <ul className="text-xs text-blue-700 space-y-1.5 pl-7 list-disc">
            <li>Our team will call you to confirm your order details</li>
            <li>Please keep your phone active and reachable</li>
            <li>Order processing begins after confirmation</li>
          </ul>
        </div>

        {/* ── COD Trust Badge ── */}
        {isCOD && (
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 shrink-0">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800">No Advance Payment Required</p>
              <p className="text-xs text-emerald-700 mt-0.5">Pay only when you receive the product at your doorstep. 100% safe.</p>
            </div>
            <Star className="h-5 w-5 text-emerald-400 shrink-0 ml-auto" />
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-xs font-bold text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
          >
            <Home className="h-4 w-4" /> Go to Home
          </Link>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-xs font-bold text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
          >
            <ShoppingBag className="h-4 w-4" /> Continue Shopping
          </Link>
          <button
            onClick={handleCopyId}
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--foreground)] px-4 py-3 text-xs font-bold text-[var(--background)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Order ID"}
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-[10px] text-[var(--muted-foreground)]">
          Order reference: <span className="font-mono font-bold">{order.id}</span>
        </p>
      </main>
    </div>
  );
}
