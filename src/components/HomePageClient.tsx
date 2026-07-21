"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart, ArrowRight, Layers, ShoppingBag, ShoppingCart, User, Package, Store, LogOut,
  Star, ChevronLeft, ChevronRight, Search, ChevronDown, Menu, Tag, Sparkles,
  Trash2, X, Plus, Minus, Truck, Info, RotateCcw, Headphones, ShieldCheck, Home as HomeIcon, Compass
} from "lucide-react";
import { useShopStore } from "../store/shop-store";
import { useAuthStore } from "../store/auth-store";
import { signOutAction } from "../actions/auth";
import { supabase } from "@/lib/supabase";
import ProductQuickViewModal from "./ProductQuickViewModal";

interface HomePageClientProps {
  initialShopData: any;
  initialConfig: any;
}

/* Sleek modern product card with 100% full-container image coverage */
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

  const badgeText = product.badge || (discount ? `-${discount}%` : (product.is_bestseller ? "BESTSELLER" : null));
  const ratingVal = product.rating || (4.5 + (product.id ? (String(product.id).charCodeAt(0) % 5) * 0.1 : 0.3)).toFixed(1);
  const reviewsCount = product.reviews_count || (50 + (product.id ? (String(product.id).charCodeAt(0) % 150) : 25));

  return (
    <div className="group flex w-full shrink-0 flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xs hover:shadow-xl transition-all duration-300">
      {/* Product Image Box - Full space coverage */}
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
      </div>
    </div>
  );
}

