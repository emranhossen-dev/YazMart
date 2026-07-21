"use client";

import React, { useState } from "react";
import { createSellerStore } from "@/actions/seller";
import { Store, Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface SellerOnboardingProps {
  userId: string;
}

export default function SellerOnboarding({ userId }: SellerOnboardingProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    // Auto-generate slug
    const cleanSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(cleanSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error("Please fill in the store name and URL slug.");
      return;
    }

    setLoading(true);
    try {
      const res = await createSellerStore({
        ownerId: userId,
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Congratulations! Your store is now active.");
        window.location.reload();
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl py-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl md:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff6600] text-white shadow-xs">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#ff6600]">Merchant Store Onboarding</span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Register Your Store</h2>
          </div>
        </div>

        <p className="text-xs font-medium leading-relaxed text-slate-500">
          Create your shop profile on YazMart. Upload products, configure custom brand details, and manage customer orders under your own dedicated URL storefront.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="shopName" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Store Name
            </label>
            <input
              id="shopName"
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Apex Official Store"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:border-[#ff6600] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="shopSlug" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Storefront URL Slug
            </label>
            <div className="mt-2 flex rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-[#ff6600] focus-within:bg-white">
              <span className="flex items-center bg-slate-100 px-4 text-xs font-bold text-slate-400 select-none">
                yazmart.com/stores/
              </span>
              <input
                id="shopSlug"
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="apex-shoes"
                className="flex-1 px-4 py-3 text-sm font-semibold bg-transparent focus:outline-none"
              />
            </div>
            <p className="mt-1.5 text-[10px] font-semibold text-slate-400">
              Only letters, numbers, and dashes are allowed.
            </p>
          </div>

          <div>
            <label htmlFor="shopDesc" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Store Description
            </label>
            <textarea
              id="shopDesc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your brand, products, return policies, or physical location..."
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:border-[#ff6600] focus:bg-white focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff6600] hover:bg-orange-700 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Provisioning Store...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Submit Store Registration
              </>
            )}
          </button>
        </form>

        {/* Instant Approval Manual & Support */}
        <div className="pt-4 border-t border-slate-100 bg-orange-50/50 p-4 rounded-2xl border border-orange-200 space-y-3">
          <p className="text-[11px] font-bold text-slate-800">
            💡 Need Instant Approval? Call or Message Admin:
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            <a href="tel:+8801700000000" className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              📞 Call: +880 1700-000000
            </a>
            <a href="mailto:shop@yazmart.com?subject=Store%20Approval%20Request" className="px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800">
              ✉️ Email: shop@yazmart.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
