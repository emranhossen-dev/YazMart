"use client";

import React, { useState } from "react";
import { createStoreCoupon, deleteStoreCoupon } from "@/actions/seller";
import { Plus, Trash2, Tag, Loader2, Calendar } from "lucide-react";
import toast from "react-hot-toast";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  valid_until?: string | null;
  is_active: boolean;
}

interface CouponsClientProps {
  storeSlug: string;
  initialCoupons: Coupon[];
}

export default function CouponsClient({ storeSlug, initialCoupons }: CouponsClientProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      toast.error("Please fill in required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await createStoreCoupon(storeSlug, {
        code: code.trim(),
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
        valid_until: validUntil || undefined
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Promo code coupon registered successfully.");
        window.location.reload();
      }
    } catch (err) {
      toast.error("Failed to register coupon.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const res = await deleteStoreCoupon(storeSlug, couponId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Coupon deleted.");
        setCoupons(prev => prev.filter(c => c.id !== couponId));
      }
    } catch (err) {
      toast.error("Failed to delete coupon.");
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Store Coupons</h1>
        <p className="text-xs font-semibold text-zinc-400">Create store-specific promo codes. The code will automatically be prefixed with your store identifier.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Creator Form */}
        <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-zinc-400 flex items-center gap-2">
            <Plus className="h-4 w-4 text-zinc-600" /> Create Promo Code
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Coupon Suffix *</label>
              <div className="flex rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden items-center">
                <span className="bg-zinc-150 px-3 py-2 text-xs font-mono font-bold text-zinc-500 uppercase border-r border-zinc-200 select-none">
                  {storeSlug.toUpperCase()}-
                </span>
                <input 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)} 
                  required 
                  className="flex-1 bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-800 focus:outline-none focus:bg-white" 
                  placeholder="SUMMER25" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Discount Type *</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed BDT Amount (৳)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Discount Value *</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                value={discountValue} 
                onChange={(e) => setDiscountValue(e.target.value)} 
                required 
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none" 
                placeholder={discountType === "percentage" ? "10%" : "৳150"} 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Minimum Order Price (BDT)</label>
              <input 
                type="number" 
                min="0"
                value={minOrderAmount} 
                onChange={(e) => setMinOrderAmount(e.target.value)} 
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none" 
                placeholder="৳1,000" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Expiration Date (Optional)</label>
              <input 
                type="date" 
                value={validUntil} 
                onChange={(e) => setValidUntil(e.target.value)} 
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none cursor-pointer" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 rounded-full bg-zinc-950 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Coupon"}
            </button>
          </form>
        </div>

        {/* List View */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-zinc-400">Active Coupons</h3>
          
          <div className="divide-y divide-zinc-100">
            {coupons.length === 0 ? (
              <div className="py-12 text-center text-zinc-400">
                <Tag className="mx-auto h-10 w-10 opacity-45 mb-2" />
                No active coupons created yet.
              </div>
            ) : (
              coupons.map((coupon) => (
                <div key={coupon.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-zinc-950 flex items-center gap-1 bg-zinc-100 px-2.5 py-0.5 rounded border border-zinc-200">
                        {coupon.code}
                      </span>
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600 border border-emerald-100">
                        {coupon.discount_type === "percentage" ? `${coupon.discount_value}% OFF` : `৳${coupon.discount_value} OFF`}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-semibold pt-1">
                      <span>Min Order: ৳{coupon.min_order_amount}</span>
                      {coupon.valid_until && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Valid Till: {new Date(coupon.valid_until).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDelete(coupon.id)} 
                    className="rounded-xl border border-zinc-200 p-2 text-zinc-400 hover:border-rose-500 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
