"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart, ArrowRight, Layers, ShoppingBag, ShoppingCart, User, Package, Coins, ShieldCheck, Store, LogOut,
  Star, ChevronLeft, ChevronRight, Search, ChevronDown, Mail,
  Trash2, X, Plus, Minus, Truck, Info, RotateCcw, Headphones
} from "lucide-react";
import { ThemeToggle } from "./ui/theme-toggle";
import { useShopStore } from "../store/shop-store";
import { useAuthStore } from "../store/auth-store";
import { signOutAction } from "../actions/auth";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import ProductQuickViewModal from "./ProductQuickViewModal";

interface HomePageClientProps {
  initialShopData: any;
  initialConfig: any;
}

/* Site-wide product card — rounded, soft-shadow, matching the confirmed
   reference: discount badge top-left, wishlist heart top-right, rating,
   price + compare price, free-shipping line, outline "Add to Cart" +
   solid "Buy Now" side by side. Shared visual language with the product
   detail page's related-products card. */
function ProductCard({
  product,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onInfoClick,
}: any) {
  const discount = product.compare_price && product.compare_price > product.selling_price
    ? Math.round(((product.compare_price - product.selling_price) / product.compare_price) * 100)
    : null;
  const inWishlist = wishlist.some((item: any) => item.id === product.id);

  return (
    <div className="group flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
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
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm text-zinc-500 transition-colors hover:text-zinc-950 cursor-pointer"
            >
              <Info className="h-4 w-4" />
            </button>
          )}

          <button
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
          <img
            src={product.featured_image}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          {product.brand?.name || "General"}
        </p>
        <h4 className="-mt-1 line-clamp-1 text-sm font-semibold text-zinc-900">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h4>

        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <div className="flex text-amber-400">
            {[1, 2, 3, 4].map((s) => <Star key={s} className="h-3 w-3 fill-current" />)}
            <Star className="h-3 w-3 fill-current opacity-40" />
          </div>
          <span>4.6</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-zinc-900">
            ৳{product.selling_price.toFixed(2)}
          </span>
          {product.compare_price && (
            <span className="text-xs text-zinc-400 line-through">
              ৳{product.compare_price.toFixed(2)}
            </span>
          )}
        </div>

        <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
          <Truck className="h-3.5 w-3.5" /> Free shipping
        </p>

        <div className="mt-1 flex gap-2">
          <button
            onClick={() => onAddToCart(product)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#ff6600]/30 hover:bg-orange-50 py-2 text-[11px] font-bold text-slate-800 hover:text-[#ff6600] transition-all cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-[#ff6600]" /> Add to Cart
          </button>
          <button
            onClick={() => onBuyNow(product)}
            className="flex-1 rounded-full bg-[#ff6600] hover:bg-orange-700 py-2 text-[11px] font-extrabold text-white transition-colors cursor-pointer shadow-2xs"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePageClient({
  initialShopData,
  initialConfig,
}: HomePageClientProps) {
  const [categories] = useState<any[]>(initialShopData.categories || []);
  const [products] = useState<any[]>(initialShopData.products || []);
  const [sections] = useState<any>(initialShopData.sections || {
    featured: [], newArrivals: [], bestSelling: [], trending: [], flashSale: []
  });

  const fallbackConfig = {
    section_order: ["hero", "categories", "quick_deal", "featured", "trending", "new_arrivals", "best_selling"],
    disabled_sections: [],
    slider_images: [],
    right_banners: [],
    promo_banners: [],
    colors: { primary: "#2563eb", secondary: "#3b82f6" },
    brand_logos: [],
    testimonials: [],
  };
  const [config] = useState<any>(initialConfig || fallbackConfig);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuickDealTab, setActiveQuickDealTab] = useState("sale");
  const [quickDealPage, setQuickDealPage] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);
  const [featuredPage, setFeaturedPage] = useState(1);
  const [categoryPageMap, setCategoryPageMap] = useState<Record<string, number>>({});

  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [megaMenuLeftOffset, setMegaMenuLeftOffset] = useState<number | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMegaMenuMouseEnter = (catId: string, e?: React.MouseEvent) => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }
    setActiveMegaMenu(catId);
    if (e) {
      const btn = e.currentTarget.querySelector('button');
      const parent = e.currentTarget.closest('.relative-subbar');
      if (btn && parent) {
        const btnRect = btn.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        setMegaMenuLeftOffset(btnRect.left - parentRect.left);
      }
    }
  };

  const handleMegaMenuMouseLeave = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 150);
  };

  const slideInterval = useRef<NodeJS.Timeout | null>(null);

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const headerCategoryScrollRef = useRef<HTMLDivElement>(null);

  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [headerCategoryMenuOpen, setHeaderCategoryMenuOpen] = useState(false);

  const [rightSidebar, setRightSidebar] = useState<"cart" | "wishlist" | null>(null);

  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 15 });

  const router = useRouter();

  const {
    cart,
    wishlist,
    addToCart,
    toggleWishlist,
    removeFromCart,
    updateQuantity,
    removeFromWishlist
  } = useShopStore();
  const { user } = useAuthStore();

  useEffect(() => {
    return () => {
      if (megaMenuTimeoutRef.current) {
        clearTimeout(megaMenuTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(23, 59, 59, 999);

      let diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        target.setDate(target.getDate() + 1);
        diff = target.getTime() - now.getTime();
      }

      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (config?.slider_images && config.slider_images.length > 0) {
      slideInterval.current = setInterval(() => {
        setActiveSlide(prev => (prev + 1) % config.slider_images.length);
      }, 5000);
    }
    return () => {
      if (slideInterval.current) clearInterval(slideInterval.current);
    };
  }, [config]);

  // Reset quick-deal pagination whenever the active tab changes
  useEffect(() => {
    setQuickDealPage(1);
  }, [activeQuickDealTab]);

  const handleNextSlide = () => {
    if (!config) return;
    setActiveSlide(prev => (prev + 1) % config.slider_images.length);
  };

  const handlePrevSlide = () => {
    if (!config) return;
    setActiveSlide(prev => (prev - 1 + config.slider_images.length) % config.slider_images.length);
  };

  const scrollCategories = (direction: "left" | "right") => {
    if (categoryScrollRef.current) {
      const scrollAmt = 250;
      categoryScrollRef.current.scrollBy({ left: direction === "left" ? -scrollAmt : scrollAmt, behavior: "smooth" });
    }
  };

  const scrollHeaderCategories = (direction: "left" | "right") => {
    if (headerCategoryScrollRef.current) {
      const scrollAmt = 200;
      headerCategoryScrollRef.current.scrollBy({ left: direction === "left" ? -scrollAmt : scrollAmt, behavior: "smooth" });
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
    setRightSidebar("cart");
  };

  const handleToggleWishlist = (product: any) => {
    const wasInWishlist = wishlist.some(item => item.id === product.id);
    toggleWishlist(product);
    if (!wasInWishlist) setRightSidebar("wishlist");
  };

  const handleBuyNow = (product: any) => {
    addToCart(product);
    router.push("/checkout");
  };

  const getQuickDealProducts = () => {
    switch (activeQuickDealTab) {
      case "sale": return sections.flashSale || [];
      case "best": return sections.bestSelling || [];
      case "trending": return sections.trending || [];
      case "new": return sections.newArrivals || [];
      default: return [];
    }
  };

  const quickDealProducts = getQuickDealProducts();
  const quickDealTotalPages = Math.max(1, Math.ceil(quickDealProducts.length / 5));

  const searchedProducts = searchQuery
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)] font-sans antialiased">
      <style jsx global>{`
        @keyframes paginationFadeIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .pagination-fade {
          animation: paginationFadeIn 0.35s ease;
        }
      `}</style>

      {/* ============ ANNOUNCEMENT BAR ============ */}
      <div className="bg-[#0f172a] text-slate-300 text-xs font-medium border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-2 flex items-center justify-between">
          <span className="flex items-center gap-2 text-[11px]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#ff6600] animate-ping" />
            Free shipping on orders over ৳1500 · Cash on delivery available
          </span>
          <div className="hidden md:flex items-center gap-5 text-[11px] font-bold text-slate-400">
            <Link href="/profile?tab=tracking" className="hover:text-[#ff6600] transition-colors flex items-center gap-1">
              <Truck className="h-3.5 w-3.5 text-[#ff6600]" /> Track order
            </Link>
            <Link href="/seller-center" className="hover:text-[#ff6600] transition-colors">Become a Seller</Link>
            <a href="mailto:shop@yazmart.com" className="hover:text-[#ff6600] transition-colors">Help</a>
          </div>
        </div>
      </div>

      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/98 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 md:px-6">

          <Link href="/" className="flex shrink-0 items-center gap-2">
            <img
              src="/logo yazmart.png"
              alt="YazMart Logo"
              className="h-10 md:h-11 w-auto object-contain max-w-[160px]"
            />
          </Link>

          {/* Rounded Pill Search Input */}
          <div className="relative hidden max-w-2xl flex-1 md:block mx-4">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, brands, categories…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-28 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff6600]/30 focus:border-[#ff6600] transition text-xs font-semibold text-slate-900 placeholder-slate-400"
              />
              <button
                type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 px-5 rounded-full bg-[#ff6600] text-white text-xs font-extrabold hover:bg-orange-700 transition cursor-pointer"
              >
                Search
              </button>
            </div>

            {searchQuery && searchedProducts.length > 0 && (
              <div className="absolute top-[46px] left-0 right-0 z-50 max-h-72 overflow-y-auto border border-[var(--border)] bg-[var(--card)] p-2 text-xs">
                {searchedProducts.map((p: any) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onClick={() => setSearchQuery("")}
                    className="flex items-center gap-3 p-2 text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center border border-[var(--border)] bg-white p-1">
                      <img src={p.featured_image} className="h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="font-mono text-[10px] font-semibold" style={{ color: config?.colors?.primary || "var(--primary)" }}>৳{p.selling_price.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Link 
              href="/seller-center" 
              className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--foreground)] transition-colors hover:text-[var(--primary)] px-3.5 py-2 border border-[var(--border)] rounded-full hover:border-[var(--foreground)] mr-1 hidden sm:inline-block cursor-pointer"
            >
              Seller Center
            </Link>
            <Link href="/wishlist" className="relative flex h-9 w-9 items-center justify-center text-slate-700 hover:bg-orange-50 hover:text-[#ff6600] rounded-full transition-colors">
              <Heart className="h-[18px] w-[18px]" />
              {wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 font-mono text-[9px] font-bold text-white shadow-2xs">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative flex h-9 w-9 items-center justify-center text-slate-700 hover:bg-orange-50 hover:text-[#ff6600] rounded-full transition-colors">
              <ShoppingBag className="h-[18px] w-[18px]" />
              {cart.length > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff6600] font-mono text-[9px] font-bold text-white shadow-2xs">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>

            {user ? (
              <div 
                className="group relative ml-1"
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
                      <ShoppingCart className="h-4 w-4 text-blue-600" /> Shopping Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
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
                        onClick={async () => {
                          await supabase.auth.signOut();
                          await signOutAction();
                          window.location.reload();
                        }}
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
                className="ml-1 flex items-center gap-1.5 rounded-full bg-[#ff6600] hover:bg-orange-700 px-5 py-2 text-xs font-extrabold text-white transition-all shadow-xs"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* CATEGORY BAR */}
        <div className="relative z-40 hidden border-t border-[var(--border)] sm:block">
          <div className="relative-subbar mx-auto flex h-11 max-w-7xl items-center gap-4 px-4 md:px-6">
            <div
              className="relative z-50 flex h-full shrink-0 items-center"
              onMouseEnter={() => setHeaderCategoryMenuOpen(true)}
              onMouseLeave={() => setHeaderCategoryMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setHeaderCategoryMenuOpen(!headerCategoryMenuOpen)}
                className="flex h-full cursor-pointer items-center gap-2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground)] transition-opacity hover:opacity-70"
              >
                <Layers className="h-3.5 w-3.5" /> All Categories
              </button>

              {headerCategoryMenuOpen && (
                <div className="absolute top-full left-0 z-50 grid w-60 gap-0.5 border border-[var(--border)] bg-[var(--card)] p-2 text-xs text-[var(--foreground)]">
                  <Link href="/products" className="p-2 font-semibold transition-colors hover:bg-[var(--accent)]" style={{ color: config?.colors?.primary || undefined }} onMouseEnter={() => setHoveredCategory(null)}>
                    All Products
                  </Link>
                  <div className="my-0.5 h-px bg-[var(--border)]" />
                  <div className="relative grid gap-0.5" onMouseLeave={() => setHoveredCategory(null)}>
                    {categories.map((cat: any) => (
                      <div key={cat.id} onMouseEnter={() => setHoveredCategory(cat.id)} className="relative">
                        <Link href={`/categories/${cat.slug}`} className="flex items-center justify-between gap-2 p-2 font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]">
                          <span>{cat.name}</span>
                          {cat.sub_categories?.length > 0 && <ChevronRight className="h-3 w-3 text-[var(--muted-foreground)]" />}
                        </Link>
                      </div>
                    ))}

                    {hoveredCategory && (() => {
                      const cat = categories.find((c: any) => c.id === hoveredCategory);
                      if (!cat?.sub_categories?.length) return null;
                      return (
                        <div className="absolute left-full top-0 z-[60] ml-0.5 grid w-56 gap-0.5 border border-[var(--border)] bg-[var(--card)] p-2 text-xs text-[var(--foreground)]">
                          <Link href={`/categories/${cat.slug}`} className="p-2 font-semibold transition-colors hover:bg-[var(--accent)]" style={{ color: config?.colors?.primary || undefined }}>
                            All Products
                          </Link>
                          <div className="my-0.5 h-px bg-[var(--border)]" />
                          {cat.sub_categories.map((sub: any) => (
                            <Link key={sub.id} href={`/categories/${sub.slug}`} className="p-2 font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]">
                              — {sub.name}
                            </Link>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            <div className="mx-1 h-4 w-px shrink-0 bg-[var(--border)]" />

            <div className="flex h-full flex-1 items-center overflow-hidden">
              <nav ref={headerCategoryScrollRef} className="scrollbar-none flex h-full flex-1 items-center gap-6 overflow-x-auto overflow-y-visible py-1">
                {categories.map((cat: any) => (
                  <div
                    key={cat.id}
                    onMouseEnter={(e) => handleMegaMenuMouseEnter(cat.id, e)}
                    onMouseLeave={handleMegaMenuMouseLeave}
                    className="relative flex h-full shrink-0 items-center"
                  >
                    <button type="button" className="flex cursor-pointer items-center gap-1 whitespace-nowrap px-1 text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]">
                      {cat.name} <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </nav>

              <div className="ml-2 flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => scrollHeaderCategories("left")} className="cursor-pointer border border-[var(--border)] p-1 text-[var(--foreground)] hover:bg-[var(--accent)]">
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => scrollHeaderCategories("right")} className="cursor-pointer border border-[var(--border)] p-1 text-[var(--foreground)] hover:bg-[var(--accent)]">
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {activeMegaMenu && (() => {
              const cat = categories.find((c: any) => c.id === activeMegaMenu);
              if (!cat) return null;
              return (
                <div
                  // eslint-disable-next-line react-hooks/refs
                  onMouseEnter={() => handleMegaMenuMouseEnter(cat.id)}
                  onMouseLeave={handleMegaMenuMouseLeave}
                  className="absolute top-full z-50 grid w-64 gap-2 border border-[var(--border)] bg-[var(--card)] p-4 text-xs text-[var(--foreground)]"
                  style={{ left: megaMenuLeftOffset !== null ? `${megaMenuLeftOffset}px` : '16px' }}
                >
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Browse {cat.name}</p>
                  <Link href={`/categories/${cat.slug}`} className="font-semibold hover:underline" style={{ color: config?.colors?.primary || undefined }}>All Products</Link>
                  {cat.sub_categories?.map((sub: any) => (
                    <Link key={sub.id} href={`/categories/${sub.slug}`} className="pl-2 font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                      — {sub.name}
                    </Link>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </header>

      {/* ============ DYNAMIC SECTIONS ============ */}
      <div className="flex flex-col">
        {config.section_order.map((sectionId: string) => {
          if (config.disabled_sections.includes(sectionId)) return null;

          switch (sectionId) {
            case "hero":
              return (
                <React.Fragment key={sectionId}>
                  <section className="mx-auto grid w-full max-w-7xl gap-px border-b border-[var(--border)] px-4 pt-0 md:grid-cols-3 md:px-6 md:pt-0 md:pb-px">
                    <div className="relative h-[420px] overflow-hidden border border-[var(--border)] md:col-span-2">
                      {config.slider_images.map((img: string, idx: number) => (
                        <div key={idx} className={`absolute inset-0 flex items-center justify-center bg-[var(--surface-container-low)] transition-opacity duration-700 ${activeSlide === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
                          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                          <img src={img} className="h-full w-full object-cover" />
                          <div className="absolute bottom-10 left-10 z-20 max-w-lg space-y-4 text-left text-white">
                            <span className="inline-block bg-white px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-black">New Arrival</span>
                            <h1 className="font-display text-3xl font-bold uppercase leading-[1.05] tracking-tight md:text-5xl">Shop Smart, Live Better</h1>
                            <p className="hidden text-xs text-white/80 md:block">Thousands of products across electronics, fashion, home and beauty — delivered fast, priced right.</p>
                            <Link href="/products" className="inline-flex items-center gap-2 border border-white bg-white px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-black transition-colors hover:bg-transparent hover:text-white">
                              Shop Catalog <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}

                      <button onClick={handlePrevSlide} className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center border border-white/30 text-white opacity-0 transition-opacity hover:bg-white/10 group-hover:opacity-100 [.group:hover_&]:opacity-100">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button onClick={handleNextSlide} className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center border border-white/30 text-white opacity-0 transition-opacity hover:bg-white/10 group-hover:opacity-100 [.group:hover_&]:opacity-100">
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      <div className="absolute bottom-6 right-8 z-20 flex gap-1.5">
                        {config.slider_images.map((_: any, idx: number) => (
                          <button key={idx} onClick={() => setActiveSlide(idx)} className={`h-1 cursor-pointer transition-all ${activeSlide === idx ? "w-6 bg-white" : "w-3 bg-white/40"}`} />
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-px">
                      {config.right_banners.slice(0, 2).map((banner: any, idx: number) => (
                        <div key={idx} className="group relative h-[210px] flex-1 overflow-hidden border border-[var(--border)]">
                          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${banner.url})` }} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                          <div className="absolute bottom-5 left-5 z-10 space-y-1 text-left">
                            <h3 className="font-display text-base font-bold text-white">{banner.title}</h3>
                            <Link href={banner.link || "#"} className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white/90 hover:gap-2 transition-all">
                              Shop Now <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  
                  {/* Value Propositions Bar */}
                  <section className="border-y border-slate-200 bg-slate-50/80">
                    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl flex items-center justify-center bg-orange-50 text-[#ff6600] border border-orange-200 shrink-0">
                          <Truck className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">Free Delivery</div>
                          <div className="text-xs text-slate-500 font-medium">On orders over ৳1500</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl flex items-center justify-center bg-orange-50 text-[#ff6600] border border-orange-200 shrink-0">
                          <RotateCcw className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">Easy Returns</div>
                          <div className="text-xs text-slate-500 font-medium">7-day return policy</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl flex items-center justify-center bg-orange-50 text-[#ff6600] border border-orange-200 shrink-0">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">Secure Payment</div>
                          <div className="text-xs text-slate-500 font-medium">100% protected checkout</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl flex items-center justify-center bg-orange-50 text-[#ff6600] border border-orange-200 shrink-0">
                          <Headphones className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">24/7 Support</div>
                          <div className="text-xs text-slate-500 font-medium">Talk to our team anytime</div>
                        </div>
                      </div>
                    </div>
                  </section>
                </React.Fragment>
              );

            case "categories":
              return (
                <section key={sectionId} className="mx-auto w-full max-w-7xl space-y-6 border-b border-[var(--border)] px-4 py-12 md:px-6">
                  <div className="flex items-end justify-between">
                    <h2 className="font-display text-lg font-bold uppercase tracking-wide text-[var(--foreground)]">Shop by Category</h2>
                    <Link href="/products" className="flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-wider hover:underline" style={{ color: config?.colors?.primary || "var(--primary)" }}>
                      View All <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="group/categories relative">
                    <button onClick={() => scrollCategories("left")} className="absolute left-0 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 -translate-x-3 cursor-pointer items-center justify-center border border-[var(--border)] bg-[var(--card)] opacity-0 transition-opacity group-hover/categories:opacity-100">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={() => scrollCategories("right")} className="absolute right-0 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 translate-x-3 cursor-pointer items-center justify-center border border-[var(--border)] bg-[var(--card)] opacity-0 transition-opacity group-hover/categories:opacity-100">
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    <div ref={categoryScrollRef} className="scrollbar-none flex snap-x items-stretch gap-px overflow-x-auto border border-[var(--border)]">
                      <div className="relative shrink-0 snap-start" onMouseLeave={() => setCategoryMenuOpen(false)}>
                        <button
                          onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                          className="flex h-36 w-36 cursor-pointer flex-col items-center justify-center gap-3 border-r border-[var(--border)] bg-[var(--surface-container-low)] text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
                        >
                          <Layers className="h-6 w-6" />
                          <span className="flex items-center gap-1 font-mono text-[10px] font-semibold uppercase">
                            Categories <ChevronDown className="h-3.5 w-3.5" />
                          </span>
                        </button>

                        {categoryMenuOpen && (
                          <div onMouseLeave={() => setHoveredCategory(null)} className="absolute top-[145px] left-0 z-50 grid w-56 gap-0.5 border border-[var(--border)] bg-[var(--card)] p-2 text-xs text-[var(--foreground)]">
                            <Link href="/products" className="p-2 font-semibold transition-colors hover:bg-[var(--accent)]" style={{ color: config?.colors?.primary || undefined }} onMouseEnter={() => setHoveredCategory(null)}>
                              All Products
                            </Link>
                            <div className="my-0.5 h-px bg-[var(--border)]" />
                            <div className="relative grid gap-0.5" onMouseLeave={() => setHoveredCategory(null)}>
                              {categories.map((cat: any) => (
                                <div key={cat.id} onMouseEnter={() => setHoveredCategory(cat.id)} className="relative">
                                  <Link href={`/categories/${cat.slug}`} className="flex items-center justify-between gap-2 p-2 font-medium transition-colors hover:bg-[var(--accent)]">
                                    <span>{cat.name}</span>
                                    {cat.sub_categories?.length > 0 && <ChevronRight className="h-3 w-3 text-[var(--muted-foreground)]" />}
                                  </Link>
                                </div>
                              ))}
                              {hoveredCategory && (() => {
                                const cat = categories.find((c: any) => c.id === hoveredCategory);
                                if (!cat?.sub_categories?.length) return null;
                                return (
                                  <div className="absolute left-full top-0 z-[60] ml-0.5 grid w-56 gap-0.5 border border-[var(--border)] bg-[var(--card)] p-2">
                                    <Link href={`/categories/${cat.slug}`} className="p-2 font-semibold hover:bg-[var(--accent)]" style={{ color: config?.colors?.primary || undefined }}>All Products</Link>
                                    <div className="my-0.5 h-px bg-[var(--border)]" />
                                    {cat.sub_categories.map((sub: any) => (
                                      <Link key={sub.id} href={`/categories/${sub.slug}`} className="p-2 font-medium hover:bg-[var(--accent)]">— {sub.name}</Link>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>

                      {categories.map((cat: any) => (
                        <Link
                          key={cat.id}
                          href={`/categories/${cat.slug}`}
                          className="group flex h-36 w-36 shrink-0 snap-start flex-col items-center justify-center gap-3 border-r border-[var(--border)] bg-[var(--card)] transition-colors last:border-r-0 hover:bg-[var(--foreground)]"
                        >
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden">
                            {cat.image_url ? (
                              <img src={cat.image_url} className="h-full w-full object-contain" />
                            ) : (
                              <Layers className="h-6 w-6 text-[var(--foreground)] group-hover:text-[var(--background)]" />
                            )}
                          </div>
                          <span className="line-clamp-1 px-2 font-mono text-[10px] font-semibold uppercase text-[var(--foreground)] group-hover:text-[var(--background)]">{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case "quick_deal":
              return (
                <section key={sectionId} className="border-b border-[var(--border)] bg-[var(--foreground)] py-16 text-[var(--background)]">
                  <div className="mx-auto max-w-7xl space-y-10 px-4 md:px-6">
                    <div className="flex flex-col justify-between gap-8 border-b border-white/15 pb-8 md:flex-row md:items-end">
                      <div>
                        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/60">Limited Time Offer</p>
                        <h2 className="font-display text-3xl font-bold uppercase tracking-tight md:text-5xl">Flash Sale</h2>
                      </div>

                      <div className="flex gap-3">
                        {[
                          { v: timeLeft.hours, l: "HRS" },
                          { v: timeLeft.minutes, l: "MIN" },
                          { v: timeLeft.seconds, l: "SEC" },
                        ].map((t) => (
                          <div key={t.l} className="flex flex-col items-center">
                            <div className="flex h-14 w-14 items-center justify-center border border-white/25 font-mono text-xl font-semibold">
                              {String(t.v).padStart(2, "0")}
                            </div>
                            <span className="mt-2 font-mono text-[9px] text-white/50">{t.l}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div className="scrollbar-none flex w-full items-center gap-2 overflow-x-auto py-1 md:w-auto">
                        {[
                          { id: "sale", name: "Flash Sale" },
                          { id: "best", name: "Best Seller" },
                          { id: "trending", name: "Trending" },
                          { id: "new", name: "New Arrival" }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveQuickDealTab(tab.id)}
                            className={`cursor-pointer whitespace-nowrap border px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                              activeQuickDealTab === tab.id
                                ? "border-white bg-white text-[var(--foreground)]"
                                : "border-white/25 text-white/80 hover:border-white/60"
                            }`}
                          >
                            {tab.name}
                          </button>
                        ))}
                      </div>

                      <Link href={`/products?tab=${activeQuickDealTab}`} className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest hover:underline">
                        View All <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {quickDealProducts.length === 0 ? (
                      <div className="border border-dashed border-white/20 p-12 text-center font-mono text-xs text-white/50">
                        No active deal products listed.
                      </div>
                    ) : (
                      <div className="relative">
                        {quickDealTotalPages > 1 && (
                          <button
                            type="button"
                            onClick={() => setQuickDealPage(p => Math.max(1, p - 1))}
                            disabled={quickDealPage === 1}
                            className="absolute left-0 top-1/2 z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-[var(--foreground)] text-white transition-colors hover:border-white/60 disabled:opacity-30"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                        )}

                        <div
                          key={quickDealPage}
                          className="pagination-fade grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5"
                        >
                          {quickDealProducts
                            .slice((quickDealPage - 1) * 5, quickDealPage * 5)
                            .map((product: any) => (
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

                        {quickDealTotalPages > 1 && (
                          <button
                            type="button"
                            onClick={() => setQuickDealPage(p => Math.min(quickDealTotalPages, p + 1))}
                            disabled={quickDealPage === quickDealTotalPages}
                            className="absolute right-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-[var(--foreground)] text-white transition-colors hover:border-white/60 disabled:opacity-30"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        )}

                        {quickDealTotalPages > 1 && (
                          <div className="mt-6 flex items-center justify-center">
                            <span className="font-mono text-xs text-white/60">
                              {quickDealPage} / {quickDealTotalPages}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              );

            case "featured":
              return (
                <div key={sectionId} className="flex flex-col">
                  <section className="mx-auto w-full max-w-7xl space-y-8 border-b border-[var(--border)] px-4 py-16 md:px-6">
                    <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-end">
                      <div>
                        <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[var(--foreground)] md:text-3xl">Featured</h2>
                        <p className="mt-2 max-w-lg text-xs font-medium text-[var(--muted-foreground)]">Hand-selected pieces worth your attention.</p>
                      </div>
                      <Link href="/products?tab=featured" className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest hover:underline" style={{ color: config?.colors?.primary || "var(--primary)" }}>
                        View All <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <div className="relative">
                      {sections.featured.length > 5 && (
                        <button
                          type="button"
                          onClick={() => setFeaturedPage(p => Math.max(1, p - 1))}
                          disabled={featuredPage === 1}
                          className="absolute left-0 top-1/2 z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-sm transition-colors hover:border-[var(--foreground)] disabled:opacity-30"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                      )}

                      <div key={featuredPage} className="pagination-fade grid grid-cols-2 gap-5 lg:grid-cols-5">
                        {sections.featured.slice((featuredPage - 1) * 5, featuredPage * 5).map((product: any) => (
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

                      {sections.featured.length > 5 && (
                        <button
                          type="button"
                          onClick={() => setFeaturedPage(p => Math.min(Math.ceil(sections.featured.length / 5), p + 1))}
                          disabled={featuredPage === Math.ceil(sections.featured.length / 5)}
                          className="absolute right-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-sm transition-colors hover:border-[var(--foreground)] disabled:opacity-30"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}

                      {sections.featured.length > 5 && (
                        <div className="mt-6 flex items-center justify-center">
                          <span className="font-mono text-xs text-[var(--muted-foreground)]">
                            {featuredPage} / {Math.ceil(sections.featured.length / 5)}
                          </span>
                        </div>
                      )}
                    </div>
                  </section>

                  {categories.map((cat: any) => {
                    const catProducts = products.filter((p: any) => p.category_id === cat.id);
                    if (catProducts.length === 0) return null;

                    const catPage = categoryPageMap[cat.id] || 1;
                    const catTotalPages = Math.ceil(catProducts.length / 5);
                    const paginatedCatProducts = catProducts.slice((catPage - 1) * 5, catPage * 5);

                    return (
                      <section key={cat.id} className="mx-auto w-full max-w-7xl space-y-8 border-b border-[var(--border)] px-4 py-16 md:px-6">
                        <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-end">
                          <div>
                            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[var(--foreground)] md:text-3xl">{cat.name}</h2>
                            <p className="mt-2 max-w-lg text-xs font-medium text-[var(--muted-foreground)]">Browse the {cat.name} collection.</p>
                          </div>
                          <Link href={`/categories/${cat.slug}`} className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest hover:underline" style={{ color: config?.colors?.primary || "var(--primary)" }}>
                            View All <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>

                        <div className="relative">
                          {catProducts.length > 5 && (
                            <button
                              type="button"
                              onClick={() => setCategoryPageMap(prev => ({ ...prev, [cat.id]: Math.max(1, (prev[cat.id] || 1) - 1) }))}
                              disabled={catPage === 1}
                              className="absolute left-0 top-1/2 z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-sm transition-colors hover:border-[var(--foreground)] disabled:opacity-30"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                          )}

                          <div key={catPage} className="pagination-fade grid grid-cols-2 gap-5 lg:grid-cols-5">
                            {paginatedCatProducts.map((product: any) => (
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

                          {catProducts.length > 5 && (
                            <button
                              type="button"
                              onClick={() => setCategoryPageMap(prev => ({ ...prev, [cat.id]: Math.min(catTotalPages, (prev[cat.id] || 1) + 1) }))}
                              disabled={catPage === catTotalPages}
                              className="absolute right-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-sm transition-colors hover:border-[var(--foreground)] disabled:opacity-30"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          )}

                          {catProducts.length > 5 && (
                            <div className="mt-6 flex items-center justify-center">
                              <span className="font-mono text-xs text-[var(--muted-foreground)]">
                                {catPage} / {catTotalPages}
                              </span>
                            </div>
                          )}
                        </div>
                      </section>
                    );
                  })}
                </div>
              );

            case "promo_banner":
              return (
                <section key={sectionId} className="mx-auto w-full max-w-7xl border-b border-[var(--border)] px-4 py-12 md:px-6">
                  {config.promo_banners?.length > 0 && (
                    <Link href="/products" className="group relative block h-44 w-full overflow-hidden border border-[var(--border)] md:h-[280px]">
                      <img src={config.promo_banners[0]} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </Link>
                  )}
                </section>
              );

            case "newsletter":
              return (
                <section key={sectionId} className="mx-auto w-full max-w-7xl border-b border-[var(--border)] px-4 py-16 md:px-6">
                  <div className="flex flex-col items-center justify-between gap-8 border border-[var(--border)] p-10 md:flex-row md:p-14">
                    <div className="max-w-md space-y-2 text-left">
                      <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[var(--foreground)] md:text-3xl">Join the Circle</h2>
                      <p className="text-xs font-medium leading-relaxed text-[var(--muted-foreground)] md:text-sm">Early access to new drops and members-only offers, straight to your inbox.</p>
                    </div>

                    <div className="w-full md:w-auto">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          toast.success("Subscribed successfully!", {
                            style: { background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)", fontSize: "12px", fontWeight: "600", borderRadius: "0" }
                          });
                        }}
                        className="flex flex-col gap-0 border border-[var(--foreground)] sm:flex-row"
                      >
                        <div className="flex flex-1 items-center gap-2 px-4">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
                          <input type="email" required placeholder="you@example.com" className="w-full border-none bg-transparent py-3 text-xs font-medium text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-0" />
                        </div>
                        <button type="submit" className="cursor-pointer bg-[var(--foreground)] px-8 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--background)] transition-opacity hover:opacity-85">
                          Join
                        </button>
                      </form>
                      <p className="mt-3 text-left font-mono text-[9px] text-[var(--muted-foreground)]">By joining you agree to our Terms and Privacy Policy.</p>
                    </div>
                  </div>
                </section>
              );

            case "brands":
              const doubleBrands = [...config.brand_logos, ...config.brand_logos, ...config.brand_logos];
              return (
                <section key={sectionId} className="overflow-hidden border-b border-[var(--border)] bg-[var(--surface-container-low)] py-14">
                  <div className="animate-marquee flex items-center gap-16 whitespace-nowrap">
                    <div className="flex items-center gap-16 font-display text-3xl font-bold uppercase tracking-widest text-[var(--muted-foreground)]/50">
                      {doubleBrands.map((brand: any, idx: number) => (
                        <span key={idx} className="cursor-pointer transition-colors hover:text-[var(--foreground)]">{brand.name}</span>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case "testimonials":
              return (
                <section key={sectionId} className="mx-auto w-full max-w-7xl space-y-12 border-b border-[var(--border)] px-4 py-16 md:px-6">
                  <div className="space-y-2 text-center">
                    <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[var(--foreground)] md:text-4xl">What People Say</h2>
                    <p className="text-xs font-medium text-[var(--muted-foreground)] md:text-sm">Join over 1M+ customers shopping with YazMart.</p>
                  </div>

                  <div className="grid gap-px border border-[var(--border)] bg-[var(--border)] md:grid-cols-3">
                    {config.testimonials.slice(0, 3).map((item: any, idx: number) => (
                      <div key={idx} className="flex flex-col justify-between gap-6 bg-[var(--card)] p-8 text-left">
                        <div className="space-y-4">
                          <div className="flex gap-1 text-amber-500">
                            {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                          </div>
                          <p className="text-xs font-medium leading-relaxed text-[var(--foreground)] md:text-sm">{item.text}</p>
                        </div>
                        <div className="flex items-center gap-3 border-t border-[var(--border)] pt-4">
                          <div className="flex h-9 w-9 items-center justify-center bg-[var(--foreground)] font-mono text-xs font-semibold uppercase text-[var(--background)]">
                            {item.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[var(--foreground)]">{item.name}</p>
                            <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]">{item.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}
      </div>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-white/10 bg-[#0c0c0c] text-zinc-400">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 text-left text-xs font-medium sm:grid-cols-2 md:grid-cols-3 md:px-6 lg:grid-cols-6">

          <div className="space-y-6 lg:col-span-2">
            <Link href="/" className="inline-block">
              <img
                src="/logo yazmart.png"
                alt="YazMart Logo"
                className="h-10 w-auto object-contain max-w-[160px] bg-white/90 rounded-lg p-1"
              />
            </Link>
            <p className="max-w-xs font-normal leading-relaxed text-zinc-500">Curated shopping for people who care about the details.</p>
          </div>

          <div>
            <h4 className="mb-6 font-mono text-[10px] font-semibold uppercase tracking-wider text-white">Company</h4>
            <ul className="space-y-4 font-normal text-zinc-500">
              <li><Link href="#" className="transition-colors hover:text-white">About Us</Link></li>
              <li><Link href="#" className="transition-colors hover:text-white">Careers</Link></li>
              <li><Link href="#" className="transition-colors hover:text-white">Press</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-mono text-[10px] font-semibold uppercase tracking-wider text-white">Support</h4>
            <ul className="space-y-4 font-normal text-zinc-500">
              <li><Link href="#" className="transition-colors hover:text-white">Help Center</Link></li>
              <li><Link href="#" className="transition-colors hover:text-white">Contact Us</Link></li>
              <li><Link href="#" className="transition-colors hover:text-white">Shipping &amp; Returns</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-mono text-[10px] font-semibold uppercase tracking-wider text-white">Legal</h4>
            <ul className="space-y-4 font-normal text-zinc-500">
              <li><Link href="#" className="transition-colors hover:text-white">Privacy Policy</Link></li>
              <li><Link href="#" className="transition-colors hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="mb-6 font-mono text-[10px] font-semibold uppercase tracking-wider text-white">Payments</h4>
            <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase text-zinc-400">
              <span className="border border-zinc-800 px-2 py-1">Visa</span>
              <span className="border border-zinc-800 px-2 py-1">Mastercard</span>
              <span className="border border-zinc-800 px-2 py-1">bKash</span>
              <span className="border border-zinc-800 px-2 py-1">Nagad</span>
            </div>
          </div>

        </div>

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between border-t border-white/10 px-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500 md:px-6">
          <p>© 2026 YazMart</p>
        </div>
      </footer>

      {/* ============ CART / WISHLIST DRAWER ============ */}
      {rightSidebar && (
        <>
          <div className="fixed inset-0 z-[90] bg-black/50" onClick={() => setRightSidebar(null)} />

          <div className="fixed inset-y-0 right-0 z-[100] flex w-full flex-col border-l border-[var(--border)] bg-[var(--card)] text-left sm:w-[400px]">
            <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
              <div className="flex gap-6">
                <button
                  onClick={() => setRightSidebar("cart")}
                  className={`cursor-pointer border-b-2 pb-1 font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors ${rightSidebar === "cart" ? "border-[var(--foreground)] text-[var(--foreground)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
                >
                  Cart ({cart.length})
                </button>
                <button
                  onClick={() => setRightSidebar("wishlist")}
                  className={`cursor-pointer border-b-2 pb-1 font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors ${rightSidebar === "wishlist" ? "border-[var(--foreground)] text-[var(--foreground)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
                >
                  Wishlist ({wishlist.length})
                </button>
              </div>
              <button onClick={() => setRightSidebar(null)} className="cursor-pointer p-1 text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-4">
              {rightSidebar === "cart" ? (
                cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center text-[var(--muted-foreground)]">
                    <ShoppingBag className="h-9 w-9 text-[var(--border)]" />
                    <p className="font-mono text-xs font-semibold uppercase">Your cart is empty</p>
                    <button onClick={() => setRightSidebar(null)} className="cursor-pointer border border-[var(--foreground)] px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]">
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="group relative flex gap-3 border border-[var(--border)] p-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-[var(--border)] bg-white p-1">
                        {item.image ? <img src={item.image} className="max-h-full max-w-full object-contain" /> : <ShoppingBag className="h-5 w-5 text-zinc-400" />}
                      </div>
                      <div className="min-w-0 flex-1 pr-6">
                        <h4 className="line-clamp-1 text-xs font-semibold text-[var(--foreground)]">{item.name}</h4>
                        <p className="mt-0.5 font-mono text-[9px] text-[var(--muted-foreground)]">{item.sku}</p>
                        <p className="mt-1 font-mono text-xs font-semibold" style={{ color: config?.colors?.primary || "var(--primary)" }}>৳{item.price.toFixed(2)}</p>

                        <div className="mt-2 flex w-fit items-center border border-[var(--border)]">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="cursor-pointer px-2 py-0.5 text-xs font-bold hover:bg-[var(--accent)]"><Minus className="h-3 w-3" /></button>
                          <span className="border-x border-[var(--border)] px-3 py-0.5 font-mono text-xs font-semibold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="cursor-pointer px-2 py-0.5 text-xs font-bold hover:bg-[var(--accent)]"><Plus className="h-3 w-3" /></button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="absolute top-3 right-3 cursor-pointer p-1 text-zinc-400 transition-colors hover:text-[var(--primary)]">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )
              ) : (
                wishlist.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center text-[var(--muted-foreground)]">
                    <Heart className="h-9 w-9 text-[var(--border)]" />
                    <p className="font-mono text-xs font-semibold uppercase">Your wishlist is empty</p>
                  </div>
                ) : (
                  wishlist.map((item) => (
                    <div key={item.id} className="group relative flex gap-3 border border-[var(--border)] p-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-[var(--border)] bg-white p-1">
                        {item.image ? <img src={item.image} className="max-h-full max-w-full object-contain" /> : <ShoppingBag className="h-5 w-5 text-zinc-400" />}
                      </div>
                      <div className="min-w-0 flex-1 pr-6">
                        <h4 className="line-clamp-1 text-xs font-semibold text-[var(--foreground)]">{item.name}</h4>
                        <p className="mt-0.5 font-mono text-[9px] text-[var(--muted-foreground)]">{item.sku}</p>
                        <p className="mt-1 font-mono text-xs font-semibold" style={{ color: config?.colors?.primary || "var(--primary)" }}>৳{item.price.toFixed(2)}</p>
                        <button
                          onClick={() => { addToCart(item); removeFromWishlist(item.id); setRightSidebar("cart"); }}
                          className="mt-2 flex cursor-pointer items-center gap-1.5 bg-[var(--foreground)] px-3 py-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--background)]"
                        >
                          <ShoppingBag className="h-3 w-3" /> Add to Cart
                        </button>
                      </div>
                      <button onClick={() => removeFromWishlist(item.id)} className="absolute top-3 right-3 cursor-pointer p-1 text-zinc-400 transition-colors hover:text-[var(--primary)]">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )
              )}
            </div>

            {rightSidebar === "cart" && cart.length > 0 && (
              <div className="space-y-4 border-t border-[var(--border)] p-4">
                <div className="flex items-center justify-between font-mono text-xs font-semibold uppercase">
                  <span>Subtotal</span>
                  <span style={{ color: config?.colors?.primary || "var(--primary)" }}>
                    ৳{cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-px border border-[var(--border)]">
                  <Link href="/cart" onClick={() => setRightSidebar(null)} className="block bg-[var(--card)] py-2.5 text-center font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]">
                    View Cart
                  </Link>
                  <Link href="/checkout" onClick={() => setRightSidebar(null)} className="block bg-[var(--foreground)] py-2.5 text-center font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--background)] transition-opacity hover:opacity-85">
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}