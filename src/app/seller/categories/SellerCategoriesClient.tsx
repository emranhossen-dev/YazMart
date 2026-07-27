"use client";

import React, { useState } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/actions/categories";
import ImageUploader from "@/components/ImageUploader";
import { FolderHeart, Plus, Search, FolderPlus, FolderOpen, Trash2, Edit3, X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  slug?: string;
  parent_id?: string | null;
  parent_name?: string | null;
  description?: string | null;
  status: string;
  image_url?: string | null;
  is_featured?: boolean;
  product_count?: number;
}

interface SellerCategoriesClientProps {
  storeId: string;
  storeName: string;
  initialCategories: Category[];
  globalCategories: { id: string; name: string }[];
}

export default function SellerCategoriesClient({
  storeId,
  storeName,
  initialCategories,
  globalCategories,
}: SellerCategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [isFeatured, setIsFeatured] = useState(false);

  const resetForm = () => {
    setEditingCategory(null);
    setName("");
    setParentId("");
    setDescription("");
    setImageUrl("");
    setStatus("ACTIVE");
    setIsFeatured(false);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setParentId(cat.parent_id || "");
    setDescription(cat.description || "");
    setImageUrl(cat.image_url || "");
    setStatus(cat.status || "ACTIVE");
    setIsFeatured(cat.is_featured || false);
  };

  const handleDeleteCategory = async (id: string, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete the category "${catName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await deleteCategory(id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Category deleted successfully!");
        setCategories(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      toast.error("Failed to delete category.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
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
      fd.append("image_url", imageUrl);
      fd.append("status", status);
      fd.append("is_featured", isFeatured ? "true" : "false");
      fd.append("store_id", storeId); // Mandatory Store ID link!

      let res;
      if (editingCategory) {
        res = await updateCategory(editingCategory.id, fd);
      } else {
        res = await createCategory(fd);
      }

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(editingCategory ? "Category updated successfully!" : "Store category registered successfully!");
        resetForm();
        window.location.reload();
      }
    } catch (err) {
      toast.error("Failed to save store category node.");
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">
            Store Categories: <span className="text-amber-600 font-mono">{storeName}</span>
          </h1>
          <p className="text-xs font-semibold text-zinc-400">
            Create and manage categories exclusive to your seller store. Customers browsing your store will see these categories.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left Column: Create / Edit Form */}
        <div className="p-5 rounded-3xl border border-zinc-200 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
              <FolderPlus className="h-4 w-4 text-amber-500" />
              {editingCategory ? "Edit Store Category" : "Add Store Category"}
            </h3>
            {editingCategory && (
              <button
                type="button"
                onClick={resetForm}
                className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="h-3 w-3" /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitCategory} className="space-y-4 pt-1">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Category Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Premium Accessories, Summer Collection"
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
                <option value="">Top-level Store Category</option>
                <optgroup label="Your Store Categories">
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </optgroup>
                {globalCategories.length > 0 && (
                  <optgroup label="Main Store Parent Categories">
                    {globalCategories.map((gCat) => (
                      <option key={gCat.id} value={gCat.id}>{gCat.name} (Global)</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Image Uploader Component with Live Progress Bar */}
            <ImageUploader
              label="Category Thumbnail / Banner"
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
              multiple={false}
            />

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe what products belong to this category..."
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
                Feature in Storefront
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="text-xs font-bold border border-zinc-200 rounded-xl px-3 py-1.5 bg-zinc-50 focus:outline-none cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-opacity cursor-pointer text-center"
            >
              {loading ? "Saving..." : editingCategory ? "Update Store Category" : "Publish Store Category"}
            </button>
          </form>
        </div>

        {/* Right Column: Seller Category Directory */}
        <div className="lg:col-span-2 p-5 rounded-3xl border border-zinc-200 bg-white shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <h3 className="text-xs font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-amber-500" /> Store Categories ({filteredCategories.length})
            </h3>
            
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-2xl max-w-xs w-full">
              <Search className="h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search store categories..."
                className="bg-transparent border-none text-xs focus:outline-none w-full text-zinc-800"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {filteredCategories.length === 0 ? (
              <div className="col-span-full border border-dashed border-zinc-200 rounded-3xl py-12 text-center text-zinc-400 space-y-1">
                <FolderHeart className="mx-auto h-10 w-10 opacity-45 mb-2" />
                <p className="text-xs font-bold text-zinc-700">No store-specific categories added yet.</p>
                <p className="text-[11px] text-zinc-400">Use the form on the left to create categories for your store.</p>
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div key={category.id} className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 shadow-sm flex items-center justify-between gap-3 group hover:border-zinc-300 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    {category.image_url ? (
                      <img src={category.image_url} alt={category.name} className="h-10 w-10 shrink-0 rounded-xl object-cover border border-zinc-200" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 font-bold">
                        <FolderHeart className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-xs text-zinc-900 truncate">
                          {category.parent_name ? `${category.parent_name} > ` : ""}{category.name}
                        </h4>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${category.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-zinc-200 text-zinc-600"}`}>
                          {category.status}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-[10px] text-zinc-400 truncate max-w-[180px]">{category.description}</p>
                      )}
                      <p className="text-[9px] font-bold text-amber-600 mt-0.5">
                        {category.product_count || 0} products linked
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(category)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900 cursor-pointer transition-colors"
                      title="Edit Category"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-500 cursor-pointer transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
