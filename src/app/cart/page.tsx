"use client";

import React from "react";
import Link from "next/link";
import { useShopStore } from "@/store/shop-store";
import { ShoppingCart, Trash2, ArrowLeft, CreditCard, ShoppingBag } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useShopStore();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping;

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
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:underline">
          <ArrowLeft className="h-3 w-3" /> Continue Shopping
        </Link>

        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center gap-3">
          <ShoppingCart className="h-6 w-6 text-blue-500" /> Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <div className="p-16 border border-dashed border-[var(--border)] rounded-2xl bg-[var(--card)] text-center space-y-3">
            <ShoppingBag className="h-12 w-12 mx-auto text-[var(--muted-foreground)]" />
            <h3 className="font-bold text-sm uppercase">Your cart is empty</h3>
            <p className="text-xs text-[var(--muted-foreground)]">Browse our store catalog to add premium items to your checkout cart.</p>
            <Link href="/" className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase cursor-pointer">Shop Catalog</Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3 items-start">
            {/* Cart Items Column */}
            <div className="md:col-span-2 space-y-3">
              {cart.map((item) => (
                <div 
                  key={item.id}
                  className="flex gap-4 p-4 border border-[var(--border)] bg-[var(--card)] rounded-xl items-center shadow-xs"
                >
                  <div className="w-16 h-16 rounded-lg border border-[var(--border)] bg-[var(--background)] p-1 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <ShoppingBag className="h-6 w-6 text-[var(--border)]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[var(--foreground)] line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] text-[var(--muted-foreground)] font-mono mt-0.5">{item.sku}</p>
                    <p className="text-xs font-black text-blue-500 mt-1">${item.price.toFixed(2)}</p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center border border-[var(--border)] rounded-md bg-[var(--background)]">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-xs font-bold hover:bg-[var(--accent)]"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-mono font-black">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-xs font-bold hover:bg-[var(--accent)]"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              ))}

              <div className="flex justify-between pt-2">
                <button 
                  onClick={clearCart}
                  className="px-4 py-2 border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 text-xs font-bold uppercase rounded-lg cursor-pointer transition-colors"
                >
                  Clear Cart Ledger
                </button>
              </div>
            </div>

            {/* Cart Summary Card */}
            <div className="p-5 border border-[var(--border)] bg-[var(--card)] rounded-xl shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] tracking-wider">Order Summary Ledger</h3>
              
              <div className="divide-y divide-[var(--border)] text-xs font-medium">
                <div className="py-2.5 flex justify-between">
                  <span>Cart Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span>Standard Shipping</span>
                  <span>{shipping === 0 ? <span className="text-emerald-500">FREE</span> : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="py-3 flex justify-between text-sm font-black border-t border-[var(--border)]">
                  <span>Order Total</span>
                  <span className="text-blue-500">${total.toFixed(2)}</span>
                </div>
              </div>

              {shipping > 0 && (
                <p className="text-[10px] text-zinc-400 bg-blue-500/5 p-2 rounded border border-blue-500/10 text-center font-normal">
                  Add just <span className="font-bold">${(100 - subtotal).toFixed(2)}</span> more to unlock <span className="text-emerald-500 font-bold">Free Shipping</span>!
                </p>
              )}

              <Link 
                href="/checkout"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-colors"
              >
                <CreditCard className="h-4 w-4" /> Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
