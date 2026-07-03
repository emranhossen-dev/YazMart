"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShopStore } from "@/store/shop-store";
import { useAuthStore } from "@/store/auth-store";
import { signOutAction } from "@/actions/auth";
import { ShoppingCart, Heart, ShieldCheck, Package, ArrowLeft, ShoppingBag, Star, HelpCircle, Frown, MapPin, Truck, RotateCcw, DollarSign, Share2, ChevronLeft, ChevronRight, Info } from "lucide-react";

interface ProductDetailPageClientProps {
  initialProduct: any;
  initialRelated: any[];
}

export default function ProductDetailPageClient({
  initialProduct,
  initialRelated,
}: ProductDetailPageClientProps) {
  const router = useRouter();

  const [product] = useState<any>(initialProduct);
  const [related] = useState<any[]>(initialRelated);
  const [activeImage, setActiveImage] = useState(product.featured_image || "");
  const [qty, setQty] = useState(1);

  // Description view-more toggle
  const [descExpanded, setDescExpanded] = useState(false);

  // Delivery Location States
  const [isDhaka, setIsDhaka] = useState(true);
  const [showLocationSelect, setShowLocationSelect] = useState(false);

  // Variant States (Simulated options)
  const [selectedColor, setSelectedColor] = useState("Black");
  const [selectedSize, setSelectedSize] = useState("with Original Box");

  // Reviews States
  const [reviews, setReviews] = useState<any[]>([
    {
      author: "Rahat H.",
      rating: 5,
      content: "Exactly as described. Fast charging works perfectly. Recommended seller!",
      date: "2026-06-25"
    },
    {
      author: "Milon K.",
      rating: 4,
      content: "Good product quality. Delivery took some time but charging speed is solid.",
      date: "2026-06-28"
    }
  ]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);

  // Questions States
  const [questions, setQuestions] = useState<any[]>([
    {
      question: "Does it support fast charging for latest smartphone models?",
      answer: "Yes, this model supports full fast charging protocol configurations.",
      date: "2026-06-29"
    }
  ]);
  const [newQuestionText, setNewQuestionText] = useState("");

  const { cart, wishlist, addToCart, toggleWishlist } = useShopStore();
  const { user } = useAuthStore();

  const handleBuyNow = (p?: any) => {
    const targetProduct = p || product;
    if (!targetProduct) return;
    addToCart(targetProduct);
    router.push("/checkout");
  };

  const discount = product.compare_price && product.compare_price > product.selling_price
    ? Math.round(((product.compare_price - product.selling_price) / product.compare_price) * 100)
    : null;

  const inWishlist = wishlist.some(item => item.id === product.id);
  const allImages = [product.featured_image, ...(product.gallery_images || [])].filter(Boolean);
  const avgScore = reviews.length === 0 ? "0.0" : (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  // Delivery calculations
  const deliveryCharge = isDhaka ? 60 : 120;
  const locationName = isDhaka ? "Dhaka, Narsingdi, Belabo" : "Chittagong, Double Mooring, Agrabad";

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f6] text-[#191b23] font-sans">
      {/* Premium Consistent Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#e5e5e5] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-black tracking-tight flex items-center gap-2 flex-shrink-0">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <ShoppingBag className="h-5.5 w-5.5" />
            </div>
            Yaz<span className="text-blue-500">Mart</span>
          </Link>

          {/* Action Links */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link href="/wishlist" className="relative p-2 text-[#191b23] hover:text-blue-500 transition-colors">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 bg-rose-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative p-2 text-[#191b23] hover:text-blue-500 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-blue-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ededf9] hover:opacity-90 text-[#191b23] text-xs font-bold transition-all border border-[#c3c6d7]/30 cursor-pointer">
                  <div className="w-4.5 h-4.5 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-[9px] uppercase">
                    {user.fullName?.charAt(0) || "U"}
                  </div>
                  <span className="max-w-[70px] truncate hidden md:inline">{user.fullName || "Account"}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-[#c3c6d7] rounded-2xl shadow-xl p-1.5 hidden group-hover:block z-50 text-xs text-[#191b23] animate-fade-in">
                  {user.role === "admin" && (
                    <Link 
                      href="/admin" 
                      className="block w-full text-left px-3 py-2 hover:bg-[#ededf9] rounded-xl font-bold transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button 
                    onClick={async () => {
                      await signOutAction();
                      window.location.reload();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#ededf9] rounded-xl text-rose-500 font-bold transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link 
                href="/auth" 
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main product display */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 space-y-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Storefront
        </Link>

        {/* Product Details Section: Matches screenshot layout (Gallery 50%, Details 25%, Delivery 25%) */}
        <div className="grid gap-6 lg:grid-cols-12 bg-white rounded-lg p-5 shadow-xs border border-zinc-200/50 animate-fade-in items-start">
          
          {/* Column 1: Image Gallery (Span 6 - 50% Width) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="w-full h-[450px] bg-white flex items-center justify-center p-4 overflow-hidden relative">
              {activeImage ? (
                <img src={activeImage} alt={product.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <ShoppingBag className="h-16 w-16 text-zinc-300" />
              )}
            </div>

            {/* Thumbnail Strip with chevrons */}
            {allImages.length > 0 && (
              <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
                <button type="button" className="text-zinc-400 hover:text-zinc-600 p-1">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {allImages.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-14 h-14 border rounded p-1 bg-white overflow-hidden cursor-pointer flex-shrink-0 transition-all ${
                        activeImage === img ? "border-[#f57224] ring-1 ring-[#f57224]/10" : "border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
                <button type="button" className="text-zinc-400 hover:text-zinc-600 p-1">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Column 2: Purchase Details & Actions (Span 3 - 25% Width) */}
          <div className="lg:col-span-3 space-y-5">
            <div className="space-y-2">
              <h1 className="text-xl font-medium text-zinc-900 leading-snug">{product.name}</h1>
              
              <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-[#1a9fcb] hover:underline cursor-pointer">No Ratings</span>
                </div>
                <div className="flex gap-3">
                  <button type="button" className="hover:text-zinc-600" title="Share"><Share2 className="h-4 w-4" /></button>
                  <button 
                    type="button" 
                    onClick={() => toggleWishlist(product)} 
                    className={`hover:text-rose-500 ${inWishlist ? "text-rose-500" : ""}`}
                    title="Add to Wishlist"
                  >
                    <Heart className={`h-4 w-4 ${inWishlist ? "fill-rose-500" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-zinc-500 pt-1">
                <span>Brand: <span className="text-[#1a9fcb] hover:underline cursor-pointer">{product.brand?.name || "No Brand"}</span></span>
                <span className="mx-2 text-zinc-300">|</span>
                <span className="text-[#1a9fcb] hover:underline cursor-pointer">More products from {product.brand?.name || "No Brand"}</span>
              </div>
            </div>

            {/* Price display section */}
            <div className="space-y-1">
              <div className="text-3xl font-normal text-[#f57224]">
                ৳ {product.selling_price.toLocaleString("en-US")}
              </div>
              {product.compare_price && (
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="line-through">৳ {product.compare_price.toLocaleString("en-US")}</span>
                  <span className="text-zinc-600">-{discount}%</span>
                </div>
              )}
            </div>

            <hr className="border-zinc-100" />

            {/* Simulated Color select option */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Color</span>
                <span className="font-bold text-zinc-800">{selectedColor}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setSelectedColor("Black")}
                  className={`w-10 h-10 border p-0.5 bg-white overflow-hidden relative ${
                    selectedColor === "Black" ? "border-[#f57224]" : "border-zinc-200"
                  }`}
                >
                  <img src={product.featured_image} className="w-full h-full object-contain" />
                  {selectedColor === "Black" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#f57224] text-white flex items-center justify-center text-[7px]">✓</div>
                  )}
                </button>
              </div>
            </div>

            {/* Simulated Size select option */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Size</span>
                <span className="font-bold text-zinc-800">{selectedSize}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setSelectedSize("with Original Box")}
                  className={`px-3 py-1.5 border text-[11px] font-medium relative bg-white ${
                    selectedSize === "with Original Box" ? "border-[#f57224]" : "border-zinc-200"
                  }`}
                >
                  with Original Box
                  {selectedSize === "with Original Box" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#f57224] text-white flex items-center justify-center text-[7px]">✓</div>
                  )}
                </button>
              </div>
            </div>

            {/* Quantity Picker */}
            <div className="flex items-center gap-4 text-xs">
              <span className="text-zinc-400 w-12 shrink-0">Quantity</span>
              <div className="flex items-center border border-zinc-300 rounded bg-white">
                <button 
                  type="button"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-2.5 py-1 text-zinc-500 hover:bg-zinc-100 font-bold border-r border-zinc-200 cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-zinc-800">{qty}</span>
                <button 
                  type="button"
                  onClick={() => setQty(q => Math.min(product.current_stock || 10, q + 1))}
                  className="px-2.5 py-1 text-zinc-500 hover:bg-zinc-100 font-bold border-l border-zinc-200 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Wide horizontal side-by-side Action Buttons exactly like screenshot */}
            <div className="flex gap-3 pt-3">
              <button 
                type="button"
                onClick={() => handleBuyNow()}
                className="flex-1 py-3 bg-[#2abbe8] hover:bg-[#1a9fcb] text-white text-sm font-bold uppercase rounded-sm cursor-pointer transition-colors shadow-2xs text-center"
              >
                Buy Now
              </button>
              <button 
                type="button"
                onClick={() => {
                  addToCart(product);
                  for (let i = 1; i < qty; i++) addToCart(product);
                }}
                className="flex-1 py-3 bg-[#f57224] hover:bg-[#d65f1a] text-white text-sm font-bold uppercase rounded-sm cursor-pointer transition-colors shadow-2xs text-center"
              >
                Add to Cart
              </button>
            </div>

          </div>

          {/* Column 3: Courier / Delivery Options (Span 3 - 25% Width) */}
          <div className="lg:col-span-3 border border-zinc-200 bg-[#fafafa] rounded-sm p-4 space-y-4 text-xs font-normal">
            
            {/* Delivery header */}
            <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-200/50 pb-2">
              <span className="uppercase text-[10px] font-bold text-zinc-500">Delivery Options</span>
              <Info className="h-4 w-4 cursor-help" />
            </div>

            <div className="space-y-4.5">
              {/* Location pin & CHANGE trigger */}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex gap-2">
                    <MapPin className="h-4.5 w-4.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span className="text-zinc-800 font-medium leading-tight">{locationName}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowLocationSelect(!showLocationSelect)}
                    className="text-[#1a9fcb] font-bold uppercase text-[10px] shrink-0 hover:underline cursor-pointer"
                  >
                    CHANGE
                  </button>
                </div>

                {/* Interactive select box for location charge update */}
                {showLocationSelect && (
                  <div className="bg-white border border-zinc-200 p-2 rounded shadow-sm space-y-1.5 animate-fade-in">
                    <p className="text-[10px] font-bold uppercase text-zinc-500">Select Region:</p>
                    <div className="flex gap-2">
                      <select 
                        value={isDhaka ? "dhaka" : "outside"}
                        onChange={(e) => {
                          setIsDhaka(e.target.value === "dhaka");
                          setShowLocationSelect(false);
                        }}
                        className="flex-1 p-1 text-[11px] border border-zinc-300 rounded bg-white font-medium"
                      >
                        <option value="dhaka">Inside Dhaka (৳60)</option>
                        <option value="outside">Outside Dhaka (৳120)</option>
                      </select>
                      <button 
                        type="button"
                        onClick={() => setShowLocationSelect(false)}
                        className="text-[9px] font-bold uppercase text-zinc-400 px-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Standard Delivery */}
              <div className="flex justify-between items-start pt-3 border-t border-zinc-200/50">
                <div className="flex gap-2">
                  <Truck className="h-4.5 w-4.5 text-zinc-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-zinc-800 font-medium">Standard Delivery</p>
                    <p className="text-[10px] text-zinc-400">Get by 2 - 5 days</p>
                  </div>
                </div>
                <span className="font-bold text-zinc-800 shrink-0">৳{deliveryCharge}</span>
              </div>

              {/* Cash on delivery */}
              <div className="flex gap-2 pt-3 border-t border-zinc-200/50">
                <DollarSign className="h-4.5 w-4.5 text-zinc-400 shrink-0 mt-0.5" />
                <span className="text-zinc-800 font-medium">Cash on Delivery Available</span>
              </div>
            </div>

            {/* Returns and warranties header */}
            <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-200/50 pt-3 pb-2">
              <span className="uppercase text-[10px] font-bold text-zinc-500">Return &amp; Warranty</span>
              <Info className="h-4 w-4 cursor-help" />
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <RotateCcw className="h-4.5 w-4.5 text-zinc-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-zinc-800 font-medium">14 days easy return</p>
                  <p className="text-[10px] text-zinc-400">Change of mind is not applicable</p>
                </div>
              </div>

              <div className="flex gap-2 pt-3.5 border-t border-zinc-200/50">
                <ShieldCheck className="h-4.5 w-4.5 text-zinc-400 shrink-0 mt-0.5" />
                <span className="text-zinc-800 font-medium">Warranty not available</span>
              </div>
            </div>

            {/* App promo card as seen in screenshot */}
            <div className="border border-zinc-200 bg-white p-3 rounded-sm flex items-center justify-between gap-3 mt-4">
              <div className="shrink-0 p-1 border border-zinc-100 bg-zinc-50 rounded">
                <svg className="w-12 h-12 text-zinc-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="6" height="6" />
                  <rect x="16" y="2" width="6" height="6" />
                  <rect x="2" y="16" width="6" height="6" />
                  <rect x="9" y="9" width="6" height="6" />
                  <path d="M9 2h2M11 9v2M16 11h2M2 11h2M11 16h2M16 16v2h2M20 20h2M16 20h2" />
                </svg>
              </div>
              <div className="space-y-1">
                <div className="w-6 h-6 rounded-md bg-[#f57224] text-white flex items-center justify-center font-bold text-[10px] uppercase">Y</div>
                <p className="text-[9px] text-zinc-400 leading-tight font-medium">Download app to enjoy exclusive discounts!</p>
              </div>
            </div>
            <div className="text-center text-[9px] text-[#1a9fcb] font-medium hover:underline cursor-pointer">
              Scan with mobile
            </div>

            {/* Merchant profile card */}
            <div className="pt-4 border-t border-zinc-200/50 space-y-2">
              <div className="text-[10px] text-zinc-400 uppercase font-bold text-zinc-500">Sold by</div>
              <div className="font-bold text-zinc-800 text-xs hover:text-[#1a9fcb] cursor-pointer">
                {product.brand?.name ? `${product.brand.name} Store` : "Buy More Save More Store"}
              </div>
            </div>

          </div>

        </div>

        {/* Product Description Section with VIEW MORE collapsible wrapper containing SPEC TABLES and guides */}
        <div className="bg-white border border-zinc-200/50 rounded-lg p-5 shadow-xs space-y-6">
          <h2 className="text-base font-black uppercase tracking-wider text-zinc-500 border-b border-zinc-150 pb-2">
            Product Description :
          </h2>
          
          <div className="relative">
            <div className={`transition-all duration-500 overflow-hidden ${descExpanded ? "max-h-none" : "max-h-[300px]"} space-y-6`}>
              
              {/* Product Full Description Text */}
              {product.full_desc ? (
                <p className="text-xs text-zinc-600 font-medium leading-relaxed whitespace-pre-line bg-zinc-50/20 p-4 rounded-xl border border-zinc-100">
                  {product.full_desc}
                </p>
              ) : (
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  Explore full tech specifications and details for this product.
                </p>
              )}

              {/* Large Image inside Description */}
              <div className="max-w-2xl mx-auto pt-4">
                <div className="aspect-video bg-zinc-50 rounded-2xl border border-zinc-200 overflow-hidden flex items-center justify-center p-4">
                  {product.featured_image ? (
                    <img src={product.featured_image} alt="Product description image" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <ShoppingBag className="h-12 w-12 text-zinc-300" />
                  )}
                </div>
              </div>

              {/* Nested technical specifications list inside description */}
              {product.specifications && typeof product.specifications === "object" && Object.keys(product.specifications).length > 0 && (
                <div className="space-y-3 pt-4 max-w-2xl mx-auto">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2">Technical Matrix Specifications</h3>
                  <div className="border border-zinc-200/50 rounded overflow-hidden text-xs bg-white">
                    {Object.entries(product.specifications).map(([key, val]: any, i) => (
                      <div key={i} className="grid grid-cols-2 divide-x divide-zinc-200 border-b border-zinc-200 last:border-b-0">
                        <span className="p-3 bg-zinc-50 font-bold text-zinc-500">{key}</span>
                        <span className="p-3 font-semibold text-[#191b23]">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nested Usability Guidelines inside description */}
              {product.usability && (
                <div className="space-y-2 bg-blue-50/5 p-4 rounded-xl border border-blue-500/10 text-xs max-w-2xl mx-auto">
                  <h4 className="font-bold uppercase text-blue-600 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" /> Guidelines &amp; Usage Instructions
                  </h4>
                  <p className="font-normal leading-relaxed text-zinc-500">{product.usability}</p>
                </div>
              )}

              {/* Nested package contents logistics */}
              <div className="max-w-2xl mx-auto border border-zinc-250 bg-zinc-50/40 rounded-xl p-4 grid gap-4 sm:grid-cols-2 text-xs text-zinc-600 font-medium">
                <div className="flex gap-2">
                  <Package className="h-5 w-5 text-blue-500 shrink-0" />
                  <div>
                    <p className="font-bold text-[9px] uppercase text-zinc-400">Package Includes</p>
                    <p className="text-xs font-bold text-zinc-800 mt-0.5">{product.package_includes || "Standard Box Contents"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-bold text-[9px] uppercase text-zinc-400">Warranty details</p>
                    <p className="text-xs font-bold text-zinc-800 mt-0.5">{product.warranty || "No warranty declared."}</p>
                  </div>
                </div>
              </div>
              
              {!descExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none" />
              )}
            </div>

            <div className="flex justify-center mt-6 pt-4 border-t border-zinc-200/20">
              <button
                type="button"
                onClick={() => setDescExpanded(!descExpanded)}
                className="px-8 py-2 border border-blue-500 text-blue-500 hover:bg-blue-50 text-xs font-black uppercase rounded-sm cursor-pointer transition-all"
              >
                {descExpanded ? "VIEW LESS" : "VIEW MORE"}
              </button>
            </div>
          </div>
        </div>

        {/* Ratings & Reviews Section matching screenshot layout */}
        <div className="bg-white border border-zinc-200/50 rounded-lg p-5 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            Ratings & Reviews of {product.name}
          </h2>

          <div className="grid gap-6 md:grid-cols-3 items-center border-b border-zinc-100 pb-6">
            
            {/* Left Column: Average Star score ratio */}
            <div className="text-center md:border-r border-zinc-100 md:pr-6 space-y-2">
              <div className="text-5xl font-black text-zinc-900">
                {avgScore}<span className="text-lg text-zinc-400 font-normal">/5</span>
              </div>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => {
                  const val = Math.round(Number(avgScore));
                  return (
                    <Star 
                      key={s} 
                      className={`h-6 w-6 ${s <= val ? "fill-amber-400 text-amber-400" : "text-zinc-200 fill-zinc-200"}`} 
                    />
                  );
                })}
              </div>
              <p className="text-xs text-zinc-400 font-medium">{reviews.length} Ratings</p>
            </div>

            {/* Middle Column: 5-star to 1-star visual bars breakdown */}
            <div className="md:col-span-2 space-y-1.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter(r => r.rating === stars).length;
                const percentage = reviews.length === 0 ? 0 : Math.round((count / reviews.length) * 100);
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs font-medium">
                    <div className="flex gap-0.5 w-20 shrink-0">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          className={`h-3.5 w-3.5 ${s <= stars ? "fill-amber-400 text-amber-400" : "text-zinc-100 fill-zinc-100"}`} 
                        />
                      ))}
                    </div>
                    <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 transition-all duration-500 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-zinc-400 font-bold">{count}</span>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Custom review lists / Empty Review status mapping */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-12 space-y-4 bg-zinc-50/50 rounded border border-dashed border-zinc-200">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                  <Frown className="h-8 w-8" />
                </div>
                <div className="text-zinc-500 text-xs font-medium space-y-1">
                  <p className="font-bold text-zinc-700 text-sm">This product has no reviews.</p>
                  <p>Let others know what you think and be the first to write a review.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {reviews.map((r, i) => (
                  <div key={i} className="py-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] uppercase">
                          {r.author.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-zinc-700">{r.author}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">{r.date}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200 fill-zinc-200"}`} 
                        />
                      ))}
                    </div>
                    <p className="text-xs text-zinc-600 font-medium leading-relaxed">{r.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Review Panel */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-5 space-y-4">
              <h4 className="text-xs font-black uppercase text-zinc-500">Submit a Rating &amp; Review</h4>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-zinc-500">Your rating stars:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button 
                      key={s}
                      type="button" 
                      onClick={() => setNewReviewRating(s)}
                      className="cursor-pointer hover:scale-110 transition-transform"
                    >
                      <Star 
                        className={`h-5 w-5 ${s <= newReviewRating ? "fill-amber-400 text-amber-400" : "text-zinc-300 fill-zinc-300 hover:text-amber-300"}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="Share details of your experience with this item..."
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-white border border-zinc-250 focus:outline-none"
                />
                <button 
                  type="button"
                  onClick={() => {
                    if (!newReviewText.trim()) return;
                    setReviews([...reviews, {
                      author: user?.fullName || "Verified Buyer",
                      rating: newReviewRating,
                      content: newReviewText,
                      date: new Date().toLocaleDateString("en-US")
                    }]);
                    setNewReviewText("");
                    setNewReviewRating(5);
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Questions and Answers Widget matching screenshot */}
        <div className="bg-white border border-zinc-200/50 rounded-lg p-5 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            Questions about this product
          </h2>

          {/* Ask question search field and Orange Ask button */}
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="Enter your question(s) here"
              className="flex-1 px-4 py-3 text-xs rounded-lg bg-zinc-50 border border-zinc-200 focus:outline-none"
            />
            <button 
              type="button"
              onClick={() => {
                if (!newQuestionText.trim()) return;
                setQuestions([
                  ...questions,
                  {
                    question: newQuestionText,
                    answer: null,
                    date: new Date().toLocaleDateString("en-US")
                  }
                ]);
                setNewQuestionText("");
              }}
              className="px-6 py-3 bg-[#ff6900] hover:bg-[#e05c00] text-white rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer transition-colors"
            >
              ASK QUESTIONS
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-zinc-50/50 rounded border border-dashed border-zinc-250">
              <svg className="w-14 h-14 mx-auto text-zinc-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div className="text-zinc-400 text-xs font-medium space-y-1">
                <p className="font-bold text-zinc-500 text-sm">There are no questions yet.</p>
                <p>Ask the seller now and their answer will show here.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="py-4 first:pt-0 space-y-3 text-xs font-medium">
                  <div className="flex gap-2.5">
                    <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded font-bold text-[9px] uppercase shrink-0 h-fit">Q</span>
                    <div className="space-y-1">
                      <p className="font-bold text-zinc-800">{q.question}</p>
                      <p className="text-[9px] text-zinc-400 font-mono">Asked on {q.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 pl-5">
                    <span className="px-1.5 py-0.5 bg-emerald-500 text-white rounded font-bold text-[9px] uppercase shrink-0 h-fit">A</span>
                    <div className="space-y-1">
                      <p className="text-zinc-600 font-medium">{q.answer || "Thank you for asking! The merchant typically answers within 12 hours. We will notify you when an answer is published."}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Products list styled as "You may also like" */}
        {related.length > 0 && (
          <div className="space-y-8 pt-12 border-t border-[#c3c6d7]/40">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#191b23]">You may also like</h2>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              {related.map((p) => {
                const isItemInWishlist = wishlist.some(item => item.id === p.id);
                const itemDiscount = p.compare_price && p.compare_price > p.selling_price
                  ? Math.round(((p.compare_price - p.selling_price) / p.compare_price) * 100)
                  : null;

                return (
                  <div 
                    key={p.id} 
                    className="product-card group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden relative border border-outline-variant/10 flex flex-col justify-between text-zinc-900"
                  >
                    <div className="relative">
                      {itemDiscount && (
                        <span className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-md text-[9px] font-black bg-rose-500 text-white uppercase tracking-wider">
                          -{itemDiscount}%
                        </span>
                      )}

                      <button 
                        type="button"
                        onClick={() => toggleWishlist(p)}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white border border-outline-variant/20 hover:text-rose-500 transition-colors shadow-xs cursor-pointer text-zinc-900"
                      >
                        <Heart className={`h-4 w-4 ${isItemInWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
                      </button>

                      <Link href={`/products/${p.slug}`} className="h-56 bg-surface-container-low flex items-center justify-center p-4 overflow-hidden relative border-b border-outline-variant/5">
                        <img src={p.featured_image} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700" />
                        <div className="action-overlay absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <span className="bg-white text-zinc-900 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-wider">Quick View</span>
                        </div>
                      </Link>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-left">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">{p.brand?.name || "General"}</span>
                        <h4 className="font-bold text-xs line-clamp-2 leading-snug hover:text-blue-600 transition-colors">
                          <Link href={`/products/${p.slug}`}>{p.name}</Link>
                        </h4>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-zinc-100">
                        <span className="text-sm font-black text-[#ff6900] block">৳{p.selling_price.toLocaleString("en-US")}</span>
                        
                        {/* Rating stars at bottom of card */}
                        <div className="flex gap-0.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="h-3 w-3 fill-current" />
                          ))}
                        </div>

                        <div className="flex gap-2 w-full pt-1">
                          <button 
                            type="button"
                            onClick={() => handleBuyNow(p)}
                            className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer shadow-xs text-center"
                          >
                            Buy Now
                          </button>
                          <button 
                            type="button"
                            onClick={() => addToCart(p)}
                            className="w-8 h-8 shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center cursor-pointer shadow-xs"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
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
      </main>
    </div>
  );
}
