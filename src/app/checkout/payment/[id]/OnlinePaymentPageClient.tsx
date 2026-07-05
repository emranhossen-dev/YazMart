"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getOrderById } from "@/actions/orders";
import { submitOnlinePayment } from "@/actions/orders";
import {
  ShoppingBag, Smartphone, Copy, Check, AlertCircle,
  Banknote, ArrowRight, ShieldCheck, Info, Loader2
} from "lucide-react";

// ─── Business payment numbers (update as needed) ───
const BKASH_NUMBER  = "01XXXXXXXXX";
const NAGAD_NUMBER  = "01XXXXXXXXX";

export default function OnlinePaymentPageClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trxId, setTrxId]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [copiedBkash, setCopiedBkash] = useState(false);
  const [copiedNagad, setCopiedNagad] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [activeMethod, setActiveMethod] = useState<"bkash" | "nagad">("bkash");

  useEffect(() => {
    const load = async () => {
      const res = await getOrderById(id);
      if (res.order) setOrder(res.order);
      setLoading(false);
    };
    load();
  }, [id]);

  const copyText = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim()) {
      setError("Please enter the Transaction ID (TRXID).");
      return;
    }
    setError(null);
    setSubmitting(true);

    const res = await submitOnlinePayment(id, trxId.trim());
    if (res.error) {
      setError(res.error);
      setSubmitting(false);
    } else {
      // Go to confirmation page on success
      router.push(`/checkout/confirmation/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--background)]">
        <div className="h-10 w-10 rounded-full border-[3px] border-blue-500 border-t-transparent animate-spin" />
        <p className="text-xs text-[var(--muted-foreground)] animate-pulse uppercase tracking-widest font-semibold">Loading payment details…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--background)]">
        <p className="text-rose-500 font-bold text-sm">Order not found</p>
        <Link href="/" className="px-5 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-xs font-bold">Back to Store</Link>
      </div>
    );
  }

  const amount = Number(order.total_amount).toFixed(2);

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
        <span className="text-[10px] uppercase tracking-widest font-semibold text-[var(--muted-foreground)]">Complete Payment</span>
      </header>

      {/* Steps */}
      <div className="max-w-xl mx-auto w-full px-4 pt-6">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <div className="flex items-center gap-2 text-emerald-600">
            <span className="w-6 h-6 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-[10px] font-black">✓</span>
            <span>Order Placed</span>
          </div>
          <div className="flex-1 h-0.5 bg-emerald-500 mx-3" />
          <div className="flex items-center gap-2 text-[var(--foreground)]">
            <span className="w-6 h-6 rounded-full border-2 border-[var(--foreground)] flex items-center justify-center text-[10px] font-black">2</span>
            <span>Payment</span>
          </div>
          <div className="flex-1 h-0.5 bg-zinc-200 mx-3" />
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full border-2 border-zinc-200 flex items-center justify-center text-[10px] font-black">3</span>
            <span>Confirmed</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 space-y-5">

        {/* ── Amount Due ── */}
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-center space-y-2">
          <Smartphone className="h-8 w-8 text-blue-600 mx-auto" />
          <p className="text-xs uppercase tracking-widest font-semibold text-blue-500">Total Amount to Pay</p>
          <p className="text-4xl font-black text-blue-700">৳{amount}</p>
          <p className="text-[10px] text-blue-400 font-mono">Order #{order.id.slice(-8).toUpperCase()}</p>

          {/* Copy amount button */}
          <button
            onClick={() => copyText(amount, setCopiedAmount)}
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer mt-1"
          >
            {copiedAmount ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copiedAmount ? "Copied!" : "Copy Amount"}
          </button>
        </div>

        {/* ── Payment Method Tabs ── */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          {/* Tab switcher */}
          <div className="grid grid-cols-2 border-b border-[var(--border)]">
            <button
              onClick={() => setActiveMethod("bkash")}
              className={`py-3 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                activeMethod === "bkash"
                  ? "bg-pink-50 text-pink-600 border-b-2 border-pink-500"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              📱 bKash
            </button>
            <button
              onClick={() => setActiveMethod("nagad")}
              className={`py-3 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                activeMethod === "nagad"
                  ? "bg-orange-50 text-orange-600 border-b-2 border-orange-500"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              💸 Nagad
            </button>
          </div>

          <div className="p-5 space-y-4">
            {activeMethod === "bkash" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-pink-600 font-bold text-sm">
                  <Banknote className="h-4 w-4" />
                  Send to bKash Number:
                </div>
                <div className="flex items-center justify-between rounded-xl bg-pink-50 border border-pink-200 px-4 py-3">
                  <span className="font-mono font-black text-lg text-pink-700 tracking-widest">{BKASH_NUMBER}</span>
                  <button
                    onClick={() => copyText(BKASH_NUMBER, setCopiedBkash)}
                    className="flex items-center gap-1 text-[10px] font-bold text-pink-600 hover:text-pink-800 cursor-pointer"
                  >
                    {copiedBkash ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedBkash ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="text-xs text-pink-600 font-medium space-y-1.5 pl-1">
                  <p>1️⃣ Open bKash app → <strong>Send Money</strong></p>
                  <p>2️⃣ Enter number: <strong>{BKASH_NUMBER}</strong></p>
                  <p>3️⃣ Enter amount: <strong>৳{amount}</strong></p>
                  <p>4️⃣ Note the <strong>Transaction ID (TrxID)</strong></p>
                  <p>5️⃣ Enter TrxID below and confirm</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                  <Banknote className="h-4 w-4" />
                  Send to Nagad Number:
                </div>
                <div className="flex items-center justify-between rounded-xl bg-orange-50 border border-orange-200 px-4 py-3">
                  <span className="font-mono font-black text-lg text-orange-700 tracking-widest">{NAGAD_NUMBER}</span>
                  <button
                    onClick={() => copyText(NAGAD_NUMBER, setCopiedNagad)}
                    className="flex items-center gap-1 text-[10px] font-bold text-orange-600 hover:text-orange-800 cursor-pointer"
                  >
                    {copiedNagad ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedNagad ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="text-xs text-orange-600 font-medium space-y-1.5 pl-1">
                  <p>1️⃣ Open Nagad app → <strong>Send Money</strong></p>
                  <p>2️⃣ Enter number: <strong>{NAGAD_NUMBER}</strong></p>
                  <p>3️⃣ Enter amount: <strong>৳{amount}</strong></p>
                  <p>4️⃣ Note the <strong>Transaction ID (TrxID)</strong></p>
                  <p>5️⃣ Enter TrxID below and confirm</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Transaction ID Form ── */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldCheck className="h-4 w-4" />
            Enter Transaction ID
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1.5">
              Transaction ID (TrxID / Reference) *
            </label>
            <input
              type="text"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value.toUpperCase())}
              required
              placeholder="e.g. 8N4A2B3C1D"
              className="w-full px-4 py-3 text-sm font-mono font-bold rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-[var(--foreground)] tracking-widest uppercase transition-all"
            />
            <p className="text-[10px] text-zinc-400 mt-1.5 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Find the TrxID in your bKash/Nagad SMS after payment
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !trxId.trim()}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            {submitting
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
              : <><Check className="h-4 w-4" /> Confirm Payment <ArrowRight className="h-4 w-4" /></>
            }
          </button>
        </form>

        {/* Trust note */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-500">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
          <p>Your transaction ID is verified by our team before order dispatch. Never share your PIN or password with anyone.</p>
        </div>
      </main>
    </div>
  );
}
