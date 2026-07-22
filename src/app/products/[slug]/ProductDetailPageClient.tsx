"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShopStore } from "@/store/shop-store";
import { useAuthStore } from "@/store/auth-store";
import toast from "react-hot-toast";
import {
  Heart, ShieldCheck, Package, ShoppingBag, Star,
  Frown, Truck, RotateCcw, Share2, ChevronLeft, ChevronRight, X,
  Minus, Plus, Check, Store as StoreIcon, MessageSquare, ArrowRight, Sparkles, HelpCircle,
  ThumbsUp, Send, Filter
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductQuickViewModal from "@/components/ProductQuickViewModal";
import { getProductReviews } from "@/actions/reviews";
import { getCustomerOrders } from "@/actions/orders";

interface ProductDetailPageClientProps {
  initialProduct: any;
  initialRelated: any[];
  initialJustForYou?: any[];
}

function ProductCard({ product, wishlist, onToggleWishlist, onAddToCart, onBuyNow, onInfoClick }: any) {
  const discount = product.compare_price && product.compare_price > product.selling_price
    ? Math.round(((product.compare_price - product.selling_price) / product.compare_price) * 100)
    : null;
  const inWishlist = wishlist.some((item: any) => item.id === product.id);

  // Dynamic pill badge (NEW / TRENDING / HOT / DISCOUNT)
  const badgeLabel = product.is_new_arrival ? "NEW" : product.is_trending ? "TRENDING" : product.is_best_seller ? "HOT" : discount ? `-${discount}%` : null;
  const badgeColor = product.is_new_arrival ? "bg-amber-500" : product.is_trending ? "bg-orange-500" : product.is_best_seller ? "bg-rose-500" : "bg-[#ff6600]";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-300">
      <div className="relative w-full h-40 sm:h-52 overflow-hidden rounded-t-2xl bg-slate-100">
        {badgeLabel && (
          <span className={`absolute top-2.5 left-2.5 z-10 rounded-md ${badgeColor} px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-2xs tracking-wider`}>
            {badgeLabel}
          </span>
        )}
        
        <div className="absolute top-2.5 right-2.5 z-10 flex gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            aria-label="Toggle wishlist"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-2xs text-slate-500 transition-transform hover:scale-110 hover:text-rose-500"
          >
            <Heart className={`h-4 w-4 ${inWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
          </button>
        </div>

        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img 
            src={product.featured_image || "https://placehold.co/400x400/png"} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
          <Star className="h-3.5 w-3.5 fill-current" />
          <span>4.5</span>
          <span className="text-slate-400 font-normal">· {product.current_stock || 120}</span>
        </div>

        <h4 className="line-clamp-1 text-xs sm:text-sm font-bold text-slate-900 hover:text-[#ff6600] transition-colors">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h4>

        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-base font-black text-slate-950">৳{Number(product.selling_price).toLocaleString("en-US")}</span>
          {product.compare_price && product.compare_price > product.selling_price && (
            <span className="text-xs text-slate-400 line-through font-semibold">৳{Number(product.compare_price).toLocaleString("en-US")}</span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="flex-1 cursor-pointer rounded-xl border border-slate-300 bg-white py-2 text-[11px] font-bold text-slate-800 transition-all hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center gap-1"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add
          </button>
          <button
            type="button"
            onClick={() => onBuyNow(product)}
            className="flex-1 cursor-pointer rounded-xl bg-[#ff6600] hover:bg-[#e65c00] py-2 text-[11px] font-extrabold text-white transition-all shadow-xs"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPageClient({
  initialProduct,
  initialRelated,
  initialJustForYou = [],
}: ProductDetailPageClientProps) {
  const router = useRouter();

  const [product] = useState<any>(initialProduct);
  const [related] = useState<any[]>(initialRelated);
  const [justForYou] = useState<any[]>(initialJustForYou);
  const [activeImage, setActiveImage] = useState(product.featured_image || "");
  const [qty, setQty] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  // Variant selection
  const variants: any[] = product.variants || [];
  const uniqueColors = Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean)));
  const uniqueSizes = Array.from(new Set(variants.map((v: any) => v.size).filter(Boolean)));
  const [selectedColor, setSelectedColor] = useState<string | null>(uniqueColors[0] || null);
  const [selectedSize, setSelectedSize] = useState<string | null>(uniqueSizes[0] || null);

  // Reviews State & Modals
  const [reviews, setReviews] = useState<any[]>([]);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [hasPurchasedProduct, setHasPurchasedProduct] = useState(false);

  // Questions State & Modals
  const [questions, setQuestions] = useState<any[]>([
    { question: "Does this come with official brand warranty?", answer: "Yes! Every unit includes the 6-month official manufacturer warranty card.", date: "2026-07-14" },
    { question: "Is cash on delivery available for this item?", answer: "Yes, Cash on Delivery is available all across Bangladesh.", date: "2026-07-18" }
  ]);
  const [showAllQuestionsModal, setShowAllQuestionsModal] = useState(false);
  const [showAskQuestionModal, setShowAskQuestionModal] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");

  const { cart, wishlist, addToCart, toggleWishlist } = useShopStore();
  const { user } = useAuthStore();
  const [showSideCart, setShowSideCart] = useState(false);

  useEffect(() => {
    if (user?.id && product?.id) {
      getCustomerOrders({ userId: user.id, email: user.email || undefined }).then((res) => {
        if (res.orders) {
          const found = res.orders.some((order: any) => {
            const list = Array.isArray(order.items) ? order.items : [];
            return list.some((item: any) =>
              item.id === product.id ||
              item.name?.toLowerCase().trim() === product.name?.toLowerCase().trim()
            );
          });
          setHasPurchasedProduct(found);
        }
      });
    }
  }, [user, product]);

  const handleOpenWriteReviewModal = () => {
    if (!user) {
      toast.error("Please Sign In to leave a product review.", { icon: "🔐" });
      return;
    }
    if (!hasPurchasedProduct) {
      toast.error("Only verified customers who have purchased this product can leave a review.", {
        icon: "🛡️",
        duration: 5000
      });
      return;
    }
    setShowWriteReviewModal(true);
  };

  useEffect(() => {
    if (product?.id) {
      getProductReviews(product.id).then(res => {
        if (res.reviews) {
          setReviews(res.reviews.map((r: any) => ({
            id: r.id,
            author: r.user_name || "Verified Customer",
            rating: r.rating,
            content: r.comment,
            date: new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
          })));
        } else {
          setReviews([]);
        }
      });
    }
  }, [product?.id]);

  const handleAddToCart = () => {
    addToCart({ ...product, quantity: qty });
    setShowSideCart(true);
    toast.success("Added to cart!");
  };

  const handleBuyNow = (p?: any) => {
    const targetProduct = p || product;
    if (!targetProduct) return;
    addToCart({ ...targetProduct, quantity: p && p.id !== product.id ? 1 : qty }, true);
    router.push("/checkout");
  };

  const discount = product.compare_price && product.compare_price > product.selling_price
    ? Math.round(((product.compare_price - product.selling_price) / product.compare_price) * 100)
    : null;

  const saveAmount = product.compare_price && product.compare_price > product.selling_price
    ? product.compare_price - product.selling_price
    : 0;

  const inWishlist = wishlist.some(item => item.id === product.id);
  const allImages = [product.featured_image, ...(product.gallery_images || [])].filter(Boolean);
  const avgScore = reviews.length === 0 ? "4.6" : (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 flex-1 space-y-8 py-4 md:py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] md:text-xs font-semibold text-slate-400 overflow-x-auto pb-1 scrollbar-none">
          <Link href="/" className="hover:text-slate-700 shrink-0">Home</Link>
          <span>/</span>
          {product.category?.name && (
            <>
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-slate-700 shrink-0">{product.category.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="line-clamp-1 text-slate-600 font-extrabold">{product.name}</span>
        </nav>

        {/* TOP SECTION: Grid of Image (Left) & Info (Right) */}
        <div className="grid gap-6 rounded-3xl border border-slate-200/80 bg-white p-4 md:p-8 shadow-xs lg:grid-cols-2">

          {/* 1. Product Image & Gallery */}
          <div className="space-y-4">
            <div className="relative flex h-[340px] sm:h-[420px] md:h-[480px] w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-100 border border-slate-200/80">
              {activeImage ? (
                <img src={activeImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-300" />
              ) : (
                <ShoppingBag className="h-16 w-16 text-slate-300" />
              )}
              {discount && (
                <span className="absolute top-3 left-3 rounded-md bg-[#ff6600] px-2.5 py-1 text-xs font-black text-white shadow-xs">
                  -{discount}%
                </span>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    const idx = allImages.indexOf(activeImage);
                    setActiveImage(allImages[(idx - 1 + allImages.length) % allImages.length]);
                  }} 
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 border border-slate-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="scrollbar-none flex flex-1 gap-2 overflow-x-auto py-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 bg-white p-1 transition-all ${
                        activeImage === img ? "border-[#ff6600] shadow-2xs" : "border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    const idx = allImages.indexOf(activeImage);
                    setActiveImage(allImages[(idx + 1) % allImages.length]);
                  }} 
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 border border-slate-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* 2. Product Info */}
          <div className="flex flex-col gap-4 justify-between">
            <div className="space-y-3">
              {/* Store Badge Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Link
                  href={product.store?.slug ? `/stores/${product.store.slug}` : "#"}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <StoreIcon className="h-3.5 w-3.5 text-[#ff6600]" />
                  <span>{product.store?.name || "TechHub BD"}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-amber-500 font-black">★ 4.8</span>
                </Link>

                <button type="button" title="Share" className="flex items-center justify-center p-1 text-slate-500 hover:text-slate-900 cursor-pointer">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Rating & Stock Info */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <div className="flex items-center text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-1 text-slate-900 font-extrabold">{avgScore}</span>
                </div>
                <span className="text-slate-400">({reviews.length} reviews)</span>
                <span className="text-slate-300">•</span>
                {product.current_stock > 0 ? (
                  <span className="text-emerald-600 font-black">{product.current_stock} in stock</span>
                ) : (
                  <span className="text-rose-500 font-black">Out of stock</span>
                )}
              </div>

              {/* Price Row */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-3xl md:text-4xl font-black text-slate-950">৳{Number(product.selling_price).toLocaleString("en-US")}</span>
                {product.compare_price && product.compare_price > product.selling_price && (
                  <>
                    <span className="text-sm md:text-base text-slate-400 line-through font-semibold">
                      ৳{Number(product.compare_price).toLocaleString("en-US")}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-orange-100 text-[#ff6600] text-xs font-black">
                      Save ৳{saveAmount.toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pt-1">
                {product.short_desc || product.full_desc?.substring(0, 180) || `${product.name} — carefully selected for premium quality, thoughtful design, and everyday value.`}
              </p>
            </div>

            {/* Colors / Variants if any */}
            {uniqueColors.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-700">Color: <span className="text-slate-950 font-black">{selectedColor}</span></p>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((color: any) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-bold transition-all cursor-pointer ${
                        selectedColor === color ? "border-[#ff6600] bg-[#ff6600] text-white" : "border-slate-200 text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      {selectedColor === color && <Check className="h-3 w-3" />}
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Action Buttons */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1">
                  <button 
                    type="button" 
                    onClick={() => setQty(q => Math.max(1, q - 1))} 
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-white text-slate-700 shadow-2xs hover:bg-slate-100 font-bold"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-black text-slate-900">{qty}</span>
                  <button 
                    type="button" 
                    onClick={() => setQty(q => Math.min(product.current_stock || 10, q + 1))} 
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-white text-slate-700 shadow-2xs hover:bg-slate-100 font-bold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border transition-colors ${
                    inWishlist ? "border-rose-200 bg-rose-50 text-rose-500" : "border-slate-200 text-slate-500 hover:border-slate-400"
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`h-5 w-5 ${inWishlist ? "fill-rose-500" : ""}`} />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 cursor-pointer rounded-2xl border-2 border-slate-900 bg-white py-3 px-5 text-xs font-black uppercase tracking-wider text-slate-900 transition-all hover:bg-slate-100 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4" /> Add to Cart
                </button>
                <button
                  type="button"
                  onClick={() => handleBuyNow()}
                  className="flex-1 cursor-pointer rounded-2xl bg-[#ff6600] hover:bg-[#e65c00] py-3 px-5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" /> Buy Now
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 border border-slate-100 text-[10px] sm:text-xs text-slate-700 font-bold">
              <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5">
                <Truck className="h-4 w-4 text-[#ff6600] shrink-0" />
                <div>
                  <p className="font-extrabold text-slate-900">Free delivery</p>
                  <p className="text-[9px] text-slate-400 font-normal">Over ৳1500</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 border-x border-slate-200 px-1">
                <RotateCcw className="h-4 w-4 text-[#ff6600] shrink-0" />
                <div>
                  <p className="font-extrabold text-slate-900">7-day return</p>
                  <p className="text-[9px] text-slate-400 font-normal">No questions</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#ff6600] shrink-0" />
                <div>
                  <p className="font-extrabold text-slate-900">Secure pay</p>
                  <p className="text-[9px] text-slate-400 font-normal">COD available</p>
                </div>
              </div>
            </div>

            {/* Specifications Summary Grid */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Specifications</h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 rounded-2xl border border-slate-100 bg-white p-3 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-semibold">Brand</span>
                  <span className="font-extrabold text-slate-900">{product.brand?.name || "Techhub Bd"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-semibold">Warranty</span>
                  <span className="font-extrabold text-slate-900">{product.warranty || "6 Months"}</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="text-slate-400 font-semibold">Return</span>
                  <span className="font-extrabold text-slate-900">7-Day Easy Return</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="text-slate-400 font-semibold">Delivery</span>
                  <span className="font-extrabold text-slate-900">2-4 Business Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. RATINGS AND REVIEWS SECTION */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-4 md:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-950">Ratings & Reviews</h2>
              <p className="text-xs text-slate-400 font-medium">Verified customer feedback & experiences</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenWriteReviewModal}
                className="px-3 py-1.5 bg-orange-50 text-[#ff6600] border border-orange-200 hover:bg-orange-100 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <span>+ Write Review</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAllReviewsModal(true)}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1"
              >
                <span>View All ({reviews.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Show top 2/3 reviews */}
          <div className="grid md:grid-cols-3 gap-4">
            {reviews.slice(0, 3).map((r, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{r.author}</span>
                    <span className="text-[10px] text-slate-400">{r.date}</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-current" : "fill-slate-200 text-slate-200"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3">"{r.content}"</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 pt-1">
                  <Check className="h-3 w-3" /> Verified Purchase
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. QUESTIONS ABOUT THIS PRODUCT SECTION */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-4 md:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-950">Questions About This Product</h2>
              <p className="text-xs text-slate-400 font-medium">Have queries? Ask seller directly before purchasing.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAskQuestionModal(true)}
                className="px-3.5 py-1.5 bg-[#ff6600] text-white hover:bg-[#e65c00] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Ask Question</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAllQuestionsModal(true)}
                className="px-3.5 py-1.5 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-slate-200"
              >
                <span>View All ({questions.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {questions.slice(0, 2).map((q, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-white font-black text-[9px]">Q</span>
                  <p className="font-extrabold text-slate-900">{q.question}</p>
                </div>
                <div className="flex items-start gap-2 pl-5 pt-1">
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[9px]">A</span>
                  <p className="text-slate-600 font-medium">{q.answer || "Answer from seller pending..."}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. STORE INFO SECTION */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white shrink-0">
              {product.store?.name?.charAt(0) || "T"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-950">{product.store?.name || "TechHub BD"}</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">Verified Merchant</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Rating: <strong className="text-amber-500 font-extrabold">★ 4.8</strong> · 98% Positive Seller Feedback</p>
            </div>
          </div>

          <Link
            href={product.store?.slug ? `/stores/${product.store.slug}` : "/products"}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all text-center shrink-0 shadow-xs"
          >
            Visit Store
          </Link>
        </div>

        {/* 6. YOU MAY ALSO LIKE (CATEGORY RELATED PRODUCTS) */}
        {related.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div>
                <h2 className="text-lg md:text-xl font-black text-slate-950">You may also like</h2>
                <p className="text-xs text-slate-400">Related items from {product.category?.name || "this category"}</p>
              </div>

              <Link
                href={product.category?.slug ? `/categories/${product.category.slug}` : "/products"}
                className="text-xs font-black text-[#ff6600] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.slice(0, 4).map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  wishlist={wishlist}
                  onToggleWishlist={toggleWishlist}
                  onAddToCart={(prod: any) => { addToCart(prod); setShowSideCart(true); }}
                  onBuyNow={handleBuyNow}
                  onInfoClick={setQuickViewProduct}
                />
              ))}
            </div>
          </div>
        )}

        {/* 7. JUST FOR YOU (OTHER CATEGORIES PRODUCTS) */}
        {justForYou.length > 0 && (
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div>
                <h2 className="text-lg md:text-xl font-black text-slate-950">Just For You</h2>
                <p className="text-xs text-slate-400">Recommended items curated based on your preferences</p>
              </div>

              <Link
                href="/products"
                className="text-xs font-black text-[#ff6600] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {justForYou.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  wishlist={wishlist}
                  onToggleWishlist={toggleWishlist}
                  onAddToCart={(prod: any) => { addToCart(prod); setShowSideCart(true); }}
                  onBuyNow={handleBuyNow}
                  onInfoClick={setQuickViewProduct}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ALL REVIEWS MODAL */}
      {showAllReviewsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <h3 className="text-base font-black text-slate-900">All Customer Reviews ({reviews.length})</h3>
              <button onClick={() => setShowAllReviewsModal(false)} className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {reviews.map((r, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{r.author}</span>
                    <span className="text-[10px] text-slate-400">{r.date}</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-current" : "fill-slate-200 text-slate-200"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">"{r.content}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* WRITE REVIEW MODAL */}
      {showWriteReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Write a Review</h3>
              <button onClick={() => setShowWriteReviewModal(false)} className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Your Rating</label>
                <div className="flex gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setNewReviewRating(s)} className="cursor-pointer">
                      <Star className={`h-6 w-6 ${s <= newReviewRating ? "fill-current" : "fill-slate-200 text-slate-200"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Review Details</label>
                <textarea
                  rows={4}
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="Share your experience with this item..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 font-medium focus:outline-none focus:border-[#ff6600]"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!newReviewText.trim()) return;
                  setReviews([{ author: user?.fullName || "Verified Buyer", rating: newReviewRating, content: newReviewText, date: new Date().toLocaleDateString("en-US") }, ...reviews]);
                  setNewReviewText("");
                  setShowWriteReviewModal(false);
                  toast.success("Review submitted!");
                }}
                className="w-full py-3 bg-[#ff6600] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#e65c00] cursor-pointer shadow-xs"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALL QUESTIONS MODAL */}
      {showAllQuestionsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <h3 className="text-base font-black text-slate-900">All Product Questions ({questions.length})</h3>
              <button onClick={() => setShowAllQuestionsModal(false)} className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {questions.map((q, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-white font-black text-[9px]">Q</span>
                    <p className="font-extrabold text-slate-900">{q.question}</p>
                  </div>
                  <div className="flex items-start gap-2 pl-5">
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[9px]">A</span>
                    <p className="text-slate-600 font-medium">{q.answer || "Pending response from seller..."}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ASK QUESTION MODAL */}
      {showAskQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Ask a Question</h3>
              <button onClick={() => setShowAskQuestionModal(false)} className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Your Question</label>
                <textarea
                  rows={4}
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Ask the merchant about warranty, size, compatibility..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 font-medium focus:outline-none focus:border-[#ff6600]"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!newQuestionText.trim()) return;
                  setQuestions([{ question: newQuestionText, answer: null, date: new Date().toLocaleDateString("en-US") }, ...questions]);
                  setNewQuestionText("");
                  setShowAskQuestionModal(false);
                  toast.success("Question submitted to seller!");
                }}
                className="w-full py-3 bg-[#ff6600] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#e65c00] cursor-pointer shadow-xs"
              >
                Post Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side Cart Drawer */}
      {showSideCart && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 cursor-pointer bg-black/50" onClick={() => setShowSideCart(false)} />
          <div className="relative flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#ff6600]" />
                <h3 className="text-base font-extrabold text-slate-900">Shopping Cart</h3>
                <span className="rounded-full bg-[#ff6600] px-2 py-0.5 text-[10px] font-black text-white">
                  {cart.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              </div>
              <button onClick={() => setShowSideCart(false)} className="cursor-pointer rounded-full p-1.5 text-slate-500 hover:bg-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
                  <ShoppingBag className="h-14 w-14 opacity-20" />
                  <p className="text-sm font-bold">Your cart is empty.</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <img src={item.image || "https://placehold.co/200x200/png"} alt={item.name} className="h-16 w-16 rounded-xl border border-slate-200 bg-white object-contain" />
                    <div className="flex flex-1 flex-col justify-between">
                      <h4 className="line-clamp-2 text-xs font-bold leading-tight text-slate-900">{item.name}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-slate-950">৳{item.price}</span>
                        <span className="text-[11px] font-bold text-slate-500">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3 border-t border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-extrabold uppercase text-slate-500">Subtotal</span>
                <span className="text-lg font-black text-slate-950">
                  ৳{cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowSideCart(false)} className="flex-1 cursor-pointer rounded-xl bg-slate-200 py-3 text-xs font-black uppercase text-slate-700 hover:bg-slate-300">
                  Shop More
                </button>
                <button onClick={() => router.push("/checkout")} className="flex-1 cursor-pointer rounded-xl bg-[#ff6600] py-3 text-xs font-black uppercase text-white hover:bg-[#e65c00]">
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* 8. FOOTER */}
      <Footer />
    </div>
  );
}