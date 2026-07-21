"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryParam } from "@/hooks/use-admin-tab";
import { getAllProducts } from "@/actions/shop";
import { useShopStore } from "@/store/shop-store";
import {
  Heart, Eye, ArrowLeft, Search, Sliders, ShoppingBag,
  Grid, List, Star, ChevronDown, ChevronLeft, ChevronRight, X, Truck, SlidersHorizontal, Info
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "react-hot-toast";
import ProductQuickViewModal from "@/components/ProductQuickViewModal";

interface ProductsPageClientProps {
  initialProducts: any[];
  initialCategories: any[];
}

const PAGE_SIZE = 9;

const toastStyle = {
  background: "var(--card)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  fontSize: "12px",
  fontWeight: "600",
  borderRadius: "0",
};

/* ---------------------------------------------------------------- */
/* Product card — grid view. Shares visual language with the site's  */
/* homepage ProductCard: rounded-2xl, discount badge, wishlist heart, */
/* rating, price + compare price, free-shipping line, twin CTAs.      */
/* ---------------------------------------------------------------- */
function ProductCard({ product, wishlist, onToggleWishlist, onAddToCart, onBuyNow, onInfoClick }: any) {
  const discount = product.compare_price && product.compare_price > product.selling_price
    ? Math.round(((product.compare_price - product.selling_price) / product.compare_price) * 100)
    : null;
  const inWishlist = wishlist.some((item: any) => item.id === product.id);
  const outOfStock = !(product.current_stock > 0);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <div className="relative">
        {discount && (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        )}

        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <button
            onClick={() => onToggleWishlist(product)}
            aria-label="Toggle wishlist"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--card)]/95 shadow-sm transition-colors hover:text-rose-500 cursor-pointer"
          >
            <Heart className={`h-4 w-4 ${inWishlist ? "fill-rose-500 text-rose-500" : "text-zinc-500"}`} />
          </button>
          {onInfoClick && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onInfoClick(product);
              }}
              aria-label="Quick view"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--card)]/95 text-zinc-500 shadow-sm opacity-0 transition-all hover:text-[var(--primary)] group-hover:opacity-100 cursor-pointer"
            >
              <Info className="h-4 w-4" />
            </button>
          )}
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="flex h-52 items-center justify-center overflow-hidden bg-[var(--surface-container-low)] p-6"
        >
          {product.featured_image ? (
            <img
              src={product.featured_image}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <ShoppingBag className="h-10 w-10 text-[var(--border)]" />
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          {product.brand?.name || "General"}
        </p>
        <h4 className="-mt-1 line-clamp-1 text-sm font-semibold text-[var(--foreground)]">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h4>

        <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
          <div className="flex text-amber-400">
            {[1, 2, 3, 4].map((s) => <Star key={s} className="h-3 w-3 fill-current" />)}
            <Star className="h-3 w-3 fill-current opacity-40" />
          </div>
          <span>4.6</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-[var(--foreground)]">
            ৳{product.selling_price.toFixed(2)}
          </span>
          {product.compare_price && (
            <span className="text-xs text-[var(--muted-foreground)] line-through">
              ৳{product.compare_price.toFixed(2)}
            </span>
          )}
        </div>

        <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
          <Truck className="h-3.5 w-3.5" /> Free shipping
        </p>

        {outOfStock ? (
          <span className="mt-1 rounded-full bg-rose-500/10 py-2 text-center text-[11px] font-bold text-rose-500">
            Out of Stock
          </span>
        ) : (
          <div className="mt-1 flex gap-2">
            <button
              onClick={() => onAddToCart(product)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--border)] py-2 text-[11px] font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--foreground)] cursor-pointer"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
            </button>
            <button
              onClick={() => onBuyNow(product)}
              className="flex-1 rounded-full bg-[var(--foreground)] py-2 text-[11px] font-semibold text-[var(--background)] transition-opacity hover:opacity-85 cursor-pointer"
            >
              Buy Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Product row — list view. Same data, wider horizontal treatment.   */
/* ---------------------------------------------------------------- */
function ProductRow({ product, wishlist, onToggleWishlist, onAddToCart, onBuyNow }: any) {
  const discount = product.compare_price && product.compare_price > product.selling_price
    ? Math.round(((product.compare_price - product.selling_price) / product.compare_price) * 100)
    : null;
  const inWishlist = wishlist.some((item: any) => item.id === product.id);
  const outOfStock = !(product.current_stock > 0);

  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition-shadow duration-300 hover:shadow-lg sm:flex-row sm:items-center">
      <div className="relative shrink-0">
        {discount && (
          <span className="absolute top-2 left-2 z-10 rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-bold text-white">
            -{discount}%
          </span>
        )}
        <Link
          href={`/products/${product.slug}`}
          className="flex h-32 w-full items-center justify-center overflow-hidden rounded-xl bg-[var(--surface-container-low)] p-3 sm:w-32"
        >
          {product.featured_image ? (
            <img src={product.featured_image} alt={product.name} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <ShoppingBag className="h-8 w-8 text-[var(--border)]" />
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          {product.brand?.name || "General"}
        </p>
        <h4 className="text-sm font-semibold text-[var(--foreground)]">
          <Link href={`/products/${product.slug}`} className="hover:underline">{product.name}</Link>
        </h4>
        <p className="line-clamp-1 text-[11px] font-normal text-[var(--muted-foreground)]">
          {product.short_desc || "No summary specs listed."}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
          <div className="flex text-amber-400">
            {[1, 2, 3, 4].map((s) => <Star key={s} className="h-3 w-3 fill-current" />)}
            <Star className="h-3 w-3 fill-current opacity-40" />
          </div>
          <span>4.6</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-[var(--foreground)]">৳{product.selling_price.toFixed(2)}</span>
          {product.compare_price && (
            <span className="text-xs text-[var(--muted-foreground)] line-through">৳{product.compare_price.toFixed(2)}</span>
          )}
        </div>
        <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
          <Truck className="h-3.5 w-3.5" /> Free shipping
        </p>

        {outOfStock ? (
          <span className="rounded-full bg-rose-500/10 px-4 py-2 text-center text-[11px] font-bold text-rose-500">
            Out of Stock
          </span>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => onToggleWishlist(product)}
              aria-label="Toggle wishlist"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-zinc-500 transition-colors hover:text-rose-500 cursor-pointer"
            >
              <Heart className={`h-4 w-4 ${inWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
            <button
              onClick={() => onAddToCart(product)}
              className="flex items-center justify-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-[11px] font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--foreground)] cursor-pointer"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Add
            </button>
            <button
              onClick={() => onBuyNow(product)}
              className="rounded-full bg-[var(--foreground)] px-4 py-2 text-[11px] font-semibold text-[var(--background)] transition-opacity hover:opacity-85 cursor-pointer"
            >
              Buy Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPageClient({
  initialProducts,
  initialCategories,
}: ProductsPageClientProps) {
  const tabParam = useQueryParam("tab");
  const router = useRouter();

  const [categories] = useState<any[]>(initialCategories);
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // View states
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  const { cart, wishlist, addToCart, toggleWishlist } = useShopStore();

  const tabLabels: Record<string, string> = {
    sale: "Flash Sale",
    best: "Best Sellers",
    trending: "Trending",
    new: "New Arrivals",
    featured: "Featured",
  };

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
    loadFilteredData();
  }, [search, minPrice, maxPrice, sortBy, selectedCategory]);

  // Reset to page 1 whenever the result set changes
  useEffect(() => {
    setPage(1);
  }, [products]);

  const priceBounds = useMemo(() => {
    if (!initialProducts.length) return { min: 0, max: 1000 };
    const values = initialProducts.map((p) => p.selling_price);
    return { min: Math.floor(Math.min(...values)), max: Math.ceil(Math.max(...values)) };
  }, [initialProducts]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    categories.forEach((cat) => {
      map[cat.id] = initialProducts.filter((p) => p.category_id === cat.id).length;
    });
    return map;
  }, [categories, initialProducts]);

  const rangeMeter = useMemo(() => {
    const span = priceBounds.max - priceBounds.min || 1;
    const lo = minPrice ? Math.max(priceBounds.min, parseFloat(minPrice)) : priceBounds.min;
    const hi = maxPrice ? Math.min(priceBounds.max, parseFloat(maxPrice)) : priceBounds.max;
    const left = Math.min(100, Math.max(0, ((lo - priceBounds.min) / span) * 100));
    const right = Math.min(100, Math.max(0, ((hi - priceBounds.min) / span) * 100));
    return { left, width: Math.max(0, right - left) };
  }, [minPrice, maxPrice, priceBounds]);

  const selectedCategoryName = selectedCategory === "all"
    ? null
    : categories.find((c) => c.id === selectedCategory)?.name;

  const chips: { label: string; onClear: () => void }[] = [];
  if (search) chips.push({ label: `"${search}"`, onClear: () => setSearch("") });
  if (selectedCategoryName) chips.push({ label: selectedCategoryName, onClear: () => setSelectedCategory("all") });
  if (minPrice || maxPrice) {
    chips.push({
      label: `৳${minPrice || priceBounds.min} – ৳${maxPrice || priceBounds.max}`,
      onClear: () => { setMinPrice(""); setMaxPrice(""); },
    });
  }
  const hasActiveFilters = chips.length > 0;

  const clearAllFilters = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedCategory("all");
    setSortBy("newest");
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast.success("Added to cart", { style: toastStyle });
  };

  const handleToggleWishlist = (product: any) => {
    const wasInWishlist = wishlist.some((item) => item.id === product.id);
    toggleWishlist(product);
    toast.success(wasInWishlist ? "Removed from wishlist" : "Added to wishlist", { style: toastStyle });
  };

  const handleBuyNow = (product: any) => {
    addToCart(product);
    router.push("/checkout");
  };

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const paginatedProducts = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const rangeStart = products.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, products.length);

  const getPageList = (): (number | "…")[] => {
    const out: (number | "…")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        out.push(i);
      } else if (out[out.length - 1] !== "…") {
        out.push("…");
      }
    }
    return out;
  };

  const filterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
          <Sliders className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} /> Refine Results
        </h3>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className="cursor-pointer font-mono text-[10px] font-semibold uppercase text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-1.5">
        <label className="block text-[9px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Search keyword</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-9 pr-3 text-xs font-medium text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--foreground)] focus:outline-none"
          />
        </div>
      </div>

      <div className="h-px bg-[var(--border)]" />

      {/* Categories */}
      <div className="space-y-1.5">
        <label className="block text-[9px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Category</label>
        <div className="max-h-60 space-y-0.5 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${
              selectedCategory === "all" ? "bg-[var(--foreground)] text-[var(--background)]" : "text-[var(--foreground)] hover:bg-[var(--accent)]"
            }`}
          >
            All Categories
            <span className={`font-mono text-[10px] ${selectedCategory === "all" ? "text-[var(--background)]/70" : "text-[var(--muted-foreground)]"}`}>
              {initialProducts.length}
            </span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${
                selectedCategory === cat.id ? "bg-[var(--foreground)] text-[var(--background)]" : "text-[var(--foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              <span className="line-clamp-1">{cat.name}</span>
              <span className={`shrink-0 font-mono text-[10px] ${selectedCategory === cat.id ? "text-[var(--background)]/70" : "text-[var(--muted-foreground)]"}`}>
                {categoryCounts[cat.id] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-[var(--border)]" />

      {/* Price range */}
      <div className="space-y-2.5">
        <label className="block text-[9px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Price range (৳)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={String(priceBounds.min)}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs font-semibold text-[var(--foreground)] focus:border-[var(--foreground)] focus:outline-none"
          />
          <span className="text-[var(--muted-foreground)]">–</span>
          <input
            type="number"
            placeholder={String(priceBounds.max)}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs font-semibold text-[var(--foreground)] focus:border-[var(--foreground)] focus:outline-none"
          />
        </div>
        <div className="relative h-1 rounded-full bg-[var(--border)]">
          <div
            className="absolute h-1 rounded-full transition-all"
            style={{ left: `${rangeMeter.left}%`, width: `${rangeMeter.width}%`, background: "var(--primary)" }}
          />
        </div>
        <div className="flex justify-between font-mono text-[9px] text-[var(--muted-foreground)]">
          <span>৳{priceBounds.min}</span>
          <span>৳{priceBounds.max}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      <style jsx global>{`
        @keyframes productsFadeIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .products-fade {
          animation: productsFadeIn 0.35s ease;
        }
      `}</style>

      <Header />

      {/* ============ MAIN LAYOUT ============ */}
      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-8 px-4 md:px-6 py-8 lg:grid-cols-[260px_1fr]">
        {/* Sidebar — desktop, sticky filter panel */}
        <aside className="hidden border border-slate-200 bg-white p-5 rounded-2xl shadow-xs lg:block self-start sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto">
          {filterPanel}
        </aside>

        {/* Product column */}
        <div className="flex min-w-0 flex-col space-y-6">
          {/* ── Toolbar (fixed, does not scroll) ── */}
          <div className="flex shrink-0 flex-col justify-between gap-3 border-b border-[var(--border)] px-4 py-3 sm:flex-row sm:items-center">
            <p className="font-mono text-[11px] text-[var(--muted-foreground)]">
              {loading ? "Loading…" : products.length === 0 ? "No results" : (
                <>Showing <strong className="text-[var(--foreground)]">{rangeStart}–{rangeEnd}</strong> of <strong className="text-[var(--foreground)]">{products.length}</strong></>
              )}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-[11px] font-semibold text-[var(--foreground)] hover:border-[var(--foreground)] lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="cursor-pointer appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-3 pr-8 text-[11px] font-semibold text-[var(--foreground)] focus:border-[var(--foreground)] focus:outline-none"
                >
                  <option value="newest">Newest Arrival</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A–Z</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted-foreground)]" />
              </div>

              <div className="hidden items-center gap-0.5 rounded-lg border border-[var(--border)] p-0.5 sm:flex">
                <button
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors ${viewMode === "grid" ? "bg-[var(--foreground)] text-[var(--background)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
                >
                  <Grid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors ${viewMode === "list" ? "bg-[var(--foreground)] text-[var(--background)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Active filter chips (fixed, does not scroll) ── */}
          {hasActiveFilters && (
            <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--border)] px-4 py-2">
              {chips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={chip.onClear}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] py-1 pl-3 pr-2 text-[10px] font-semibold text-[var(--foreground)] hover:border-[var(--foreground)]"
                >
                  {chip.label} <X className="h-3 w-3 text-[var(--muted-foreground)]" />
                </button>
              ))}
              <button onClick={clearAllFilters} className="cursor-pointer font-mono text-[10px] font-semibold uppercase text-[var(--muted-foreground)] underline-offset-2 hover:text-[var(--foreground)] hover:underline">
                Clear all
              </button>
            </div>
          )}

          {/* ── Product area ── */}
          <div className="flex-1 py-5 space-y-5">
          {/* Grid / list / empty / loading states */}
          {loading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-2 gap-5 lg:grid-cols-3" : "space-y-4"}>
              {Array.from({ length: viewMode === "grid" ? 6 : 4 }).map((_, n) => (
                <div key={n} className={viewMode === "grid" ? "h-80 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" : "h-32 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]"} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-16 text-center">
              <ShoppingBag className="h-10 w-10 text-[var(--border)]" />
              <h3 className="font-display text-base font-bold uppercase tracking-tight text-[var(--foreground)]">No products found</h3>
              <p className="max-w-xs text-xs text-[var(--muted-foreground)]">Try a different keyword, or clear your filters to see everything we carry.</p>
              <button
                onClick={clearAllFilters}
                className="mt-2 cursor-pointer rounded-full border border-[var(--foreground)] px-5 py-2 text-[11px] font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
              >
                Clear all filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div key={page} className="products-fade grid grid-cols-2 gap-5 lg:grid-cols-3">
              {paginatedProducts.map((product) => (
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
          ) : (
            <div key={page} className="products-fade space-y-4">
              {paginatedProducts.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && products.length > PAGE_SIZE && (
            <div className="flex items-center justify-center gap-1.5 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] text-[var(--foreground)] transition-colors hover:border-[var(--foreground)] disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {getPageList().map((p, idx) =>
                p === "…" ? (
                  <span key={`e-${idx}`} className="px-1 font-mono text-xs text-[var(--muted-foreground)]">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg font-mono text-xs font-semibold transition-colors ${
                      page === p ? "bg-[var(--foreground)] text-[var(--background)]" : "border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--foreground)]"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] text-[var(--foreground)] transition-colors hover:border-[var(--foreground)] disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
          </div>{/* end scrollable area */}
        </div>
      </main>

      {/* ============ MOBILE FILTER DRAWER ============ */}
      {mobileFiltersOpen && (
        <>
          <div className="fixed inset-0 z-[90] bg-black/50 lg:hidden" onClick={() => setMobileFiltersOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-[100] flex w-[85%] max-w-sm flex-col overflow-y-auto border-r border-[var(--border)] bg-[var(--card)] p-5 lg:hidden">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-sm font-bold uppercase tracking-tight text-[var(--foreground)]">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="cursor-pointer p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterPanel}
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-6 w-full cursor-pointer rounded-full bg-[var(--foreground)] py-3 text-xs font-semibold uppercase tracking-wider text-[var(--background)] transition-opacity hover:opacity-85"
            >
              Show {products.length} Results
            </button>
          </div>
        </>
      )}

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