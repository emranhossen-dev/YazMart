"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useShopStore } from "@/store/shop-store";
import { 
  Heart, ShoppingBag, Info, Truck, Star, Search, SlidersHorizontal, ChevronRight 
} from "lucide-react";
import ProductQuickViewModal from "@/components/ProductQuickViewModal";

interface Store {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  banner_url?: string | null;
  description?: string | null;
  colors?: any;
}

interface StorePageClientProps {
  store: Store;
  initialProducts: any[];
}

function ProductCard({ product, wishlist, onToggleWishlist, onAddToCart, onBuyNow, onInfoClick }: any) {
  const discount = product.compare_price && product.compare_price > product.selling_price
    ? Math.round(((product.compare_price - product.selling_price) / product.compare_price) * 100)
    : null;
  const inWishlist = wishlist.some((item: any) => item.id === product.id);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <div className="relative">
        {discount && (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        )}

        <div className="absolute top-3 right-3 z-10 flex gap-1.5">
          {onInfoClick && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onInfoClick(product);
              }}
              aria-label="Quick view"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm text-zinc-500 transition-colors hover:text-zinc-955 cursor-pointer"
            >
              <Info className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onToggleWishlist(product)}
            aria-label="Toggle wishlist"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm transition-colors hover:text-rose-500 cursor-pointer"
          >
            <Heart className={`h-4 w-4 ${inWishlist ? "fill-rose-500 text-rose-500" : "text-zinc-500"}`} />
          </button>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="flex h-40 items-center justify-center overflow-hidden bg-[var(--surface-container-low)] p-4"
        >
          {product.featured_image ? (
            <img
              src={product.featured_image}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <ShoppingBag className="h-8 w-8 text-[var(--border)]" />
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          {product.brand?.name || "General"}
        </p>
        <h4 className="mt-1 line-clamp-2 text-xs font-bold text-[var(--foreground)] min-h-[32px]">
          <Link href={`/products/${product.slug}`} className="hover:underline">{product.name}</Link>
        </h4>

        <div className="mt-1.5 flex items-center gap-1">
          <div className="flex text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-2.5 w-2.5 fill-current" />
            ))}
          </div>
          <span className="text-[10px] text-[var(--muted-foreground)]">(5.0)</span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-sm font-extrabold text-[var(--foreground)]">৳{product.selling_price.toLocaleString()}</span>
          {product.compare_price && product.compare_price > product.selling_price && (
            <span className="text-xs text-[var(--muted-foreground)] line-through">৳{product.compare_price.toLocaleString()}</span>
          )}
        </div>

        <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
          <Truck className="h-3.5 w-3.5" /> Free shipping
        </p>

        <div className="mt-1 flex gap-2">
          <button
            onClick={() => onAddToCart(product)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-zinc-200 py-2 text-[11px] font-semibold text-zinc-700 transition-colors hover:border-zinc-400 cursor-pointer animate-press"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
          </button>
          <button
            onClick={() => onBuyNow(product)}
            className="flex-1 rounded-full bg-zinc-900 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-zinc-700 cursor-pointer animate-press"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StorePageClient({ store, initialProducts }: StorePageClientProps) {
  const { wishlist, addToCart, toggleWishlist } = useShopStore();
  const [products] = useState<any[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  // Dynamic colors style mapping
  const styleVariables = useMemo(() => {
    if (!store.colors) return {};
    return {
      "--primary": store.colors.primary || "var(--primary)",
      "--accent": store.colors.secondary || "var(--accent)",
      "--card": store.colors.cardBg || "var(--card)",
      "--background": store.colors.background || "var(--background)",
    } as React.CSSProperties;
  }, [store.colors]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.short_desc?.toLowerCase().includes(q));
    }

    // Sort order
    if (sortBy === "price_asc") {
      result.sort((a, b) => a.selling_price - b.selling_price);
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => b.selling_price - a.selling_price);
    } else if (sortBy === "name_asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default: Newest
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [products, searchTerm, sortBy]);

  const handleToggleWishlist = (prod: any) => {
    toggleWishlist(prod);
  };

  const handleAddToCart = (prod: any) => {
    addToCart(prod);
  };

  const handleBuyNow = (prod: any) => {
    addToCart(prod);
    window.location.href = "/checkout";
  };

  return (
    <div style={styleVariables} className="min-h-screen bg-[var(--background)] pb-16 font-sans text-[var(--foreground)]">
      {/* Dynamic Header Banner */}
      <div className="relative h-64 w-full overflow-hidden bg-gradient-to-r from-zinc-800 to-zinc-900 md:h-80">
        {store.banner_url ? (
          <img 
            src={store.banner_url} 
            alt={store.name} 
            className="h-full w-full object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        
        {/* Breadcrumb & Navigation */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-xs text-zinc-300 font-semibold md:left-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white">Stores</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white">{store.name}</span>
        </div>

        {/* Store Profile Info */}
        <div className="absolute bottom-6 left-4 right-4 flex flex-col gap-4 md:bottom-8 md:left-8 md:flex-row md:items-center md:gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white/10 bg-zinc-950 p-2 shadow-xl md:h-24 md:w-24">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="max-h-full max-w-full object-contain rounded-lg" />
            ) : (
              <ShoppingBag className="h-10 w-10 text-white opacity-90" />
            )}
          </div>

          <div className="flex-1 text-white">
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{store.name}</h1>
            <p className="mt-1.5 text-xs font-semibold text-zinc-300 max-w-2xl line-clamp-2">
              {store.description || "Welcome to our store page! Discover our latest products and exclusive deals."}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar Section */}
      <div className="mx-auto mt-8 max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">Our Products</h2>
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">Showing {filteredProducts.length} items</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] sm:flex-initial">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search products in this store..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-[var(--border)] bg-[var(--card)] py-2 pl-9 pr-4 text-xs font-semibold placeholder-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
              />
            </div>

            {/* Sort Select */}
            <div className="relative flex items-center">
              <SlidersHorizontal className="absolute left-3.5 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none rounded-full border border-[var(--border)] bg-[var(--card)] py-2 pl-9 pr-8 text-xs font-bold text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--muted-foreground)]">
            <ShoppingBag className="h-12 w-12 text-[var(--border)]" />
            <p className="mt-3 font-mono text-sm font-bold uppercase">No products found</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onInfoClick={setQuickViewProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
