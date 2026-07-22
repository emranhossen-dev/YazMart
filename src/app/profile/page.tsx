"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useShopStore } from "@/store/shop-store";
import { getCustomerOrders } from "@/actions/orders";
import { getUserCoins } from "@/actions/reviews";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "@/app/not-found";
import { 
  User, Package, ShoppingCart, Heart, Coins, Truck, Star, Loader2
} from "lucide-react";

import toast from "react-hot-toast";

// Unified Status Stages Order
const PARCEL_STAGES = [
  { key: "TAKEN", label: "Parcel Taken", icon: "📦", desc: "Order received & registered" },
  { key: "CONFIRMED", label: "Confirmed", icon: "✅", desc: "Order confirmed by store" },
  { key: "PROCESSED", label: "Processed", icon: "⚙️", desc: "Item packaged & prepared" },
  { key: "SHIPPED", label: "Handed Over / Shipped", icon: "🚚", desc: "Handed over to delivery partner" },
  { key: "IN_TRANSIT", label: "In Transit", icon: "🛣️", desc: "On the way to destination" },
  { key: "DELIVERED", label: "Delivered", icon: "🎉", desc: "Parcel successfully delivered" },
];

function getStageIndex(status: string): number {
  const norm = (status || "").toUpperCase();
  if (norm === "PENDING" || norm === "TAKEN" || norm === "AWAITING_PAYMENT") return 0;
  if (norm === "CONFIRMED") return 1;
  if (norm === "PROCESSED" || norm === "PROCESSING") return 2;
  if (norm === "SHIPPED") return 3;
  if (norm === "IN_TRANSIT") return 4;
  if (norm === "DELIVERED" || norm === "COMPLETED") return 5;
  
  const idx = PARCEL_STAGES.findIndex(s => s.key === norm);
  return idx !== -1 ? idx : 0;
}

