"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useShopStore } from "@/store/shop-store";
import { signOutAction } from "@/actions/auth";
import { 
  ShoppingBag, Heart, ShoppingCart, User, LogOut, ShieldCheck, 
  Store, Package, Menu, X, Compass, Coins, Truck, ChevronDown
} from "lucide-react";

export default function Header() {
  const { user, logout } = useAuthStore();
  const { cart, wishlist } = useShopStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSignOut = async () => {
    await signOutAction();
    logout();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4 font-sans">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/logo yazmart.png"
            alt="YazMart Logo"
            className="h-10 w-auto object-contain max-w-[160px]"
          />
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-extrabold uppercase tracking-wider text-slate-700">
          <Link href="/products" className="hover:text-[#ff6600] transition-colors flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-[#ff6600]" /> All Products
          </Link>
          <Link href="/profile?tab=tracking" className="hover:text-[#ff6600] transition-colors flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-[#ff6600]" /> Track Parcel
          </Link>
          <Link href="/seller-center" className="hover:text-[#ff6600] transition-colors flex items-center gap-1.5 text-[#ff6600] font-black">
            <Store className="h-3.5 w-3.5" /> Become a Seller
          </Link>
        </nav>

        {/* Right Actions & Utilities */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Wishlist Link */}
          <Link
            href="/wishlist"
            className="relative flex h-9 w-9 items-center justify-center text-slate-700 hover:bg-orange-50 hover:text-[#ff6600] rounded-full transition-colors"
            title="Wishlist"
          >
            <Heart className="h-[18px] w-[18px]" />
            {wishlist.length > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-xs">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Link */}
          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center text-slate-700 hover:bg-orange-50 hover:text-[#ff6600] rounded-full transition-colors"
            title="Shopping Cart"
          >
            <ShoppingCart className="h-[18px] w-[18px]" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff6600] text-[9px] font-black text-white shadow-xs">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Profile / Auth Dropdown */}
          {user ? (
            <div 
              className="group relative"
              onMouseEnter={() => setUserMenuOpen(true)}
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900 hover:border-[#ff6600] hover:bg-orange-50 transition-all shadow-2xs"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff6600] text-[10px] font-black uppercase text-white shadow-xs">
                  {user.fullName?.charAt(0) || "U"}
                </span>
                <span className="hidden max-w-[100px] truncate md:inline">{user.fullName || "My Account"}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500 group-hover:text-[#ff6600] transition-colors" />
              </button>

              {/* Seamless Zero-Gap Hover & Click Dropdown Menu */}
              <div className={`absolute right-0 top-full pt-1.5 z-50 ${userMenuOpen ? "block" : "hidden group-hover:block"}`}>
                <div className="w-60 rounded-2xl border border-slate-200 bg-white p-2 text-xs shadow-2xl space-y-1 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 bg-orange-50/50 rounded-xl mb-1">
                    <p className="font-black text-slate-900 truncate">{user.fullName || "Customer"}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email || "Verified User"}</p>
                  </div>

                  <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-bold text-slate-800 hover:bg-orange-50 hover:text-[#ff6600] transition-colors">
                    <User className="h-4 w-4 text-[#ff6600]" /> My Profile
                  </Link>

                  <Link href="/profile?tab=orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-bold text-slate-800 hover:bg-orange-50 hover:text-[#ff6600] transition-colors">
                    <Package className="h-4 w-4 text-[#ff6600]" /> My Orders
                  </Link>

                  <Link href="/profile?tab=tracking" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-bold text-slate-800 hover:bg-orange-50 hover:text-[#ff6600] transition-colors">
                    <Truck className="h-4 w-4 text-emerald-600" /> Track Parcel
                  </Link>

                  <Link href="/cart" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-bold text-slate-800 hover:bg-orange-50 hover:text-[#ff6600] transition-colors">
                    <ShoppingCart className="h-4 w-4 text-blue-600" /> Shopping Cart ({cartCount})
                  </Link>

                  <Link href="/wishlist" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-bold text-slate-800 hover:bg-orange-50 hover:text-[#ff6600] transition-colors">
                    <Heart className="h-4 w-4 text-rose-500" /> Saved Wishlist ({wishlist.length})
                  </Link>

                  <Link href="/profile?tab=coins" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-bold text-slate-800 hover:bg-orange-50 hover:text-[#ff6600] transition-colors">
                    <Coins className="h-4 w-4 text-amber-500" /> Reward Coins Balance
                  </Link>

                  {user.role === "admin" && (
                    <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-bold text-slate-800 hover:bg-slate-100 transition-colors border-t border-slate-100">
                      <ShieldCheck className="h-4 w-4 text-indigo-600" /> Admin Panel
                    </Link>
                  )}

                  {user.role === "seller" && (
                    <Link href="/seller" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-bold text-slate-800 hover:bg-slate-100 transition-colors border-t border-slate-100">
                      <Store className="h-4 w-4 text-purple-600" /> Seller Center
                    </Link>
                  )}

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left font-bold text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/auth"
              className="rounded-full bg-[#ff6600] hover:bg-orange-700 px-5 py-2 text-xs font-extrabold text-white transition-colors shadow-sm"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 text-xs font-bold uppercase tracking-wider">
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-slate-800 hover:text-[#ff6600]"
          >
            <Compass className="h-4 w-4 text-[#ff6600]" /> All Products
          </Link>
          <Link
            href="/profile?tab=tracking"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-slate-800 hover:text-[#ff6600]"
          >
            <Truck className="h-4 w-4 text-[#ff6600]" /> Track Parcel
          </Link>
          <Link
            href="/seller-center"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-[#ff6600] font-black"
          >
            <Store className="h-4 w-4 text-[#ff6600]" /> Become a Seller
          </Link>

          {user ? (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 text-slate-800">
                <User className="h-4 w-4 text-[#ff6600]" /> My Profile
              </Link>
              <Link href="/profile?tab=orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 text-slate-800">
                <Package className="h-4 w-4 text-[#ff6600]" /> My Orders & Tracking
              </Link>
              <button onClick={handleSignOut} className="w-full text-left flex items-center gap-2 py-2 text-rose-600 font-bold">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 bg-[#ff6600] text-white rounded-xl font-extrabold"
              >
                Sign In / Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
