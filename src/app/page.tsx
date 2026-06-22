"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getShopData } from "../actions/shop";
import { getHomepageConfig } from "../actions/homepage";
import { useShopStore } from "../store/shop-store";
import { 
  ShoppingCart, Heart, Eye, ArrowRight, Layers, Sparkles, 
  Flame, ShoppingBag, ShieldCheck, Star, Clock, ChevronLeft, 
  ChevronRight, Search, ChevronDown, CheckCircle, Mail, MapPin, 
  Phone, Shield, Award 
} from "lucide-react";
import { ThemeToggle } from "../components/ui/theme-toggle";

const FALLBACK_CATEGORIES = [
  { id: "f-cat1", name: "Electronics", slug: "electronics", image_url: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=200&auto=format&fit=crop" },
  { id: "f-cat2", name: "Fashion Wear", slug: "fashion", image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=200&auto=format&fit=crop" },
  { id: "f-cat3", name: "Smart Devices", slug: "smart-devices", image_url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=200&auto=format&fit=crop" },
  { id: "f-cat4", name: "Cosmetics & Beauty", slug: "beauty", image_url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200&auto=format&fit=crop" },
  { id: "f-cat5", name: "Fresh Grocery", slug: "grocery", image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&auto=format&fit=crop" },
  { id: "f-cat6", name: "Premium Accessories", slug: "accessories", image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&auto=format&fit=crop" }
];

const FALLBACK_PRODUCTS = [
  { id: "f-prod1", name: "Pro ANC Wireless Headphones", slug: "headphones", sku: "SKU-ANC-99", selling_price: 180, compare_price: 250, current_stock: 15, featured_image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop", short_desc: "Industry leading active noise cancellation headphones.", is_featured: true, is_flash_sale: true, brand: { name: "Sony" }, category: { name: "Electronics" } },
  { id: "f-prod2", name: "Minimalist Leather Watch", slug: "watch", sku: "SKU-MIN-101", selling_price: 110, compare_price: 160, current_stock: 22, featured_image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop", short_desc: "Crafted with Italian leather straps and premium dial frames.", is_featured: true, is_best_seller: true, brand: { name: "Casio" }, category: { name: "Premium Accessories" } },
  { id: "f-prod3", name: "RGB Hot-Swap Mechanical Keyboard", slug: "keyboard", sku: "SKU-RGB-88", selling_price: 95, compare_price: 130, current_stock: 8, featured_image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=400&auto=format&fit=crop", short_desc: "Smooth linear yellow switches with fully customizable RGB mapping.", is_new_arrival: true, is_trending: true, brand: { name: "Keychron" }, category: { name: "Electronics" } },
  { id: "f-prod4", name: "Waterproof Leather Commute Pack", slug: "backpack", sku: "SKU-BAG-77", selling_price: 130, compare_price: 195, current_stock: 12, featured_image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=400&auto=format&fit=crop", short_desc: "Ergonomic shoulder straps and hidden secure passport compartments.", is_featured: true, is_flash_sale: true, brand: { name: "Urban" }, category: { name: "Fashion Wear" } }
];

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [sections, setSections] = useState<any>({
    featured: [], newArrivals: [], bestSelling: [], trending: [], flashSale: []
  });
  const [loading, setLoading] = useState(true);

  // Homepage Config States (Super Admin Controlled)
  const [config, setConfig] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuickDealTab, setActiveQuickDealTab] = useState("sale"); // sale, best, trending, new
  const [activeSlide, setActiveSlide] = useState(0);

  // Active mega menu hover
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);

  // Slide interval ref
  const slideInterval = useRef<NodeJS.Timeout | null>(null);

  // Horizontal scroll ref for category cards
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Testimonial slider index
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  // Zustand Store hooks
  const { cart, wishlist, addToCart, toggleWishlist } = useShopStore();

  const loadAllContent = async () => {
    try {
      setLoading(true);
      const shopRes = await getShopData("all");
      const configRes = await getHomepageConfig();

      if (shopRes.categories && shopRes.categories.length > 0) {
        setCategories(shopRes.categories);
      } else {
        setCategories(FALLBACK_CATEGORIES);
      }

      if (shopRes.products && shopRes.products.length > 0) {
        setProducts(shopRes.products);
        setSections(shopRes.sections || {
          featured: shopRes.products.filter((p: any) => p.is_featured),
          newArrivals: shopRes.products.filter((p: any) => p.is_new_arrival),
          bestSelling: shopRes.products.filter((p: any) => p.is_best_seller),
          trending: shopRes.products.filter((p: any) => p.is_trending),
          flashSale: shopRes.products.filter((p: any) => p.is_flash_sale),
        });
      } else {
        setProducts(FALLBACK_PRODUCTS);
        setSections({
          featured: FALLBACK_PRODUCTS,
          newArrivals: FALLBACK_PRODUCTS.filter(p => p.is_new_arrival),
          bestSelling: FALLBACK_PRODUCTS.filter(p => p.is_best_seller),
          trending: FALLBACK_PRODUCTS.filter(p => p.is_trending),
          flashSale: FALLBACK_PRODUCTS.filter(p => p.is_flash_sale),
        });
      }

      if (configRes.config) {
        setConfig(configRes.config);
      }
    } catch (err) {
      console.error(err);
      setCategories(FALLBACK_CATEGORIES);
      setProducts(FALLBACK_PRODUCTS);
      setSections({
        featured: FALLBACK_PRODUCTS,
        newArrivals: FALLBACK_PRODUCTS.filter(p => p.is_new_arrival),
        bestSelling: FALLBACK_PRODUCTS.filter(p => p.is_best_seller),
        trending: FALLBACK_PRODUCTS.filter(p => p.is_trending),
        flashSale: FALLBACK_PRODUCTS.filter(p => p.is_flash_sale),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllContent();
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

  if (loading || !config) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
        <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)] mt-3">Loading YazMart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans antialiased transition-colors duration-300">
      
      {/* 1. STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-[var(--card)] border-b border-[var(--border)] shadow-xs transition-colors duration-300">
        <div className="max-w-7xl mx-auto h-16 px-4 md:px-6 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="text-xl font-black tracking-tight flex items-center gap-2 flex-shrink-0 text-[var(--foreground)]">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white" style={{ backgroundColor: config?.colors?.primary || undefined }}>
              <ShoppingBag className="h-5 w-5" />
            </div>
            Yaz<span className="text-blue-500" style={{ color: config?.colors?.primary || undefined }}>Mart</span>
          </Link>

          {/* Large Search Bar */}
          <div className="flex-1 max-w-xl relative hidden md:block">
            <div className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] px-3 py-2 rounded-xl focus-within:border-blue-500 transition-colors">
              <Search className="h-4 w-4 text-[var(--muted-foreground)]" />
              <input 
                type="text" 
                placeholder="Search premium products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs focus:outline-none w-full font-medium text-[var(--foreground)] placeholder-[var(--muted-foreground)]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-[10px] uppercase font-black text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Clear</button>
              )}
            </div>

            {/* Quick search dropdown */}
            {searchQuery && searchedProducts.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg p-2 max-h-72 overflow-y-auto z-50 text-xs">
                {searchedProducts.map((p: any) => (
                  <Link 
                    key={p.id} 
                    href={`/products/${p.slug}`}
                    onClick={() => setSearchQuery("")}
                    className="flex items-center gap-3 p-2 hover:bg-[var(--accent)] rounded-lg transition-colors text-[var(--foreground)]"
                  >
                    <div className="w-8 h-8 rounded border border-[var(--border)] overflow-hidden flex items-center justify-center p-0.5 bg-white">
                      <img src={p.featured_image} className="h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-bold">{p.name}</p>
                      <p className="text-[10px] text-blue-500 font-bold" style={{ color: config?.colors?.primary || undefined }}>${p.selling_price.toFixed(2)}</p>
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

            <Link 
              href="/admin" 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] hover:opacity-90 text-[var(--foreground)] text-xs font-bold transition-all border border-[var(--border)]"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </Link>
          </div>
        </div>

        {/* 2. CATEGORY NAVIGATION BAR */}
        <div className="bg-[var(--background)] border-t border-[var(--border)] transition-colors relative z-40 hidden sm:block">
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center gap-1 overflow-x-auto py-1">
            <Link 
              href="/" 
              className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-blue-500 hover:bg-[var(--accent)] rounded-lg transition-colors whitespace-nowrap"
              style={{ color: config?.colors?.primary || undefined }}
            >
              Storefront Home
            </Link>

            {categories.slice(0, 10).map((cat: any) => (
              <div 
                key={cat.id}
                onMouseEnter={() => setActiveMegaMenu(cat.id)}
                onMouseLeave={() => setActiveMegaMenu(null)}
                className="relative"
              >
                <button 
                  type="button"
                  className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer"
                >
                  {cat.name} <ChevronDown className="h-3 w-3" />
                </button>

                {/* Hover mega menu list */}
                {activeMegaMenu === cat.id && (
                  <div className="absolute top-9 left-0 w-64 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg p-4 z-50 grid gap-2 text-xs text-[var(--foreground)]">
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
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* DYNAMIC HOMEPAGE SECTIONS */}
      <div className="space-y-12 pb-16">
        
        {config.section_order.map((sectionId: string) => {
          if (config.disabled_sections.includes(sectionId)) return null;

          switch (sectionId) {
            
            // 3. HERO BANNER SECTION (3 Column Layout)
            case "hero":
              return (
                <section key={sectionId} className="max-w-7xl w-full mx-auto px-4 md:px-6 pt-6 grid gap-6 md:grid-cols-3">
                  
                  {/* Left & Center: auto-slider */}
                  <div className="md:col-span-2 relative h-64 md:h-80 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)] group shadow-sm">
                    {config.slider_images.map((img: string, idx: number) => (
                      <div 
                        key={idx}
                        className={`absolute inset-0 transition-opacity duration-700 flex items-center justify-center p-2 bg-[var(--background)] ${
                          activeSlide === idx ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`}
                      >
                        <img src={img} className="w-full h-full object-cover rounded-xl" />
                      </div>
                    ))}

                    {/* Navigation Buttons */}
                    <button 
                      onClick={handlePrevSlide}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-[var(--card)]/80 hover:bg-[var(--card)] text-[var(--foreground)] shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-[var(--border)]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={handleNextSlide}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-[var(--card)]/80 hover:bg-[var(--card)] text-[var(--foreground)] shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-[var(--border)]"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Pagination Dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                      {config.slider_images.map((_: any, idx: number) => (
                        <button 
                          key={idx}
                          onClick={() => setActiveSlide(idx)}
                          className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                            activeSlide === idx ? "bg-blue-600 w-4" : "bg-zinc-300"
                          }`}
                          style={{ backgroundColor: activeSlide === idx ? config?.colors?.primary || undefined : undefined }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Promotional banners */}
                  <div className="flex flex-col gap-4">
                    {config.right_banners.slice(0, 2).map((banner: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="flex-1 h-30 md:h-auto border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--card)] shadow-xs relative group flex flex-col justify-end p-4 text-white"
                      >
                        {/* Background Image overlay */}
                        <div className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105" style={{ backgroundImage: `url(${banner.url})` }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-0" />
                        
                        <div className="relative z-10 space-y-1">
                          <h4 className="font-black text-sm uppercase tracking-wide leading-tight text-white">{banner.title}</h4>
                          <p className="text-[10px] text-zinc-200 font-medium">{banner.sub}</p>
                          <Link href={banner.link || "#"} className="text-[9px] uppercase font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1">
                            Explore <ArrowRight className="h-3 w-3" />
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
                <section key={sectionId} className="max-w-7xl w-full mx-auto px-4 md:px-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-2">
                      <Layers className="h-4 w-4 text-blue-500" style={{ color: config?.colors?.primary || undefined }} /> Shop by Category
                    </h3>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => scrollCategories("left")}
                        className="p-1.5 border border-[var(--border)] rounded-lg hover:bg-[var(--accent)] text-[var(--foreground)] cursor-pointer"
                      >
                        <ChevronLeft className="h-4.5 w-4.5" />
                      </button>
                      <button 
                        onClick={() => scrollCategories("right")}
                        className="p-1.5 border border-[var(--border)] rounded-lg hover:bg-[var(--accent)] text-[var(--foreground)] cursor-pointer"
                      >
                        <ChevronRight className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>

                  <div 
                    ref={categoryScrollRef}
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x"
                  >
                    {categories.map((cat: any) => (
                      <Link 
                        key={cat.id} 
                        href={`/categories/${cat.slug}`}
                        className="w-32 p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-blue-500/50 hover:shadow-sm text-center transition-all group flex flex-col items-center gap-3 snap-start flex-shrink-0 text-[var(--foreground)]"
                      >
                        <div className="w-16 h-16 rounded-xl bg-[var(--background)] flex items-center justify-center overflow-hidden border border-[var(--border)] group-hover:scale-105 transition-transform p-1">
                          {cat.image_url ? (
                            <img src={cat.image_url} className="w-full h-full object-contain" />
                          ) : (
                            <Layers className="h-6 w-6 text-blue-500" />
                          )}
                        </div>
                        <span className="text-[11px] font-black group-hover:text-blue-500 transition-colors line-clamp-1 uppercase">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              );

            // 5. FLASH SALE / QUICK DEAL
            case "quick_deal":
              return (
                <section key={sectionId} className="max-w-7xl w-full mx-auto px-4 md:px-6 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[var(--border)] pb-2">
                    <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2 text-[var(--foreground)]">
                      <Flame className="h-5 w-5 text-rose-500" /> Quick Deal
                    </h3>
                    
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {[
                        { id: "sale", name: "Flash Sale" },
                        { id: "best", name: "Best Seller" },
                        { id: "trending", name: "Trending" },
                        { id: "new", name: "New Arrival" }
                      ].map(tab => (
                        <button 
                          key={tab.id}
                          onClick={() => setActiveQuickDealTab(tab.id)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-colors whitespace-nowrap cursor-pointer ${
                            activeQuickDealTab === tab.id 
                              ? "bg-blue-600 text-white" 
                              : "bg-[var(--card)] hover:bg-[var(--accent)] text-[var(--muted-foreground)] border border-[var(--border)]"
                          }`}
                          style={{ backgroundColor: activeQuickDealTab === tab.id ? config?.colors?.primary || undefined : undefined }}
                        >
                          {tab.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {quickDealProducts.length === 0 ? (
                    <div className="p-12 text-center border border-dashed border-[var(--border)] rounded-xl bg-[var(--card)] text-xs text-[var(--muted-foreground)]">
                      No active deal products listed.
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      {quickDealProducts.slice(0, 4).map((product: any) => {
                        const discount = product.compare_price && product.compare_price > product.selling_price
                          ? Math.round(((product.compare_price - product.selling_price) / product.compare_price) * 100)
                          : null;
                        const inWishlist = wishlist.some(item => item.id === product.id);

                        return (
                          <div 
                            key={product.id}
                            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] flex flex-col overflow-hidden shadow-xs hover:shadow-md transition-all group relative text-[var(--foreground)]"
                          >
                            {discount && (
                              <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md text-[9px] font-black bg-rose-500 text-white">
                                -{discount}%
                              </span>
                            )}

                            <button 
                              onClick={() => toggleWishlist(product)}
                              className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-[var(--card)] border border-[var(--border)] hover:text-rose-500 transition-colors shadow-xs cursor-pointer text-[var(--foreground)]"
                            >
                              <Heart className={`h-4 w-4 ${inWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
                            </button>

                            <Link href={`/products/${product.slug}`} className="h-44 bg-[var(--background)] flex items-center justify-center border-b border-[var(--border)] p-3 overflow-hidden">
                              <img src={product.featured_image} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                            </Link>

                            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                              <div>
                                <span className="text-[9px] font-bold text-blue-500 uppercase">{product.brand?.name || "General"}</span>
                                <h4 className="font-bold text-xs line-clamp-1 mt-0.5 hover:text-blue-500 transition-colors">
                                  <Link href={`/products/${product.slug}`}>{product.name}</Link>
                                </h4>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <div className="flex text-amber-500 text-[10px]">
                                    <Star className="h-3.5 w-3.5 fill-current" />
                                    <span className="font-bold text-[var(--muted-foreground)] ml-1">4.5</span>
                                  </div>
                                  <span className="text-[9px] text-[var(--muted-foreground)]">• 120 sold</span>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 pt-1 border-t border-[var(--border)]/40">
                                <div className="flex items-baseline justify-between">
                                  <span className="text-base font-black text-blue-500" style={{ color: config?.colors?.primary || undefined }}>${product.selling_price.toFixed(2)}</span>
                                  {product.compare_price && (
                                    <span className="text-[10px] line-through text-[var(--muted-foreground)]">${product.compare_price.toFixed(2)}</span>
                                  )}
                                </div>

                                <button 
                                  onClick={() => addToCart(product)}
                                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
                                  style={{ backgroundColor: config?.colors?.primary || undefined }}
                                >
                                  <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );

            // 7. MULTIPLE PRODUCT SECTIONS
            case "featured":
              return (
                <section key={sectionId} className="max-w-7xl w-full mx-auto px-4 md:px-6 space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" style={{ color: config?.colors?.primary || undefined }} /> Featured Items
                  </h3>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {sections.featured.slice(0, 4).map((product: any) => {
                      const discount = product.compare_price && product.compare_price > product.selling_price
                        ? Math.round(((product.compare_price - product.selling_price) / product.compare_price) * 100)
                        : null;
                      const inWishlist = wishlist.some(item => item.id === product.id);

                      return (
                        <div 
                          key={product.id}
                          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] flex flex-col overflow-hidden shadow-xs hover:shadow-md transition-all group relative text-[var(--foreground)]"
                        >
                          {discount && (
                            <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md text-[9px] font-black bg-rose-500 text-white">
                              -{discount}%
                            </span>
                          )}

                          <button 
                            onClick={() => toggleWishlist(product)}
                            className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-[var(--card)] border border-[var(--border)] hover:text-rose-500 transition-colors shadow-xs cursor-pointer text-[var(--foreground)]"
                          >
                            <Heart className={`h-4 w-4 ${inWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
                          </button>

                          <Link href={`/products/${product.slug}`} className="h-44 bg-[var(--background)] flex items-center justify-center border-b border-[var(--border)] p-3 overflow-hidden">
                            <img src={product.featured_image} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                          </Link>

                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              <span className="text-[9px] font-bold text-blue-500 uppercase">{product.brand?.name || "General"}</span>
                              <h4 className="font-bold text-xs line-clamp-1 mt-0.5 hover:text-blue-500 transition-colors">
                                <Link href={`/products/${product.slug}`}>{product.name}</Link>
                              </h4>
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className="flex text-amber-500 text-[10px]">
                                  <Star className="h-3.5 w-3.5 fill-current" />
                                  <span className="font-bold text-[var(--muted-foreground)] ml-1">4.7</span>
                                </div>
                                <span className="text-[9px] text-[var(--muted-foreground)]">• 98 sold</span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 pt-1 border-t border-[var(--border)]/40">
                              <div className="flex items-baseline justify-between">
                                <span className="text-base font-black text-blue-500" style={{ color: config?.colors?.primary || undefined }}>${product.selling_price.toFixed(2)}</span>
                                {product.compare_price && (
                                  <span className="text-[10px] line-through text-[var(--muted-foreground)]">${product.compare_price.toFixed(2)}</span>
                                )}
                              </div>

                              <button 
                                onClick={() => addToCart(product)}
                                className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
                                style={{ backgroundColor: config?.colors?.primary || undefined }}
                              >
                                <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );

            // 8. PROMOTIONAL FULL WIDTH BANNER & 11. NEWSLETTER
            case "newsletter":
              return (
                <section key={sectionId} className="max-w-7xl w-full mx-auto px-4 md:px-6">
                  {/* Full width banner */}
                  {config.promo_banners.length > 0 && (
                    <div className="w-full h-40 md:h-48 rounded-2xl overflow-hidden border border-[var(--border)] shadow-xs relative group mb-12">
                      <img src={config.promo_banners[0]} className="w-full h-full object-cover transition-transform group-hover:scale-102" />
                    </div>
                  )}

                  {/* Newsletter */}
                  <div className="p-8 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center space-y-4 max-w-3xl mx-auto shadow-sm">
                    <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest" style={{ color: config?.colors?.primary || undefined }}>Stay Connected</span>
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-[var(--foreground)]">Subscribe to our newsletter</h3>
                    <p className="text-[var(--muted-foreground)] text-xs font-normal max-w-md mx-auto">Get notifications about special deals, campaign discounts, and new arrivals directly to your inbox.</p>
                    
                    <form onSubmit={(e) => { e.preventDefault(); alert("Subscription registered successfully!"); }} className="flex max-w-md mx-auto gap-2 bg-[var(--background)] p-1.5 rounded-xl border border-[var(--border)]">
                      <input 
                        type="email" 
                        required 
                        placeholder="Enter email address..."
                        className="bg-transparent border-none text-xs text-[var(--foreground)] focus:outline-none flex-1 px-3 py-2 font-medium placeholder-[var(--muted-foreground)]"
                      />
                      <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs uppercase cursor-pointer hover:bg-blue-700" style={{ backgroundColor: config?.colors?.primary || undefined }}>Subscribe</button>
                    </form>
                  </div>
                </section>
              );

            // 9. BRAND LOGOS SECTION
            case "brands":
              return (
                <section key={sectionId} className="max-w-7xl w-full mx-auto px-4 md:px-6 space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[var(--muted-foreground)]">Popular Brands</h3>
                  
                  <div className="flex gap-6 overflow-x-auto pb-4 items-center justify-between bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]">
                    {config.brand_logos.map((brand: any, idx: number) => (
                      <Link 
                        key={idx} 
                        href="/categories"
                        className="h-12 w-28 bg-[var(--background)] border border-[var(--border)] rounded-xl p-2 flex items-center justify-center flex-shrink-0 hover:border-blue-500/50 transition-colors group"
                      >
                        {brand.logoUrl ? (
                          <img src={brand.logoUrl} alt={brand.name} className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all dark:invert dark:opacity-80" />
                        ) : (
                          <span className="font-bold text-xs uppercase tracking-wider text-[var(--muted-foreground)] group-hover:text-blue-500">{brand.name}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </section>
              );

            // 10. CUSTOMER REVIEWS
            case "testimonials":
              return (
                <section key={sectionId} className="max-w-3xl w-full mx-auto px-4 text-center space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[var(--muted-foreground)]">Customer Testimonials</h3>
                  
                  <div className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xs relative text-[var(--foreground)]">
                    <p className="text-sm font-medium italic leading-relaxed text-[var(--foreground)]">
                      "{config.testimonials[activeReviewIndex]?.text}"
                    </p>
                    <p className="font-black text-xs uppercase tracking-wider mt-4">
                      {config.testimonials[activeReviewIndex]?.name}
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                      {config.testimonials[activeReviewIndex]?.role}
                    </p>

                    {/* Pagination indicators */}
                    <div className="flex justify-center gap-1.5 mt-4">
                      {config.testimonials.map((_: any, idx: number) => (
                        <button 
                          key={idx}
                          onClick={() => setActiveReviewIndex(idx)}
                          className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                            activeReviewIndex === idx ? "bg-blue-600" : "bg-zinc-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}

      </div>

      {/* 12. footer */}
      <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4 text-xs font-medium">
          
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase text-white tracking-wider">YazMart Enterprise</h4>
            <p className="leading-relaxed font-normal text-zinc-500">Premium bookstore layout and dynamic client storefront catalog systems. Experience response fast loading times.</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase text-white tracking-wider">Shopping Matrix</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-white transition-colors">Featured collections</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Quick deal campaigns</Link></li>
              <li><Link href="/wishlist" className="hover:text-white transition-colors">Saved wishlist</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Shopping cart ledger</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase text-white tracking-wider">Terms & Guidelines</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Return policy guidelines</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Help desk support</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase text-white tracking-wider">Direct Contact</h4>
            <ul className="space-y-2 text-zinc-500 font-normal">
              <li>Dhaka, Bangladesh</li>
              <li>Support: contact@yazmart.com</li>
              <li>Phone: +8801700000000</li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-zinc-900 h-16 px-4 md:px-6 flex items-center justify-between text-[11px] text-zinc-500 font-normal">
          <p>&copy; {new Date().getFullYear()} YazMart. All rights reserved.</p>
          <div className="flex gap-3">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>bKash</span>
            <span>NAGAD</span>
          </div>
        </div>
      </footer>
    </div>
  );
}