function CustomerProfileContent() {
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab");
  const { user, isLoading: authLoading, openAuthModal } = useAuthStore();
  const { cart, wishlist, removeFromCart, removeFromWishlist, addToCart } = useShopStore();

  if (!authLoading && !user) {
    return <NotFound />;
  }

  const [activeTab, setActiveTab] = useState<"orders" | "cart" | "wishlist" | "coins" | "account">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [coins, setCoins] = useState(0);

  // Sync tab query parameter if passed in URL
  useEffect(() => {
    if (tabQuery) {
      if (tabQuery === "tracking") {
        setActiveTab("orders");
      } else if (["orders", "cart", "wishlist", "coins", "account"].includes(tabQuery)) {
        setActiveTab(tabQuery as any);
      }
    }
  }, [tabQuery]);

  // (Reviews are admin-only — no customer review state needed)

  useEffect(() => {
    if (user) {
      fetchCustomerData();
    }
  }, [user]);

  const fetchCustomerData = async () => {
    if (!user) return;
    setLoadingOrders(true);

    const [ordersRes, coinsRes] = await Promise.all([
      getCustomerOrders({ userId: user.id, email: user.email || undefined }),
      getUserCoins(user.id),
    ]);

    if (ordersRes.orders) setOrders(ordersRes.orders);
    if (coinsRes.coins !== undefined) setCoins(coinsRes.coins);
    setLoadingOrders(false);
  };



  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 font-sans">
        <Header />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 text-center">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm max-w-md mx-auto space-y-4">
            <User className="h-12 w-12 text-zinc-400 mx-auto" />
            <h2 className="text-xl font-bold text-zinc-900">Sign In to View Dashboard</h2>
            <p className="text-xs text-zinc-500">Log in to track your orders, write reviews, manage cart, wishlist, and redeem reward coins.</p>
            <button
              onClick={() => openAuthModal("login")}
              className="w-full py-3 bg-[#ff6600] hover:bg-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Sign In / Register
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900">
      <Header />

      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 py-8 space-y-8">
        {/* Profile Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-slate-800">
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-16 w-16 rounded-full bg-[#ff6600] border-4 border-white/20 flex items-center justify-center text-2xl font-black uppercase text-white shadow-inner shrink-0">
              {user.fullName?.charAt(0) || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">{user.fullName || "Customer"}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ff6600]/20 border border-[#ff6600]/40 text-[#ff6600] text-[10px] font-bold uppercase tracking-wider">Verified Buyer</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{user.email || "No email linked"}</p>
            </div>
          </div>

          {/* Reward Coins Badge */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 relative z-10 shrink-0">
            <span className="text-3xl">🪙</span>
            <div>
              <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Reward Coins</p>
              <p className="text-xl font-black text-white">{coins} <span className="text-xs font-semibold text-amber-200">Coins</span></p>
              <p className="text-[9px] text-slate-300">Worth ৳{coins} discount on orders</p>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px scrollbar-none">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
              activeTab === "orders" ? "border-[#ff6600] text-[#ff6600] bg-orange-50/60" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Package className="h-4 w-4" /> My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("cart")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
              activeTab === "cart" ? "border-[#ff6600] text-[#ff6600] bg-orange-50/60" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <ShoppingCart className="h-4 w-4" /> Cart ({cart.length})
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
              activeTab === "wishlist" ? "border-[#ff6600] text-[#ff6600] bg-orange-50/60" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Heart className="h-4 w-4" /> Wishlist ({wishlist.length})
          </button>
          <button
            onClick={() => setActiveTab("coins")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
              activeTab === "coins" ? "border-[#ff6600] text-[#ff6600] bg-orange-50/60" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Coins className="h-4 w-4 text-amber-500" /> Reward Coins
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
              activeTab === "account" ? "border-[#ff6600] text-[#ff6600] bg-orange-50/60" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <User className="h-4 w-4" /> Account Info
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {loadingOrders ? (
              <div className="py-12 text-center text-zinc-400 flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-xs font-semibold">Loading purchase & tracking records...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-zinc-200 text-center space-y-3">
                <Package className="h-10 w-10 text-zinc-300 mx-auto" />
                <h3 className="text-sm font-bold text-zinc-700">No orders placed yet</h3>
                <p className="text-xs text-zinc-400">Your purchased items and real-time parcel tracking will appear here.</p>
                <Link href="/products" className="inline-block px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors">
                  Explore Shop
                </Link>
              </div>
            ) : (
              orders.map((order) => {
                const currentStageIdx = getStageIndex(order.status);
                const isCancelled = order.status === "CANCELLED";

                return (
                  <div key={order.id} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-6">
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-blue-600">#{order.id.slice(0, 8).toUpperCase()}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            isCancelled ? "bg-rose-100 text-rose-700" :
                            order.status === "DELIVERED" ? "bg-emerald-100 text-emerald-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-medium mt-1">
                          Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-xs text-zinc-400 font-semibold">Total Amount</p>
                        <p className="text-lg font-black text-zinc-950">৳{order.total_amount.toLocaleString()}</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase">{order.payment_method || "COD"}</p>
                      </div>
                    </div>

                    {/* Parcel Tracking Progress Pipeline */}
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                        <Truck className="h-4 w-4 text-blue-600" /> Live Parcel Tracking
                      </h4>

                      {isCancelled ? (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
                          <span>❌</span> This order was cancelled.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                          {PARCEL_STAGES.map((stage, idx) => {
                            const isPassed = idx <= currentStageIdx;
                            const isCurrent = idx === currentStageIdx;

                            return (
                              <div
                                key={stage.key}
                                className={`p-3 rounded-2xl border text-center relative transition-all ${
                                  isCurrent
                                    ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300"
                                    : isPassed
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                    : "bg-zinc-50 border-zinc-200 text-zinc-400"
                                }`}
                              >
                                <span className="text-xl block mb-1">{stage.icon}</span>
                                <p className={`text-[10px] font-black uppercase tracking-tight ${isCurrent ? "text-white" : isPassed ? "text-emerald-800" : "text-zinc-400"}`}>
                                  {stage.label}
                                </p>
                                <p className={`text-[8px] mt-0.5 ${isCurrent ? "text-blue-100" : "text-zinc-400"}`}>
                                  {stage.desc}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Purchased Items List */}
                    <div className="border-t border-zinc-100 pt-4 space-y-3">
                      <h4 className="text-xs font-extrabold uppercase text-zinc-400">Order Items</h4>
                      <div className="divide-y divide-zinc-100">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-zinc-200 shrink-0" />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                                  <Package className="h-5 w-5 text-zinc-400" />
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-extrabold text-zinc-900 line-clamp-1">{item.name}</p>
                                <p className="text-[10px] text-zinc-400 font-semibold">Qty: {item.quantity} × ৳{item.price}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-zinc-900">৳{(item.price * item.quantity).toLocaleString()}</span>
                              {order.status === "DELIVERED" && (
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-bold uppercase">
                                  ✓ Delivered
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab: Cart */}
        {activeTab === "cart" && (
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black uppercase text-zinc-900 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" /> Your Cart Items ({cart.length})
            </h3>

            {cart.length === 0 ? (
              <p className="text-xs text-zinc-400 py-8 text-center">Your shopping cart is currently empty.</p>
            ) : (
              <div className="space-y-4">
                <div className="divide-y divide-zinc-100">
                  {cart.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {item.image && <img src={item.image} className="w-10 h-10 rounded-lg object-cover" />}
                        <div>
                          <p className="text-xs font-bold text-zinc-900">{item.name}</p>
                          <p className="text-[10px] text-zinc-400 font-semibold">Qty: {item.quantity} × ৳{item.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-zinc-900">৳{(item.price * item.quantity).toLocaleString()}</span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-rose-500 text-xs hover:underline cursor-pointer font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-zinc-100 flex justify-end">
                  <Link
                    href="/checkout"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Wishlist */}
        {activeTab === "wishlist" && (
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black uppercase text-zinc-900 flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" /> Wishlist Products ({wishlist.length})
            </h3>

            {wishlist.length === 0 ? (
              <p className="text-xs text-zinc-400 py-8 text-center">No favorite products saved in your wishlist.</p>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {wishlist.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl border border-zinc-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} className="w-12 h-12 rounded-xl object-cover shrink-0" />}
                      <div>
                        <p className="text-xs font-extrabold text-zinc-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs font-black text-blue-600">৳{item.price}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        addToCart({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          quantity: 1,
                          sku: item.sku || item.id,
                          image: item.image,
                        });
                        removeFromWishlist(item.id);
                        toast.success("Moved to cart!");
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Add Cart
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Reward Coins */}
        {activeTab === "coins" && (
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-4 bg-amber-500/10 p-6 rounded-2xl border border-amber-500/20">
              <span className="text-4xl">🪙</span>
              <div>
                <h3 className="text-lg font-extrabold text-amber-900">Your Coin Balance: {coins} Coins</h3>
                <p className="text-xs text-amber-700 mt-1">1 Reward Coin = ৳1 Instant Discount on checkout!</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase text-zinc-400">How to Earn Coins</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <p className="text-xs font-bold text-zinc-900">⭐ Earn Coins on Delivered Orders</p>
                  <p className="text-[11px] text-zinc-500">Complete purchases and get them delivered to earn reward coins. Coins are credited automatically by the system for qualifying orders.</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <p className="text-xs font-bold text-zinc-900">🛒 Redeem Coins at Checkout</p>
                  <p className="text-[11px] text-zinc-500">Toggle "Use Reward Coins" on the Checkout page to automatically reduce your final order total.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Account Info */}
        {activeTab === "account" && (
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-4 max-w-xl">
            <h3 className="text-sm font-black uppercase text-zinc-900 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" /> Profile Details
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400">Full Name</label>
                <p className="font-bold text-zinc-900 text-sm mt-0.5">{user.fullName || "-"}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400">Email Address</label>
                <p className="font-bold text-zinc-900 text-sm mt-0.5">{user.email || "-"}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400">Account Role</label>
                <p className="font-bold text-blue-600 uppercase text-xs mt-0.5">{user.role || "customer"}</p>
              </div>
            </div>
          </div>
        )}
      </main>


      <Footer />
    </div>
  );
}

export default function CustomerProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-zinc-50 font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
        <Footer />
      </div>
    }>
      <CustomerProfileContent />
    </Suspense>
  );
}

