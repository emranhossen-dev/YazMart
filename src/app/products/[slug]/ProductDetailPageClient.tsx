"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShopStore } from "@/store/shop-store";
import { ShoppingCart, Heart, Shield, Package, ArrowLeft, ShoppingBag } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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

  const { cart, wishlist, addToCart, toggleWishlist } = useShopStore();

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product);
    router.push("/checkout");
  };

  const discount = product.compare_price && product.compare_price > product.selling_price
    ? Math.round(((product.compare_price - product.selling_price) / product.compare_price) * 100)
    : null;

  const inWishlist = wishlist.some(item => item.id === product.id);

  // Combine featured image with gallery images for the preview strip
  const allImages = [product.featured_image, ...(product.gallery_images || [])].filter(Boolean);

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

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-12">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:underline">
          <ArrowLeft className="h-3 w-3" /> Back to Storefront
        </Link>

        {/* Product Details Section */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="h-96 border border-[var(--border)] rounded-2xl bg-[var(--card)] flex items-center justify-center p-6 overflow-hidden relative">
              {activeImage ? (
                <img src={activeImage} alt={product.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <ShoppingBag className="h-16 w-16 text-[var(--border)]" />
              )}
            </div>

            {/* Thumbnail Preview Strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-xl border p-1 bg-[var(--card)] overflow-hidden cursor-pointer flex-shrink-0 ${
                      activeImage === img ? "border-blue-500 ring-2 ring-blue-500/20" : "border-[var(--border)] hover:border-blue-400"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Buy Details */}
          <div className="space-y-5 text-[var(--foreground)]">
            <div>
              <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-md uppercase">
                {product.category?.name || "General Catalog"}
              </span>
              <h1 className="text-2xl md:text-4xl font-black mt-2 leading-tight">{product.name}</h1>
              <p className="text-xs text-[var(--muted-foreground)] font-mono mt-1">SKU: {product.sku}</p>
            </div>

            {/* Prices */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black text-blue-500">${product.selling_price.toFixed(2)}</span>
              {product.compare_price && (
                <>
                  <span className="line-through text-xs text-[var(--muted-foreground)]">${product.compare_price.toFixed(2)}</span>
                  <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-md">Save {discount}%</span>
                </>
              )}
            </div>

            {/* Short specs */}
            {product.short_desc && (
              <p className="text-xs md:text-sm text-[var(--muted-foreground)] font-normal leading-relaxed">
                {product.short_desc}
              </p>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-4 text-xs font-bold border-y border-[var(--border)] py-3">
              <span>Stock status:</span>
              {product.current_stock > 0 ? (
                <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">In Stock ({product.current_stock} units left)</span>
              ) : (
                <span className="text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">Out of Stock</span>
              )}
            </div>

            {/* Quantity select & Buy controls */}
            {product.current_stock > 0 && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center border border-[var(--border)] rounded-lg bg-[var(--card)] w-fit">
                  <button 
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-3 py-1.5 hover:bg-[var(--accent)] font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-black font-mono">{qty}</span>
                  <button 
                    onClick={() => setQty(q => Math.min(product.current_stock, q + 1))}
                    className="px-3 py-1.5 hover:bg-[var(--accent)] font-bold text-xs"
                  >
                    +
                  </button>
                </div>

                <div className="flex-1 flex gap-2">
                  <button 
                    onClick={() => {
                      addToCart(product);
                      for (let i = 1; i < qty; i++) addToCart(product);
                    }}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                  >
                    Buy Now
                  </button>
                  <button 
                    onClick={() => toggleWishlist(product)}
                    className="p-3 border border-[var(--border)] hover:bg-[var(--accent)] rounded-xl cursor-pointer transition-colors"
                  >
                    <Heart className={`h-4.5 w-4.5 ${inWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed specifications tabbed view */}
        <div className="grid gap-8 lg:grid-cols-3 pt-6 border-t border-[var(--border)]">
          {/* Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--muted-foreground)]">Product Specifications</h3>
            
            {product.full_desc && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-zinc-400">Detailed Description</h4>
                <p className="text-xs text-[var(--foreground)] font-normal leading-relaxed whitespace-pre-line bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
                  {product.full_desc}
                </p>
              </div>
            )}

            {/* Technical specification JSON mapping */}
            {product.specifications && typeof product.specifications === "object" && Object.keys(product.specifications).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-zinc-400">Technical Details</h4>
                <div className="border border-[var(--border)] rounded-xl overflow-hidden text-xs">
                  {Object.entries(product.specifications).map(([key, val]: any, i) => (
                    <div key={i} className="grid grid-cols-2 divide-x divide-[var(--border)] border-b border-[var(--border)] last:border-b-0">
                      <span className="p-3 bg-[var(--card)] font-bold text-zinc-400">{key}</span>
                      <span className="p-3 bg-[var(--background)] font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Usability instruction */}
            {product.usability && (
              <div className="space-y-2 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                <h4 className="text-xs font-bold uppercase text-blue-500 flex items-center gap-1.5">
                  <Shield className="h-4 w-4" /> Guidelines & Usage Instructions
                </h4>
                <p className="text-xs font-normal leading-relaxed text-[var(--muted-foreground)]">{product.usability}</p>
              </div>
            )}
          </div>

          {/* Package and warranty side ledger */}
          <div className="space-y-4 bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-xs h-fit text-xs font-medium">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] mb-3">Service & Shipping Matrix</h3>
            
            <div className="flex gap-3 py-3 border-b border-[var(--border)]">
              <Package className="h-5 w-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-[10px] uppercase text-zinc-400">Package Includes</p>
                <p className="text-xs font-bold mt-0.5">{product.package_includes || "Standard Box Contents"}</p>
              </div>
            </div>

            <div className="flex gap-3 py-3 border-b border-[var(--border)]">
              <Shield className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-[10px] uppercase text-zinc-400">Warranty details</p>
                <p className="text-xs font-bold mt-0.5">{product.warranty || "No warranty coverage details declared."}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products list */}
        {related.length > 0 && (
          <div className="space-y-6 pt-12 border-t border-[var(--border)]">
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--muted-foreground)]">Related Items</h2>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              {related.map((p) => (
                <div key={p.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden flex flex-col p-4 space-y-3 shadow-xs hover:border-blue-500/35 transition-colors text-[var(--foreground)]">
                  <Link href={`/products/${p.slug}`} className="h-32 bg-[var(--background)] flex items-center justify-center rounded-lg overflow-hidden p-2">
                    <img src={p.featured_image} alt="" className="max-h-full max-w-full object-contain" />
                  </Link>
                  <div>
                    <h4 className="font-bold text-xs line-clamp-1 hover:text-blue-500"><Link href={`/products/${p.slug}`}>{p.name}</Link></h4>
                    <span className="text-xs font-black text-blue-500 mt-1 block">${p.selling_price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
