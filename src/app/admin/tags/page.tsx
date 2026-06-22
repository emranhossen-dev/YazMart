"use client";

import React, { useState } from "react";
import { Plus, Tag, Trash2, Hash } from "lucide-react";

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

export default function TagsPage() {
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
        <h1 className="text-xl font-black uppercase tracking-tight">Tag Manager</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Administer classification hashtags and product campaigns collection tag listings.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Creator Form */}
        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
            <Plus className="h-4 w-4 text-blue-500" /> Create Tag Taxonomy
          </h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Tag Display Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Winter Clearance" 
                className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500 text-[var(--foreground)]"
              />
            </div>
            <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-xs">
              Save Tag Record
            </button>
          </form>
        </div>

        {/* Directory Ledger */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
            <Tag className="h-4 w-4 text-blue-500" /> Active Tag Collection
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                  <th className="pb-3">Tag ID Reference</th>
                  <th className="pb-3">Display Name</th>
                  <th className="pb-3">URL Slug Route</th>
                  <th className="pb-3">Assigned Products</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-medium">
                {tags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-[var(--background)]/50 transition-colors">
                    <td className="py-3 font-mono text-[10px] text-[var(--muted-foreground)]">{tag.id}</td>
                    <td className="py-3 font-bold text-[var(--foreground)] flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5 text-blue-500" /> {tag.name}
                    </td>
                    <td className="py-3 font-mono text-[10px] text-[var(--muted-foreground)]">/{tag.slug}</td>
                    <td className="py-3 text-[var(--muted-foreground)] font-semibold">{tag.usageCount} Products linked</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDelete(tag.id)} className="p-1 hover:bg-rose-500/10 text-rose-500 rounded cursor-pointer transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
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
