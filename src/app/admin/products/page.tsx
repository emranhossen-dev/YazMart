"use client";

import React, { useState, useEffect } from "react";
import { createProduct, getProducts, deleteProduct } from "../../../actions/products";
import { getCategories } from "../../../actions/categories";
import { Plus, Trash2, PackagePlus, AlertTriangle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categories: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = async () => {
    const prodRes = await getProducts();
    const catRes = await getCategories();
    if (prodRes.products) {
      setProducts(prodRes.products.map((p: any) => ({
        ...p,
        stock: p.stock_quantity ?? 0,
      })));
    }
    if (catRes.categories) setCategories(catRes.categories as unknown as Category[]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await createProduct(formData);

    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: res.success || "" });
      form.reset();
      await loadData();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const res = await deleteProduct(id);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: res.success || "" });
      await loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products Inventory</h1>
        <p className="text-[var(--muted-foreground)]">Manage your ERP stocks, baseline pricing, and catalog categorizations.</p>
      </div>

      {message && (
        <div className={`p-3 rounded text-sm max-w-md ${
          message.type === "success" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Add Product Form */}
        <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--card)] h-fit">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <PackagePlus className="h-4 w-4" /> Add New Product
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--muted-foreground)]">Product Name</label>
              <input type="text" name="name" required className="w-full px-3 py-2 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--primary)]" placeholder="e.g., Wireless Mouse" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--muted-foreground)]">Category</label>
              <select name="categoryId" required className="w-full px-3 py-2 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--primary)]">
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted-foreground)]">Price ($)</label>
                <input type="number" step="0.01" name="price" required className="w-full px-3 py-2 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--primary)]" placeholder="29.99" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted-foreground)]">Initial Stock</label>
                <input type="number" name="stock" required className="w-full px-3 py-2 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--primary)]" placeholder="100" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--muted-foreground)]">Description</label>
              <textarea name="description" rows={3} className="w-full px-3 py-2 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--primary)]" placeholder="Optional specifications..." />
            </div>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer">
              <Plus className="h-4 w-4" />
              {loading ? "Adding Product..." : "Add Product"}
            </button>
          </form>
        </div>

        {/* Right: Products Inventory List Table */}
        <div className="lg:col-span-2 p-6 rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <h3 className="font-semibold mb-4">Current Stock Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium">Stock</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-[var(--muted-foreground)]">No products in inventory yet.</td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-medium">
                        <div>
                          <p>{product.name}</p>
                          {product.description && <p className="text-xs text-[var(--muted-foreground)] font-normal line-clamp-1">{product.description}</p>}
                        </div>
                      </td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">
                        {product.categories ? product.categories.name : "Uncategorized"}
                      </td>
                      <td className="py-3.5 font-semibold">${product.price.toFixed(2)}</td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          product.stock < 10 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                        }`}>
                          {product.stock < 10 && <AlertTriangle className="h-3 w-3" />}
                          {product.stock} pcs
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button type="button" onClick={() => handleDelete(product.id)} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded transition-colors cursor-pointer">
                          <Trash2 className="h-4 w-4" />
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