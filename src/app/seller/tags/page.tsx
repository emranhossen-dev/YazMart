"use client";

import React, { useState } from "react";
import { Plus, Tag, Trash2 } from "lucide-react";

interface ProductTag {
  id: string;
  name: string;
  slug: string;
  usageCount: number;
}

const INITIAL_TAGS: ProductTag[] = [
  { id: "TAG-001", name: "Summer Campaign", slug: "summer-campaign", usageCount: 14 },
  { id: "TAG-002", name: "Trending Now", slug: "trending-now", usageCount: 22 },
  { id: "TAG-003", name: "Eco Friendly", slug: "eco-friendly", usageCount: 8 },
  { id: "TAG-004", name: "Limited Edition", slug: "limited-edition", usageCount: 11 },
  { id: "TAG-005", name: "Premium Choice", slug: "premium-choice", usageCount: 17 }
];

export default function SellerTagsPage() {
  const [tags, setTags] = useState<ProductTag[]>(INITIAL_TAGS);
  const [name, setName] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newTag: ProductTag = {
      id: `TAG-${Date.now().toString().slice(-3)}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      usageCount: 0
    };

    setTags([...tags, newTag]);
    setName("");
  };

  const handleDelete = (id: string) => {
    setTags(tags.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6 select-none font-sans">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Store Tag Taxonomy</h1>
        <p className="text-xs font-semibold text-zinc-400">Administer classification hashtags and product campaigns collection tag listings.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Creator Form */}
        <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-zinc-400 flex items-center gap-2">
            <Plus className="h-4 w-4 text-zinc-600" /> Create Tag Taxonomy
          </h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Tag Display Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none" 
                placeholder="e.g. Flash Deal" 
              />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-1.5 rounded-full bg-zinc-950 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 cursor-pointer">
              Add Tag
            </button>
          </form>
        </div>

        {/* List View */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-zinc-400">Available Campaign Tags</h3>
          
          <div className="divide-y divide-zinc-100">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-zinc-950 flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5 text-zinc-500" /> {tag.name}
                    </span>
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-zinc-500">#{tag.slug}</span>
                  </div>
                  <p className="text-[10px] font-semibold text-zinc-400">Used on {tag.usageCount} products</p>
                </div>

                <button 
                  onClick={() => handleDelete(tag.id)} 
                  className="rounded-xl border border-zinc-200 p-2 text-zinc-400 hover:border-rose-500 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
