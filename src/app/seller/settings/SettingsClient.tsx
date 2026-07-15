"use client";

import React, { useState } from "react";
import { saveStoreSettings } from "@/actions/seller";
import { Settings, Save, Loader2, Image as ImageIcon, Palette } from "lucide-react";
import toast from "react-hot-toast";

interface Store {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  banner_url?: string | null;
  description?: string | null;
  colors?: any;
}

export default function SettingsClient({ store }: { store: Store }) {
  const [logoUrl, setLogoUrl] = useState(store.logo_url || "");
  const [bannerUrl, setBannerUrl] = useState(store.banner_url || "");
  const [description, setDescription] = useState(store.description || "");
  
  // Theme colors
  const defaultColors = {
    primary: "#18181b",
    secondary: "#71717a",
    cardBg: "#ffffff",
    background: "#fafafa"
  };
  const storeColors = store.colors || defaultColors;
  const [primaryColor, setPrimaryColor] = useState(storeColors.primary || "#18181b");
  const [secondaryColor, setSecondaryColor] = useState(storeColors.secondary || "#71717a");
  const [cardBgColor, setCardBgColor] = useState(storeColors.cardBg || "#ffffff");
  const [bgColor, setBgColor] = useState(storeColors.background || "#fafafa");

  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await saveStoreSettings(store.id, {
        logo_url: logoUrl.trim(),
        banner_url: bannerUrl.trim(),
        description: description.trim(),
        colors: {
          primary: primaryColor,
          secondary: secondaryColor,
          cardBg: cardBgColor,
          background: bgColor
        }
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Settings saved successfully.");
      }
    } catch (err) {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 md:text-3xl">
          Store Settings
        </h1>
        <p className="text-xs font-semibold text-zinc-400">
          Customize your store branding, banner assets, descriptions, and dynamic theme coloring.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid gap-8 lg:grid-cols-3">
        {/* Settings Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brand Assets Card */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <ImageIcon className="h-5 w-5 text-zinc-500" />
              <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider">Brand Media Assets</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">Logo Image URL</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">Banner Background URL</label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">Storefront Bio Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Apex Shoes Bangladesh official marketplace channel..."
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Color Customizer Card */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Palette className="h-5 w-5 text-zinc-500" />
              <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider">Dynamic Theme Styling</h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-9 w-9 rounded-xl border border-zinc-200 cursor-pointer overflow-hidden"
                />
                <div>
                  <label className="block text-xs font-bold text-zinc-700">Primary Color</label>
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">{primaryColor}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-9 w-9 rounded-xl border border-zinc-200 cursor-pointer overflow-hidden"
                />
                <div>
                  <label className="block text-xs font-bold text-zinc-700">Accent Color</label>
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">{secondaryColor}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={cardBgColor}
                  onChange={(e) => setCardBgColor(e.target.value)}
                  className="h-9 w-9 rounded-xl border border-zinc-200 cursor-pointer overflow-hidden"
                />
                <div>
                  <label className="block text-xs font-bold text-zinc-700">Card Background</label>
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">{cardBgColor}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-9 w-9 rounded-xl border border-zinc-200 cursor-pointer overflow-hidden"
                />
                <div>
                  <label className="block text-xs font-bold text-zinc-700">Site Background</label>
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">{bgColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Save & Live Preview */}
        <div className="space-y-6">
          {/* Action Card */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Theme Settings
                </>
              )}
            </button>
            <a
              href={`/stores/${store.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-1.5 rounded-full border border-zinc-200 bg-white py-3 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              View Live Storefront
            </a>
          </div>

          {/* Live Mockup Preview */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Live Header Preview</h3>
            
            <div 
              style={{ background: bgColor }}
              className="overflow-hidden rounded-2xl border border-zinc-200 p-2 shadow-inner"
            >
              {/* Simulated Store Page Header */}
              <div className="relative h-28 w-full overflow-hidden rounded-xl bg-zinc-900">
                {bannerUrl ? (
                  <img src={bannerUrl} className="h-full w-full object-cover opacity-50" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-zinc-800 to-zinc-900" />
                )}
                
                <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 text-white">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 p-1 border border-white/10 shadow">
                    {logoUrl ? (
                      <img src={logoUrl} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <Palette className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold truncate">{store.name}</h4>
                    <p className="text-[8px] opacity-75 truncate">{description || "Store Bio..."}</p>
                  </div>
                </div>
              </div>

              {/* Simulated Product Card preview */}
              <div className="mt-3 p-2 rounded-xl" style={{ background: cardBgColor, border: "1px solid var(--border)" }}>
                <div className="h-16 w-full rounded bg-zinc-100 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-zinc-400">Product Image</span>
                </div>
                <h5 className="mt-1.5 text-[9px] font-bold" style={{ color: primaryColor }}>Simulated Product Title</h5>
                <p className="text-[9px] font-extrabold" style={{ color: secondaryColor }}>৳1,200</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
