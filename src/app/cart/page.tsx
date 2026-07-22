"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useShopStore } from "@/store/shop-store";
import { ShoppingCart, Trash2, ArrowLeft, CreditCard, ShoppingBag, ShieldCheck } from "lucide-react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useShopStore();

  const subtotal = cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      {/* Main content grid */}
      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 flex-1 py-8 space-y-8">
        
        {/* Step Indicator */}
        <div className="max-w-xl mx-auto flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
          <div className="flex items-center gap-2 text-[#ff6600]">
            <span className="w-6 h-6 rounded-full border-2 border-[#ff6600] flex items-center justify-center text-[10px] font-black">1</span>
            <span>Shopping Bag</span>
          </div>
          <div className="flex-1 h-0.5 bg-zinc-200 mx-4" />
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full border-2 border-zinc-200 flex items-center justify-center text-[10px] font-black">2</span>
            <span>Checkout Details</span>
          </div>
          <div className="flex-1 h-0.5 bg-zinc-200 mx-4" />
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full border-2 border-zinc-200 flex items-center justify-center text-[10px] font-black">3</span>
            <span>Confirmation</span>
          </div>
        </div>

        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center gap-3">
            <ShoppingCart className="h-7 w-7 text-[#ff6600]" /> Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review the itemized ledger of premium products selected for checkout.</p>
        </div>

        {cart.length === 0 ? (
          <div className="p-16 border border-dashed border-[var(--border)] rounded-3xl bg-[var(--card)] text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
              <ShoppingBag className="h-8 w-8 text-blue-500" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-base uppercase">Your bag is empty</h3>
              <p className="text-xs text-zinc-500">Explore the YazMart catalog to add premium items and exclusive flash deals.</p>
            </div>
            <Link href="/" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-colors shadow-sm">Shop Catalog</Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            {/* Left Items Column */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div 
                  key={item.id}
                  className="flex gap-4 p-5 bg-[var(--card)] border border-[var(--border)]/50 rounded-2xl items-center shadow-xs hover:border-[var(--border)] transition-all"
                >
                  <div className="w-20 h-20 rounded-xl border border-[var(--border)]/40 bg-[var(--background)] p-1.5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <ShoppingBag className="h-8 w-8 text-zinc-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-bold text-sm text-[var(--foreground)] line-clamp-1 hover:text-blue-500 transition-colors">
                      <Link href={`/products/${item.sku.toLowerCase()}`}>{item.name}</Link>
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-mono">SKU: {item.sku}</p>
                    <p className="text-xs font-black text-blue-500">৳{item.price.toFixed(2)}</p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center border border-[var(--border)]/60 rounded-xl bg-[var(--background)] overflow-hidden shadow-2xs">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="px-3 py-1.5 text-xs font-black hover:bg-[var(--accent)] transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-mono font-black text-[var(--foreground)]">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1.5 text-xs font-black hover:bg-[var(--accent)] transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer transition-colors"
                    title="Remove from Cart"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              ))}

              <div className="flex justify-between items-center pt-2">
                <button 
                  onClick={clearCart}
                  className="px-4 py-2 border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 text-xs font-bold uppercase rounded-xl cursor-pointer transition-colors"
                >
                  Clear Bag Ledger
                </button>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="p-6 border border-[var(--border)] bg-[var(--card)] rounded-2xl shadow-xs space-y-6">
              <h3 className="text-xs font-black uppercase text-[var(--foreground)] tracking-wider border-b border-[var(--border)]/30 pb-3">Order Ledger Summary</h3>
              
              <div className="divide-y divide-[var(--border)]/40 text-xs font-medium">
                <div className="py-3.5 flex justify-between text-zinc-600">
                  <span>Cart Subtotal</span>
                  <span className="font-bold text-[var(--foreground)]">৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="py-3.5 flex justify-between text-zinc-600">
                  <span>Standard Shipping</span>
                  <span>{shipping === 0 ? <span className="text-emerald-500 font-bold">FREE</span> : <span className="font-bold text-[var(--foreground)]">৳{shipping.toFixed(2)}</span>}</span>
                </div>
                <div className="py-4.5 flex justify-between text-sm font-black border-t border-[var(--border)] text-[var(--foreground)]">
                  <span>Net Amount Due</span>
                  <span className="text-[#ff6600] text-base font-mono">৳{total.toFixed(2)}</span>
                </div>
              </div>

              {shipping > 0 && (
                <div className="text-[10px] text-slate-500 bg-orange-50 p-3 rounded-xl border border-orange-200 text-center font-normal">
                  Add just <span className="font-bold">৳{(100 - subtotal).toFixed(2)}</span> more to unlock <span className="text-emerald-600 font-bold">Free Shipping</span>!
                </div>
              )}

              <div className="space-y-3">
                <Link 
                  href="/checkout"
                  className="w-full py-3 bg-[#ff6600] hover:bg-orange-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer flex items-center justify-center gap-2 transition-colors"
                >
                  <CreditCard className="h-4 w-4" /> Proceed to Checkout
                </Link>

                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 font-medium">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Secure 256-bit SSL checkout encrypted pipeline.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
