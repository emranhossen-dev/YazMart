"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShopStore } from "@/store/shop-store";
import { createOrder } from "@/actions/orders";
import { ArrowLeft, CreditCard, ShoppingBag, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useShopStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cart.length === 0) {
      setError("Your cart is empty. Add products before placing an order.");
      return;
    }

    setLoading(true);

    const payload = {
      customer_name: name,
      customer_email: email,
      shipping_address: address,
      phone: phone,
      total_amount: total,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        sku: item.sku,
        image: item.image
      }))
    };

    const res = await createOrder(payload);

    if (res.error) {
      setError(res.error);
    } else if (res.success && res.orderId) {
      clearCart();
      router.push(`/checkout/confirmation/${res.orderId}`);
    }

    setLoading(false);
  };

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

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-6">
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:underline">
          <ArrowLeft className="h-3 w-3" /> Back to Cart
        </Link>

        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-blue-500" /> Checkout Ledger
        </h1>

        {error && (
          <div className="p-3 rounded text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/15">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-5 items-start">
          {/* Shipping Form Column */}
          <div className="md:col-span-3 p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-500" /> Shipping & Billing details
            </h3>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500 font-bold" 
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500 font-bold" 
                    placeholder="e.g. john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required 
                  className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500 font-bold" 
                  placeholder="e.g. +8801700000000"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Delivery Address</label>
                <textarea 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  required 
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500" 
                  placeholder="Apartment, Street name, City, Zip Code"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || cart.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? "Registering Transaction..." : "Confirm & Place Order"}
              </button>
            </form>
          </div>

          {/* Cart Preview Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="p-5 border border-[var(--border)] bg-[var(--card)] rounded-xl shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] tracking-wider">Checkout Items</h3>
              
              <div className="max-h-48 overflow-y-auto space-y-2 text-xs pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-1 border-b border-[var(--border)] last:border-b-0 pb-2">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold line-clamp-1">{item.name}</p>
                      <p className="text-[9px] text-[var(--muted-foreground)] font-mono">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                    </div>
                    <span className="font-bold text-blue-500 flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="divide-y divide-[var(--border)] text-xs font-medium pt-2 border-t border-[var(--border)]">
                <div className="py-2 flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span>Shipping Fee</span>
                  <span>{shipping === 0 ? <span className="text-emerald-500 font-bold">FREE</span> : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="py-3 flex justify-between text-sm font-black border-t border-[var(--border)]">
                  <span>Net Due</span>
                  <span className="text-blue-500">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
