"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useShopStore } from "@/store/shop-store";
import { 
  Heart, ShoppingBag, ShoppingCart, Info, Truck, Star, Search, SlidersHorizontal, ChevronRight 
} from "lucide-react";
import ProductQuickViewModal from "@/components/ProductQuickViewModal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  const outOfStock = product.current_stock !== undefined && product.current_stock <= 0;

  const badgeText = product.badge || (discount ? `-${discount}%` : (product.is_bestseller ? "BESTSELLER" : null));
  const ratingVal = product.rating || (4.5 + (product.id ? (String(product.id).charCodeAt(0) % 5) * 0.1 : 0.3)).toFixed(1);
  const reviewsCount = product.reviews_count || (50 + (product.id ? (String(product.id).charCodeAt(0) % 150) : 25));

  return (
    <div className="group flex w-full shrink-0 flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xs hover:shadow-xl transition-all duration-300">
      {/* Product Image Box */}
      <div className="relative w-full h-36 sm:h-48 md:h-56 overflow-hidden rounded-t-3xl bg-slate-100">
        {badgeText && (
          <span className="absolute top-2 left-2 z-10 rounded-full bg-[#ff6600] px-2 py-0.5 text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase text-white shadow-xs tracking-wide">
            {badgeText}
          </span>
        )}

        <div className="absolute top-2 right-2 z-10 flex gap-1">
          {onInfoClick && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onInfoClick(product);
              }}
              aria-label="Quick view"
              className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-white/95 shadow-sm text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Info className="h-3 w-3 md:h-4 md:w-4" />
            </button>
          )}

          <button
            onClick={() => onToggleWishlist(product)}
            aria-label="Toggle wishlist"
            className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-white/95 shadow-sm transition-colors hover:text-rose-500 cursor-pointer"
          >
            <Heart className={`h-3 w-3 md:h-4 md:w-4 ${inWishlist ? "fill-rose-500 text-rose-500" : "text-slate-400"}`} />
          </button>
        </div>

        <Link
          href={`/products/${product.slug || product.id}`}
          className="block w-full h-full"
        >
          <img
            src={product.featured_image || product.image || "/images/cat_electronics.png"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5 sm:p-3 md:p-4">
        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] md:text-xs text-amber-500 font-bold">
          <Star className="h-3 w-3 md:h-3.5 md:w-3.5 fill-current" />
          <span>{ratingVal}</span>
          <span className="text-slate-400 font-normal">· {reviewsCount}</span>
        </div>

        <h4 className="line-clamp-1 text-[11px] sm:text-xs md:text-sm font-bold text-slate-900 hover:text-[#ff6600] transition-colors">
          <Link href={`/products/${product.slug || product.id}`}>{product.name}</Link>
        </h4>

        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-xs sm:text-sm md:text-base font-black text-slate-900">
            ৳{Number(product.selling_price || product.price || 0).toLocaleString()}
          </span>
          {(product.compare_price || product.originalPrice) && (
            <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-slate-400 line-through">
              ৳{Number(product.compare_price || product.originalPrice).toLocaleString()}
            </span>
          )}
        </div>

        {outOfStock ? (
          <span className="mt-1 rounded-full bg-rose-50 py-1 text-center text-[10px] md:text-[11px] font-bold text-rose-500">
            Out of Stock
          </span>
        ) : (
          <div className="mt-1 flex gap-1 sm:gap-1.5">
            <button
              onClick={() => onAddToCart(product)}
              className="flex flex-1 items-center justify-center gap-0.5 rounded-full border border-slate-200 bg-white hover:border-[#ff6600] hover:bg-orange-50/50 py-1 text-[10px] md:text-[11px] font-bold text-slate-800 hover:text-[#ff6600] transition-all cursor-pointer"
            >
              <ShoppingCart className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#ff6600]" /> Add
            </button>
            <button
              onClick={() => onBuyNow(product)}
              className="flex-1 rounded-full bg-[#ff6600] hover:bg-orange-700 py-1 text-[10px] md:text-[11px] font-bold text-white transition-all cursor-pointer shadow-xs"
            >
              Buy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StorePageClient({ store, initialProducts, storeCategories = [] }: StorePageClientProps) {
  const { wishlist, addToCart, toggleWishlist } = useShopStore();
  const [products] = useState<any[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
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

    // Category filter
    if (selectedCategory !== "ALL") {
      result = result.filter(p => p.category_id === selectedCategory || p.category?.id === selectedCategory);
    }

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
  }, [products, selectedCategory, searchTerm, sortBy]);

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
    <div style={styleVariables} className="flex min-h-screen flex-col bg-[var(--background)] font-sans text-[var(--foreground)]">
      <Header />

      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 py-6 flex-1 space-y-8">
        {/* Dynamic Header Banner */}
        <div className="relative h-64 w-full overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-800 to-zinc-900 md:h-80 shadow-md">
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

        {/* Store Specific Categories Horizontal Filter */}
        {storeCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === "ALL"
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
              }`}
            >
              All Items ({products.length})
            </button>
            {storeCategories.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === c.id
                    ? "bg-zinc-950 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                }`}
              >
                {c.image_url && (
                  <img src={c.image_url} alt={c.name} className="h-4 w-4 rounded-full object-cover" />
                )}
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Toolbar Section */}
        <div className="space-y-6">
          <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Our Store Products</h2>
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
              <p className="mt-3 font-mono text-sm font-bold uppercase">No products found in this store</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Try adjusting your search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
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
      </main>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      <Footer />
    </div>
  );
}
