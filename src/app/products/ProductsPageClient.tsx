"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getAllProducts } from "@/actions/shop";
import { useShopStore } from "@/store/shop-store";
import { ShoppingCart, Heart, Eye, ArrowLeft, Search, Sliders, ShoppingBag, Grid, List } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface ProductsPageClientProps {
  initialProducts: any[];
  initialCategories: any[];
}

export default function ProductsPageClient({
  initialProducts,
  initialCategories,
}: ProductsPageClientProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab"); // Can be sale, featured, etc.

  const [categories] = useState<any[]>(initialCategories);
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { cart, wishlist, addToCart, toggleWishlist } = useShopStore();

  // If a tab parameter is passed (e.g. from homepage View All)
  useEffect(() => {
    if (tabParam === "sale") {
      setProducts(initialProducts.filter(p => p.is_flash_sale));
    } else if (tabParam === "best") {
      setProducts(initialProducts.filter(p => p.is_best_seller));
    } else if (tabParam === "trending") {
      setProducts(initialProducts.filter(p => p.is_trending));
    } else if (tabParam === "new") {
      setProducts(initialProducts.filter(p => p.is_new_arrival));
    } else if (tabParam === "featured") {
      setProducts(initialProducts.filter(p => p.is_featured));
    }
  }, [tabParam, initialProducts]);

  const loadFilteredData = async () => {
    setLoading(true);
    const filterObj = {
      search,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy,
      categoryId: selectedCategory
    };
    const res = await getAllProducts(filterObj);
    if (res.products) setProducts(res.products);
    setLoading(false);
  };

  // Debounced/Triggered load on filter changes
  useEffect(() => {
    // Skip if it's the initial render without changes to avoid redundant calls
    loadFilteredData();
  }, [search, minPrice, maxPrice, sortBy, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans">
      {/* Global Header */}
      <header className="h-16 border-b border-[var(--border)] bg-[var(--card)] px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link href="/" className="text-xl font-black tracking-tight flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white">
            <ShoppingBag className="h-5 w-5" />
          </div>
          Yaz<span className="text-blue-500">Mart</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/wishlist" className="relative p-2 hover:text-blue-500 transition-colors">
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link href="/cart" className="relative p-2 hover:text-blue-500 transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900/10 via-zinc-950/15 to-zinc-900/10 border-b border-[var(--border)] py-12 px-6">
        <div className="max-w-7xl mx-auto space-y-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:underline">
            <ArrowLeft className="h-3 w-3" /> Back to Storefront
          </Link>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
            All Products
          </h1>
          <p className="text-xs md:text-sm text-[var(--muted-foreground)] max-w-2xl font-normal">
            Browse our entire collection of premium products. Use the smart filters to narrow down your choices.
          </p>
        </div>
      </div>

      {/* Main Filter and Product View Catalog */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 grid gap-8 lg:grid-cols-4">
        {/* Sidebar Filters */}
        <aside className="space-y-5 bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-xs h-fit">
          <h3 className="font-black text-xs uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-2">
            <Sliders className="h-4 w-4 text-blue-500" /> Filter Engine
          </h3>

          {/* Search bar */}
          <div className="space-y-1">
            <label className="block text-[9px] font-bold uppercase text-[var(--muted-foreground)]">Search keyword</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
              <input 
                type="text" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search products..."
                className="pl-8 pr-3 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] w-full focus:outline-none focus:border-blue-500 font-medium text-[var(--foreground)] placeholder-[var(--muted-foreground)]"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="block text-[9px] font-bold uppercase text-[var(--muted-foreground)]">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] w-full focus:outline-none font-bold text-[var(--foreground)]"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Price Filters */}
          <div className="space-y-2">
            <label className="block text-[9px] font-bold uppercase text-[var(--muted-foreground)]">Price Range ($)</label>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice} 
                onChange={(e) => setMinPrice(e.target.value)}
                className="px-2 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500 font-bold text-[var(--foreground)]" 
              />
              <input 
                type="number" 
                placeholder="Max" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(e.target.value)}
                className="px-2 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500 font-bold text-[var(--foreground)]" 
              />
            </div>
          </div>

          {/* Sorting */}
          <div className="space-y-1">
            <label className="block text-[9px] font-bold uppercase text-[var(--muted-foreground)]">Sort Rules</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] w-full focus:outline-none font-bold text-[var(--foreground)]"
            >
              <option value="newest">Newest Arrival</option>
              <option value="price_asc">Price Low-High</option>
              <option value="price_desc">Price High-Low</option>
              <option value="name_asc">Name A-Z</option>
            </select>
          </div>
        </aside>

        {/* Dynamic Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[var(--border)] rounded-xl bg-[var(--card)]">
              <ShoppingBag className="h-12 w-12 mx-auto text-[var(--muted-foreground)] mb-3" />
              <h3 className="font-bold text-base uppercase">No Products Found</h3>
              <p className="text-xs text-[var(--muted-foreground)]">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const discount = product.compare_price && product.compare_price > product.selling_price
                  ? Math.round(((product.compare_price - product.selling_price) / product.compare_price) * 100)
                  : null;
                const inWishlist = wishlist.some(item => item.id === product.id);

                return (
                  <div 
                    key={product.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-all group relative text-[var(--foreground)]"
                  >
                    {/* Discount badge */}
                    {discount && (
                      <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[9px] font-black bg-rose-500 text-white">
                        -{discount}%
                      </span>
                    )}

                    {/* Wishlist toggle */}
                    <button 
                      onClick={() => toggleWishlist(product)}
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-[var(--card)] border border-[var(--border)] hover:text-rose-500 transition-colors shadow-xs cursor-pointer text-[var(--foreground)]"
                    >
                      <Heart className={`h-4 w-4 ${inWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
                    </button>

                    {/* Product Image */}
                    <Link href={`/products/${product.slug}`} className="h-44 bg-[var(--background)] flex items-center justify-center border-b border-[var(--border)] p-3 overflow-hidden">
                      {product.featured_image ? (
                        <img 
                          src={product.featured_image} 
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <ShoppingBag className="h-10 w-10 text-[var(--border)]" />
                      )}
                    </Link>

                    {/* Meta details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[9px] font-bold text-blue-500 uppercase">{product.brand?.name || "General"}</span>
                        <h4 className="font-bold text-sm line-clamp-1 mt-0.5 hover:text-blue-500 transition-colors">
                          <Link href={`/products/${product.slug}`}>{product.name}</Link>
                        </h4>
                        <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 mt-1 font-normal">
                          {product.short_desc || "No summary specs listed."}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 pt-1 border-t border-[var(--border)]/40">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-black text-blue-500">${product.selling_price.toFixed(2)}</span>
                          <span className="text-[9px] text-[var(--muted-foreground)] font-mono">{product.sku}</span>
                        </div>

                        {product.current_stock > 0 ? (
                          <div className="flex gap-1">
                            <button 
                              onClick={() => addToCart(product)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              <ShoppingCart className="h-3 w-3" /> Add to Cart
                            </button>
                            <Link 
                              href={`/products/${product.slug}`}
                              className="p-1.5 bg-[var(--background)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-lg text-[var(--foreground)] cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        ) : (
                          <span className="text-center text-[10px] font-bold text-rose-500 bg-rose-500/10 py-1.5 rounded-lg">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
