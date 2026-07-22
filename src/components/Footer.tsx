import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, Truck, RefreshCw } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0f172a] text-slate-300 border-t border-slate-800 pt-12 pb-8 font-sans relative mt-auto">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-xs">
        
        {/* Brand Info */}
        <div className="space-y-4">
          <Link href="/" className="inline-block">
            <img
              src="/logo yazmart.png"
              alt="YazMart Logo"
              className="h-10 w-auto object-contain max-w-[160px] bg-white rounded-lg p-1"
            />
          </Link>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Bangladesh's premier multi-vendor e-commerce marketplace for quality electronics, fashion, and everyday essentials.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-[#ff6600]" /> 100% Verified Merchants
          </div>
        </div>

        {/* Quick Navigation */}
        <div>
          <h4 className="font-black uppercase tracking-wider text-white text-[11px] mb-4 border-l-2 border-[#ff6600] pl-2">
            Quick Navigation
          </h4>
          <ul className="space-y-2.5 text-slate-400">
            <li><Link href="/products" className="hover:text-[#ff6600] transition-colors">All Products Catalog</Link></li>
            <li><Link href="/profile?tab=tracking" className="hover:text-[#ff6600] transition-colors flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-[#ff6600]" /> Live Parcel Tracking</Link></li>
            <li><Link href="/cart" className="hover:text-[#ff6600] transition-colors">Shopping Cart</Link></li>
            <li><Link href="/wishlist" className="hover:text-[#ff6600] transition-colors">Saved Wishlist</Link></li>
            <li><Link href="/profile" className="hover:text-[#ff6600] transition-colors">Customer Dashboard</Link></li>
          </ul>
        </div>

        {/* Merchant & Partner Center */}
        <div>
          <h4 className="font-black uppercase tracking-wider text-white text-[11px] mb-4 border-l-2 border-[#ff6600] pl-2">
            Merchant Center
          </h4>
          <ul className="space-y-2.5 text-slate-400">
            <li><Link href="/seller-center" className="hover:text-[#ff6600] font-bold text-[#ff6600] transition-colors">Become a Seller</Link></li>
            <li><Link href="/stores" className="hover:text-[#ff6600] transition-colors">Browse Verified Stores</Link></li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h4 className="font-black uppercase tracking-wider text-white text-[11px] mb-4 border-l-2 border-[#ff6600] pl-2">
            Customer Support
          </h4>
          <ul className="space-y-2.5 text-slate-400 text-[11px]">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#ff6600] shrink-0" />
              <span>shop@yazmart.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#ff6600] shrink-0" />
              <span>+880 1700-000000</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#ff6600] shrink-0" />
              <span>Dhaka, Bangladesh</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
        <p>© {new Date().getFullYear()} YazMart Enterprise Marketplace. All rights reserved.</p>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Fast Delivery Across Bangladesh</span>
          <span>•</span>
          <span>Secure Encrypted Checkout</span>
        </div>
      </div>
    </footer>
  );
}
