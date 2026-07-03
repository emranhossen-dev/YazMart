"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Plus, Search, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { getBrands, createBrand, updateBrand, deleteBrand } from "@/actions/pim-products";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface Brand {
  id: string;
  name: string;
  logo: string;
  productCount: number;
  featured: boolean;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [featured, setFeatured] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadBrands = async () => {
    setLoading(true);
    const res = await getBrands();
    if (res.brands) {
      setBrands(res.brands.map((b: any) => ({
        id: b.id,
        name: b.name,
        logo: b.logo_url,
        productCount: b.productCount,
        featured: b.featured
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const res = await createBrand({ name: name.trim(), status: featured ? "ACTIVE" : "INACTIVE" });
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Brand added successfully!");
      setName("");
      setFeatured(false);
      await loadBrands();
    }
    setLoading(false);
  };

  const toggleFeatured = async (id: string) => {
    const brand = brands.find(b => b.id === id);
    if (!brand) return;
    const newStatus = brand.featured ? "INACTIVE" : "ACTIVE";
    setLoading(true);
    const res = await updateBrand(id, { name: brand.name, status: newStatus });
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Brand status updated.");
      await loadBrands();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Deleting this brand will make all its products unbranded, but products will not be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
      background: "#121420",
      color: "#f8fafc",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33"
    });

    if (result.isConfirmed) {
      setLoading(true);
      const res = await deleteBrand(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Brand deleted successfully!");
        await loadBrands();
      }
      setLoading(false);
    }
  };

  const filtered = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedBrands = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white rounded-lg text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-xs">
              {loading ? "Processing..." : "Save Brand Ledger"}
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
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
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
                {loading && brands.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-400">
                      Loading brands registry...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-400">
                      No brands found.
                    </td>
                  </tr>
                ) : (
                  paginatedBrands.map((brand) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION PANEL */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] text-xs">
              <span className="text-[var(--muted-foreground)]">Showing page {currentPage} of {totalPages}</span>
              <div className="flex gap-1">
                <button 
                  type="button" 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1.5 border border-[var(--border)] rounded hover:bg-[var(--accent)] disabled:opacity-50 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  type="button" 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-1.5 border border-[var(--border)] rounded hover:bg-[var(--accent)] disabled:opacity-50 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
