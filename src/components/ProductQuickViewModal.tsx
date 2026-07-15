"use client";

import React, { useState } from "react";
import { X, Heart, Star, Truck, Plus, Minus, ShoppingBag } from "lucide-react";
import { useShopStore } from "@/store/shop-store";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface Product {
  id: string | number;
  name: string;
  featured_image?: string;
  selling_price: number;
  compare_price?: number;
  description?: string;
  brand?: {
    name?: string;
  };
}

interface ProductQuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductQuickViewModal({ product, onClose }: ProductQuickViewModalProps) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const { wishlist, toggleWishlist, addToCart } = useShopStore();

  const inWishlist = wishlist.some((item) => item.id === product.id);
  const discount = product.compare_price && product.compare_price > product.selling_price
    ? Math.round(((product.compare_price - product.selling_price) / product.compare_price) * 100)
    : null;

  const handleAddToCart = () => {
    addToCart({ ...product, quantity: qty });
    toast.success("Added to cart", {
      style: {
        background: "var(--card)",
        color: "var(--foreground)",
        border: "1px solid var(--border)",
        fontSize: "12px",
        fontWeight: "600",
        borderRadius: "0",
      },
    });
    onClose();
  };

  const handleBuyNow = () => {
    addToCart({ ...product, quantity: qty });
    router.push("/checkout");
    onClose();
  };

  const handleToggleWishlist = () => {
    const wasInWishlist = inWishlist;
    toggleWishlist(product);
    toast.success(wasInWishlist ? "Removed from wishlist" : "Added to wishlist", {
      style: {
        background: "var(--card)",
        color: "var(--foreground)",
        border: "1px solid var(--border)",
        fontSize: "12px",
        fontWeight: "600",
        borderRadius: "0",
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-2xl transition-all duration-300 md:flex-row max-h-[90vh] md:max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--background)]/85 text-[var(--foreground)] border border-[var(--border)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)] cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left Side: Product Image */}
        <div className="relative flex min-h-[250px] items-center justify-center bg-[var(--surface-container-low)] p-8 md:w-1/2">
          {discount && (
            <span className="absolute top-4 left-4 z-10 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-bold text-white">
              -{discount}% OFF
            </span>
          )}
          <img
            src={product.featured_image}
            alt={product.name}
            className="max-h-56 max-w-full object-contain md:max-h-80 transition-transform duration-300 hover:scale-102"
          />
        </div>

        {/* Right Side: Details */}
        <div className="flex flex-1 flex-col overflow-y-auto p-6 md:p-8">
          <div className="flex-1 space-y-4">
            {/* Brand & Name */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                {product.brand?.name || "General"}
              </p>
              <h2 className="mt-1 text-xl font-bold leading-tight md:text-2xl">
                {product.name}
              </h2>
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4].map((s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-current" />
                ))}
                <Star className="h-3.5 w-3.5 fill-current opacity-40" />
              </div>
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                4.6 (12 reviews)
              </span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 border-y border-[var(--border)] py-3">
              <span className="text-2xl font-black text-[var(--foreground)]">
                ৳{product.selling_price.toLocaleString("en-US")}
              </span>
              {product.compare_price && (
                <span className="text-sm text-[var(--muted-foreground)] line-through">
                  ৳{product.compare_price.toLocaleString("en-US")}
                </span>
              )}
            </div>

            {/* Short Description */}
            <div className="space-y-1">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Description
              </h4>
              <p className="text-xs leading-relaxed text-[var(--muted-foreground)] line-clamp-4">
                {product.description || "No product description available for this item. This product is sourced with premium materials and designed to offer exceptional utility, durability, and style."}
              </p>
            </div>

            {/* Free Shipping Line */}
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <Truck className="h-4 w-4" />
              <span>Free delivery on this order</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 space-y-4 border-t border-[var(--border)] pt-5">
            {/* Quantity Selector & Wishlist */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center border border-[var(--border)] rounded-full px-2 py-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center font-mono text-xs font-bold">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="flex h-8 w-8 items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                onClick={handleToggleWishlist}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--foreground)] transition-colors hover:border-rose-500 hover:text-rose-500 cursor-pointer"
                aria-label="Toggle wishlist"
              >
                <Heart className={`h-4.5 w-4.5 ${inWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
              </button>
            </div>

            {/* Cart & Buy Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--foreground)] py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)] cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" /> Add To Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 rounded-full bg-[var(--foreground)] py-3 text-xs font-bold uppercase tracking-wider text-[var(--background)] transition-opacity hover:opacity-90 cursor-pointer"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