/* Category Product Row Carousel with Vertically Centered Left/Right Navigation Buttons */
function CategoryCarouselRow({
  title,
  subtitle,
  categorySlug,
  products,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onInfoClick,
}: any) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-3 py-6 md:px-6 md:py-8 space-y-3 md:space-y-4 border-b border-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-2xl font-extrabold text-[#0c192e] tracking-tight">{title}</h2>
          {subtitle && <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        {categorySlug && (
          <Link
            href={`/categories/${categorySlug}`}
            className="text-[11px] md:text-xs font-bold text-[#ff6600] hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="h-3 w-3 md:h-3.5 md:w-3.5" />
          </Link>
        )}
      </div>

      {/* Carousel Track with Vertically Centered Edge Controls */}
      <div className="relative group/carousel">
        <button
          onClick={() => scroll("left")}
          aria-label="Previous"
          className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-slate-900/60 hover:bg-[#ff6600] text-white shadow-xl border border-white/20 backdrop-blur-xs transition-all cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
        </button>

        <div
          ref={scrollRef}
          className="scrollbar-none flex gap-3 md:gap-5 overflow-x-auto py-2 snap-x snap-mandatory scroll-smooth px-1"
        >
          {products.map((product: any) => (
            <div key={product.id} className="w-[155px] sm:w-[210px] md:w-[285px] shrink-0 snap-start">
              <ProductCard
                product={product}
                wishlist={wishlist}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                onInfoClick={onInfoClick}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          aria-label="Next"
          className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/60 hover:bg-[#ff6600] text-white shadow-xl border border-white/20 backdrop-blur-xs transition-all cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

/* Dynamic Auto-Playing Animated Hero Banner Carousel */
function HeroBannerCarousel({ productCount, categoryCount }: { productCount: number; categoryCount: number }) {
  const slides = [
    {
      id: 1,
      badge: "MEGA SALE · UP TO 60% OFF",
      title: "Shop Smart,",
      titleHighlight: "Live Better.",
      subtitle: "Thousands of products from trusted local sellers — delivered fast, priced right.",
      image: "/images/hero_shopping_lifestyle.png",
      cta1Text: "Shop Now",
      cta1Link: "/products",
      cta2Text: "Browse Stores",
      cta2Link: "/stores",
      gradient: "from-[#0c192e] via-[#10203b] to-[#152745]"
    },
    {
      id: 2,
      badge: "TECH & ELECTRONICS · NEW ARRIVALS",
      title: "Upgrade Your",
      titleHighlight: "Digital Setup.",
      subtitle: "Discover authentic gadgets, smartphones & accessories with official warranty.",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop",
      cta1Text: "Explore Tech",
      cta1Link: "/products",
      cta2Text: "View Deals",
      cta2Link: "/products",
      gradient: "from-[#1a0e2e] via-[#23123b] to-[#2e1647]"
    },
    {
      id: 3,
      badge: "EXCLUSIVE FASHION COLLECTION",
      title: "Redefine Your",
      titleHighlight: "Everyday Style.",
      subtitle: "Premium clothing, footwear and accessories curated for modern lifestyles.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
      cta1Text: "Shop Fashion",
      cta1Link: "/products",
      cta2Text: "New Arrivals",
      cta2Link: "/products",
      gradient: "from-[#2e0e1a] via-[#3b1224] to-[#47162b]"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const slide = slides[currentSlide];

  return (
    <section 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative overflow-hidden bg-gradient-to-r ${slide.gradient} text-white py-10 md:py-16 transition-all duration-700`}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 grid md:grid-cols-2 gap-8 md:gap-10 items-center min-h-[380px]">
        
        {/* Left Content */}
        <div key={currentSlide} className="space-y-4 md:space-y-6 text-center md:text-left animate-in fade-in duration-500">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 text-[#ff7722] text-[11px] font-extrabold tracking-wider uppercase border border-orange-500/30">
            <Sparkles className="h-3.5 w-3.5" />
            {slide.badge}
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-[1.1] tracking-tight">
            {slide.title} <br />
            <span className="text-[#ff6600]">{slide.titleHighlight}</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
            {slide.subtitle}
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 pt-1">
            <Link
              href={slide.cta1Link}
              className="h-11 md:h-12 px-6 md:px-8 rounded-full bg-[#ff6600] hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20 inline-flex items-center gap-2 cursor-pointer"
            >
              {slide.cta1Text} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={slide.cta2Link}
              className="h-11 md:h-12 px-6 md:px-8 rounded-full border border-white/20 hover:border-white/40 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer inline-flex items-center gap-2 bg-white/5"
            >
              <Store className="h-4 w-4" /> {slide.cta2Text}
            </Link>
          </div>

          {/* Stats */}
          <div className="pt-4 md:pt-6 flex justify-around md:justify-start md:gap-10 border-t border-slate-800/80 text-xs text-slate-400">
            <div>
              <div className="text-xl md:text-2xl font-black text-white">{productCount || 100}+</div>
              <span className="text-slate-400 font-bold">Products</span>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-black text-white">{categoryCount || 10}+</div>
              <span className="text-slate-400 font-bold">Categories</span>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-black text-white">4.8★</div>
              <span className="text-slate-400 font-bold">Rating</span>
            </div>
          </div>
        </div>

        {/* Right Photo Banner */}
        <div className="relative flex justify-center w-full">
          <div className="w-full max-w-lg rounded-[28px] md:rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-slate-900 h-[280px] sm:h-[340px] md:h-[400px] relative group">
            <img
              key={currentSlide}
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-105"
            />
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        aria-label="Previous slide"
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-full bg-slate-900/60 hover:bg-[#ff6600] text-white shadow-2xl border border-white/20 backdrop-blur-xs transition-all cursor-pointer"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        aria-label="Next slide"
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-full bg-slate-900/60 hover:bg-[#ff6600] text-white shadow-2xl border border-white/20 backdrop-blur-xs transition-all cursor-pointer"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2.5 rounded-full transition-all cursor-pointer ${
              currentSlide === idx ? "w-8 bg-[#ff6600]" : "w-2.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default function HomePageClient({
  initialShopData,
}: HomePageClientProps) {
  const [categories] = useState<any[]>(initialShopData?.categories || []);
  const [products] = useState<any[]>(initialShopData?.products || []);
  const [sections] = useState<any>(initialShopData?.sections || {
    featured: [], newArrivals: [], bestSelling: [], trending: [], flashSale: []
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [headerCategoryMenuOpen, setHeaderCategoryMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [rightSidebar, setRightSidebar] = useState<"cart" | "wishlist" | null>(null);

  const categoryScrollRef = useRef<HTMLDivElement>(null);
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

  const scrollCategoryCarousel = (direction: "left" | "right") => {
    if (categoryScrollRef.current) {
      const scrollAmount = 300;
      categoryScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const searchedProducts = searchQuery
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 font-sans antialiased pb-16 md:pb-0">

      {/* ============ 1. TOP ANNOUNCEMENT BAR ============ */}
      <div className="bg-[#0b1426] text-slate-300 text-xs font-medium border-b border-slate-800/80 py-2">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex items-center justify-between">
          <span className="text-[11px] text-slate-300 flex items-center gap-2">
            Free shipping over ৳1500 · Cash on delivery available
          </span>
          <div className="hidden sm:flex items-center gap-6 text-[11px] font-medium text-slate-300">
            <Link href="/profile?tab=tracking" className="hover:text-white transition-colors">
              Track order
            </Link>
            <Link href="/seller-center" className="hover:text-white transition-colors">
              Sell on YazMart
            </Link>
          </div>
        </div>
      </div>

      {/* ============ 2. MAIN HEADER (Responsive: Logo Left, Search Middle, Hamburger Right) ============ */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/98 backdrop-blur-md">
        <div className="mx-auto flex h-16 md:h-[76px] max-w-7xl items-center justify-between gap-2 md:gap-4 px-3 md:px-6">

          {/* Left: Logo */}
          <Link href="/" className="flex shrink-0 items-center">
            <img
              src="/logo yazmart.png"
              alt="YazMart Logo"
              className="h-8 md:h-11 w-auto object-contain max-w-[120px] md:max-w-[160px]"
            />
          </Link>

          {/* Center: Search Input taking all remaining middle space */}
          <div className="relative flex-1 max-w-2xl mx-1 md:mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-3.5 md:h-4 w-3.5 md:w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, brands, stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 md:h-11 pl-9 md:pl-11 pr-16 md:pr-28 rounded-full border border-slate-200 bg-slate-100/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff6600]/30 focus:border-[#ff6600] transition text-xs font-semibold text-slate-900 placeholder-slate-400"
              />
              <button
                type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 md:h-9 px-3 md:px-6 rounded-full bg-[#ff6600] text-white text-[11px] md:text-xs font-bold hover:bg-orange-700 transition cursor-pointer shadow-xs"
              >
                Search
              </button>
            </div>

            {searchQuery && searchedProducts.length > 0 && (
              <div className="absolute top-[42px] md:top-[48px] left-0 right-0 z-50 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 text-xs shadow-xl space-y-1">
                {searchedProducts.map((p: any) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug || p.id}`}
                    onClick={() => setSearchQuery("")}
                    className="flex items-center gap-3 p-2 text-slate-800 rounded-xl transition-colors hover:bg-orange-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center border border-slate-100 bg-white rounded-lg overflow-hidden shrink-0">
                      <img src={p.featured_image || p.image} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <p className="text-[11px] font-bold text-[#ff6600]">৳{Number(p.selling_price || p.price).toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Actions & Hamburger Button */}
          <div className="flex shrink-0 items-center gap-1.5 md:gap-3">
            
            {/* Account Badge (Desktop) */}
            {user ? (
              <div 
                className="relative hidden md:block"
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900 hover:border-[#ff6600] hover:bg-orange-50 transition-all"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff6600] text-[11px] font-black uppercase text-white shadow-xs">
                    {user.fullName?.charAt(0) || "U"}
                  </span>
                  <span className="hidden md:inline">{user.fullName || "My Account"}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full pt-1 z-50">
                    <div className="w-56 rounded-2xl border border-slate-200 bg-white p-2 text-xs shadow-2xl space-y-1">
                      <div className="px-3 py-2 border-b border-slate-100 bg-orange-50/50 rounded-xl mb-1">
                        <p className="font-bold text-slate-900 truncate">{user.fullName || "User"}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user.email || "Verified Account"}</p>
                      </div>

                      <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-slate-800 hover:bg-orange-50 hover:text-[#ff6600]">
                        <User className="h-4 w-4 text-[#ff6600]" /> Profile
                      </Link>
                      <Link href="/profile?tab=orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-slate-800 hover:bg-orange-50 hover:text-[#ff6600]">
                        <Package className="h-4 w-4 text-[#ff6600]" /> Orders
                      </Link>
                      <button
                        onClick={async () => {
                          await supabase.auth.signOut();
                          await signOutAction();
                          window.location.reload();
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth" className="hidden md:flex items-center gap-1.5 rounded-full bg-[#ff6600] hover:bg-orange-700 px-4 py-2 text-xs font-extrabold text-white transition-all shadow-xs">
                Sign In
              </Link>
            )}

            {/* Wishlist Icon (Desktop) */}
            <Link href="/wishlist" className="relative hidden md:flex h-10 w-10 items-center justify-center text-slate-700 hover:bg-orange-50 hover:text-[#ff6600] rounded-full transition-colors">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Icon (Desktop) */}
            <button 
              onClick={() => setRightSidebar("cart")}
              className="relative hidden md:flex h-10 w-10 items-center justify-center text-slate-700 hover:bg-orange-50 hover:text-[#ff6600] rounded-full transition-colors cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5" />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff6600] text-[9px] font-bold text-white shadow-xs">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Right Hamburger Icon Button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-orange-50 text-slate-800 hover:text-[#ff6600] transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* CATEGORY NAV SUB-BAR (Visible on Mobile & Desktop) */}
        <div className="relative z-40 border-t border-slate-200/80 bg-white">
          <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-3 md:px-6">
            
            <div className="flex items-center gap-4 w-full overflow-hidden">
              {/* All Categories Trigger (Desktop) */}
              <div
                className="relative hidden md:block shrink-0"
                onMouseEnter={() => setHeaderCategoryMenuOpen(true)}
                onMouseLeave={() => setHeaderCategoryMenuOpen(false)}
              >
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-900 hover:text-[#ff6600] transition-colors"
                >
                  <Layers className="h-4 w-4 text-slate-700" />
                  <span>All Categories</span>
                </button>

                {headerCategoryMenuOpen && categories.length > 0 && (
                  <div className="absolute top-full left-0 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 text-xs shadow-xl space-y-1 mt-1">
                    {categories.map((cat: any) => (
                      <Link
                        key={cat.id}
                        href={`/categories/${cat.slug}`}
                        className="flex items-center gap-2 rounded-xl p-2.5 font-semibold text-slate-800 hover:bg-orange-50 hover:text-[#ff6600] transition-colors"
                      >
                        <span>{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Direct Horizontal Category Links Strip */}
              <nav className="flex items-center gap-4 text-xs font-semibold text-slate-700 overflow-x-auto scrollbar-none py-1 w-full">
                {categories.map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="hover:text-[#ff6600] transition-colors whitespace-nowrap bg-slate-50 md:bg-transparent px-3 md:px-0 py-1 md:py-0 rounded-full border border-slate-200 md:border-none"
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Become a Seller Link */}
            <Link
              href="/seller-center"
              className="hidden md:flex text-xs font-bold text-[#ff6600] hover:underline items-center gap-1 cursor-pointer shrink-0"
            >
              Become a Seller <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ============ 3. HERO BANNER CAROUSEL SECTION ============ */}
      <HeroBannerCarousel productCount={products.length} categoryCount={categories.length} />

      {/* ============ 4. FEATURE HIGHLIGHTS BAR ============ */}
      <section className="border-b border-slate-200 bg-slate-50/60 py-6">
        <div className="mx-auto max-w-7xl px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 md:h-11 md:w-11 rounded-2xl flex items-center justify-center bg-orange-100/70 text-[#ff6600] shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs md:text-sm text-slate-900">Free Delivery</div>
              <div className="text-[11px] text-slate-500 font-medium">On orders over ৳1500</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 md:h-11 md:w-11 rounded-2xl flex items-center justify-center bg-orange-100/70 text-[#ff6600] shrink-0">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs md:text-sm text-slate-900">Easy Returns</div>
              <div className="text-[11px] text-slate-500 font-medium">7-day return policy</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 md:h-11 md:w-11 rounded-2xl flex items-center justify-center bg-orange-100/70 text-[#ff6600] shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs md:text-sm text-slate-900">Secure Payment</div>
              <div className="text-[11px] text-slate-500 font-medium">100% protected checkout</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 md:h-11 md:w-11 rounded-2xl flex items-center justify-center bg-orange-100/70 text-[#ff6600] shrink-0">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs md:text-sm text-slate-900">24/7 Support</div>
              <div className="text-[11px] text-slate-500 font-medium">Talk to our team anytime</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 5. SHOP BY CATEGORY (Slidable Carousel with Vertically Centered Left/Right Buttons) ============ */}
      {categories.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-10 md:py-16 md:px-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0c192e] tracking-tight">Shop by Category</h2>
              <p className="text-xs md:text-sm text-slate-500 mt-1">Browse the collections available on YazMart.</p>
            </div>
          </div>

          <div className="relative group/category-carousel">
            <button
              onClick={() => scrollCategoryCarousel("left")}
              aria-label="Previous categories"
              className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/60 hover:bg-[#ff6600] text-white shadow-xl border border-white/20 backdrop-blur-xs transition-all cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div
              ref={categoryScrollRef}
              className="scrollbar-none flex gap-4 md:gap-6 overflow-x-auto py-2 snap-x snap-mandatory scroll-smooth px-1"
            >
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group relative h-56 md:h-80 w-[155px] sm:w-[240px] md:w-[280px] shrink-0 snap-start rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-end p-4 md:p-6 border border-slate-100"
                >
                  {/* Full Container Image Coverage */}
                  <img
                    src={cat.image_url || cat.image || "/images/cat_electronics.png"}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                  <div className="relative z-10 space-y-1">
                    <div className="text-white font-black text-lg">
                      {cat.name}
                    </div>
                    <div className="text-xs font-bold text-[#ff6600] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Shop now →
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <button
              onClick={() => scrollCategoryCarousel("right")}
              aria-label="Next categories"
              className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/60 hover:bg-[#ff6600] text-white shadow-xl border border-white/20 backdrop-blur-xs transition-all cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </section>
      )}

      {/* ============ 6. PROMO DEAL BANNERS ============ */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 md:pb-16 md:px-6">
        <div className="grid md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 rounded-3xl bg-gradient-to-r from-[#ff6600] via-[#ff7300] to-[#ff8533] p-6 md:p-10 text-white relative overflow-hidden flex flex-col justify-between min-h-[240px] md:min-h-[260px] shadow-lg shadow-orange-500/15">
            <div className="space-y-2 relative z-10">
              <span className="text-xs font-black uppercase tracking-wider text-amber-100/90">
                WEEKEND FLASH SALE
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight max-w-md">
                Up to 60% off <br />Deals & Products
              </h3>
              <p className="text-xs md:text-sm text-orange-100">
                Ends Sunday midnight. Don't miss out.
              </p>
            </div>

            <div className="pt-4 md:pt-6 relative z-10">
              <Link
                href="/products?tab=flash-sale"
                className="bg-white hover:bg-slate-100 text-slate-900 rounded-full px-6 py-2.5 text-xs font-extrabold inline-flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                Grab the Deal →
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-[#0c192e] p-6 md:p-10 text-white relative overflow-hidden flex flex-col justify-between min-h-[240px] md:min-h-[260px] shadow-lg">
            <div className="space-y-2 relative z-10">
              <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                NEW SEASON
              </span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight">
                Fashion & Lifestyle 2026
              </h3>
              <p className="text-xs text-slate-300">
                Fresh arrivals & top choices.
              </p>
            </div>

            <div className="pt-4 md:pt-6 relative z-10">
              <Link
                href="/products"
                className="bg-[#ff6600] hover:bg-orange-600 text-white rounded-full px-6 py-2.5 text-xs font-extrabold inline-flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                Explore →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ============ 7. ALL FEATURED / TRENDING PRODUCTS ROW CAROUSEL ============ */}
      {products.length > 0 && (
        <CategoryCarouselRow
          title="Trending Now"
          subtitle="Hand-picked bestsellers & top items from store."
          categorySlug="all"
          products={sections.trending?.length ? sections.trending : products}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onInfoClick={setQuickViewProduct}
        />
      )}

      {/* ============ 8. ALL CATEGORY PRODUCTS ROW CAROUSELS ============ */}
      {categories.map((cat: any) => {
        const catProducts = products.filter(
          (p: any) => p.category_id === cat.id || p.category?.id === cat.id || p.category?.slug === cat.slug
        );

        if (!catProducts || catProducts.length === 0) return null;

        return (
          <CategoryCarouselRow
            key={cat.id}
            title={cat.name}
            subtitle={`Popular products in ${cat.name}`}
            categorySlug={cat.slug}
            products={catProducts}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onInfoClick={setQuickViewProduct}
          />
        );
      })}

      {/* Empty State fallback if database has no products yet */}
      {products.length === 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 text-center">
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 space-y-3">
            <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-800">No Products Listed Yet</h3>
            <p className="text-xs text-slate-500">Check back soon or publish products from your Seller / Admin Center.</p>
            <Link
              href="/seller-center"
              className="inline-block rounded-full bg-[#ff6600] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-orange-700"
            >
              Add Products
            </Link>
          </div>
        </section>
      )}

      {/* ============ 9. FOOTER ============ */}
      <footer className="border-t border-slate-200 bg-[#0c192e] text-slate-300 mt-12">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
          
          <div className="col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/logo yazmart.png"
                alt="YazMart Logo"
                className="h-10 w-auto object-contain bg-white/95 rounded-xl p-1.5"
              />
            </Link>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              YazMart is your premier online marketplace for top-quality products across Bangladesh.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              {categories.slice(0, 3).map((c: any) => (
                <li key={c.id}>
                  <Link href={`/categories/${c.slug}`} className="hover:text-white transition-colors">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/profile?tab=orders" className="hover:text-white transition-colors">My Orders</Link></li>
              <li><Link href="/profile?tab=tracking" className="hover:text-white transition-colors">Track Parcel</Link></li>
              <li><Link href="/help" className="hover:text-white transition-colors">Help & FAQ</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider">Seller Portal</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/seller-center" className="hover:text-white transition-colors">Become a Seller</Link></li>
              <li><Link href="/seller" className="hover:text-white transition-colors">Seller Login</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 py-6 text-center text-[11px] text-slate-400">
          © 2026 YazMart. All rights reserved.
        </div>
      </footer>

      {/* ============ MOBILE RIGHT SIDEBAR DRAWER (Opens when Hamburger Menu clicked) ============ */}
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
              
              {/* User Account / Sign In */}
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
                <Link
                  href="/auth"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#ff6600] py-3 font-extrabold text-white text-xs shadow-md"
                >
                  <User className="h-4 w-4" /> Sign In / Register
                </Link>
              )}

              {/* All Categories Section */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">All Categories</h4>
                <div className="space-y-1">
                  {categories.map((cat: any) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      onClick={() => setMobileSidebarOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-slate-800 hover:bg-orange-50 hover:text-[#ff6600] transition-colors"
                    >
                      <span className="font-bold">{cat.name}</span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Navigation Links */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">Quick Links</h4>
                <div className="space-y-1">
                  <Link href="/products" onClick={() => setMobileSidebarOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-slate-800 hover:bg-orange-50 hover:text-[#ff6600]">
                    <Compass className="h-4 w-4 text-[#ff6600]" /> All Products
                  </Link>
                  <Link href="/profile?tab=tracking" onClick={() => setMobileSidebarOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-slate-800 hover:bg-orange-50 hover:text-[#ff6600]">
                    <Truck className="h-4 w-4 text-emerald-600" /> Track Parcel
                  </Link>
                  <Link href="/seller-center" onClick={() => setMobileSidebarOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[#ff6600] font-black hover:bg-orange-50">
                    <Store className="h-4 w-4" /> Become a Seller
                  </Link>
                </div>
              </div>

              {user && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={async () => {
                      setMobileSidebarOpen(false);
                      await supabase.auth.signOut();
                      await signOutAction();
                      window.location.reload();
                    }}
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

      {/* ============ MOBILE FIXED BOTTOM NAVIGATION BAR ============ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around text-[10px] font-bold text-slate-600 shadow-2xl">
        <Link href="/" className="flex flex-col items-center gap-0.5 hover:text-[#ff6600] transition-colors">
          <HomeIcon className="h-5 w-5 text-[#ff6600]" />
          <span>Home</span>
        </Link>

        <Link href="/products?tab=flash-sale" className="flex flex-col items-center gap-0.5 hover:text-[#ff6600] transition-colors">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <span>Deals</span>
        </Link>

        {/* Center Floating Cart Button */}
        <button
          onClick={() => setRightSidebar("cart")}
          className="relative flex flex-col items-center justify-center -mt-5 cursor-pointer"
        >
          <div className="h-12 w-12 rounded-full bg-[#ff6600] text-white flex items-center justify-center shadow-lg shadow-orange-500/40 border-2 border-white">
            <ShoppingBag className="h-6 w-6" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-black text-white shadow-xs">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>
          <span className="mt-0.5 text-slate-800 font-extrabold">Cart</span>
        </button>

        <Link href="/profile?tab=orders" className="flex flex-col items-center gap-0.5 hover:text-[#ff6600] transition-colors">
          <Package className="h-5 w-5 text-slate-600" />
          <span>Orders</span>
        </Link>

        <Link href="/profile" className="flex flex-col items-center gap-0.5 hover:text-[#ff6600] transition-colors">
          <User className="h-5 w-5 text-slate-600" />
          <span>Profile</span>
        </Link>
      </div>

      {/* ============ CART / WISHLIST DRAWER ============ */}
      {rightSidebar && (
        <>
          <div className="fixed inset-0 z-[90] bg-slate-900/50 backdrop-blur-xs" onClick={() => setRightSidebar(null)} />

          <div className="fixed inset-y-0 right-0 z-[100] flex w-full flex-col border-l border-slate-200 bg-white text-left sm:w-[400px]">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div className="flex gap-6">
                <button
                  onClick={() => setRightSidebar("cart")}
                  className={`cursor-pointer border-b-2 pb-1 text-xs font-extrabold transition-colors ${rightSidebar === "cart" ? "border-[#ff6600] text-[#ff6600]" : "border-transparent text-slate-500 hover:text-slate-900"}`}
                >
                  Cart ({cart.length})
                </button>
                <button
                  onClick={() => setRightSidebar("wishlist")}
                  className={`cursor-pointer border-b-2 pb-1 text-xs font-extrabold transition-colors ${rightSidebar === "wishlist" ? "border-[#ff6600] text-[#ff6600]" : "border-transparent text-slate-500 hover:text-slate-900"}`}
                >
                  Wishlist ({wishlist.length})
                </button>
              </div>
              <button onClick={() => setRightSidebar(null)} className="cursor-pointer p-1 text-slate-400 hover:text-slate-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {rightSidebar === "cart" ? (
                cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center text-slate-400">
                    <ShoppingBag className="h-10 w-10 text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">Your cart is empty</p>
                    <button onClick={() => setRightSidebar(null)} className="mt-2 rounded-full border border-slate-300 px-5 py-2 text-xs font-bold text-slate-800 hover:border-[#ff6600] hover:text-[#ff6600]">
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="group relative flex gap-3 rounded-2xl border border-slate-100 p-3 bg-slate-50/50">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white overflow-hidden">
                        {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <ShoppingBag className="h-5 w-5 text-slate-400" />}
                      </div>
                      <div className="min-w-0 flex-1 pr-6">
                        <h4 className="line-clamp-1 text-xs font-bold text-slate-900">{item.name}</h4>
                        <p className="mt-1 text-xs font-black text-[#ff6600]">৳{Number(item.price).toLocaleString()}</p>

                        <div className="mt-2 flex w-fit items-center rounded-full border border-slate-200 bg-white">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-0.5 text-xs font-bold hover:text-[#ff6600]"><Minus className="h-3 w-3" /></button>
                          <span className="px-2 py-0.5 text-xs font-bold text-slate-900">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-0.5 text-xs font-bold hover:text-[#ff6600]"><Plus className="h-3 w-3" /></button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="absolute top-3 right-3 p-1 text-slate-400 hover:text-rose-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )
              ) : (
                wishlist.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center text-slate-400">
                    <Heart className="h-10 w-10 text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">Your wishlist is empty</p>
                  </div>
                ) : (
                  wishlist.map((item) => (
                    <div key={item.id} className="group relative flex gap-3 rounded-2xl border border-slate-100 p-3 bg-slate-50/50">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white overflow-hidden">
                        {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <ShoppingBag className="h-5 w-5 text-slate-400" />}
                      </div>
                      <div className="min-w-0 flex-1 pr-6">
                        <h4 className="line-clamp-1 text-xs font-bold text-slate-900">{item.name}</h4>
                        <p className="mt-1 text-xs font-black text-[#ff6600]">৳{Number(item.price).toLocaleString()}</p>
                        <button
                          onClick={() => { addToCart(item); removeFromWishlist(item.id); setRightSidebar("cart"); }}
                          className="mt-2 flex cursor-pointer items-center gap-1 rounded-full bg-[#ff6600] px-3 py-1 text-[10px] font-bold text-white shadow-xs"
                        >
                          <ShoppingBag className="h-3 w-3" /> Move to Cart
                        </button>
                      </div>
                      <button onClick={() => removeFromWishlist(item.id)} className="absolute top-3 right-3 p-1 text-slate-400 hover:text-rose-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )
              )}
            </div>

            {rightSidebar === "cart" && cart.length > 0 && (
              <div className="space-y-4 border-t border-slate-200 p-4">
                <div className="flex items-center justify-between text-xs font-black">
                  <span>Subtotal</span>
                  <span className="text-[#ff6600] text-sm">
                    ৳{cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/cart" onClick={() => setRightSidebar(null)} className="rounded-full border border-slate-300 py-2.5 text-center text-xs font-bold text-slate-800 hover:bg-slate-50">
                    View Cart
                  </Link>
                  <Link href="/checkout" onClick={() => setRightSidebar(null)} className="rounded-full bg-[#ff6600] hover:bg-orange-700 py-2.5 text-center text-xs font-bold text-white shadow-xs">
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