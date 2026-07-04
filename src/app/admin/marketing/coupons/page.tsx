"use client";

import React, { useEffect, useState } from "react";
import { Ticket, Plus, Tag, Check, X, ShieldAlert } from "lucide-react";
import { getCoupons, createCoupon, toggleCouponStatus } from "@/actions/marketing";
import toast from "react-hot-toast";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "0"
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const res = await getCoupons();
    if (res.success) setCoupons(res.coupons);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await createCoupon({
      code: form.code,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_amount: Number(form.min_order_amount)
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

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const res = await toggleCouponStatus(id, !currentStatus);
    if (res.success) {
      setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
      toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'}`);
    } else {
      toast.error(res.error || "Failed to toggle status");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)] flex items-center gap-2">
          <Ticket className="h-6 w-6 text-blue-500" /> Marketing Coupons
        </h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Manage promotional codes and active discount engines.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Create Form */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-xs">
          <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Promotion
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Coupon Code</label>
              <input 
                type="text" 
                required
                value={form.code}
                onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                className="w-full p-2 text-xs rounded-lg border border-[var(--border)] uppercase font-bold"
                placeholder="e.g. SUMMER50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Type</label>
                <select 
                  value={form.discount_type}
                  onChange={e => setForm({...form, discount_type: e.target.value})}
                  className="w-full p-2 text-xs rounded-lg border border-[var(--border)] font-bold cursor-pointer"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (৳)</option>
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
                  className="w-full p-2 text-xs rounded-lg border border-[var(--border)] font-bold"
                  placeholder="e.g. 10"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Min. Order Amount (৳)</label>
              <input 
                type="number" 
                required
                min="0"
                value={form.min_order_amount}
                onChange={e => setForm({...form, min_order_amount: e.target.value})}
                className="w-full p-2 text-xs rounded-lg border border-[var(--border)] font-bold"
                placeholder="e.g. 500"
              />
            </div>
            <button 
              type="submit" 
              disabled={creating}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-50"
            >
              {creating ? "Deploying..." : "Deploy Coupon"}
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
                <tr><td colSpan={5} className="p-8 text-center text-zinc-500">Loading engine state...</td></tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-400">
                    <ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="font-bold">No active coupons in ledger</p>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon: any) => (
                  <tr key={coupon.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4 font-black text-blue-600">{coupon.code}</td>
                    <td className="p-4 font-bold">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `৳${coupon.discount_value}`}
                    </td>
                    <td className="p-4 text-zinc-500 font-mono">৳{coupon.min_order_amount}</td>
                    <td className="p-4">
                      {coupon.is_active ? (
                        <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">Active</span>
                      ) : (
                        <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">Inactive</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleToggle(coupon.id, coupon.is_active)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                          coupon.is_active 
                            ? "border-rose-200 text-rose-600 hover:bg-rose-50" 
                            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {coupon.is_active ? "Deactivate" : "Activate"}
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
