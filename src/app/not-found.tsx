"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Home, ShoppingBag, Store, Search, ArrowLeft, Compass, Sparkles } from "lucide-react";

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#060813] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 font-sans overflow-hidden select-none">
      
      {/* Background Animated Gradient Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] sm:h-[500px] sm:w-[500px] rounded-full bg-gradient-to-tr from-[#ff6600]/25 via-purple-600/20 to-cyan-500/25 blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-10 left-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
      <div className="absolute top-10 right-10 h-64 w-64 rounded-full bg-[#ff6600]/10 blur-2xl pointer-events-none" />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full text-center space-y-8">
        
        {/* Floating Animated 404 Graphic Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="text-8xl sm:text-9xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#ff6600] via-purple-400 to-cyan-400 drop-shadow-[0_10px_25px_rgba(255,102,0,0.3)] animate-bounce duration-1000">
            404
          </div>
          <div className="absolute -top-3 -right-3 flex items-center justify-center h-8 w-8 rounded-full bg-[#ff6600] text-white animate-spin">
            <Compass className="h-5 w-5" />
          </div>
        </div>

        {/* Messaging */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-bold text-[#ff6600] uppercase tracking-widest shadow-inner">
            <Sparkles className="h-3.5 w-3.5" /> Lost In Digital Space
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Oops! Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            The destination you are looking for doesn't exist, has been moved, or you don't have authorization to access this page.
          </p>
        </div>

        {/* Search Box on 404 Page */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products or stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-24 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-[#ff6600] focus:ring-2 focus:ring-[#ff6600]/20 transition-all shadow-lg"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 px-4 rounded-full bg-[#ff6600] hover:bg-orange-600 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Action Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ff6600] hover:bg-orange-600 text-white text-xs font-bold tracking-wide transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-lg shadow-[#ff6600]/25"
          >
            <Home className="h-4 w-4" /> Back to Home
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold tracking-wide transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-md"
          >
            <ShoppingBag className="h-4 w-4 text-cyan-400" /> Browse Products
          </Link>

          <Link
            href="/stores"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold tracking-wide transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-md"
          >
            <Store className="h-4 w-4 text-purple-400" /> Verified Stores
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-[10px] font-mono text-slate-600 pt-4">
          Error Code: 404_PAGE_NOT_FOUND · YazMart Security Engine
        </p>

      </div>
    </div>
  );
}
