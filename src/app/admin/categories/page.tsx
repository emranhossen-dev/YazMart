"use client";

import React, { useState, useEffect } from "react";
import { createCategory, getCategories, deleteCategory, updateCategory } from "../../../actions/categories";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ডাটা লোড করার ফাংশন
  const loadCategories = async () => {
    const res = await getCategories();
    if (res.categories) setCategories(res.categories as unknown as Category[]);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ক্রিয়েট সাবমিট হ্যান্ডলার

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = e.currentTarget; // ফর্মের রেফারেন্সটি আগেই ধরে রাখা হলো
    const formData = new FormData(form);
    const res = await createCategory(formData);

    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: res.success || "" });
      form.reset(); // এখন আর নাল এরর আসবে না
      await loadCategories();
    }
    setLoading(false);
  };
  
  // আপডেট হ্যান্ডলার
  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    const res = await updateCategory(id, editName);
    if (res.error) {
      alert(res.error);
    } else {
      setEditingId(null);
      await loadCategories();
    }
  };

  // ডিলিট হ্যান্ডলার
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const res = await deleteCategory(id);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: res.success || "" });
      await loadCategories();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-[var(--muted-foreground)]">Manage structure and taxonomies for your ecommerce inventory.</p>
      </div>

      {message && (
        <div className={`p-3 rounded text-sm max-w-md ${
          message.type === "success" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left: Create Form */}
        <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--card)] h-fit">
          <h3 className="font-semibold mb-4">Add New Category</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--muted-foreground)]">Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] text-sm"
                placeholder="e.g., Electronics"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              {loading ? "Creating..." : "Add Category"}
            </button>
          </form>
        </div>

        {/* Right: Categories List Table */}
        <div className="md:col-span-2 p-6 rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <h3 className="font-semibold mb-4">All Categories</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Slug</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-[var(--muted-foreground)]">No categories found.</td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-medium">
                        {editingId === category.id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2 py-1 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-sm focus:outline-none"
                          />
                        ) : (
                          category.name
                        )}
                      </td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{category.slug}</td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {editingId === category.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdate(category.id)}
                                className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded transition-colors cursor-pointer"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)] rounded transition-colors cursor-pointer"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(category.id);
                                  setEditName(category.name);
                                }}
                                className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded transition-colors cursor-pointer"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(category.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
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