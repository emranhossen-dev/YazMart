"use client";

import React, { useState } from "react";
import { Sliders, Plus, Trash2 } from "lucide-react";

interface Attribute {
  id: string;
  name: string;
  code: string;
  values: string[];
}

const INITIAL_ATTRIBUTES: Attribute[] = [
  { id: "ATT-001", name: "Color Theme", code: "color", values: ["Charcoal Black", "Slate Blue", "Emerald Green", "Crimson Red"] },
  { id: "ATT-002", name: "Clothing Size", code: "size", values: ["XS", "S", "M", "L", "XL", "XXL"] },
  { id: "ATT-003", name: "Shoe Width", code: "shoe-width", values: ["Narrow", "Standard", "Wide"] },
  { id: "ATT-004", name: "Material Matrix", code: "material", values: ["100% Cotton", "Polyester Blend", "Full-grain Leather", "Canvas"] }
];

export default function SellerAttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>(INITIAL_ATTRIBUTES);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [valInput, setValInput] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    const valuesArray = valInput
      .split(",")
      .map(v => v.trim())
      .filter(v => v.length > 0);

    const newAttr: Attribute = {
      id: `ATT-${Date.now().toString().slice(-3)}`,
      name,
      code: code.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      values: valuesArray.length > 0 ? valuesArray : ["Default"]
    };

    setAttributes([...attributes, newAttr]);
    setName("");
    setCode("");
    setValInput("");
  };

  const handleDelete = (id: string) => {
    setAttributes(attributes.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 select-none font-sans">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Store Attributes</h1>
        <p className="text-xs font-semibold text-zinc-400">Configure product specification variations and options taxonomy values.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Creator Form */}
        <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-zinc-400 flex items-center gap-2">
            <Plus className="h-4 w-4 text-zinc-600" /> Create Specification Attribute
          </h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Attribute Label</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none" 
                placeholder="e.g. Memory Size" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Code Slug</label>
              <input 
                type="text" 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                required 
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none" 
                placeholder="e.g. ram-size" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Allowed Option Values (Comma Separated)</label>
              <input 
                type="text" 
                value={valInput} 
                onChange={(e) => setValInput(e.target.value)} 
                required 
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none" 
                placeholder="e.g. 8GB, 16GB, 32GB" 
              />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-1.5 rounded-full bg-zinc-950 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 cursor-pointer">
              Add Attribute
            </button>
          </form>
        </div>

        {/* List View */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-zinc-400">Available Attribute Options</h3>
          
          <div className="divide-y divide-zinc-100">
            {attributes.map((attr) => (
              <div key={attr.id} className="flex items-start justify-between py-4 first:pt-0 last:pb-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-zinc-950">{attr.name}</span>
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider">{attr.code}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {attr.values.map((v, i) => (
                      <span key={i} className="rounded-full border border-zinc-200 bg-zinc-50/50 px-2 py-0.5 text-[9px] font-bold text-zinc-600">{v}</span>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => handleDelete(attr.id)} 
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
