"use client";

import React, { useState } from "react";
import { updateStoreStatus } from "@/actions/seller";
import { 
  Store, Check, X, Clock, AlertCircle, Search, Loader2, Calendar, ExternalLink 
} from "lucide-react";
import toast from "react-hot-toast";

interface StoreItem {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  banner_url?: string | null;
  description?: string | null;
  status: string;
  createdAt: string;
  owner_id: string;
}

interface AdminStoresClientProps {
  initialStores: StoreItem[];
}

export default function AdminStoresClient({ initialStores }: AdminStoresClientProps) {
  const [stores, setStores] = useState<StoreItem[]>(initialStores);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const handleStatusChange = async (storeId: string, status: "PENDING" | "ACTIVE" | "INACTIVE") => {
    setLoadingMap(prev => ({ ...prev, [storeId]: true }));
    try {
      const res = await updateStoreStatus(storeId, status);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Store status updated to ${status}.`);
        setStores(prev => 
          prev.map(s => s.id === storeId ? { ...s, status } : s)
        );
      }
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setLoadingMap(prev => ({ ...prev, [storeId]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600 border border-amber-200">
            <Clock className="h-3 w-3" /> Pending Review
          </span>
        );
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-200">
            <Check className="h-3 w-3" /> Active
          </span>
        );
      case "INACTIVE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-500 border border-rose-200">
            <AlertCircle className="h-3 w-3" /> Deactivated
          </span>
        );
      default:
        return <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-600">{status}</span>;
    }
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          store.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" ? true : store.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">Seller Stores Manager</h1>
        <p className="text-xs text-[var(--muted-foreground)]">Review store registrations, activate vendor channels, or deactivate sellers.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search stores by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-4 text-xs font-semibold focus:border-[var(--primary)] focus:outline-none text-[var(--foreground)] placeholder-[var(--muted-foreground)]"
          />
        </div>

        {/* Status Selection */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs font-bold text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Applications</option>
          <option value="PENDING">Pending Review</option>
          <option value="ACTIVE">Active Stores</option>
          <option value="INACTIVE">Deactivated</option>
        </select>
      </div>

      {/* Stores List Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredStores.length === 0 ? (
          <div className="col-span-full border border-dashed border-[var(--border)] rounded-2xl py-16 text-center text-[var(--muted-foreground)]">
            <Store className="mx-auto h-12 w-12 opacity-35 mb-2.5" />
            No store applications found.
          </div>
        ) : (
          filteredStores.map((store) => {
            const isLoading = loadingMap[store.id] || false;

            return (
              <div 
                key={store.id} 
                className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm hover:border-[var(--primary)]/40 transition-colors flex flex-col justify-between"
              >
                {/* Store Main Details */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-zinc-50 p-1">
                        {store.logo_url ? (
                          <img src={store.logo_url} alt={store.name} className="max-h-full max-w-full object-contain rounded-lg" />
                        ) : (
                          <Store className="h-5 w-5 text-zinc-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-[var(--foreground)] truncate">{store.name}</h4>
                        <a 
                          href={`/stores/${store.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-500 font-bold inline-flex items-center gap-1 hover:underline mt-0.5"
                        >
                          yazmart.com/stores/{store.slug} <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>

                    <div>{getStatusBadge(store.status)}</div>
                  </div>

                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-3 leading-relaxed min-h-[48px]">
                    {store.description || "No storefront description provided by the seller."}
                  </p>
                </div>

                {/* Footer Logistics and Actions */}
                <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1 text-[10px] text-[var(--muted-foreground)] font-semibold">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Applied: {new Date(store.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                    ) : (
                      <>
                        <a
                          href={`/seller?store_id=${store.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer"
                        >
                          <ExternalLink className="h-3 w-3" /> Manage
                        </a>
                        {store.status !== "ACTIVE" && (
                          <button
                            onClick={() => handleStatusChange(store.id, "ACTIVE")}
                            className="flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                          >
                            <Check className="h-3 w-3" /> Approve Store
                          </button>
                        )}
                        {store.status === "ACTIVE" && (
                          <button
                            onClick={() => handleStatusChange(store.id, "INACTIVE")}
                            className="flex items-center justify-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-rose-700 transition-colors cursor-pointer"
                          >
                            <X className="h-3 w-3" /> Suspend Store
                          </button>
                        )}
                        {store.status === "INACTIVE" && (
                          <button
                            onClick={() => handleStatusChange(store.id, "PENDING")}
                            className="flex items-center justify-center gap-1 rounded-lg border border-[var(--border)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer"
                          >
                            <Clock className="h-3 w-3" /> Reset Status
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
