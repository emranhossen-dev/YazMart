"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getShopData } from "../actions/shop";
import { ShoppingCart, ShieldCheck, Layers, ShoppingBag, Eye } from "lucide-react";
import { ThemeToggle } from "../components/ui/theme-toggle";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categories: { name: string; slug: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadShopContent = async (categorySlug: string) => {
    setLoading(true);
    const res = await getShopData(categorySlug);
    if (res.products) {
      setProducts(res.products.map((p: any) => ({
        ...p,
        stock: p.stock_quantity ?? 0,
      })));
    }
    if (res.categories) setCategories(res.categories as unknown as Category[]);
    setLoading(false);
  };

  useEffect(() => {
    loadShopContent(activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      {/* Global Customer Header */}
      <header className="h-16 border-b border-[var(--border)] bg-[var(--card)] px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-blue-500" />
          Enterprise <span className="text-blue-500">Shop</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/auth" className="text-sm font-medium hover:text-blue-500 transition-colors">
            Login / Register
          </Link>
          <Link 
            href="/admin" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Panel
          </Link>
        </div>
      </header>

      {/* Hero Banner Component */}
      <div className="bg-[var(--card)] border-b border-[var(--border)] py-12 px-6 text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Discover Premium Collections
        </h1>
        <p className="text-[var(--muted-foreground)] max-w-xl mx-auto text-sm md:text-base">
          Get elite infrastructure speed and responsive UX. Powered by dynamic MERN edge routing.
        </p>
      </div>

      {/* Main Catalog Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 grid gap-8 lg:grid-cols-4">
        
        {/* Left Sidebar: Category Filters */}
        <aside className="space-y-4">
          <h3 className="font-bold text-sm tracking-wide uppercase text-[var(--muted-foreground)] flex items-center gap-2">
            <Layers className="h-4 w-4" /> Filter Taxonomies
          </h3>
          <div className="flex flex-row flex-wrap lg:flex-col gap-1">
            <button
              onClick={() => setActiveCategory("all")}
              className={`w-fit lg:w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                activeCategory === "all"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--card)] hover:bg-[var(--accent)] text-[var(--foreground)] border border-[var(--border)] lg:border-none"
              }`}
            >
              All Store Inventory
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`w-fit lg:w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  activeCategory === cat.slug
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "bg-[var(--card)] hover:bg-[var(--accent)] text-[var(--foreground)] border border-[var(--border)] lg:border-none"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Right Section: Dynamic Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 rounded-lg bg-[var(--card)] border border-[var(--border)] animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[var(--border)] rounded-lg bg-[var(--card)]">
              <ShoppingBag className="h-12 w-12 mx-auto text-[var(--muted-foreground)] mb-3" />
              <h3 className="font-semibold text-lg">No products found</h3>
              <p className="text-sm text-[var(--muted-foreground)]">Try switching to another taxonomy or check back later.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  {/* Mock Image Placeholder */}
                  <div className="h-40 bg-[var(--background)] flex items-center justify-center border-b border-[var(--border)] relative overflow-hidden">
                    <ShoppingBag className="h-10 w-10 text-[var(--border)] group-hover:scale-110 transition-transform" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--accent)] text-[var(--foreground)] border border-[var(--border)]">
                      {product.categories ? product.categories.name : "General"}
                    </span>
                  </div>

                  {/* Product Metadata */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-semibold text-base line-clamp-1 group-hover:text-blue-500 transition-colors">
                        {product.name}
                      </h4>
                      {product.description && (
                        <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mt-1 font-normal">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-bold text-[var(--foreground)]">
                        ${product.price.toFixed(2)}
                      </span>
                      
                      {product.stock > 0 ? (
                        <button 
                          type="button"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" /> Buy Now
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-rose-500 bg-rose-500/10 px-2 py-1 rounded">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Global Customer Footer */}
      <footer className="h-14 border-t border-[var(--border)] flex items-center justify-center text-xs text-[var(--muted-foreground)] bg-[var(--card)]">
        &copy; {new Date().getFullYear()} Enterprise Commerce. All rights reserved.
      </footer>
    </div>
  );
}