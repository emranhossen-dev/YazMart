"use client";

import React, { useState } from "react";
import { createBrand, deleteBrand } from "@/actions/pim-products";
import { Award, Plus, Search, Tag, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface Brand {
  id: string;
  name: string;
  logo_url?: string | null;
  status: string;
}

interface SellerBrandsClientProps {
  initialBrands: Brand[];
}

export default function SellerBrandsClient({
  initialBrands,
}: SellerBrandsClientProps) {
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");

  const handleDeleteBrand = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the brand tag "${name}"? Linked products will become unbranded.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await deleteBrand(id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Brand tag deleted successfully!");
        window.location.reload();
      }
    } catch (err) {
      toast.error("Failed to delete brand.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Brand name is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await createBrand({
        name: name.trim(),
        status: "ACTIVE"
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Brand registered successfully!");
        setName("");
        
        // Reload page to pull updated brand registry list
        window.location.reload();
      }
    } catch (err) {
      toast.error("Failed to register brand tag.");
    } finally {
      setLoading(false);
    }
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none font-sans max-w-[1700px] mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Brand Registry</h1>
        <p className="text-xs font-semibold text-zinc-400">Register brand tags to associate them with your products for search visibility.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left Column: Register Form */}
        <div className="p-5 rounded-3xl border border-zinc-200 bg-white shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
            <Plus className="h-4 w-4 text-blue-600" /> Register Brand Tag
          </h3>
          
          <form onSubmit={handleRegisterBrand} className="space-y-4 pt-1">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Brand Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Adidas, Samsung"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-opacity cursor-pointer text-center"
            >
              {loading ? "Registering..." : "Register Brand"}
            </button>
          </form>
        </div>

        {/* Right Column: Brands Directory */}
        <div className="lg:col-span-2 p-5 rounded-3xl border border-zinc-200 bg-white shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <h3 className="text-xs font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-600" /> Authorized System Brands
            </h3>
            
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-2xl max-w-xs w-full">
              <Search className="h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brands..."
                className="bg-transparent border-none text-xs focus:outline-none w-full text-zinc-800"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {filteredBrands.length === 0 ? (
              <div className="col-span-full border border-dashed border-zinc-200 rounded-3xl py-12 text-center text-zinc-400">
                <Award className="mx-auto h-10 w-10 opacity-45 mb-2" />
                No matching brands registered.
              </div>
            ) : (
              filteredBrands.map((brand) => (
                <div key={brand.id} className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-600">
                      <Award className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs text-zinc-900 truncate">{brand.name}</h4>
                      <p className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wider">Active Tag</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleDeleteBrand(brand.id, brand.name)}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-500 cursor-pointer transition-colors shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
