"use client";

import React, { useEffect, useState } from "react";
import { Ticket, Plus, Tag, Trash2 } from "lucide-react";
import { getCoupons, createCoupon, deleteCoupon } from "@/actions/coupons";
import toast from "react-hot-toast";

export default function SellerCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    min_order_amount: "0",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const res = await getCoupons();
    if (res.coupons) setCoupons(res.coupons);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await createCoupon({
      code: form.code,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_amount: Number(form.min_order_amount),
    });

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Coupon code generated successfully!");
      setForm({ code: "", discount_type: "percentage", discount_value: "", min_order_amount: "0" });
      fetchCoupons();
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon code?")) return;
    setDeletingId(id);
    const res = await deleteCoupon(id);
    if (res.success) {
      toast.success("Coupon deleted!");
      setCoupons(prev => prev.filter(c => c.id !== id));
    } else {
      toast.error(res.error || "Failed to delete coupon");
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight text-zinc-950 flex items-center gap-2">
          <Ticket className="h-6 w-6 text-blue-600" /> Store Discount Coupons
        </h1>
        <p className="text-[11px] text-zinc-500">Create promotional discount codes for your store items to boost sales.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Create Form */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2 text-zinc-900">
            <Plus className="h-4 w-4" /> Add Store Coupon
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Coupon Code</label>
              <input 
                type="text" 
                required
                value={form.code}
                onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                className="w-full p-2.5 text-xs rounded-xl border border-zinc-200 uppercase font-bold tracking-wider"
                placeholder="e.g. STORE10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Discount Type</label>
                <select 
                  value={form.discount_type}
                  onChange={e => setForm({...form, discount_type: e.target.value as any})}
                  className="w-full p-2.5 text-xs rounded-xl border border-zinc-200 font-bold cursor-pointer"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (৳)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Value</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={form.discount_value}
                  onChange={e => setForm({...form, discount_value: e.target.value})}
                  className="w-full p-2.5 text-xs rounded-xl border border-zinc-200 font-bold"
                  placeholder="e.g. 10"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Min. Order Spend (৳)</label>
              <input 
                type="number" 
                required
                min="0"
                value={form.min_order_amount}
                onChange={e => setForm({...form, min_order_amount: e.target.value})}
                className="w-full p-2.5 text-xs rounded-xl border border-zinc-200 font-bold"
                placeholder="e.g. 300"
              />
            </div>
            <button 
              type="submit" 
              disabled={creating}
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-50"
            >
              {creating ? "Creating..." : "Save Coupon"}
            </button>
          </form>
        </div>

        {/* Coupon List */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase font-black tracking-wider text-zinc-400">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min. Spend</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-zinc-400">Loading coupons...</td></tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-400">
                    <Tag className="h-8 w-8 mx-auto opacity-30 mb-2" />
                    No coupon codes generated yet.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50/50">
                    <td className="p-4 font-mono font-black text-blue-600 tracking-wider">
                      {c.code}
                    </td>
                    <td className="p-4 font-bold text-zinc-900">
                      {c.discount_type === "percentage" ? `${c.discount_value}% OFF` : `৳${c.discount_value} OFF`}
                    </td>
                    <td className="p-4 font-medium text-zinc-600">
                      ৳{c.min_order_amount}
                    </td>
                    <td className="p-4">
                      {c.is_active ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">Active</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-bold">Inactive</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
