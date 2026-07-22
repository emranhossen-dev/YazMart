"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useShopStore } from "@/store/shop-store";
import { signOutAction } from "@/actions/auth";
import { supabase } from "@/lib/supabase";
import { 
  ShoppingBag, Heart, ShoppingCart, User, LogOut, ShieldCheck, 
  Store, Package, Menu, X, Compass, Search, Truck, ChevronDown, ChevronRight
} from "lucide-react";

export default function Header() {
  const { user, logout, openAuthModal } = useAuthStore();
  const { cart, wishlist } = useShopStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await signOutAction();
    logout();
    window.location.href = "/";
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs">
        {/* Announcement Bar */}
        <div className="bg-[#0b1426] text-slate-300 text-xs font-medium border-b border-slate-800/80 py-1.5 hidden sm:block">
          <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 flex items-center justify-between">
            <span className="text-[11px] text-slate-300">
              Free shipping over ৳1500 · Cash on delivery available
            </span>
            <div className="flex items-center gap-6 text-[11px] font-medium text-slate-300">
              <Link href="/profile?tab=tracking" className="hover:text-white transition-colors">
                Track order
              </Link>
              <Link href="/seller-center" className="hover:text-white transition-colors">
                Sell on YazMart
              </Link>
            </div>
          </div>
        </div>

        {/* Main Header Navbar */}
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 h-16 flex items-center justify-between gap-2 md:gap-4 font-sans">
          
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/logo yazmart.png"
              alt="YazMart Logo"
              className="h-8 md:h-10 w-auto object-contain max-w-[120px] md:max-w-[160px]"
            />
          </Link>

          {/* Center: Search Bar taking all remaining space */}
          <div className="relative flex-1 max-w-2xl mx-1 md:mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-3.5 md:h-4 w-3.5 md:w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, brands, stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                className="w-full h-9 md:h-11 pl-9 md:pl-11 pr-3 sm:pr-28 rounded-full border border-slate-200 bg-slate-100/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff6600]/30 focus:border-[#ff6600] transition text-xs font-semibold text-slate-900 placeholder-slate-400"
              />
              {/* Search text button - Hidden on Mobile */}
              <button
                type="button"
                onClick={() => {
                  if (searchQuery.trim()) {
                    window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                className="hidden sm:block absolute right-1 top-1/2 -translate-y-1/2 h-9 px-6 rounded-full bg-[#ff6600] text-white text-xs font-bold hover:bg-orange-700 transition cursor-pointer shadow-xs"
              >
                Search
              </button>
            </div>
          </div>

          {/* Right Actions & Hamburger Button */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="relative hidden sm:flex h-9 w-9 items-center justify-center text-slate-700 hover:bg-orange-50 hover:text-[#ff6600] rounded-full transition-colors"
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
              className="relative hidden sm:flex h-9 w-9 items-center justify-center text-slate-700 hover:bg-orange-50 hover:text-[#ff6600] rounded-full transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff6600] text-[9px] font-black text-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile Dropdown (Desktop) */}
            {user ? (
              <div 
                className="group relative hidden sm:block"
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

                {userMenuOpen && (
                  <div className="absolute right-0 top-full pt-1.5 z-50">
                    <div className="w-56 rounded-2xl border border-slate-200 bg-white p-2 text-xs shadow-2xl space-y-1">
                      <div className="px-3.5 py-2.5 border-b border-slate-100 bg-orange-50/50 rounded-xl mb-1">
                        <p className="font-black text-slate-900 truncate">{user.fullName || "Customer"}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-bold text-slate-800 hover:bg-orange-50 hover:text-[#ff6600]">
                        <User className="h-4 w-4 text-[#ff6600]" /> My Profile
                      </Link>

                      <Link href="/profile?tab=orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-bold text-slate-800 hover:bg-orange-50 hover:text-[#ff6600]">
                        <Package className="h-4 w-4 text-[#ff6600]" /> My Orders
                      </Link>

                      <Link href="/profile?tab=tracking" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-bold text-slate-800 hover:bg-orange-50 hover:text-[#ff6600]">
                        <Truck className="h-4 w-4 text-emerald-600" /> Track Parcel
                      </Link>

                      {user.role === "admin" && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-bold text-slate-800 hover:bg-slate-100 border-t border-slate-100">
                          <ShieldCheck className="h-4 w-4 text-indigo-600" /> Admin Panel
                        </Link>
                      )}

                      {user.role === "seller" && (
                        <Link href="/seller" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-bold text-slate-800 hover:bg-slate-100 border-t border-slate-100">
                          <Store className="h-4 w-4 text-purple-600" /> Seller Center
                        </Link>
                      )}

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="hidden sm:flex rounded-full bg-[#ff6600] hover:bg-orange-700 px-4 py-2 text-xs font-extrabold text-white transition-colors shadow-xs cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-orange-50 text-slate-800 hover:text-[#ff6600] transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu (Right Side) */}
      {mobileSidebarOpen && (
        <>
          <div className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-xs" onClick={() => setMobileSidebarOpen(false)} />

          <div className="fixed inset-y-0 right-0 z-[100] flex w-72 sm:w-80 flex-col bg-white text-slate-900 shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <Link href="/" onClick={() => setMobileSidebarOpen(false)}>
                <img src="/logo yazmart.png" alt="YazMart" className="h-8 w-auto object-contain" />
              </Link>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs font-semibold">
              {user ? (
                <div className="bg-orange-50/70 p-3 rounded-2xl border border-orange-100 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff6600] text-sm font-black uppercase text-white shadow-xs">
                    {user.fullName?.charAt(0) || "U"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-slate-900 truncate">{user.fullName || "Customer"}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    openAuthModal("login");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff6600] py-3 font-extrabold text-white text-xs shadow-md cursor-pointer"
                >
                  <User className="h-4 w-4" /> Sign In / Register
                </button>
              )}

              {/* Navigation Links */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">Navigation</h4>
                <div className="space-y-1">
                  <Link href="/products" onClick={() => setMobileSidebarOpen(false)} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-slate-800 hover:bg-orange-50 hover:text-[#ff6600]">
                    <span className="flex items-center gap-2.5 font-bold"><Compass className="h-4 w-4 text-[#ff6600]" /> All Products</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                  <Link href="/profile?tab=tracking" onClick={() => setMobileSidebarOpen(false)} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-slate-800 hover:bg-orange-50 hover:text-[#ff6600]">
                    <span className="flex items-center gap-2.5 font-bold"><Truck className="h-4 w-4 text-emerald-600" /> Track Parcel</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                  <Link href="/seller-center" onClick={() => setMobileSidebarOpen(false)} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[#ff6600] font-black hover:bg-orange-50">
                    <span className="flex items-center gap-2.5"><Store className="h-4 w-4 text-[#ff6600]" /> Become a Seller</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                </div>
              </div>

              {user && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => { setMobileSidebarOpen(false); handleSignOut(); }}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-extrabold text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
