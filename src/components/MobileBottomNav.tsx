"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home as HomeIcon, Sparkles, ShoppingBag, Package, User } from "lucide-react";
import { useShopStore } from "@/store/shop-store";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cart } = useShopStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Hide bottom nav on admin or seller dashboard paths
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/seller")) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around text-[10px] font-bold text-slate-600 shadow-2xl">
      <Link 
        href="/" 
        className={`flex flex-col items-center gap-0.5 transition-colors ${isActive("/") ? "text-[#ff6600]" : "text-slate-600 hover:text-[#ff6600]"}`}
      >
        <HomeIcon className="h-5 w-5" />
        <span>Home</span>
      </Link>

      <Link 
        href="/products?tab=flash-sale" 
        className={`flex flex-col items-center gap-0.5 transition-colors ${pathname?.includes("flash-sale") ? "text-[#ff6600]" : "text-slate-600 hover:text-[#ff6600]"}`}
      >
        <Sparkles className="h-5 w-5 text-amber-500" />
        <span>Deals</span>
      </Link>

      {/* Center Floating Cart Button */}
      <Link
        href="/cart"
        className="relative flex flex-col items-center justify-center -mt-5 cursor-pointer"
      >
        <div className="h-12 w-12 rounded-full bg-[#ff6600] text-white flex items-center justify-center shadow-lg shadow-orange-500/40 border-2 border-white">
          <ShoppingBag className="h-6 w-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-black text-white shadow-xs">
              {cartCount}
            </span>
          )}
        </div>
        <span className="mt-0.5 text-slate-800 font-extrabold">Cart</span>
      </Link>

      <Link 
        href="/profile?tab=orders" 
        className={`flex flex-col items-center gap-0.5 transition-colors ${pathname?.includes("orders") ? "text-[#ff6600]" : "text-slate-600 hover:text-[#ff6600]"}`}
      >
        <Package className="h-5 w-5" />
        <span>Orders</span>
      </Link>

      <Link 
        href="/profile" 
        className={`flex flex-col items-center gap-0.5 transition-colors ${isActive("/profile") ? "text-[#ff6600]" : "text-slate-600 hover:text-[#ff6600]"}`}
      >
        <User className="h-5 w-5" />
        <span>Profile</span>
      </Link>
    </div>
  );
}
