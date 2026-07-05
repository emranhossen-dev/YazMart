"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShopStore } from "@/store/shop-store";
import { useAuthStore } from "@/store/auth-store";
import { signOutAction } from "@/actions/auth";
import toast from "react-hot-toast";
import {
  ShoppingCart, Heart, ShieldCheck, Package, ShoppingBag, Star,
  Frown, Truck, RotateCcw, Share2, ChevronLeft, ChevronRight, X,
  Minus, Plus, Check
} from "lucide-react";

interface ProductDetailPageClientProps {
  initialProduct: any;
  initialRelated: any[];
}

/* Shared rounded product card — used for "You may also like".
   Matches the confirmed site-wide card language: rounded corners,
   soft shadow, neutral image tile, outline "Add to Cart" + solid
   "Buy Now" side by side. */
function ProductCard({ product, wishlist, onToggleWishlist, onAddToCart, onBuyNow }: any) {
  const discount = product.compare_price && product.compare_price > product.selling_price
    ? Math.round(((product.compare_price - product.selling_price) / product.compare_price) * 100)
    : null;
  const inWishlist = wishlist.some((item: any) => item.id === product.id);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <div className="relative">
        {discount && (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        )}
        <button
          type="button"
          onClick={() => onToggleWishlist(product)}
          aria-label="Toggle wishlist"
          className="absolute top-3 right-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/95 shadow-sm transition-colors hover:text-rose-500"
        >
          <Heart className={`h-4 w-4 ${inWishlist ? "fill-rose-500 text-rose-500" : "text-zinc-500"}`} />
        </button>

        <Link href={`/products/${product.slug}`} className="flex h-52 items-center justify-center bg-[var(--surface-container-low)] p-6">
          <img src={product.featured_image} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" />
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h4 className="line-clamp-1 text-sm font-semibold text-zinc-900">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h4>

        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <div className="flex text-amber-400">
            {[1, 2, 3, 4].map(s => <Star key={s} className="h-3 w-3 fill-current" />)}
            <Star className="h-3 w-3 fill-current opacity-40" />
          </div>
          <span>4.6</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-zinc-900">৳{product.selling_price.toLocaleString("en-US")}</span>
          {product.compare_price && (
            <span className="text-xs text-zinc-400 line-through">৳{product.compare_price.toLocaleString("en-US")}</span>
          )}
        </div>

        <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
          <Truck className="h-3.5 w-3.5" /> Free shipping
        </p>

        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-zinc-200 py-2 text-[11px] font-semibold text-zinc-700 transition-colors hover:border-zinc-400"
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
          </button>
          <button
            type="button"
            onClick={() => onBuyNow(product)}
            className="flex-1 cursor-pointer rounded-full bg-zinc-900 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-zinc-700"
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
}: ProductDetailPageClientProps) {
  const router = useRouter();

  const [product] = useState<any>(initialProduct);
  const [related] = useState<any[]>(initialRelated);
  const [activeImage, setActiveImage] = useState(product.featured_image || "");
  const [qty, setQty] = useState(1);
  const [descExpanded, setDescExpanded] = useState(false);

  // Variant selection — derived from real ProductVariants if present
  const variants: any[] = product.variants || [];
  const uniqueColors = Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean)));
  const uniqueSizes = Array.from(new Set(variants.map((v: any) => v.size).filter(Boolean)));
  const [selectedColor, setSelectedColor] = useState<string | null>(uniqueColors[0] || null);
  const [selectedSize, setSelectedSize] = useState<string | null>(uniqueSizes[0] || null);

  const [reviews, setReviews] = useState<any[]>([
    { author: "Rahat H.", rating: 5, content: "Exactly as described. Fast delivery and great packaging.", date: "2026-06-25" },
    { author: "Milon K.", rating: 4, content: "Good quality for the price. Would order again.", date: "2026-06-28" }
  ]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);

  const [questions, setQuestions] = useState<any[]>([
    { question: "Does this come with an official warranty card?", answer: "Yes, every unit ships with the manufacturer warranty card included.", date: "2026-06-29" }
  ]);
  const [newQuestionText, setNewQuestionText] = useState("");

  const { cart, wishlist, addToCart, toggleWishlist } = useShopStore();
  const { user } = useAuthStore();

  const [showSideCart, setShowSideCart] = useState(false);

  // Guest checkout supported — no login required to add to cart or buy.
  const handleAddToCart = () => {
    addToCart({ ...product, quantity: qty });
    setShowSideCart(true);
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

  const inWishlist = wishlist.some(item => item.id === product.id);
  const allImages = [product.featured_image, ...(product.gallery_images || [])].filter(Boolean);
  const avgScore = reviews.length === 0 ? "0.0" : (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)] font-sans">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 font-display text-xl font-bold tracking-tight text-[var(--foreground)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--foreground)] text-[var(--background)]">
              <ShoppingBag className="h-4 w-4" />
            </span>
            Yaz<span style={{ color: "var(--primary)" }}>Mart</span>
          </Link>

          <div className="flex shrink-0 items-center gap-1">
            <Link href="/wishlist" className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]">
              <Heart className="h-[18px] w-[18px]" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--primary)] text-[8px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]">
              <ShoppingCart className="h-[18px] w-[18px]" />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--primary)] text-[8px] font-bold text-white">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>

            {user ? (
              <div className="group relative ml-1">
                <button className="flex cursor-pointer items-center gap-1.5 rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-bold text-[var(--foreground)]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-[9px] font-bold uppercase text-white">
                    {user.fullName?.charAt(0) || "U"}
                  </span>
                  <span className="hidden max-w-[70px] truncate md:inline">{user.fullName || "Account"}</span>
                </button>
                <div className="absolute right-0 top-full z-50 hidden w-40 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1.5 text-xs shadow-lg group-hover:block">
                  {user.role === "admin" && (
                    <Link href="/admin" className="block rounded-lg px-3 py-2 font-bold hover:bg-[var(--accent)]">Admin Panel</Link>
                  )}
                  <button onClick={async () => { await signOutAction(); window.location.reload(); }} className="w-full cursor-pointer rounded-lg px-3 py-2 text-left font-bold text-rose-500 hover:bg-[var(--accent)]">
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/auth" className="ml-1 rounded-full bg-[var(--foreground)] px-4 py-2 text-xs font-bold text-[var(--background)]">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-10 px-4 py-8 md:px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-medium text-zinc-400">
          <Link href="/" className="hover:text-zinc-700">Home</Link>
          <span>/</span>
          {product.category?.name && (
            <>
              <Link href={`/categories/${product.category.slug}`} className="hover:text-zinc-700">{product.category.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="line-clamp-1 text-zinc-600">{product.name}</span>
        </nav>

        {/* Main product panel */}
        <div className="grid gap-8 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm lg:grid-cols-2 lg:p-8">

          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative flex h-[420px] items-center justify-center overflow-hidden rounded-2xl bg-[var(--surface-container-low)] p-8">
              {activeImage ? (
                <img src={activeImage} alt={product.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <ShoppingBag className="h-16 w-16 text-zinc-300" />
              )}
              {discount && (
                <span className="absolute top-4 left-4 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-bold text-white">
                  -{discount}% OFF
                </span>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => {
                  const idx = allImages.indexOf(activeImage);
                  setActiveImage(allImages[(idx - 1 + allImages.length) % allImages.length]);
                }} className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="scrollbar-none flex flex-1 gap-2 overflow-x-auto">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 bg-white p-1 transition-colors ${
                        activeImage === img ? "border-zinc-900" : "border-zinc-100 hover:border-zinc-300"
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => {
                  const idx = allImages.indexOf(activeImage);
                  setActiveImage(allImages[(idx + 1) % allImages.length]);
                }} className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Purchase panel */}
          <div className="flex flex-col gap-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{product.brand?.name || "General"}</p>
              <h1 className="text-2xl font-bold leading-snug text-zinc-900">{product.name}</h1>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(Number(avgScore)) ? "fill-current" : "fill-zinc-200 text-zinc-200"}`} />
                    ))}
                  </div>
                  <span className="font-medium">{avgScore} ({reviews.length} reviews)</span>
                </div>
                <div className="flex gap-1">
                  <button type="button" className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100" title="Share">
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100"
                    title="Add to wishlist"
                  >
                    <Heart className={`h-4 w-4 ${inWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-3 border-y border-zinc-100 py-4">
              <span className="text-3xl font-bold text-zinc-900">৳{product.selling_price.toLocaleString("en-US")}</span>
              {product.compare_price && (
                <>
                  <span className="text-sm text-zinc-400 line-through">৳{product.compare_price.toLocaleString("en-US")}</span>
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-500">-{discount}%</span>
                </>
              )}
            </div>

            {uniqueColors.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-500">Color: <span className="text-zinc-900">{selectedColor}</span></p>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((color: any) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors cursor-pointer ${
                        selectedColor === color ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-700 hover:border-zinc-400"
                      }`}
                    >
                      {selectedColor === color && <Check className="h-3 w-3" />}
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {uniqueSizes.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-500">Size: <span className="text-zinc-900">{selectedSize}</span></p>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((size: any) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`flex h-9 items-center rounded-full border px-3.5 text-xs font-semibold transition-colors cursor-pointer ${
                        selectedSize === size ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-700 hover:border-zinc-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-zinc-500">Quantity</span>
              <div className="flex items-center rounded-full border border-zinc-200">
                <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} className="flex h-9 w-9 cursor-pointer items-center justify-center text-zinc-500 hover:text-zinc-900">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-zinc-900">{qty}</span>
                <button type="button" onClick={() => setQty(q => Math.min(product.current_stock || 10, q + 1))} className="flex h-9 w-9 cursor-pointer items-center justify-center text-zinc-500 hover:text-zinc-900">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              {product.current_stock > 0 ? (
                <span className="text-xs font-medium text-emerald-600">In stock</span>
              ) : (
                <span className="text-xs font-medium text-rose-500">Out of stock</span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-900 py-3.5 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-50"
              >
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </button>
              <button
                type="button"
                onClick={() => handleBuyNow()}
                className="flex-1 cursor-pointer rounded-full bg-zinc-900 py-3.5 text-sm font-bold text-white transition-colors hover:bg-zinc-700"
              >
                Buy Now
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl bg-[var(--surface-container-low)] p-4 text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 shrink-0 text-emerald-600" /> Free shipping over ৳1000
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 shrink-0 text-zinc-500" /> 14-day easy return
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-zinc-500" /> Cash on delivery available
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 shrink-0 text-zinc-500" /> Checkout without an account
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-5 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-bold text-zinc-900">Product Description</h2>

          <div className="relative">
            <div className={`space-y-6 overflow-hidden transition-all duration-500 ${descExpanded ? "max-h-none" : "max-h-[260px]"}`}>
              <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-600">
                {product.full_desc || "Full product details and specifications for this item."}
              </p>

              {product.specifications && typeof product.specifications === "object" && Object.keys(product.specifications).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Specifications</h3>
                  <div className="overflow-hidden rounded-xl border border-zinc-100 text-sm">
                    {Object.entries(product.specifications).map(([key, val]: any, i) => (
                      <div key={i} className="grid grid-cols-2 border-b border-zinc-100 last:border-b-0">
                        <span className="bg-zinc-50 p-3 font-medium text-zinc-500">{key}</span>
                        <span className="p-3 font-medium text-zinc-800">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3 rounded-xl bg-zinc-50 p-4">
                  <Package className="h-5 w-5 shrink-0 text-zinc-500" />
                  <div>
                    <p className="text-[10px] font-bold uppercase text-zinc-400">Package Includes</p>
                    <p className="mt-0.5 text-sm font-semibold text-zinc-800">{product.package_includes || "Standard box contents"}</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-xl bg-zinc-50 p-4">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
                  <div>
                    <p className="text-[10px] font-bold uppercase text-zinc-400">Warranty</p>
                    <p className="mt-0.5 text-sm font-semibold text-zinc-800">{product.warranty || "No warranty declared"}</p>
                  </div>
                </div>
              </div>

              {!descExpanded && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
              )}
            </div>

            <div className="mt-6 flex justify-center border-t border-zinc-100 pt-5">
              <button
                type="button"
                onClick={() => setDescExpanded(!descExpanded)}
                className="cursor-pointer rounded-full border border-zinc-200 px-6 py-2 text-xs font-bold text-zinc-600 transition-colors hover:border-zinc-400"
              >
                {descExpanded ? "Show less" : "Show more"}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="space-y-6 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-bold text-zinc-900">Ratings &amp; Reviews</h2>

          <div className="grid items-center gap-8 border-b border-zinc-100 pb-6 md:grid-cols-3">
            <div className="space-y-2 text-center md:border-r md:border-zinc-100 md:pr-6">
              <div className="text-5xl font-bold text-zinc-900">{avgScore}<span className="text-lg font-normal text-zinc-400">/5</span></div>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-5 w-5 ${s <= Math.round(Number(avgScore)) ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200"}`} />
                ))}
              </div>
              <p className="text-xs font-medium text-zinc-400">{reviews.length} ratings</p>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter(r => r.rating === stars).length;
                const pct = reviews.length === 0 ? 0 : Math.round((count / reviews.length) * 100);
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs font-medium">
                    <span className="w-10 shrink-0 text-zinc-500">{stars} star</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                      <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right font-bold text-zinc-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="space-y-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 py-12 text-center">
              <Frown className="mx-auto h-8 w-8 text-zinc-300" />
              <p className="text-sm font-bold text-zinc-700">No reviews yet</p>
              <p className="text-xs text-zinc-400">Be the first to share your experience.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {reviews.map((r, i) => (
                <div key={i} className="space-y-2 py-4 first:pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold uppercase text-zinc-600">
                        {r.author.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-zinc-700">{r.author}</span>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-400">{r.date}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200"}`} />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-600">{r.content}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4 rounded-xl bg-zinc-50 p-5">
            <h4 className="text-xs font-bold uppercase text-zinc-500">Write a review</h4>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-zinc-500">Your rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setNewReviewRating(s)} className="cursor-pointer transition-transform hover:scale-110">
                    <Star className={`h-5 w-5 ${s <= newReviewRating ? "fill-amber-400 text-amber-400" : "fill-zinc-300 text-zinc-300"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                placeholder="Share your experience..."
                className="flex-1 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-300"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newReviewText.trim()) return;
                  setReviews([...reviews, { author: user?.fullName || "Verified Buyer", rating: newReviewRating, content: newReviewText, date: new Date().toLocaleDateString("en-US") }]);
                  setNewReviewText("");
                  setNewReviewRating(5);
                }}
                className="cursor-pointer rounded-full bg-zinc-900 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-zinc-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* Q&A */}
        <div className="space-y-6 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-bold text-zinc-900">Questions about this product</h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-300"
            />
            <button
              type="button"
              onClick={() => {
                if (!newQuestionText.trim()) return;
                setQuestions([...questions, { question: newQuestionText, answer: null, date: new Date().toLocaleDateString("en-US") }]);
                setNewQuestionText("");
              }}
              className="cursor-pointer rounded-full bg-zinc-900 px-6 py-3 text-xs font-bold text-white transition-colors hover:bg-zinc-700"
            >
              Ask
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="space-y-2 rounded-xl border border-dashed border-zinc-200 py-12 text-center">
              <p className="text-sm font-bold text-zinc-500">No questions yet</p>
              <p className="text-xs text-zinc-400">Ask the seller and their answer will show here.</p>
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-zinc-100">
              {questions.map((q, i) => (
                <div key={i} className="space-y-3 py-4 text-sm first:pt-0">
                  <div className="flex gap-2.5">
                    <span className="h-fit shrink-0 rounded-md bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Q</span>
                    <div>
                      <p className="font-semibold text-zinc-800">{q.question}</p>
                      <p className="font-mono text-[10px] text-zinc-400">Asked on {q.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 pl-5">
                    <span className="h-fit shrink-0 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">A</span>
                    <p className="text-zinc-600">{q.answer || "Thank you for asking! The seller usually replies within 12 hours."}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="space-y-6 border-t border-zinc-100 pt-10">
            <h2 className="text-xl font-bold text-zinc-900">You may also like</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  wishlist={wishlist}
                  onToggleWishlist={toggleWishlist}
                  onAddToCart={(prod: any) => { addToCart(prod); setShowSideCart(true); }}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-4 border-t border-zinc-900 bg-zinc-950 text-zinc-400">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 text-left text-xs font-medium sm:grid-cols-2 md:grid-cols-3 md:px-6 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="font-display text-2xl font-black uppercase tracking-tight text-white">YazMart</Link>
            <p className="max-w-xs leading-relaxed text-zinc-500">Curated shopping for people who care about the details.</p>
          </div>
          <div>
            <h4 className="mb-4 text-[10px] font-black uppercase tracking-wider text-white">Support</h4>
            <ul className="space-y-3 text-zinc-500">
              <li><Link href="#" className="hover:text-white">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white">Shipping &amp; Returns</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-[10px] font-black uppercase tracking-wider text-white">Legal</h4>
            <ul className="space-y-3 text-zinc-500">
              <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between border-t border-zinc-900 px-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 md:px-6">
          <p>&copy; 2026 YazMart</p>
          <div className="flex gap-4">
            <span>Visa</span><span>Mastercard</span><span>bKash</span><span>Nagad</span>
          </div>
        </div>
      </footer>

      {/* Side cart */}
      {showSideCart && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 cursor-pointer bg-black/50" onClick={() => setShowSideCart(false)} />
          <div className="relative flex h-full w-full max-w-sm flex-col border-l border-zinc-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 p-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-zinc-900" />
                <h3 className="text-base font-bold text-zinc-900">Your Cart</h3>
                <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-white">
                  {cart.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              </div>
              <button onClick={() => setShowSideCart(false)} className="cursor-pointer rounded-full p-1.5 text-zinc-500 hover:bg-zinc-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-400">
                  <ShoppingBag className="h-14 w-14 opacity-20" />
                  <p className="text-sm font-medium">Your cart is empty.</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                    <img src={item.image || "https://placehold.co/200x200/png"} alt={item.name} className="h-16 w-16 rounded-lg border border-zinc-100 bg-white object-contain" />
                    <div className="flex flex-1 flex-col justify-between">
                      <h4 className="line-clamp-2 text-xs font-semibold leading-tight text-zinc-800">{item.name}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-zinc-900">৳{item.price}</span>
                        <span className="text-[11px] font-medium text-zinc-400">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-4 border-t border-zinc-100 bg-zinc-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold uppercase text-zinc-500">Subtotal</span>
                <span className="text-lg font-bold text-zinc-900">
                  ৳{cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowSideCart(false)} className="flex-1 cursor-pointer rounded-full bg-zinc-200 py-3 text-xs font-bold uppercase text-zinc-600 transition-colors hover:bg-zinc-300">
                  Continue Shopping
                </button>
                <button onClick={() => router.push("/checkout")} className="flex-1 cursor-pointer rounded-full bg-zinc-900 py-3 text-xs font-bold uppercase text-white transition-colors hover:bg-zinc-700">
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}