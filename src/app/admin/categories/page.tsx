"use client";

import React, { useState, useEffect } from "react";
import { createCategory, getCategories, deleteCategory, updateCategory, deleteMultipleCategories, bulkImportCategories } from "@/actions/categories";
import { uploadImage } from "@/actions/upload";
import { Plus, Trash2, Edit3, FolderPlus, Search, Image as ImageIcon, CheckCircle, XCircle, Star, ChevronRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  is_featured: boolean;
  image_url: string | null;
  parent_id: string | null;
  parent?: Category | null;
  sub_categories?: Category[];
}

export default function EnterpriseCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [formTab, setFormTab] = useState<"manual" | "bulk">("manual");
  const [bulkJsonInput, setBulkJsonInput] = useState("");
  const [bulkErrorDetails, setBulkErrorDetails] = useState<string[]>([]);

  const handleLoadSampleCategoryJson = () => {
    const sample = [
      {
        "name": "Smart Electronics",
        "description": "Smart watches, smart home gadgets, and internet of things controllers.",
        "status": "ACTIVE",
        "is_featured": true,
        "image_url": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=400&auto=format&fit=crop"
      },
      {
        "name": "Mechanical Keyboards",
        "description": "Custom keycaps, hot-swappable tactile switches, and fully assembled gaming decks.",
        "parent_id": categories[0]?.id || undefined,
        "status": "ACTIVE",
        "is_featured": false,
        "image_url": "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=400&auto=format&fit=crop"
      },
      {
        "name": "Premium Audio Gear",
        "description": "Noise-cancelling headphones, high-fidelity studio monitors, and portable wireless speakers.",
        "status": "ACTIVE",
        "is_featured": true,
        "image_url": "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=400&auto=format&fit=crop"
      },
      {
        "name": "Ergonomic Office Furniture",
        "description": "Orthopedic mesh chairs, height-adjustable standing desks, and desk organizers.",
        "status": "ACTIVE",
        "is_featured": false,
        "image_url": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=400&auto=format&fit=crop"
      },
      {
        "name": "Fitness & Health Gear",
        "description": "Smart jump ropes, heavy-duty resistance bands, and intelligent body fat scale matrices.",
        "status": "ACTIVE",
        "is_featured": false,
        "image_url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop"
      },
      {
        "name": "Premium Leather Goods",
        "description": "Handcrafted full-grain leather wallets, luxury belts, and professional messenger bags.",
        "status": "ACTIVE",
        "is_featured": true,
        "image_url": "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=400&auto=format&fit=crop"
      },
      {
        "name": "Smart Ambient Lighting",
        "description": "App-controlled RGB LED light strips, decorative neon table lamps, and bedside sleep lights.",
        "status": "ACTIVE",
        "is_featured": false,
        "image_url": "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?q=80&w=400&auto=format&fit=crop"
      },
      {
        "name": "Pro Gaming Accessories",
        "description": "Ultra-lightweight wireless mice, speed-surface mousepads, and heavy-duty headset stands.",
        "status": "ACTIVE",
        "is_featured": true,
        "image_url": "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?q=80&w=400&auto=format&fit=crop"
      },
      {
        "name": "Men's Designer Apparel",
        "description": "Premium cotton tees, formal tailored suits, and comfortable outdoor windbreakers.",
        "status": "ACTIVE",
        "is_featured": false,
        "image_url": "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop"
      },
      {
        "name": "Organic Cosmetics",
        "description": "All-natural botanical face scrubs, charcoal masks, and hydrating night creams.",
        "status": "ACTIVE",
        "is_featured": false,
        "image_url": "https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=400&auto=format&fit=crop"
      }
    ];
    setBulkJsonInput(JSON.stringify(sample, null, 2));
  };

  const handleExecuteBulkImportCategories = async () => {
    setLoading(true);
    setMessage(null);
    setBulkErrorDetails([]);
    try {
      const parsed = JSON.parse(bulkJsonInput);
      if (!Array.isArray(parsed)) {
        setMessage({ type: "error", text: "Invalid JSON format. Expected an array of category objects." });
        setLoading(false);
        return;
      }
      const res = await bulkImportCategories(parsed);
      if (res.error) {
        setMessage({ type: "error", text: res.error });
        if (res.details) setBulkErrorDetails(res.details);
      } else {
        setMessage({ type: "success", text: res.success || "Categories bulk imported successfully!" });
        setBulkJsonInput("");
        await loadCategories();
      }
    } catch (e: any) {
      setMessage({ type: "error", text: `JSON Syntax Error: ${e.message}` });
    }
    setLoading(false);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedCategoryIds.length} categories? This cannot be undone.`)) return;
    setLoading(true);
    const res = await deleteMultipleCategories(selectedCategoryIds);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: res.success || "Selected categories deleted." });
      setSelectedCategoryIds([]);
      await loadCategories();
    }
    setLoading(false);
  };

  // Edit Mode States
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form Field States
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [isFeatured, setIsFeatured] = useState(false);

  const loadCategories = async () => {
    const res = await getCategories();
    if (res.categories) setCategories(res.categories as any);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setParentId("");
    setImageUrl("");
    setStatus("ACTIVE");
    setIsFeatured(false);
    setMessage(null);
    setSelectedCategoryIds([]);
  };

  const handleEditInit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setParentId(cat.parent_id || "");
    setImageUrl(cat.image_url || "");
    setStatus(cat.status);
    setIsFeatured(cat.is_featured);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    const res = await uploadImage(fd);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else if (res.url) {
      setImageUrl(res.url);
      setMessage({ type: "success", text: "Image uploaded successfully!" });
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", description);
    fd.append("parent_id", parentId);
    fd.append("image_url", imageUrl);
    fd.append("status", status);
    fd.append("is_featured", String(isFeatured));

    let res;
    if (editingCategory) {
      res = await updateCategory(editingCategory.id, fd);
    } else {
      res = await createCategory(fd);
    }

    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: res.success || "Operation complete!" });
      resetForm();
      await loadCategories();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category node? This might break dependent child links.")) return;
    const res = await deleteCategory(id);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: res.success || "Category deleted." });
      await loadCategories();
    }
  };

  // Filter Logic
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || cat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 select-none font-sans max-w-[1700px] mx-auto p-1">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Category Taxonomy Deck</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Manage multi-level hierarchies, subcategories, status matrices, and image assets.</p>
      </div>

      {message && (
        <div className={`p-3 rounded text-xs font-bold max-w-xl ${
          message.type === "success" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/10" : "bg-rose-500/10 text-rose-500 border border-rose-500/10"
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left Column: Form Setup (Add/Edit / Bulk) */}
        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
          <div className="flex border-b border-[var(--border)] pb-2 text-[10px] uppercase font-bold text-[var(--muted-foreground)] gap-3">
            <button
              type="button"
              onClick={() => setFormTab("manual")}
              className={`pb-1 cursor-pointer hover:text-[var(--foreground)] ${formTab === "manual" ? "border-b-2 border-blue-500 text-blue-500" : ""}`}
            >
              Manual Form
            </button>
            <button
              type="button"
              onClick={() => setFormTab("bulk")}
              className={`pb-1 cursor-pointer hover:text-[var(--foreground)] ${formTab === "bulk" ? "border-b-2 border-blue-500 text-blue-500" : ""}`}
            >
              Bulk JSON Upload
            </button>
          </div>

          {formTab === "manual" ? (
            <>
              <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                <FolderPlus className="h-4 w-4 text-blue-500" /> 
                {editingCategory ? `Modify Node: ${editingCategory.name}` : "Establish Taxonomy"}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Category Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500 font-medium" 
                    placeholder="e.g., Electronics, Smart Watches" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Parent Category</label>
                  <select 
                    value={parentId} 
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="">No Parent (Top-level Category)</option>
                    {categories
                      .filter((cat) => !editingCategory || cat.id !== editingCategory.id) // Avoid self nesting
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.parent ? `${cat.parent.name} > ` : ""}{cat.name}
                        </option>
                      ))
                    }
                  </select>
                </div>

                {/* Category Image Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Category Image</label>
                  <div className="flex gap-3 items-center">
                    {imageUrl ? (
                      <div className="relative w-16 h-16 border border-[var(--border)] rounded bg-[var(--background)] overflow-hidden">
                        <img src={imageUrl} className="w-full h-full object-contain" />
                        <button 
                          type="button" 
                          onClick={() => setImageUrl("")} 
                          className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 border border-dashed border-[var(--border)] rounded flex items-center justify-center text-[var(--muted-foreground)]">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                        id="cat-image-file" 
                      />
                      <label 
                        htmlFor="cat-image-file" 
                        className="inline-block px-3 py-1.5 bg-[var(--background)] hover:bg-[var(--accent)] border border-[var(--border)] text-[10px] font-bold uppercase rounded cursor-pointer transition-colors"
                      >
                        {uploading ? "Uploading..." : "Upload Image"}
                      </label>
                      <p className="text-[9px] text-[var(--muted-foreground)] mt-1">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Status</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-bold"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end pb-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-[var(--foreground)] cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={isFeatured} 
                        onChange={(e) => setIsFeatured(e.target.checked)} 
                        className="rounded bg-[var(--background)] border-[var(--border)] text-blue-500 h-4 w-4"
                      />
                      <span>Featured Category</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Description</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    rows={3} 
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500" 
                    placeholder="Describe this category hierarchy..." 
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    type="submit" 
                    disabled={loading || uploading} 
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer text-center"
                  >
                    {loading ? "Saving..." : editingCategory ? "Update Node" : "Publish Category"}
                  </button>
                  {editingCategory && (
                    <button 
                      type="button" 
                      onClick={resetForm} 
                      className="px-3 py-2 bg-[var(--background)] hover:bg-[var(--accent)] border border-[var(--border)] text-xs font-bold uppercase rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                <FolderPlus className="h-4 w-4 text-blue-500" /> 
                Bulk Import Taxonomy
              </h3>
              
              <div className="flex gap-2 bg-[var(--background)] p-2 rounded border border-[var(--border)]">
                <button 
                  type="button" 
                  onClick={handleLoadSampleCategoryJson} 
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] cursor-pointer"
                >
                  ⚡ Load Sample JSON
                </button>
                {bulkJsonInput && (
                  <button 
                    type="button" 
                    onClick={() => {
                      navigator.clipboard.writeText(bulkJsonInput);
                      alert("Copied sample categories JSON to clipboard!");
                    }}
                    className="px-2.5 py-1 bg-zinc-700 hover:bg-zinc-800 text-white font-bold rounded text-[10px] cursor-pointer"
                  >
                    📋 Copy JSON
                  </button>
                )}
              </div>

              <textarea 
                rows={10}
                value={bulkJsonInput}
                onChange={(e) => setBulkJsonInput(e.target.value)}
                placeholder='Paste categories JSON array: [{"name": "Category 1", "description": "Desc", "parent_id": "uuid"}]'
                className="w-full p-2.5 font-mono text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none"
              />

              {bulkErrorDetails.length > 0 && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/10 rounded text-[10px] font-mono text-rose-500 space-y-1 max-h-32 overflow-y-auto">
                  <p className="font-bold">Errors found:</p>
                  {bulkErrorDetails.map((err, idx) => (
                    <p key={idx}>• {err}</p>
                  ))}
                </div>
              )}

              <button 
                type="button"
                onClick={handleExecuteBulkImportCategories}
                disabled={loading || !bulkJsonInput}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer text-center"
              >
                {loading ? "Importing..." : "Import Categories"}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Matrix List View */}
        <div className="lg:col-span-2 p-5 border border-[var(--border)] bg-[var(--card)] rounded-xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)]">Active System Taxonomies</h3>
              {selectedCategoryIds.length > 0 && (
                <button 
                  type="button" 
                  onClick={handleBulkDelete}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Trash2 className="h-3 w-3" /> Purge Selected ({selectedCategoryIds.length})
                </button>
              )}
              {categories.length > 0 && (
                <button 
                  type="button" 
                  onClick={() => {
                    const text = categories.map(c => `${c.name}: ${c.id}`).join("\n");
                    navigator.clipboard.writeText(text);
                    alert("Copied all Category name-ID pairs to clipboard!");
                  }}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                  title="Copy all active Category names and their corresponding IDs"
                >
                  📋 Copy All IDs
                </button>
              )}
            </div>
            
            {/* Filters */}
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Search categories..." 
                  className="pl-8 pr-3 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500 font-medium w-full"
                />
              </div>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-bold"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                  <th className="pb-3 w-8">
                    <input 
                      type="checkbox" 
                      checked={filteredCategories.length > 0 && selectedCategoryIds.length === filteredCategories.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategoryIds(filteredCategories.map(c => c.id));
                        } else {
                          setSelectedCategoryIds([]);
                        }
                      }}
                      className="rounded bg-[var(--background)] border-[var(--border)] text-blue-500 h-3.5 w-3.5 cursor-pointer"
                    />
                  </th>
                  <th className="pb-3">Thumbnail</th>
                  <th className="pb-3">Category Title Node</th>
                  <th className="pb-3">Parent Route</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Featured</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-medium">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-[var(--muted-foreground)] font-normal">No operational nodes active in configuration stack.</td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[var(--background)]/40 transition-colors">
                      <td className="py-3">
                        <input 
                          type="checkbox"
                          checked={selectedCategoryIds.includes(cat.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategoryIds([...selectedCategoryIds, cat.id]);
                            } else {
                              setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== cat.id));
                            }
                          }}
                          className="rounded bg-[var(--background)] border-[var(--border)] text-blue-500 h-3.5 w-3.5 cursor-pointer"
                        />
                      </td>
                      <td className="py-3">
                        <div className="w-10 h-10 border border-[var(--border)] rounded bg-[var(--background)] flex items-center justify-center overflow-hidden p-0.5">
                          {cat.image_url ? (
                            <img src={cat.image_url} className="w-full h-full object-contain" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-[var(--border)]" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 font-bold">
                        <p className="text-blue-500">{cat.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[9px] text-[var(--muted-foreground)] bg-[var(--background)] border border-[var(--border)] px-1 py-0.5 rounded select-all">{cat.id}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(cat.id);
                              alert("Category UUID copied to clipboard!");
                            }}
                            className="text-[9px] text-blue-500 hover:text-blue-600 hover:underline font-black uppercase cursor-pointer"
                          >
                            Copy
                          </button>
                        </div>
                        <p className="font-mono text-[9px] text-[var(--muted-foreground)] mt-1">{cat.slug}</p>
                      </td>
                      <td className="py-3 text-[var(--muted-foreground)]">
                        {cat.parent ? (
                          <span className="bg-[var(--background)] px-1.5 py-0.5 rounded border border-[var(--border)] text-[10px]">
                            {cat.parent.name}
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-400">Root Node</span>
                        )}
                      </td>
                      <td className="py-3">
                        {cat.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                            <CheckCircle className="h-3 w-3" /> ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">
                            <XCircle className="h-3 w-3" /> INACTIVE
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        {cat.is_featured ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> FEATURED
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-400">-</span>
                        )}
                      </td>
                      <td className="py-3 text-right space-x-1">
                        <button 
                          type="button" 
                          onClick={() => handleEditInit(cat)} 
                          className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleDelete(cat.id)} 
                          className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
    </div>
  );
}