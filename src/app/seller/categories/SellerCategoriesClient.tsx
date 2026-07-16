"use client";

import React, { useState } from "react";
import { createCategory, deleteCategory } from "@/actions/categories";
import { FolderHeart, Plus, Search, FolderPlus, FolderOpen, HelpCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  parent_id?: string | null;
  description?: string | null;
  status: string;
}

interface SellerCategoriesClientProps {
  initialCategories: Category[];
}

export default function SellerCategoriesClient({
  initialCategories,
}: SellerCategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [description, setDescription] = useState("");

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"? Linked products will become uncategorized.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await deleteCategory(id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Category deleted successfully!");
        window.location.reload();
      }
    } catch (err) {
      toast.error("Failed to delete category.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("description", description.trim());
      fd.append("parent_id", parentId);
      fd.append("status", "ACTIVE");
      fd.append("is_featured", "false");

      const res = await createCategory(fd);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Category published successfully!");
        
        // Optimistic refresh - reload the page or update list
        setName("");
        setParentId("");
        setDescription("");
        
        // Since we are on client side, a page reload will pull the fresh active taxonomy hierarchy
        window.location.reload();
      }
    } catch (err) {
      toast.error("Failed to establish new category node.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 select-none font-sans max-w-[1700px] mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Category Taxonomy Deck</h1>
        <p className="text-xs font-semibold text-zinc-400">Manage multi-level hierarchies, subcategories, and map your product catalog.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left Column: Create Form */}
        <div className="p-5 rounded-3xl border border-zinc-200 bg-white shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
            <FolderPlus className="h-4 w-4 text-blue-600" /> Establish Taxonomy Node
          </h3>
          
          <form onSubmit={handleCreateCategory} className="space-y-4 pt-1">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Category Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Leather Footwear, Smart Gadgets"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Parent Category (Optional)</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="">No Parent (Top-level Category)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Briefly describe this category node..."
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-opacity cursor-pointer text-center"
            >
              {loading ? "Saving..." : "Publish Category"}
            </button>
          </form>
        </div>

        {/* Right Column: Taxonomy Directory */}
        <div className="lg:col-span-2 p-5 rounded-3xl border border-zinc-200 bg-white shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <h3 className="text-xs font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-blue-600" /> Active Platform Taxonomies
            </h3>
            
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-2xl max-w-xs w-full">
              <Search className="h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search taxonomy..."
                className="bg-transparent border-none text-xs focus:outline-none w-full text-zinc-800"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {filteredCategories.length === 0 ? (
              <div className="col-span-full border border-dashed border-zinc-200 rounded-3xl py-12 text-center text-zinc-400">
                <FolderHeart className="mx-auto h-10 w-10 opacity-45 mb-2" />
                No matching active categories found.
              </div>
            ) : (
              filteredCategories.map((category) => {
                const parent = categories.find((c) => c.id === category.parent_id);
                return (
                  <div key={category.id} className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 shadow-sm flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-600">
                        <FolderHeart className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-zinc-900 truncate">
                          {parent ? `${parent.name} > ` : ""}{category.name}
                        </h4>
                        {category.description && (
                          <p className="text-[10px] text-zinc-400 truncate max-w-[150px]">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-500 cursor-pointer transition-colors shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
