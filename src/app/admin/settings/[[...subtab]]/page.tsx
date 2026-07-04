"use client";

import React, { startTransition, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getHomepageConfig, updateHomepageConfig } from "@/actions/homepage";
import { uploadImage } from "@/actions/upload";
import { seedDemoDatabaseAction } from "@/actions/seed";
import { 
  Sliders, LayoutGrid, Palette, ArrowUp, ArrowDown, 
  Trash2, Plus, UploadCloud, CheckCircle, Image as ImageIcon, Sparkles, Star 
} from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Field entry helper states
  const [newSlideUrl, setNewSlideUrl] = useState("");
  const [newPromoUrl, setNewPromoUrl] = useState("");


  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandUrl, setNewBrandUrl] = useState("");

  const [newRevName, setNewRevName] = useState("");
  const [newRevRole, setNewRevRole] = useState("");
  const [newRevText, setNewRevText] = useState("");
  const [newRevRating, setNewRevRating] = useState(5);

  const loadConfig = async () => {
    setLoading(true);
    const res = await getHomepageConfig();
    if (res.config) setConfig(res.config);
    setLoading(false);
  };

  const handleSeedData = async () => {
    setSeeding(true);
    setMessage(null);
    try {
      const res = await seedDemoDatabaseAction();
      if (res.success) {
        setMessage({ type: "success", text: res.success });
        await loadConfig();
      } else {
        setMessage({ type: "error", text: res.error || "Seeding failed" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "An unexpected error occurred during seeding." });
    } finally {
      setSeeding(false);
    }
  };


  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setLoading(true);
    setMessage(null);
    const res = await updateHomepageConfig(config);
    if (res.success) {
      setMessage({ type: "success", text: res.success });
      await loadConfig();
    } else {
      setMessage({ type: "error", text: res.error || "Save failed" });
    }
    setLoading(false);
  };

  // Section Ordering Rules
  const moveSection = (index: number, direction: "up" | "down") => {
    if (!config) return;
    const order = [...config.section_order];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= order.length) return;

    // Swap
    const temp = order[index];
    order[index] = order[targetIndex];
    order[targetIndex] = temp;

    setConfig({ ...config, section_order: order });
  };

  const toggleSectionVisibility = (sectionId: string) => {
    if (!config) return;
    const disabled = [...config.disabled_sections];
    const isCurrentlyDisabled = disabled.includes(sectionId);
    
    let updated;
    if (isCurrentlyDisabled) {
      updated = disabled.filter(id => id !== sectionId);
    } else {
      updated = [...disabled, sectionId];
    }

    setConfig({ ...config, disabled_sections: updated });
  };

  const handleColorChange = (field: string, value: string) => {
    if (!config) return;
    setConfig({
      ...config,
      colors: {
        ...config.colors,
        [field]: value
      }
    });
  };

  const handleUploadSlide = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    const res = await uploadImage(fd);
    if (res.url) {
      setConfig({
        ...config,
        slider_images: [...config.slider_images, res.url]
      });
    }
    setUploading(false);
  };

  const handleUploadPromo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    const res = await uploadImage(fd);
    if (res.url) {
      setConfig({
        ...config,
        promo_banners: [...config.promo_banners, res.url]
      });
    }
    setUploading(false);
  };

  const handleUploadRightBanner = async (idx: number, file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    const res = await uploadImage(fd);
    if (res.url) {
      const updated = [...(config?.right_banners || [])];
      while (updated.length <= idx) {
        updated.push({ title: "", sub: "", url: "", link: "" });
      }
      updated[idx] = {
        ...updated[idx],
        url: res.url
      };
      setConfig({
        ...config,
        right_banners: updated
      });
    }
    setUploading(false);
  };

  const handleUploadBrand = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    const res = await uploadImage(fd);
    if (res.url) {
      setNewBrandUrl(res.url);
    }
    setUploading(false);
  };

  const addBrandLogo = () => {
    if (!newBrandName || !newBrandUrl) return;
    setConfig({
      ...config,
      brand_logos: [...config.brand_logos, { name: newBrandName, logoUrl: newBrandUrl, brandId: "" }]
    });
    setNewBrandName("");
    setNewBrandUrl("");
  };

  const addTestimonial = () => {
    if (!newRevName || !newRevText) return;
    setConfig({
      ...config,
      testimonials: [...config.testimonials, { name: newRevName, role: newRevRole, text: newRevText, rating: newRevRating }]
    });
    setNewRevName("");
    setNewRevRole("");
    setNewRevText("");
    setNewRevRating(5);
  };

  if (!config) {
    return (
      <div className="p-6 text-center text-xs font-bold uppercase">
        Loading Layout Manager stack...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto p-1 font-sans select-none">
      <div className="border-b border-[var(--border)] pb-3 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight">Super Admin Layout Deck</h2>
          <p className="text-[11px] text-[var(--muted-foreground)]">Dynamically toggle, order, and styles configure storefront homepage assets.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleSeedData} 
            disabled={seeding || loading}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer shadow-xs disabled:opacity-50"
          >
            {seeding ? "Seeding Catalog..." : "Seed Demo Storefront"}
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer shadow-xs"
          >
            {loading ? "Saving Config..." : "Commit layout configs"}
          </button>
        </div>

      </div>

      {message && (
        <div className={`p-3 rounded text-xs font-bold max-w-xl ${
          message.type === "success" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/10" : "bg-rose-500/10 text-rose-500 border border-rose-500/10"
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        
        {/* Left Card: Reorder & Section Visibility */}
        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-blue-500" /> Structure & Order
          </h3>
          <p className="text-[10px] text-[var(--muted-foreground)]">Toggle switches to enable sections or click arrow indices to rearrange layout order.</p>

          <div className="divide-y divide-[var(--border)] font-medium text-xs">
            {config.section_order.map((sectionId: string, index: number) => {
              const isDisabled = config.disabled_sections.includes(sectionId);
              return (
                <div key={sectionId} className="py-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-400">#{index+1}</span>
                    <span className="font-bold uppercase tracking-wide">{sectionId.replace("_", " ")}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleSectionVisibility(sectionId)}
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                        isDisabled ? "bg-rose-500/10 text-rose-500 border border-rose-500/15" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/15"
                      }`}
                    >
                      {isDisabled ? "Disabled" : "Active"}
                    </button>
                    
                    <div className="flex gap-1">
                      <button 
                        disabled={index === 0} 
                        onClick={() => moveSection(index, "up")}
                        className="p-1 border border-[var(--border)] rounded hover:bg-[var(--accent)] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button 
                        disabled={index === config.section_order.length - 1} 
                        onClick={() => moveSection(index, "down")}
                        className="p-1 border border-[var(--border)] rounded hover:bg-[var(--accent)] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Card: Palette, Slider & Banners */}
        <div className="space-y-6">
          {/* Colors Card */}
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <Palette className="h-4 w-4 text-blue-500" /> Color Branding Configs
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Primary Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={config.colors.primary} onChange={(e) => handleColorChange("primary", e.target.value)} className="w-8 h-8 rounded border cursor-pointer bg-[var(--background)]" />
                  <span className="font-mono text-xs font-bold">{config.colors.primary}</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Background Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={config.colors.background} onChange={(e) => handleColorChange("background", e.target.value)} className="w-8 h-8 rounded border cursor-pointer bg-[var(--background)]" />
                  <span className="font-mono text-xs font-bold">{config.colors.background}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Slider Banner uploads */}
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-blue-500" /> Main Slider Carousels (Left Column)
            </h3>
            
            <div className="flex gap-3 items-center">
              <input type="file" onChange={handleUploadSlide} className="hidden" id="slide-upload" />
              <label htmlFor="slide-upload" className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-blue-700">
                <UploadCloud className="h-4 w-4" /> {uploading ? "Uploading..." : "Add New Slide Image"}
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {config.slider_images.map((img: string, idx: number) => (
                <div key={idx} className="h-20 border border-[var(--border)] relative group rounded overflow-hidden bg-[var(--background)] p-1">
                  <img src={img} className="w-full h-full object-contain" />
                  <button 
                    onClick={() => setConfig({ ...config, slider_images: config.slider_images.filter((_:any, i:any)=>i!==idx) })} 
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right-Side campaign banners */}
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-blue-500" /> Right-Side Campaign Banners (2 Slots)
            </h3>
            <p className="text-[10px] text-[var(--muted-foreground)]">Customize the two campaign banners displayed in the right column of the hero section.</p>

            <div className="space-y-4">
              {[0, 1].map((idx) => {
                const banner = config.right_banners?.[idx] || { title: "", sub: "", url: "", link: "" };
                return (
                  <div key={idx} className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background)] space-y-3">
                    <p className="font-bold text-xs text-[var(--foreground)] uppercase">Slot #{idx + 1} Banner</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] uppercase text-[var(--muted-foreground)] mb-1">Banner Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Smart Gadgets Campaign" 
                          value={banner.title || ""} 
                          onChange={(e) => {
                            const updated = [...(config.right_banners || [])];
                            while (updated.length <= idx) {
                              updated.push({ title: "", sub: "", url: "", link: "" });
                            }
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setConfig({ ...config, right_banners: updated });
                          }} 
                          className="w-full px-3 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase text-[var(--muted-foreground)] mb-1">Banner Subtitle</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Instant 15% cashback inside" 
                          value={banner.sub || ""} 
                          onChange={(e) => {
                            const updated = [...(config.right_banners || [])];
                            while (updated.length <= idx) {
                              updated.push({ title: "", sub: "", url: "", link: "" });
                            }
                            updated[idx] = { ...updated[idx], sub: e.target.value };
                            setConfig({ ...config, right_banners: updated });
                          }} 
                          className="w-full px-3 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] uppercase text-[var(--muted-foreground)] mb-1">Target Link Route</label>
                        <input 
                          type="text" 
                          placeholder="e.g. /categories/electronics or #" 
                          value={banner.link || ""} 
                          onChange={(e) => {
                            const updated = [...(config.right_banners || [])];
                            while (updated.length <= idx) {
                              updated.push({ title: "", sub: "", url: "", link: "" });
                            }
                            updated[idx] = { ...updated[idx], link: e.target.value };
                            setConfig({ ...config, right_banners: updated });
                          }} 
                          className="w-full px-3 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase text-[var(--muted-foreground)] mb-1">Banner Image File</label>
                        <input 
                          type="file" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadRightBanner(idx, file);
                          }} 
                          className="hidden" 
                          id={`right-banner-upload-${idx}`} 
                        />
                        <label 
                          htmlFor={`right-banner-upload-${idx}`} 
                          className="block text-center py-2 bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] text-[10px] font-bold uppercase rounded cursor-pointer transition-colors"
                        >
                          {banner.url ? "Change Image ✓" : "Select Image File"}
                        </label>
                      </div>
                    </div>

                    {banner.url && (
                      <div className="mt-2 h-20 border border-[var(--border)] rounded overflow-hidden bg-[var(--background)] p-1 w-full max-w-[200px]">
                        <img src={banner.url} className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full promo banner uploads */}
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-blue-500" /> Promo Full-Width Banners
            </h3>
            
            <div className="flex gap-3 items-center">
              <input type="file" onChange={handleUploadPromo} className="hidden" id="promo-upload" />
              <label htmlFor="promo-upload" className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-blue-700">
                <UploadCloud className="h-4 w-4" /> {uploading ? "Uploading..." : "Add Full Width Banner"}
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {config.promo_banners.map((img: string, idx: number) => (
                <div key={idx} className="h-20 border border-[var(--border)] relative group rounded overflow-hidden bg-[var(--background)] p-1">
                  <img src={img} className="w-full h-full object-contain" />
                  <button 
                    onClick={() => setConfig({ ...config, promo_banners: config.promo_banners.filter((_:any, i:any)=>i!==idx) })} 
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Brand logos management */}
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" /> Brand Logo slider
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Brand Name" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} className="px-3 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" />
              <div>
                <input type="file" onChange={handleUploadBrand} className="hidden" id="brand-upload" />
                <label htmlFor="brand-upload" className="block text-center py-2 bg-[var(--background)] hover:bg-[var(--accent)] border border-[var(--border)] text-[10px] font-bold uppercase rounded cursor-pointer">
                  {newBrandUrl ? "Logo Selected ✓" : "Select Brand Logo File"}
                </label>
              </div>
            </div>
            <button type="button" onClick={addBrandLogo} className="w-full py-1.5 bg-zinc-800 text-white rounded text-xs font-bold uppercase flex items-center justify-center gap-1">
              <Plus className="h-4 w-4" /> Add Brand Logo
            </button>

            <div className="grid grid-cols-4 gap-2">
              {config.brand_logos.map((brand: any, idx: number) => (
                <div key={idx} className="h-16 border border-[var(--border)] relative group rounded overflow-hidden bg-[var(--background)] p-1">
                  <img src={brand.logoUrl} className="w-full h-full object-contain" />
                  <span className="absolute bottom-1 left-1 bg-black/75 text-[8px] text-white px-1 rounded">{brand.name}</span>
                  <button 
                    onClick={() => setConfig({ ...config, brand_logos: config.brand_logos.filter((_:any, i:any)=>i!==idx) })} 
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews Management */}
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-500" /> Testimonials Slider
            </h3>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Reviewer Name" value={newRevName} onChange={(e) => setNewRevName(e.target.value)} className="px-3 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" />
                <input type="text" placeholder="Role (e.g. Regular Shopper)" value={newRevRole} onChange={(e) => setNewRevRole(e.target.value)} className="px-3 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" />
              </div>
              <textarea placeholder="Review Text..." value={newRevText} onChange={(e) => setNewRevText(e.target.value)} className="w-full p-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" />
            </div>
            <button type="button" onClick={addTestimonial} className="w-full py-1.5 bg-zinc-800 text-white rounded text-xs font-bold uppercase flex items-center justify-center gap-1">
              <Plus className="h-4 w-4" /> Add Testimonial Entry
            </button>

            <div className="max-h-48 overflow-y-auto space-y-2">
              {config.testimonials.map((rev: any, idx: number) => (
                <div key={idx} className="p-3 border border-[var(--border)] rounded bg-[var(--background)] relative group flex justify-between">
                  <div>
                    <p className="font-bold text-xs">{rev.name} <span className="text-[10px] text-zinc-400 font-normal">({rev.role})</span></p>
                    <p className="text-[11px] text-[var(--muted-foreground)] mt-1">{rev.text}</p>
                  </div>
                  <button 
                    onClick={() => setConfig({ ...config, testimonials: config.testimonials.filter((_:any, i:any)=>i!==idx) })} 
                    className="p-1 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer h-fit self-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
