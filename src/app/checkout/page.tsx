"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShopStore } from "@/store/shop-store";
import { useAuthStore } from "@/store/auth-store";
import { signOutAction } from "@/actions/auth";
import { createOrder } from "@/actions/orders";
import { ArrowLeft, CreditCard, ShoppingBag, ShieldCheck, Heart, ShoppingCart, Lock, Ticket } from "lucide-react";
import { validateCoupon } from "@/actions/marketing";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, wishlist } = useShopStore();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth Redirect
  React.useEffect(() => {
    if (!user) {
      router.push("/auth");
    }
  }, [user, router]);

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

// Location Data
const BD_DIVISIONS = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh"];
const BD_DISTRICTS: Record<string, string[]> = {
  "Dhaka": ["Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail"],
  "Chittagong": ["Bandarban", "Brahmanbaria", "Chandpur", "Chattogram", "Cumilla", "Cox's Bazar", "Feni", "Khagrachari", "Lakshmipur", "Noakhali", "Rangamati"]
};
// Simplified mock thanas for demonstration
const BD_THANAS: Record<string, string[]> = {
  "Dhaka": ["Adabor", "Badda", "Cantonment", "Dhanmondi", "Gulshan", "Mirpur", "Mohammadpur", "Pallabi", "Ramna", "Tejgaon", "Uttara"],
  "Gazipur": ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"],
  "Narayanganj": ["Araihazar", "Bandar", "Narayanganj Sadar", "Rupganj", "Sonargaon"]
};

  // Form inputs
  const [name, setName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  
  // Location States
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [thana, setThana] = useState("");
  const [addressLine, setAddressLine] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setApplyingCoupon(true);
    setCouponError(null);
    const res = await validateCoupon(couponCode, subtotal);
    if (res.error) {
      setCouponError(res.error);
      setDiscountAmount(0);
    } else if (res.success && res.discountAmount) {
      setDiscountAmount(res.discountAmount);
      setCouponError(null);
    }
    setApplyingCoupon(false);
  };
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping - discountAmount;

  if (!user) return null; // Avoid flashing content

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cart.length === 0) {
      setError("Your cart is empty. Add products before placing an order.");
      return;
    }

    setLoading(true);

    const payload = {
      customer_name: name,
      customer_email: email,
      shipping_address: `${addressLine}, ${thana}, ${district}, ${division}`,
      phone: phone,
      total_amount: total,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        sku: item.sku,
        image: item.image
      }))
    };

    const res = await createOrder(payload);

    if (res.error) {
      setError(res.error);
    } else if (res.success && res.orderId) {
      clearCart();
      router.push(`/checkout/confirmation/${res.orderId}`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans">
      {/* Premium Consistent Navbar */}
      <header className="sticky top-0 z-50 bg-[var(--card)]/90 backdrop-blur-md border-b border-[var(--border)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-black tracking-tight flex items-center gap-2 flex-shrink-0">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <ShoppingBag className="h-5.5 w-5.5" />
            </div>
            Yaz<span className="text-blue-500">Mart</span>
          </Link>

          {/* Action Links */}
          <div className="flex items-center gap-4 flex-shrink-0">
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
                <span className="absolute top-0 right-0 bg-blue-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent)] hover:opacity-90 text-[var(--foreground)] text-xs font-bold transition-all border border-[var(--outline-variant)]/30 cursor-pointer">
                  <div className="w-4.5 h-4.5 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-[9px] uppercase">
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
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main content grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 space-y-8">
        
        {/* Step Indicator */}
        <div className="max-w-xl mx-auto flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
          <div className="flex items-center gap-2 text-emerald-600">
            <span className="w-6 h-6 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-[10px] font-black text-emerald-600">✓</span>
            <span>Shopping Bag</span>
          </div>
          <div className="flex-1 h-0.5 bg-emerald-500 mx-4" />
          <div className="flex items-center gap-2 text-blue-600">
            <span className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center text-[10px] font-black">2</span>
            <span>Checkout Details</span>
          </div>
          <div className="flex-1 h-0.5 bg-zinc-200 mx-4" />
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full border-2 border-zinc-200 flex items-center justify-center text-[10px] font-black">3</span>
            <span>Confirmation</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-[var(--border)]/40 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center gap-3">
              <CreditCard className="h-7 w-7 text-blue-500" /> Checkout Ledger
            </h1>
            <p className="text-xs text-zinc-500 mt-1">Provide delivery credentials and verify order breakdown to commit purchase.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/15">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-5 items-start">
          {/* Shipping Form Column */}
          <div className="lg:col-span-3 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-6">
            <h3 className="text-xs font-black uppercase text-[var(--foreground)] tracking-wider border-b border-[var(--border)]/30 pb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-500" /> Shipping & Billing credentials
            </h3>

            <form onSubmit={handlePlaceOrder} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    className="w-full px-3 py-2.5 text-xs rounded-xl bg-zinc-50 border border-[#c3c6d7]/60 focus:outline-none focus:border-blue-500 font-bold transition-all focus:bg-white" 
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="w-full px-3 py-2.5 text-xs rounded-xl bg-zinc-50 border border-[#c3c6d7]/60 focus:outline-none focus:border-blue-500 font-bold transition-all focus:bg-white" 
                    placeholder="e.g. john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required 
                  className="w-full px-3 py-2.5 text-xs rounded-xl bg-zinc-50 border border-[#c3c6d7]/60 focus:outline-none focus:border-blue-500 font-bold transition-all focus:bg-white" 
                  placeholder="e.g. +8801700000000"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1">Division</label>
                <select
                  value={division}
                  onChange={(e) => {
                    setDivision(e.target.value);
                    setDistrict("");
                    setThana("");
                  }}
                  required
                  className="w-full px-3 py-2.5 text-xs rounded-xl bg-zinc-50 border border-[#c3c6d7]/60 focus:outline-none focus:border-blue-500 font-bold transition-all focus:bg-white cursor-pointer"
                >
                  <option value="" disabled>Select Division</option>
                  {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setThana("");
                    }}
                    required
                    disabled={!division}
                    className="w-full px-3 py-2.5 text-xs rounded-xl bg-zinc-50 border border-[#c3c6d7]/60 focus:outline-none focus:border-blue-500 font-bold transition-all focus:bg-white cursor-pointer disabled:opacity-50"
                  >
                    <option value="" disabled>Select District</option>
                    {(BD_DISTRICTS[division] || [division]).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1">Thana / Upazila</label>
                  <select
                    value={thana}
                    onChange={(e) => setThana(e.target.value)}
                    required
                    disabled={!district}
                    className="w-full px-3 py-2.5 text-xs rounded-xl bg-zinc-50 border border-[#c3c6d7]/60 focus:outline-none focus:border-blue-500 font-bold transition-all focus:bg-white cursor-pointer disabled:opacity-50"
                  >
                    <option value="" disabled>Select Thana</option>
                    {(BD_THANAS[district] || ["Sadar"]).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1">Union / Village / House / Road Number</label>
                <textarea 
                  value={addressLine} 
                  onChange={(e) => setAddressLine(e.target.value)} 
                  required 
                  rows={2}
                  className="w-full px-3 py-2.5 text-xs rounded-xl bg-zinc-50 border border-[#c3c6d7]/60 focus:outline-none focus:border-blue-500 font-medium transition-all focus:bg-white" 
                  placeholder="Apartment, Street address, Local area"
                />
              </div>

              {/* Payment Method Selector */}
              <div className="pt-2">
                <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2">Payment Method</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div 
                    onClick={() => setPaymentMethod("COD")}
                    className={`border rounded-xl p-3 cursor-pointer transition-all ${paymentMethod === "COD" ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500" : "border-zinc-200 hover:border-zinc-300"}`}
                  >
                    <div className="font-black text-xs">Cash on Delivery (COD)</div>
                    <div className="text-[10px] text-zinc-500 mt-1">Pay when you receive the package</div>
                  </div>
                  <div 
                    onClick={() => setPaymentMethod("ONLINE")}
                    className={`border rounded-xl p-3 cursor-pointer transition-all ${paymentMethod === "ONLINE" ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500" : "border-zinc-200 hover:border-zinc-300"}`}
                  >
                    <div className="font-black text-xs">Online Payment</div>
                    <div className="text-[10px] text-zinc-500 mt-1">bKash, Nagad, Visa, MasterCard</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)]">
                <button 
                  type="submit" 
                  disabled={loading || cart.length === 0}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" /> {loading ? "Processing..." : `Confirm Order - ৳${total.toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>

          {/* Cart Preview Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 border border-[var(--border)] bg-[var(--card)] rounded-2xl shadow-xs space-y-6">
              <h3 className="text-xs font-black uppercase text-[var(--foreground)] tracking-wider border-b border-[var(--border)]/30 pb-3">Checkout Items ledger</h3>
              
              <div className="max-h-56 overflow-y-auto space-y-3 text-xs pr-1 scrollbar-none">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-[var(--border)]/15 last:border-b-0 pb-3">
                    <div className="min-w-0 pr-3">
                      <p className="font-bold text-[var(--foreground)] line-clamp-1">{item.name}</p>
                      <p className="text-[9px] text-[var(--muted-foreground)] font-mono mt-0.5">Qty: {item.quantity} x ৳{item.price.toFixed(2)}</p>
                    </div>
                    <span className="font-bold text-blue-500 flex-shrink-0">৳{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="divide-y divide-[var(--border)]/30 text-xs font-medium border-t border-[var(--border)]/40 pt-1">
                <div className="py-3 flex justify-between text-[var(--muted-foreground)]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[var(--foreground)]">৳{subtotal.toFixed(2)}</span>
                </div>
                
                {/* Coupon Input Area */}
                <div className="py-3">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter promo code"
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-[var(--border)] focus:outline-none focus:border-blue-500 font-bold uppercase tracking-wider"
                    />
                    <button 
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode}
                      className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-lg text-xs font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                    >
                      {applyingCoupon ? "..." : "Apply"}
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] text-rose-500 font-bold mt-1.5">{couponError}</p>}
                  {discountAmount > 0 && <p className="text-[10px] text-emerald-500 font-bold mt-1.5 flex items-center gap-1"><Ticket className="h-3 w-3" /> Coupon Applied!</p>}
                </div>

                {discountAmount > 0 && (
                  <div className="py-3 flex justify-between text-emerald-500 font-bold">
                    <span>Discount</span>
                    <span>- ৳{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="py-3 flex justify-between text-[var(--muted-foreground)]">
                  <span>Shipping Fee</span>
                  <span>{shipping === 0 ? <span className="text-emerald-500 font-bold">FREE</span> : <span className="font-bold text-[var(--foreground)]">৳{shipping.toFixed(2)}</span>}</span>
                </div>
                <div className="py-4 flex justify-between text-sm font-black border-t border-[var(--border)] text-[var(--foreground)]">
                  <span>Net Due</span>
                  <span className="text-blue-500 text-base">৳{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[var(--muted-foreground)] bg-[var(--background)] p-3 rounded-xl border border-[var(--border)]/30 font-medium">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
                <span>Encrypted secure socket layer payment tunnel.</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
