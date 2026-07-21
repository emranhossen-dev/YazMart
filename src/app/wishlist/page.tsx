"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useShopStore } from "@/store/shop-store";
import { Heart, Trash2, ArrowLeft, ShoppingCart, ShoppingBag } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useShopStore();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-6">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center gap-3">
          <Heart className="h-6 w-6 text-rose-500" /> Saved Wishlist
        </h1>

        {wishlist.length === 0 ? (
          <div className="p-16 border border-dashed border-slate-200 rounded-2xl bg-white text-center space-y-3">
            <Heart className="h-12 w-12 mx-auto text-slate-300 animate-pulse" />
            <h3 className="font-bold text-sm uppercase">Your wishlist is empty</h3>
            <p className="text-xs text-slate-500">Save items you like here to purchase them later.</p>
            <Link href="/" className="inline-block px-5 py-2.5 bg-[#ff6600] hover:bg-orange-700 text-white rounded-xl text-xs font-bold uppercase cursor-pointer">Explore Catalog</Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {wishlist.map((item) => (
              <div 
                key={item.id}
                className="flex flex-col p-4 border border-[var(--border)] bg-[var(--card)] rounded-xl shadow-xs justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="w-full h-36 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <ShoppingBag className="h-8 w-8 text-[var(--border)]" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--foreground)] line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] text-[var(--muted-foreground)] font-mono mt-0.5">{item.sku}</p>
                    <p className="text-xs font-black text-blue-500 mt-1">৳{item.price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-[var(--border)]/40">
                  <button 
                    onClick={() => {
                      addToCart(item);
                      removeFromWishlist(item.id);
                    }}
                    className="flex-1 py-2 bg-[#ff6600] hover:bg-orange-700 text-white rounded-lg text-xs font-bold uppercase cursor-pointer flex items-center justify-center gap-1 transition-colors"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" /> Buy Now
                  </button>
                  <button 
                    onClick={() => removeFromWishlist(item.id)}
                    className="p-2 border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 rounded-lg cursor-pointer transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
