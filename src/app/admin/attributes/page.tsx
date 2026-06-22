"use client";

import React, { useState } from "react";
import { Sliders, Plus, Trash2, Tag } from "lucide-react";

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

export default function AttributesPage() {
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
        <h1 className="text-xl font-black uppercase tracking-tight">Product Attributes</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Configure product specification variations and options taxonomy values.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Creator Form */}
        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
            <Plus className="h-4 w-4 text-blue-500" /> Create Attribute Type
          </h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Display Title</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Size, Material" 
                className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500 text-[var(--foreground)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Attribute Identifier Code</label>
              <input 
                type="text" 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                placeholder="e.g. size, mat-type" 
                className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500 text-[var(--foreground)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Option Values (Comma Separated)</label>
              <input 
                type="text" 
                value={valInput} 
                onChange={(e) => setValInput(e.target.value)} 
                placeholder="e.g. Small, Medium, Large" 
                className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500 text-[var(--foreground)]"
              />
            </div>
            <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-xs">
              Commit Attribute Type
            </button>
          </form>
        </div>

        {/* Directory Ledger */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
            <Sliders className="h-4 w-4 text-blue-500" /> Active Attribute Schema
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                  <th className="pb-3">Variation Schema ID</th>
                  <th className="pb-3">Display Title</th>
                  <th className="pb-3">Database Code</th>
                  <th className="pb-3">Option Value Arrays</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-medium">
                {attributes.map((attr) => (
                  <tr key={attr.id} className="hover:bg-[var(--background)]/50 transition-colors">
                    <td className="py-3 font-mono text-[10px] text-[var(--muted-foreground)]">{attr.id}</td>
                    <td className="py-3 font-bold text-[var(--foreground)]">{attr.name}</td>
                    <td className="py-3 font-mono text-[10px] text-[var(--muted-foreground)]">{attr.code}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {attr.values.map((v, i) => (
                          <span key={i} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--accent)] text-blue-500 border border-[var(--border)]">
                            <Tag className="h-2.5 w-2.5" /> {v}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDelete(attr.id)} className="p-1 hover:bg-rose-500/10 text-rose-500 rounded cursor-pointer transition-colors">
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
