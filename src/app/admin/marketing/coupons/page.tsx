"use client";

import React, { useEffect, useState } from "react";
import { Ticket, Plus, Tag, Check, X, ShieldAlert, Trash2 } from "lucide-react";
import { getCoupons, createCoupon, deleteCoupon } from "@/actions/coupons";
import toast from "react-hot-toast";

export default function CouponsPage() {
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
      toast.success("Coupon created successfully!");
      setForm({ code: "", discount_type: "percentage", discount_value: "", min_order_amount: "0" });
      fetchCoupons();
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    setDeletingId(id);
    const res = await deleteCoupon(id);
    if (res.success) {
      toast.success("Coupon deleted successfully!");
      setCoupons(prev => prev.filter(c => c.id !== id));
    } else {
      toast.error(res.error || "Failed to delete coupon");
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)] flex items-center gap-2">
          <Ticket className="h-6 w-6 text-blue-500" /> Marketing & Store Coupons
        </h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Manage promotional codes, product discounts, and active coupon campaigns.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Create Form */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-xs">
          <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Coupon Code
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Coupon Code</label>
              <input 
                type="text" 
                required
                value={form.code}
                onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                className="w-full p-2.5 text-xs rounded-lg border border-[var(--border)] uppercase font-bold tracking-wider"
                placeholder="e.g. YAZMART50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Discount Type</label>
                <select 
                  value={form.discount_type}
                  onChange={e => setForm({...form, discount_type: e.target.value as any})}
                  className="w-full p-2.5 text-xs rounded-lg border border-[var(--border)] font-bold cursor-pointer"
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
                  className="w-full p-2.5 text-xs rounded-lg border border-[var(--border)] font-bold"
                  placeholder="e.g. 15"
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
                className="w-full p-2.5 text-xs rounded-lg border border-[var(--border)] font-bold"
                placeholder="e.g. 500"
              />
            </div>
            <button 
              type="submit" 
              disabled={creating}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-50"
            >
              {creating ? "Saving..." : "Create Coupon"}
            </button>
          </form>
        </div>

        {/* Coupon List */}
        <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-[var(--border)] text-[10px] uppercase font-black tracking-wider text-zinc-500">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min. Spend</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-zinc-500">Loading coupons list...</td></tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-400">
                    <Tag className="h-8 w-8 mx-auto opacity-30 mb-2" />
                    No coupon codes created yet.
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
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-bold">Inactive</span>
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
