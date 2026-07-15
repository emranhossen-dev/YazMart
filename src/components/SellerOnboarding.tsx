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
    <div className="mx-auto max-w-xl py-12 md:py-16">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl md:p-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Launch a Store</span>
            <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">Onboard as a Seller</h2>
          </div>
        </div>

        <p className="mt-4 text-xs font-medium leading-relaxed text-zinc-500">
          Create your personalized shop profile on YazMart. Upload products, configure custom brand themes, and manage customer orders under your own dedicated URL storefront.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="shopName" className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
              Store Name
            </label>
            <input
              id="shopName"
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Apex Official Store"
              className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="shopSlug" className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
              Storefront URL Slug
            </label>
            <div className="mt-2 flex rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden focus-within:border-zinc-900 focus-within:bg-white">
              <span className="flex items-center bg-zinc-100 px-4 text-xs font-bold text-zinc-400 select-none">
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
            <p className="mt-1.5 text-[10px] font-semibold text-zinc-400">
              Only letters, numbers, and dashes are allowed.
            </p>
          </div>

          <div>
            <label htmlFor="shopDesc" className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
              Store Description
            </label>
            <textarea
              id="shopDesc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your brand, return policies, or physical location..."
              className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Provisioning Store...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Create My Store
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
