"use client";

import React, { useState } from "react";
import { Sparkles, Plus, Search, Trash2, Edit } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  featured: boolean;
  logo: string;
}

const INITIAL_BRANDS: Brand[] = [
  { id: "BRD-101", name: "Apple", slug: "apple", productCount: 42, featured: true, logo: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=80&fit=crop&q=60" },
  { id: "BRD-102", name: "Samsung", slug: "samsung", productCount: 38, featured: true, logo: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=80&fit=crop&q=60" },
  { id: "BRD-103", name: "Nike", slug: "nike", productCount: 29, featured: true, logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&fit=crop&q=60" },
  { id: "BRD-104", name: "Adidas", slug: "adidas", productCount: 24, featured: false, logo: "https://images.unsplash.com/photo-1518002171953-a080ee81be25?w=80&fit=crop&q=60" },
  { id: "BRD-105", name: "Sony", slug: "sony", productCount: 19, featured: false, logo: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=80&fit=crop&q=60" }
];

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>(INITIAL_BRANDS);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [featured, setFeatured] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newBrand: Brand = {
      id: `BRD-${Date.now().toString().slice(-3)}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      productCount: 0,
      featured,
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=80&fit=crop&q=60"
    };
    setBrands([...brands, newBrand]);
    setName("");
    setFeatured(false);
  };

  const toggleFeatured = (id: string) => {
    setBrands(brands.map(b => b.id === id ? { ...b, featured: !b.featured } : b));
  };

  const handleDelete = (id: string) => {
    setBrands(brands.filter(b => b.id !== id));
  };

  const filtered = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 select-none font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight">Brand Matrix</h1>
          <p className="text-[11px] text-[var(--muted-foreground)]">Manage product brand taxonomies and featured homepage status.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Form */}
        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
            <Plus className="h-4 w-4 text-blue-500" /> Create New Brand
          </h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Brand Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Apple, Nike" 
                className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500 text-[var(--foreground)]"
              />
            </div>
            <div className="flex items-center gap-2 py-1">
              <input 
                type="checkbox" 
                id="featured" 
                checked={featured} 
                onChange={(e) => setFeatured(e.target.checked)} 
                className="rounded border-[var(--border)] accent-blue-500"
              />
              <label htmlFor="featured" className="text-xs font-semibold text-[var(--foreground)] cursor-pointer">Featured on Storefront</label>
            </div>
            <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-xs">
              Save Brand Ledger
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" /> Active Brands Directory
            </h3>
            <div className="flex items-center gap-2 max-w-xs bg-[var(--background)] border border-[var(--border)] px-3 py-1.5 rounded-lg">
              <Search className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
              <input 
                type="text" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search brands..." 
                className="bg-transparent border-none text-xs focus:outline-none w-full text-[var(--foreground)]" 
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                  <th className="pb-3">Logo</th>
                  <th className="pb-3">Brand Info</th>
                  <th className="pb-3">Products Connected</th>
                  <th className="pb-3">Homepage Feature</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-medium">
                {filtered.map((brand) => (
                  <tr key={brand.id} className="hover:bg-[var(--background)]/50 transition-colors">
                    <td className="py-3">
                      <div className="w-8 h-8 rounded border border-[var(--border)] bg-[var(--background)] overflow-hidden p-1 flex items-center justify-center">
                        <img src={brand.logo} className="w-full h-full object-contain" alt="" />
                      </div>
                    </td>
                    <td className="py-3">
                      <p className="font-bold text-[var(--foreground)]">{brand.name}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)] font-mono">{brand.id}</p>
                    </td>
                    <td className="py-3 text-[var(--muted-foreground)] font-semibold">{brand.productCount} Items</td>
                    <td className="py-3">
                      <button 
                        onClick={() => toggleFeatured(brand.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                          brand.featured ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/10" : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/10"
                        }`}
                      >
                        {brand.featured ? "Featured" : "Regular"}
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => handleDelete(brand.id)} className="p-1 hover:bg-rose-500/10 text-rose-500 rounded cursor-pointer transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
