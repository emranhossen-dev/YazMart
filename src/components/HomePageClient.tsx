"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, Heart, Eye, ArrowRight, Layers, Sparkles, 
  Flame, ShoppingBag, ShieldCheck, Star, Clock, ChevronLeft, 
  ChevronRight, Search, ChevronDown, CheckCircle, Mail, MapPin, 
  Phone, Shield, Award, Trash2 
} from "lucide-react";
import { ThemeToggle } from "./ui/theme-toggle";
import { useShopStore } from "../store/shop-store";
import { useAuthStore } from "../store/auth-store";
import { signOutAction } from "../actions/auth";

interface HomePageClientProps {
  initialShopData: any;
  initialConfig: any;
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

  // Homepage Config States (Super Admin Controlled)
  const [config] = useState<any>(initialConfig);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuickDealTab, setActiveQuickDealTab] = useState("sale"); // sale, best, trending, new
  const [activeSlide, setActiveSlide] = useState(0);
  const [featuredPage, setFeaturedPage] = useState(1);
  const [categoryPageMap, setCategoryPageMap] = useState<Record<string, number>>({});

  // Active mega menu hover
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [megaMenuLeftOffset, setMegaMenuLeftOffset] = useState<number | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Slide interval ref
  const slideInterval = useRef<NodeJS.Timeout | null>(null);

  // Horizontal scroll ref for category cards
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const headerCategoryScrollRef = useRef<HTMLDivElement>(null);
  const flashSaleScrollRef = useRef<HTMLDivElement>(null);

  // Testimonial slider index
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  // All Categories Dropdown open state
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [headerCategoryMenuOpen, setHeaderCategoryMenuOpen] = useState(false);

  // Right sidebar state ("cart", "wishlist", or null)
  const [rightSidebar, setRightSidebar] = useState<"cart" | "wishlist" | null>(null);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 15 });

  const router = useRouter();

  // Zustand Store hooks
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

  // Countdown clock ticking logic
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

  // Auto Slider Timer
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
      categoryScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmt : scrollAmt,
        behavior: "smooth"
      });
    }
  };

  const scrollHeaderCategories = (direction: "left" | "right") => {
    if (headerCategoryScrollRef.current) {
      const scrollAmt = 200;
      headerCategoryScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmt : scrollAmt,
        behavior: "smooth"
      });
    }
  };

  const scrollFlashSale = (direction: "left" | "right") => {
    if (flashSaleScrollRef.current) {
      const scrollAmt = 300;
      flashSaleScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmt : scrollAmt,
        behavior: "smooth"
      });
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
    setRightSidebar("cart");
  };

  const handleToggleWishlist = (product: any) => {
    const wasInWishlist = wishlist.some(item => item.id === product.id);
    toggleWishlist(product);
    if (!wasInWishlist) {
      setRightSidebar("wishlist");
    }
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

  const searchedProducts = searchQuery
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans antialiased transition-colors duration-300">
      
      {/* 1. STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-[var(--card)]/80 backdrop-blur-md border-b border-outline-variant/30 shadow-xs transition-colors duration-300">
        <div className="max-w-7xl mx-auto h-20 px-4 md:px-6 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="text-2xl font-display font-black tracking-tight flex items-center gap-2 flex-shrink-0 text-[var(--foreground)]">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white" style={{ backgroundColor: config?.colors?.primary || undefined }}>
              <ShoppingBag className="h-5.5 w-5.5" />
            </div>
            Yaz<span className="text-blue-500" style={{ color: config?.colors?.primary || undefined }}>Mart</span>
          </Link>

          {/* Large Search Bar */}
          <div className="flex-1 max-w-xl relative hidden md:block">
            <div className="flex items-center gap-2 bg-surface-container border border-outline-variant/20 px-4 py-2 rounded-full focus-within:border-blue-500/50 transition-colors">
              <Search className="h-4 w-4 text-[var(--muted-foreground)]" />
              <input 
                type="text" 
                placeholder="Search premium products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs focus:outline-none w-full font-medium text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:ring-0"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-[10px] uppercase font-black text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Clear</button>
              )}
            </div>

            {/* Quick search dropdown */}
            {searchQuery && searchedProducts.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl p-2.5 max-h-72 overflow-y-auto z-50 text-xs">
                {searchedProducts.map((p: any) => (
                  <Link 
                    key={p.id} 
                    href={`/products/${p.slug}`}
                    onClick={() => setSearchQuery("")}
                    className="flex items-center gap-3 p-2 hover:bg-[var(--accent)] rounded-xl transition-colors text-[var(--foreground)]"
                  >
                    <div className="w-8 h-8 rounded border border-[var(--border)] overflow-hidden flex items-center justify-center p-0.5 bg-white">
                      <img src={p.featured_image} className="h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-bold">{p.name}</p>
                      <p className="text-[10px] text-blue-500 font-bold" style={{ color: config?.colors?.primary || undefined }}>৳{p.selling_price.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />
            
            <Link href="/wishlist" className="relative p-2 text-[var(--foreground)] hover:text-blue-500 transition-colors">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 bg-rose-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative p-2 text-[var(--foreground)] hover:text-blue-500 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-blue-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ backgroundColor: config?.colors?.primary || undefined }}>
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent)] hover:opacity-90 text-[var(--foreground)] text-xs font-bold transition-all border border-outline-variant/20 cursor-pointer">
                  <div className="w-4.5 h-4.5 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-[9px] uppercase" style={{ backgroundColor: config?.colors?.primary || undefined }}>
                    {user.fullName?.charAt(0) || "U"}
                  </div>
                  <span className="max-w-[70px] truncate hidden md:inline">{user.fullName || "Account"}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-40 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl p-1.5 hidden group-hover:block z-50 text-xs text-[var(--foreground)] animate-fade-in">
                  {user.role === "admin" && (
                    <Link 
                      href="/admin" 
                      className="block w-full text-left px-3 py-2 hover:bg-[var(--accent)] rounded-xl font-bold transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button 
                    onClick={async () => {
                      await signOutAction();
                      window.location.reload();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[var(--accent)] rounded-xl text-rose-500 font-bold transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link 
                href="/auth" 
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all"
                style={{ backgroundColor: config?.colors?.primary || undefined }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* 2. CATEGORY NAVIGATION BAR */}
        <div className="border-t border-outline-variant/10 bg-[var(--card)]/95 backdrop-blur-sm relative z-40 hidden sm:block overflow-visible">
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center h-12 gap-4 overflow-visible relative relative-subbar">
            <div 
              className="relative shrink-0 z-50 overflow-visible h-full flex items-center"
              onMouseEnter={() => setHeaderCategoryMenuOpen(true)}
              onMouseLeave={() => setHeaderCategoryMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setHeaderCategoryMenuOpen(!headerCategoryMenuOpen)}
                className="flex items-center gap-2 text-blue-500 hover:opacity-85 font-black text-xs uppercase tracking-wider transition-opacity whitespace-nowrap cursor-pointer h-full"
                style={{ color: config?.colors?.primary || undefined }}
              >
                <Layers className="h-4 w-4" /> ALL CATEGORIES
              </button>

              {headerCategoryMenuOpen && (
                <div className="absolute top-full left-0 w-60 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl p-2.5 z-50 grid gap-1 text-xs text-[var(--foreground)] animate-fade-in text-left">
                  <p className="font-black text-[9px] uppercase text-[var(--muted-foreground)] tracking-wider px-2 py-1">Select Category</p>
                  <Link 
                    href="/products" 
                    className="flex items-center gap-2 p-2 hover:bg-[var(--accent)] rounded-lg font-bold text-blue-500 transition-colors"
                    style={{ color: config?.colors?.primary || undefined }}
                    onMouseEnter={() => setHoveredCategory(null)}
                  >
                    All Products
                  </Link>
                  <div className="h-px bg-[var(--border)] my-0.5" />
                  
                  <div className="grid gap-1 relative" onMouseLeave={() => setHoveredCategory(null)}>
                    {categories.map((cat: any) => (
                      <div
                        key={cat.id}
                        onMouseEnter={() => setHoveredCategory(cat.id)}
                        className="relative"
                      >
                        <Link 
                          href={`/categories/${cat.slug}`}
                          className="flex items-center justify-between gap-2 p-2 hover:bg-[var(--accent)] rounded-lg font-semibold text-[var(--foreground)] transition-colors"
                        >
                          <span>{cat.name}</span>
                          {cat.sub_categories && cat.sub_categories.length > 0 && (
                            <ChevronRight className="h-3 w-3 text-[var(--muted-foreground)]" />
                          )}
                        </Link>
                      </div>
                    ))}

                    {/* Side Flyout for Subcategories */}
                    {hoveredCategory && (() => {
                      const cat = categories.find((c: any) => c.id === hoveredCategory);
                      if (!cat || !cat.sub_categories || cat.sub_categories.length === 0) return null;
                      return (
                        <div 
                          className="absolute left-full top-0 ml-1.5 w-60 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl p-3 grid gap-1 text-xs text-[var(--foreground)] animate-fade-in z-[60]"
                        >
                          <p className="font-black text-[9px] uppercase text-[var(--muted-foreground)] tracking-wider px-2 py-1">Browse {cat.name}</p>
                          <Link 
                            href={`/categories/${cat.slug}`}
                            className="flex items-center gap-2 p-2 hover:bg-[var(--accent)] rounded-lg font-bold text-blue-500 transition-colors"
                            style={{ color: config?.colors?.primary || undefined }}
                          >
                            All Products
                          </Link>
                          <div className="h-px bg-[var(--border)] my-0.5" />
                          {cat.sub_categories.map((sub: any) => (
                            <Link 
                              key={sub.id} 
                              href={`/categories/${sub.slug}`}
                              className="flex items-center gap-2 p-2 hover:bg-[var(--accent)] rounded-lg font-semibold text-[var(--foreground)] transition-colors"
                            >
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

            <div className="h-4 w-px bg-[var(--border)] shrink-0 mx-1" />

            <div className="flex-1 flex items-center overflow-hidden h-full">
              <nav 
                ref={headerCategoryScrollRef}
                className="flex items-center gap-6 overflow-x-auto scrollbar-none py-1 overflow-y-visible flex-1 h-full"
              >
                {categories.map((cat: any) => (
                  <div 
                    key={cat.id}
                    onMouseEnter={(e) => {
                      setActiveMegaMenu(cat.id);
                      const btn = e.currentTarget.querySelector('button');
                      const parent = e.currentTarget.closest('.relative-subbar');
                      if (btn && parent) {
                        const btnRect = btn.getBoundingClientRect();
                        const parentRect = parent.getBoundingClientRect();
                        setMegaMenuLeftOffset(btnRect.left - parentRect.left);
                      }
                    }}
                    onMouseLeave={() => setActiveMegaMenu(null)}
                    className="relative shrink-0 h-full flex items-center"
                  >
                    <button 
                      type="button"
                      className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer"
                    >
                      {cat.name} <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </nav>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button 
                  type="button"
                  onClick={() => scrollHeaderCategories("left")}
                  className="p-1 border border-outline-variant/20 rounded-md hover:bg-[var(--accent)] text-[var(--foreground)] cursor-pointer"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button 
                  type="button"
                  onClick={() => scrollHeaderCategories("right")}
                  className="p-1 border border-outline-variant/20 rounded-md hover:bg-[var(--accent)] text-[var(--foreground)] cursor-pointer"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Hover mega menu list rendered outside scroll container to avoid layout clipping */}
            {activeMegaMenu && (() => {
              const cat = categories.find((c: any) => c.id === activeMegaMenu);
              if (!cat) return null;
              return (
                <div 
                  onMouseEnter={() => setActiveMegaMenu(cat.id)}
                  onMouseLeave={() => setActiveMegaMenu(null)}
                  className="absolute top-full bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg p-4 z-50 grid gap-2 text-xs text-[var(--foreground)] w-64 animate-fade-in"
                  style={{ 
                    left: megaMenuLeftOffset !== null ? `${megaMenuLeftOffset}px` : '16px',
                  }}
                >
                  <p className="font-black text-[10px] uppercase text-[var(--muted-foreground)] tracking-wider">Browse {cat.name}</p>
                  <Link href={`/categories/${cat.slug}`} className="font-bold text-blue-500 hover:underline" style={{ color: config?.colors?.primary || undefined }}>All Products</Link>
                  {cat.sub_categories && cat.sub_categories.map((sub: any) => (
                    <Link 
                      key={sub.id} 
                      href={`/categories/${sub.slug}`}
                      className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium pl-2"
                    >
                      — {sub.name}
                    </Link>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </header>

      {/* DYNAMIC HOMEPAGE SECTIONS */}
      <div className="space-y-16 pb-20">
        
        {config.section_order.map((sectionId: string) => {
          if (config.disabled_sections.includes(sectionId)) return null;

          switch (sectionId) {
            
            // 3. HERO BANNER SECTION (3 Column Layout)
            case "hero":
              return (
                <section key={sectionId} className="max-w-7xl w-full mx-auto px-4 md:px-6 pt-8 grid gap-6 md:grid-cols-3">
                  
                  {/* Left & Center: auto-slider */}
                  <div className="md:col-span-2 relative h-[420px] rounded-2xl overflow-hidden shadow-xl group border border-outline-variant/10">
                    {config.slider_images.map((img: string, idx: number) => (
                      <div 
                        key={idx}
                        className={`absolute inset-0 transition-all duration-700 flex items-center justify-center bg-[var(--background)] ${
                          activeSlide === idx ? "opacity-100 scale-100 z-10" : "opacity-0 scale-95 z-0"
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent z-10" />
                        <img src={img} className="w-full h-full object-cover" />
                        
                        <div className="absolute bottom-12 left-12 z-20 max-w-lg text-left text-white space-y-4">
                          <span className="text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white px-3 py-1 rounded-full inline-block" style={{ backgroundColor: config?.colors?.primary || undefined }}>NEW ARRIVAL</span>
                          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-none uppercase">Future of Sound &amp; Vision</h1>
                          <p className="text-white/80 text-xs md:text-sm font-medium leading-relaxed">Experience the pinnacle of luxury technology with our exclusive curated collection.</p>
                          <Link 
                            href="/products" 
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                            style={{ backgroundColor: config?.colors?.primary || undefined }}
                          >
                            Explore Collection
                          </Link>
                        </div>
                      </div>
                    ))}

                    {/* Navigation Buttons */}
                    <button 
                      onClick={handlePrevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border border-white/20 hover:bg-white/30 cursor-pointer"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={handleNextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border border-white/20 hover:bg-white/30 cursor-pointer"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Pagination Indicators */}
                    <div className="absolute bottom-6 right-12 z-20 flex gap-2">
                      {config.slider_images.map((_: any, idx: number) => (
                        <button 
                          key={idx}
                          onClick={() => setActiveSlide(idx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            activeSlide === idx ? "bg-white w-8" : "bg-white/30 w-4"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Side promos */}
                  <div className="flex flex-col gap-6">
                    {config.right_banners.slice(0, 2).map((banner: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="flex-1 h-44 md:h-auto rounded-2xl overflow-hidden relative shadow-md group hover:-translate-y-1 transition-all border border-outline-variant/10"
                      >
                        <div className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-110 duration-700" style={{ backgroundImage: `url(${banner.url})` }} />
                        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors z-0" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10" />
                        
                        <div className="absolute bottom-6 left-6 z-20 space-y-1 text-left">
                          <h3 className="text-white font-display font-bold text-base md:text-lg">{banner.title}</h3>
                          <Link href={banner.link || "#"} className="text-white/95 text-[10px] font-black uppercase flex items-center gap-1 hover:gap-2 transition-all">
                            Shop Now <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            // 4. SHOP BY CATEGORY (Horizontal Slider)
            case "categories":
              return (
                <section key={sectionId} className="max-w-7xl w-full mx-auto px-4 md:px-6 py-4 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-base md:text-lg font-black uppercase tracking-wider text-[var(--foreground)]">Shop by Category</h2>
                    <Link href="/products" className="text-blue-500 font-bold text-[10px] flex items-center gap-1 hover:underline uppercase tracking-wider" style={{ color: config?.colors?.primary || undefined }}>
                      View All Categories <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="relative group/categories">
                    {/* Left Scroll Arrow */}
                    <button 
                      onClick={() => scrollCategories("left")}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/95 dark:bg-zinc-900/95 shadow-md border border-outline-variant/20 rounded-full flex items-center justify-center text-[var(--foreground)] hover:scale-105 active:scale-95 transition-all opacity-0 group-hover/categories:opacity-100 cursor-pointer"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    {/* Right Scroll Arrow */}
                    <button 
                      onClick={() => scrollCategories("right")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/95 dark:bg-zinc-900/95 shadow-md border border-outline-variant/20 rounded-full flex items-center justify-center text-[var(--foreground)] hover:scale-105 active:scale-95 transition-all opacity-0 group-hover/categories:opacity-100 cursor-pointer"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    <div 
                      ref={categoryScrollRef}
                      className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x items-center px-2"
                    >
                      {/* All Categories Dropdown Card */}
                      <div 
                        className="relative shrink-0 snap-start"
                        onMouseLeave={() => setCategoryMenuOpen(false)}
                      >
                        <button
                          onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                          className="w-36 h-40 bg-surface-container-low rounded-2xl flex flex-col items-center justify-center border border-outline-variant/10 shadow-xs cursor-pointer text-[var(--foreground)] hover:bg-blue-600 hover:text-white transition-all group"
                          style={{ '--hover-bg': config?.colors?.primary || '#2563eb' } as React.CSSProperties}
                        >
                          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                            <Layers className="h-6 w-6 text-blue-500" style={{ color: config?.colors?.primary || undefined }} />
                          </div>
                          <span className="text-[10px] font-black uppercase flex items-center justify-center gap-1 w-full px-2 group-hover:text-white">
                            Categories <ChevronDown className="h-3.5 w-3.5" />
                          </span>
                        </button>

                        {categoryMenuOpen && (
                          <div 
                            onMouseLeave={() => setHoveredCategory(null)}
                            className="absolute top-44 left-0 w-56 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl p-2.5 z-50 grid gap-1 text-xs text-[var(--foreground)] animate-fade-in text-left"
                          >
                            <p className="font-black text-[9px] uppercase text-[var(--muted-foreground)] tracking-wider px-2 py-1">Select Category</p>
                            <Link 
                              href="/products" 
                              className="flex items-center gap-2 p-2 hover:bg-[var(--accent)] rounded-lg font-bold text-blue-500 transition-colors"
                              style={{ color: config?.colors?.primary || undefined }}
                              onMouseEnter={() => setHoveredCategory(null)}
                            >
                              All Products
                            </Link>
                            <div className="h-px bg-[var(--border)] my-0.5" />
                            <div className="grid gap-1 relative" onMouseLeave={() => setHoveredCategory(null)}>
                              {categories.map((cat: any) => (
                                <div
                                  key={cat.id}
                                  onMouseEnter={() => setHoveredCategory(cat.id)}
                                  className="relative"
                                >
                                  <Link 
                                    href={`/categories/${cat.slug}`}
                                    className="flex items-center justify-between gap-2 p-2 hover:bg-[var(--accent)] rounded-lg font-semibold text-[var(--foreground)] transition-colors"
                                  >
                                    <span>{cat.name}</span>
                                    {cat.sub_categories && cat.sub_categories.length > 0 && (
                                      <ChevronRight className="h-3 w-3 text-[var(--muted-foreground)]" />
                                    )}
                                  </Link>
                                </div>
                              ))}

                              {/* Side Flyout for Subcategories */}
                              {hoveredCategory && (() => {
                                const cat = categories.find((c: any) => c.id === hoveredCategory);
                                if (!cat || !cat.sub_categories || cat.sub_categories.length === 0) return null;
                                return (
                                  <div 
                                    className="absolute left-full top-0 ml-1.5 w-56 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl p-3 grid gap-1 text-xs text-[var(--foreground)] animate-fade-in z-[60]"
                                  >
                                    <p className="font-black text-[9px] uppercase text-[var(--muted-foreground)] tracking-wider px-2 py-1">Browse {cat.name}</p>
                                    <Link 
                                      href={`/categories/${cat.slug}`}
                                      className="flex items-center gap-2 p-2 hover:bg-[var(--accent)] rounded-lg font-bold text-blue-500 transition-colors"
                                      style={{ color: config?.colors?.primary || undefined }}
                                    >
                                      All Products
                                    </Link>
                                    <div className="h-px bg-[var(--border)] my-0.5" />
                                    {cat.sub_categories.map((sub: any) => (
                                      <Link 
                                        key={sub.id} 
                                        href={`/categories/${sub.slug}`}
                                        className="flex items-center gap-2 p-2 hover:bg-[var(--accent)] rounded-lg font-semibold text-[var(--foreground)] transition-colors"
                                      >
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

                      {categories.map((cat: any) => (
                        <Link 
                          key={cat.id} 
                          href={`/categories/${cat.slug}`}
                          className="flex-shrink-0 w-36 h-40 bg-surface-container-low rounded-2xl flex flex-col items-center justify-center border border-outline-variant/10 shadow-xs cursor-pointer snap-start hover:bg-[var(--hover-bg)] hover:text-white transition-all group"
                          style={{ '--hover-bg': config?.colors?.primary || '#2563eb' } as React.CSSProperties}
                        >
                          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform overflow-hidden p-1.5 border border-outline-variant/5">
                            {cat.image_url ? (
                              <img src={cat.image_url} className="w-full h-full object-contain" />
                            ) : (
                              <Layers className="h-6 w-6 text-blue-500" style={{ color: config?.colors?.primary || undefined }} />
                            )}
                          </div>
                          <span className="text-[10px] font-black uppercase line-clamp-1 px-2 group-hover:text-white">{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              );

            // 5. FLASH SALE / QUICK DEAL
            case "quick_deal":
              return (
                <section key={sectionId} className="max-w-7xl w-full mx-auto px-4 md:px-6">
                  <div 
                    className="py-16 text-white rounded-3xl px-6 md:px-12 border border-outline-variant/10 shadow-2xl space-y-12"
                    style={{ backgroundColor: config?.colors?.primary || '#2563eb' }}
                  >
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/20 pb-8">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="w-12 h-[2px] bg-white/40"></span>
                          <span className="text-white/80 font-black text-[10px] tracking-widest uppercase">LIMITED TIME OFFER</span>
                        </div>
                        <h2 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tight">Flash Sale Fever</h2>
                      </div>
                      
                      {/* Timer block */}
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white text-2xl font-bold border border-white/20">
                            {String(timeLeft.hours).padStart(2, "0")}
                          </div>
                          <span className="text-white/60 text-[10px] mt-2 font-black uppercase">HOURS</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white text-2xl font-bold border border-white/20">
                            {String(timeLeft.minutes).padStart(2, "0")}
                          </div>
                          <span className="text-white/60 text-[10px] mt-2 font-black uppercase">MINS</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white text-2xl font-bold border border-white/20">
                            {String(timeLeft.seconds).padStart(2, "0")}
                          </div>
                          <span className="text-white/60 text-[10px] mt-2 font-black uppercase">SECS</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 w-full md:w-auto">
                        {[
                          { id: "sale", name: "Flash Sale" },
                          { id: "best", name: "Best Seller" },
                          { id: "trending", name: "Trending" },
                          { id: "new", name: "New Arrival" }
                        ].map(tab => (
                          <button 
                            key={tab.id}
                            onClick={() => setActiveQuickDealTab(tab.id)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                              activeQuickDealTab === tab.id 
                                ? "bg-white text-zinc-900 border-white shadow-sm" 
                                : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                            }`}
                          >
                            {tab.name}
                          </button>
                        ))}
                      </div>

                      <Link 
                        href={`/products?tab=${activeQuickDealTab}`} 
                        className="text-xs font-black text-white hover:underline flex items-center gap-1.5 uppercase tracking-widest shrink-0"
                      >
                        View All Deals <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {quickDealProducts.length === 0 ? (
                      <div className="p-12 text-center bg-white/5 border border-dashed border-white/15 rounded-2xl text-xs text-white/60">
                        No active deal products listed.
                      </div>
                    ) : (
                      <div className="relative group/flash">
                        {/* Left Scroll Arrow */}
                        <button 
                          onClick={() => scrollFlashSale("left")}
                          className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white backdrop-blur-md rounded-full shadow-lg border border-outline-variant/20 flex items-center justify-center hover:scale-105 transition-all opacity-0 group-hover/flash:opacity-100 cursor-pointer"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>

                        {/* Right Scroll Arrow */}
                        <button 
                          onClick={() => scrollFlashSale("right")}
                          className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white backdrop-blur-md rounded-full shadow-lg border border-outline-variant/20 flex items-center justify-center hover:scale-105 transition-all opacity-0 group-hover/flash:opacity-100 cursor-pointer"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>

                        <div 
                          ref={flashSaleScrollRef}
                          className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x items-stretch px-2 text-zinc-900"
                        >
                          {quickDealProducts.map((product: any) => {
                            const discount = product.compare_price && product.compare_price > product.selling_price
                              ? Math.round(((product.compare_price - product.selling_price) / product.compare_price) * 100)
                              : null;
                            const inWishlist = wishlist.some(item => item.id === product.id);

                            return (
                              <div 
                                key={product.id}
                                className="product-card w-64 shrink-0 snap-start bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden relative border border-outline-variant/10 flex flex-col justify-between"
                              >
                                <div className="relative">
                                  {discount && (
                                    <span className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-md text-[9px] font-black bg-rose-500 text-white uppercase tracking-wider">
                                      -{discount}% OFF
                                    </span>
                                  )}

                                  <button 
                                    onClick={() => handleToggleWishlist(product)}
                                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white border border-outline-variant/20 hover:text-rose-500 transition-colors shadow-xs cursor-pointer text-zinc-900"
                                  >
                                    <Heart className={`h-4 w-4 ${inWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
                                  </button>

                                  <Link href={`/products/${product.slug}`} className="h-56 bg-surface-container-low flex items-center justify-center border-b border-outline-variant/10 p-4 overflow-hidden relative">
                                    <img src={product.featured_image} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                                    <div className="action-overlay absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                      <span className="bg-white text-zinc-900 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-wider">Quick View</span>
                                    </div>
                                  </Link>
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                  <div>
                                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">{product.brand?.name || "General"}</span>
                                    <h4 className="font-bold text-xs line-clamp-1 mt-0.5 hover:text-blue-600 transition-colors">
                                      <Link href={`/products/${product.slug}`}>{product.name}</Link>
                                    </h4>
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <div className="flex text-amber-500 text-[10px]">
                                        <Star className="h-3.5 w-3.5 fill-current" />
                                        <span className="font-bold text-zinc-500 ml-1">4.8</span>
                                      </div>
                                      <span className="text-[9px] text-zinc-400 font-medium">• 120 sold</span>
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/10">
                                    <div className="flex items-baseline justify-between">
                                      <span className="text-base font-black text-blue-600" style={{ color: config?.colors?.primary || undefined }}>৳{product.selling_price.toFixed(2)}</span>
                                      {product.compare_price && (
                                        <span className="text-[10px] line-through text-zinc-400 font-semibold">৳{product.compare_price.toFixed(2)}</span>
                                      )}
                                    </div>

                                    <div className="flex gap-2 w-full mt-1">
                                      <button 
                                        onClick={() => handleBuyNow(product)}
                                        className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-xs text-center flex items-center justify-center"
                                      >
                                        Buy Now
                                      </button>
                                      <button 
                                        onClick={() => handleAddToCart(product)}
                                        className="w-10 h-10 shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-xs"
                                        style={{ backgroundColor: config?.colors?.primary || undefined }}
                                      >
                                        <ShoppingCart className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              );

            // 7. MULTIPLE PRODUCT SECTIONS
            case "featured":
              return (
                <div key={sectionId} className="space-y-16">
                  {/* Featured Masterpieces with Pagination */}
                  <section className="max-w-7xl w-full mx-auto px-4 md:px-6 space-y-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/15 pb-6">
                      <div>
                        <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-[var(--foreground)]">Featured Masterpieces</h2>
                        <p className="text-[var(--muted-foreground)] text-xs font-medium max-w-lg mt-2">Hand-selected pieces from the world's most prestigious designers and innovators.</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {/* Pagination controls */}
                        {sections.featured.length > 4 && (
                          <div className="flex items-center gap-2">
                            <button 
                              type="button"
                              onClick={() => setFeaturedPage(p => Math.max(1, p - 1))}
                              disabled={featuredPage === 1}
                              className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-[var(--foreground)] disabled:opacity-30 hover:bg-[var(--accent)] cursor-pointer"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-xs font-mono font-bold text-zinc-500">
                              {featuredPage} / {Math.ceil(sections.featured.length / 4)}
                            </span>
                            <button 
                              type="button"
                              onClick={() => setFeaturedPage(p => Math.min(Math.ceil(sections.featured.length / 4), p + 1))}
                              disabled={featuredPage === Math.ceil(sections.featured.length / 4)}
                              className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-[var(--foreground)] disabled:opacity-30 hover:bg-[var(--accent)] cursor-pointer"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        <div className="h-4 w-px bg-outline-variant/30 hidden md:block" />
                        <Link 
                          href="/products?tab=featured" 
                          className="text-xs font-black text-blue-500 hover:underline flex items-center gap-1.5 uppercase tracking-widest shrink-0"
                          style={{ color: config?.colors?.primary || undefined }}
                        >
                          View All Masterpieces <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      {sections.featured.slice((featuredPage - 1) * 4, featuredPage * 4).map((product: any) => {
                        const discount = product.compare_price && product.compare_price > product.selling_price
                          ? Math.round(((product.compare_price - product.selling_price) / product.compare_price) * 100)
                          : null;
                        const inWishlist = wishlist.some(item => item.id === product.id);

                        return (
                          <div 
                            key={product.id}
                            className="product-card group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden relative border border-outline-variant/10 flex flex-col justify-between text-zinc-900"
                          >
                            <div className="relative">
                              {discount && (
                                <span className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-md text-[9px] font-black bg-rose-500 text-white uppercase tracking-wider">
                                  -{discount}%
                                </span>
                              )}

                              <button 
                                onClick={() => handleToggleWishlist(product)}
                                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white border border-outline-variant/20 hover:text-rose-500 transition-colors shadow-xs cursor-pointer text-zinc-900"
                              >
                                <Heart className={`h-4 w-4 ${inWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
                              </button>

                              <Link href={`/products/${product.slug}`} className="h-72 bg-surface-container-low flex items-center justify-center p-4 overflow-hidden relative border-b border-outline-variant/5">
                                <img src={product.featured_image} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700" />
                                <div className="action-overlay absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                  <span className="bg-white text-zinc-900 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-wider">Quick View</span>
                                </div>
                              </Link>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">{product.brand?.name || "General"}</span>
                                  <div className="flex items-center gap-1 text-amber-500 text-[10px]">
                                    <Star className="h-3.5 w-3.5 fill-current" />
                                    <span className="font-bold text-zinc-500">4.9</span>
                                  </div>
                                </div>
                                <h4 className="font-bold text-sm line-clamp-1 mt-1 group-hover:text-blue-600 transition-colors">
                                  <Link href={`/products/${product.slug}`}>{product.name}</Link>
                                </h4>
                              </div>

                              <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/10">
                                <span className="text-base font-black text-zinc-900">৳{product.selling_price.toFixed(2)}</span>
                                
                                <div className="flex gap-2 w-full mt-1">
                                  <button 
                                    onClick={() => handleBuyNow(product)}
                                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-xs text-center flex items-center justify-center"
                                  >
                                    Buy Now
                                  </button>
                                  <button 
                                    onClick={() => handleAddToCart(product)}
                                    className="w-10 h-10 shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-xs"
                                    style={{ backgroundColor: config?.colors?.primary || undefined }}
                                  >
                                    <ShoppingCart className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Category-Specific Paginated Product Rows */}
                  {categories.map((cat: any) => {
                    const catProducts = products.filter((p: any) => p.category_id === cat.id);
                    if (catProducts.length === 0) return null;

                    const catPage = categoryPageMap[cat.id] || 1;
                    const catTotalPages = Math.ceil(catProducts.length / 4);
                    const paginatedCatProducts = catProducts.slice((catPage - 1) * 4, catPage * 4);

                    return (
                      <section key={cat.id} className="max-w-7xl w-full mx-auto px-4 md:px-6 space-y-12 animate-fade-in">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/15 pb-6">
                          <div>
                            <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-[var(--foreground)]">{cat.name} Collection</h2>
                            <p className="text-[var(--muted-foreground)] text-xs font-medium max-w-lg mt-2">Premium curated list of items categorized under {cat.name}.</p>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            {/* Pagination controls */}
                            {catProducts.length > 4 && (
                              <div className="flex items-center gap-2">
                                <button 
                                  type="button"
                                  onClick={() => setCategoryPageMap(prev => ({ ...prev, [cat.id]: Math.max(1, (prev[cat.id] || 1) - 1) }))}
                                  disabled={catPage === 1}
                                  className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-[var(--foreground)] disabled:opacity-30 hover:bg-[var(--accent)] cursor-pointer"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="text-xs font-mono font-bold text-zinc-500">
                                  {catPage} / {catTotalPages}
                                </span>
                                <button 
                                  type="button"
                                  onClick={() => setCategoryPageMap(prev => ({ ...prev, [cat.id]: Math.min(catTotalPages, (prev[cat.id] || 1) + 1) }))}
                                  disabled={catPage === catTotalPages}
                                  className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-[var(--foreground)] disabled:opacity-30 hover:bg-[var(--accent)] cursor-pointer"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                            <div className="h-4 w-px bg-outline-variant/30 hidden md:block" />
                            <Link 
                              href={`/categories/${cat.slug}`}
                              className="text-xs font-black text-blue-500 hover:underline flex items-center gap-1.5 uppercase tracking-widest shrink-0"
                              style={{ color: config?.colors?.primary || undefined }}
                            >
                              View All Products <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                          {paginatedCatProducts.map((product: any) => {
                            const discount = product.compare_price && product.compare_price > product.selling_price
                              ? Math.round(((product.compare_price - product.selling_price) / product.compare_price) * 100)
                              : null;
                            const inWishlist = wishlist.some(item => item.id === product.id);

                            return (
                              <div 
                                key={product.id}
                                className="product-card group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden relative border border-outline-variant/10 flex flex-col justify-between text-zinc-900"
                              >
                                <div className="relative">
                                  {discount && (
                                    <span className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-md text-[9px] font-black bg-rose-500 text-white uppercase tracking-wider">
                                      -{discount}%
                                    </span>
                                  )}

                                  <button 
                                    onClick={() => handleToggleWishlist(product)}
                                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white border border-outline-variant/20 hover:text-rose-500 transition-colors shadow-xs cursor-pointer text-zinc-900"
                                  >
                                    <Heart className={`h-4 w-4 ${inWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
                                  </button>

                                  <Link href={`/products/${product.slug}`} className="h-72 bg-surface-container-low flex items-center justify-center p-4 overflow-hidden relative border-b border-outline-variant/5">
                                    <img src={product.featured_image} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700" />
                                    <div className="action-overlay absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                      <span className="bg-white text-zinc-900 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-wider">Quick View</span>
                                    </div>
                                  </Link>
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">{product.brand?.name || "General"}</span>
                                      <div className="flex items-center gap-1 text-amber-500 text-[10px]">
                                        <Star className="h-3.5 w-3.5 fill-current" />
                                        <span className="font-bold text-zinc-500">4.9</span>
                                      </div>
                                    </div>
                                    <h4 className="font-bold text-sm line-clamp-1 mt-1 group-hover:text-blue-600 transition-colors">
                                      <Link href={`/products/${product.slug}`}>{product.name}</Link>
                                    </h4>
                                  </div>

                                  <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/10">
                                    <span className="text-base font-black text-zinc-900">৳{product.selling_price.toFixed(2)}</span>
                                    
                                    <div className="flex gap-2 w-full mt-1">
                                      <button 
                                        onClick={() => handleBuyNow(product)}
                                        className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-xs text-center flex items-center justify-center"
                                      >
                                        Buy Now
                                      </button>
                                      <button 
                                        onClick={() => handleAddToCart(product)}
                                        className="w-10 h-10 shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-xs"
                                        style={{ backgroundColor: config?.colors?.primary || undefined }}
                                      >
                                        <ShoppingCart className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </div>
              );

            // 8. PROMOTIONAL FULL WIDTH BANNER
            case "promo_banner":
              return (
                <section key={sectionId} className="max-w-7xl w-full mx-auto px-4 md:px-6 py-4">
                  {config.promo_banners && config.promo_banners.length > 0 && (
                    <Link href="/products" className="block w-full h-44 md:h-[300px] rounded-3xl overflow-hidden border border-outline-variant/10 shadow-md relative group cursor-pointer">
                      <img src={config.promo_banners[0]} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-1000" />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-300" />
                    </Link>
                  )}
                </section>
              );

            // 11. NEWSLETTER
            case "newsletter":
              return (
                <section key={sectionId} className="max-w-7xl w-full mx-auto px-4 md:px-6 py-6">
                  {/* Newsletter card */}
                  <div className="bg-surface-container rounded-3xl p-10 md:p-12 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 border border-outline-variant/10 shadow-sm">
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                      <div className="w-full h-full border-4 border-blue-600 rounded-full scale-150 -translate-x-1/2 -translate-y-1/2" style={{ borderColor: config?.colors?.primary || undefined }}></div>
                    </div>
                    
                    <div className="z-10 text-left space-y-2 max-w-md">
                      <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-[var(--foreground)]">Join the YazMart Circle</h2>
                      <p className="text-[var(--muted-foreground)] text-xs md:text-sm font-medium leading-relaxed">Get early access to exclusive drops, campaign promotions, and members-only luxury insights.</p>
                    </div>

                    <div className="z-10 w-full lg:w-auto">
                      <form 
                        onSubmit={(e) => { e.preventDefault(); alert("Subscription registered successfully!"); }} 
                        className="flex flex-col sm:flex-row gap-4 bg-[var(--card)] p-1.5 rounded-2xl border border-outline-variant/10 shadow-inner"
                      >
                        <input 
                          type="email" 
                          required 
                          placeholder="Your premium email"
                          className="bg-transparent border-none text-xs text-[var(--foreground)] focus:outline-none flex-1 px-4 py-3 font-medium placeholder-[var(--muted-foreground)] focus:ring-0"
                        />
                        <button 
                          type="submit" 
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:scale-102 cursor-pointer"
                          style={{ backgroundColor: config?.colors?.primary || undefined }}
                        >
                          Join Now
                        </button>
                      </form>
                      <p className="text-[9px] text-zinc-400 mt-3 text-left">By joining, you agree to our Terms and Privacy Policy.</p>
                    </div>
                  </div>
                </section>
              );

            // 9. BRAND LOGOS SECTION
            case "brands":
              const doubleBrands = [...config.brand_logos, ...config.brand_logos, ...config.brand_logos];
              return (
                <section key={sectionId} className="py-16 overflow-hidden bg-surface-container-low border-y border-outline-variant/25">
                  <div className="flex animate-marquee gap-16 whitespace-nowrap items-center">
                    <div className="text-4xl font-black text-outline/30 tracking-widest flex items-center gap-16 uppercase">
                      {doubleBrands.map((brand: any, idx: number) => (
                        <span key={idx} className="hover:text-blue-500 transition-colors cursor-pointer">{brand.name}</span>
                      ))}
                    </div>
                  </div>
                </section>
              );

            // 10. CUSTOMER REVIEWS
            case "testimonials":
              return (
                <section key={sectionId} className="max-w-7xl w-full mx-auto px-4 md:px-6 py-8 space-y-12">
                  <div className="text-center space-y-2">
                    <h2 className="font-display text-2xl md:text-4xl font-bold uppercase tracking-tight text-[var(--foreground)]">Loved by Connoisseurs</h2>
                    <p className="text-[var(--muted-foreground)] text-xs md:text-sm font-medium">Join over 1M+ customers experiencing the YazMart difference.</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    {config.testimonials.slice(0, 3).map((item: any, idx: number) => (
                      <div 
                        key={idx}
                        className="bg-[var(--card)] p-8 rounded-2xl border border-outline-variant/10 shadow-xs relative text-left flex flex-col justify-between space-y-6 animate-fade-in"
                      >
                        <span className="absolute top-4 right-6 text-blue-500/10 text-7xl font-serif select-none pointer-events-none">“</span>
                        
                        <div className="space-y-4">
                          <div className="flex gap-1 text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-current" />
                            ))}
                          </div>
                          <p className="text-[var(--foreground)] text-xs md:text-sm font-medium leading-relaxed">
                            "{item.text}"
                          </p>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-outline-variant/10">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center font-black text-xs text-blue-500 uppercase">
                            {item.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-[var(--foreground)]">{item.name}</p>
                            <p className="text-[9px] text-[var(--muted-foreground)] font-semibold uppercase tracking-wider">{item.role}</p>
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

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 grid gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 text-xs font-medium text-left">
          
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="font-display text-2xl font-black text-white tracking-tight uppercase">YazMart</Link>
            <p className="leading-relaxed font-normal text-zinc-500 max-w-xs">Elevating the digital shopping experience through curated luxury and technological excellence.</p>
            <div className="flex gap-4">
              <span className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-white hover:text-zinc-950 transition-colors cursor-pointer"><Layers className="h-4 w-4" /></span>
              <span className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-white hover:text-zinc-950 transition-colors cursor-pointer"><Star className="h-4 w-4" /></span>
              <span className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-white hover:text-zinc-950 transition-colors cursor-pointer"><ShoppingCart className="h-4 w-4" /></span>
            </div>
          </div>

          <div>
            <h4 className="font-black text-white uppercase tracking-wider mb-6 text-[10px]">Company</h4>
            <ul className="space-y-4 font-normal text-zinc-500">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Sustainability</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Press Room</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-white uppercase tracking-wider mb-6 text-[10px]">Support Desk</h4>
            <ul className="space-y-4 font-normal text-zinc-500">
              <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Shipping &amp; Returns</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Sizing Guides</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-white uppercase tracking-wider mb-6 text-[10px]">Legal Terms</h4>
            <ul className="space-y-4 font-normal text-zinc-500">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Security Audit</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-black text-white uppercase tracking-wider mb-6 text-[10px]">Mobile Experience</h4>
            <div className="flex flex-col gap-3">
              <span className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2.5 rounded-xl flex items-center gap-3 hover:bg-zinc-800 transition-colors cursor-pointer select-none">
                <Layers className="h-5 w-5 shrink-0" />
                <div className="text-[8px] leading-tight font-black uppercase text-left">Download on the <br/><span className="text-[11px] font-bold">App Store</span></div>
              </span>
              <span className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2.5 rounded-xl flex items-center gap-3 hover:bg-zinc-800 transition-colors cursor-pointer select-none">
                <ShoppingCart className="h-5 w-5 shrink-0" />
                <div className="text-[8px] leading-tight font-black uppercase text-left">Get it on <br/><span className="text-[11px] font-bold">Google Play</span></div>
              </span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-zinc-900 h-20 px-4 md:px-6 flex items-center justify-between text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
          <p>&copy; {new Date().getFullYear()} YazMart. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>bKash</span>
            <span>NAGAD</span>
          </div>
        </div>
      </footer>

      {/* RIGHT SIDEBAR (CART / WISHLIST DRAWER) */}
      {rightSidebar && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setRightSidebar(null)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 z-[100] w-full sm:w-96 bg-[var(--card)] border-l border-[var(--border)] shadow-2xl flex flex-col transition-all duration-300 animate-fade-in text-left">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex gap-4">
                <button 
                  onClick={() => setRightSidebar("cart")}
                  className={`text-xs font-black uppercase tracking-wider pb-1 border-b-2 cursor-pointer transition-all ${
                    rightSidebar === "cart" 
                      ? "border-blue-500 text-blue-500 font-black" 
                      : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                  style={rightSidebar === "cart" ? { color: config?.colors?.primary, borderColor: config?.colors?.primary } : {}}
                >
                  Cart ({cart.length})
                </button>
                <button 
                  onClick={() => setRightSidebar("wishlist")}
                  className={`text-xs font-black uppercase tracking-wider pb-1 border-b-2 cursor-pointer transition-all ${
                    rightSidebar === "wishlist" 
                      ? "border-blue-500 text-blue-500 font-black" 
                      : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                  style={rightSidebar === "wishlist" ? { color: config?.colors?.primary, borderColor: config?.colors?.primary } : {}}
                >
                  Wishlist ({wishlist.length})
                </button>
              </div>
              <button 
                onClick={() => setRightSidebar(null)}
                className="p-1 rounded-lg hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {rightSidebar === "cart" ? (
                cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[var(--muted-foreground)] py-12 space-y-3">
                    <ShoppingCart className="h-10 w-10 text-[var(--border)]" />
                    <p className="text-xs font-bold uppercase">Your cart is empty</p>
                    <button 
                      onClick={() => setRightSidebar(null)} 
                      className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors"
                      style={{ backgroundColor: config?.colors?.primary }}
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 border border-[var(--border)] bg-[var(--background)] rounded-xl relative group">
                        <div className="w-12 h-12 rounded border border-[var(--border)] bg-white overflow-hidden flex items-center justify-center p-1 shrink-0">
                          {item.image ? (
                            <img src={item.image} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <ShoppingBag className="h-5 w-5 text-zinc-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                          <h4 className="font-bold text-xs text-[var(--foreground)] line-clamp-1">{item.name}</h4>
                          <p className="text-[9px] text-[var(--muted-foreground)] font-mono mt-0.5">{item.sku}</p>
                          <p className="text-xs font-black text-blue-500 mt-1" style={{ color: config?.colors?.primary }}>৳{item.price.toFixed(2)}</p>
                          
                          {/* Quantity control */}
                          <div className="flex items-center border border-[var(--border)] rounded-md w-fit bg-[var(--card)] mt-2">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-xs font-bold hover:bg-[var(--accent)] rounded-l"
                            >
                              -
                            </button>
                            <span className="px-3 py-0.5 text-xs font-bold border-x border-[var(--border)]">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-xs font-bold hover:bg-[var(--accent)] rounded-r"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="absolute top-3 right-3 text-zinc-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                wishlist.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[var(--muted-foreground)] py-12 space-y-3">
                    <Heart className="h-10 w-10 text-[var(--border)]" />
                    <p className="text-xs font-bold uppercase">Your wishlist is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {wishlist.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 border border-[var(--border)] bg-[var(--background)] rounded-xl relative group">
                        <div className="w-12 h-12 rounded border border-[var(--border)] bg-white overflow-hidden flex items-center justify-center p-1 shrink-0">
                          {item.image ? (
                            <img src={item.image} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <ShoppingBag className="h-5 w-5 text-zinc-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                          <h4 className="font-bold text-xs text-[var(--foreground)] line-clamp-1">{item.name}</h4>
                          <p className="text-[9px] text-[var(--muted-foreground)] font-mono mt-0.5">{item.sku}</p>
                          <p className="text-xs font-black text-blue-500 mt-1" style={{ color: config?.colors?.primary }}>৳{item.price.toFixed(2)}</p>
                          
                          <button 
                            onClick={() => {
                              addToCart(item);
                              removeFromWishlist(item.id);
                              setRightSidebar("cart");
                            }}
                            className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                            style={{ backgroundColor: config?.colors?.primary }}
                          >
                            <ShoppingCart className="h-3 w-3" /> Add to Cart
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromWishlist(item.id)}
                          className="absolute top-3 right-3 text-zinc-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Bottom Panel */}
            {rightSidebar === "cart" && cart.length > 0 && (
              <div className="p-4 border-t border-[var(--border)] bg-[var(--card)] space-y-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase">
                  <span>Subtotal:</span>
                  <span className="text-sm font-black text-blue-500" style={{ color: config?.colors?.primary }}>
                    ৳{cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                  </span>
                </div>
                <div className="grid gap-2 grid-cols-2">
                  <Link 
                    href="/cart" 
                    onClick={() => setRightSidebar(null)}
                    className="block text-center py-2.5 bg-[var(--accent)] hover:bg-[var(--border)] border border-[var(--border)] text-xs font-black uppercase tracking-wider rounded-xl transition-all text-[var(--foreground)]"
                  >
                    View Cart
                  </Link>
                  <Link 
                    href="/checkout" 
                    onClick={() => setRightSidebar(null)}
                    className="block text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md"
                    style={{ backgroundColor: config?.colors?.primary }}
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
