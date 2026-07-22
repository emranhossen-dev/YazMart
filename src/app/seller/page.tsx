import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEnterpriseUserSession } from "@/actions/auth-enterprise";
import { getSellerStore, getSellerDashboardData } from "@/actions/seller";
import SellerOnboarding from "@/components/SellerOnboarding";
import {
  IndianRupee, ShoppingBag, Receipt, Truck, ArrowUpRight, Plus, Settings, Store
} from "lucide-react";

export const unstable_instant = false;

import { getActiveSellerStore } from "@/actions/seller-session";

export default async function SellerDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ store_id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const storeSession = await getActiveSellerStore(resolvedParams.store_id);

  const { store, user: sessionUser } = storeSession || {
    store: {
      id: resolvedParams.store_id || "default-store-id",
      name: "Seller Workspace",
      status: "ACTIVE"
    },
    user: { id: "seller-user-id", name: "Merchant Seller" },
    isImpersonating: false
  };
  const session = { user: sessionUser, role: storeSession?.isImpersonating ? "Admin Impersonator" : "Seller Merchant" };

  // Fetch dashboard metrics
  const statsRes = await getSellerDashboardData(store.id);
  const stats = statsRes.stats || {
    productsCount: 0,
    ordersCount: 0,
    totalSales: 0,
    pendingOrdersCount: 0
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 md:text-3xl">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-xs font-semibold text-zinc-400">
            Here is what is happening with your store <strong className="text-zinc-700">{store.name}</strong> today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/seller/products"
            className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Manage Products
          </Link>
          <Link
            href="/seller/settings"
            className="flex items-center gap-1.5 rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
          >
            <Settings className="h-3.5 w-3.5" /> Edit Store Settings
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Earnings Card */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Total Revenue</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <span className="text-sm font-bold">৳</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold tracking-tight text-zinc-950">
              ৳{stats.totalSales.toLocaleString()}
            </h3>
            <p className="mt-1 text-[10px] font-bold text-emerald-600">From successful settlements</p>
          </div>
        </div>

        {/* Orders Count Card */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Total Orders</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold tracking-tight text-zinc-950">
              {stats.ordersCount}
            </h3>
            <p className="mt-1 text-[10px] font-bold text-zinc-400">Lifetime client purchases</p>
          </div>
        </div>

        {/* Active Products Card */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Store Products</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold tracking-tight text-zinc-950">
              {stats.productsCount}
            </h3>
            <p className="mt-1 text-[10px] font-bold text-zinc-400">Published online items</p>
          </div>
        </div>

        {/* Pending Shipments Card */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Pending Actions</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold tracking-tight text-zinc-950">
              {stats.pendingOrdersCount}
            </h3>
            <p className="mt-1 text-[10px] font-bold text-amber-600">Orders requiring shipment</p>
          </div>
        </div>
      </div>

      {/* Quick Dashboard Shortcuts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Shortcut Banner 1 */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between h-48">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-white">
              <Plus className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-extrabold text-zinc-950">Expand Your Inventory</h3>
            <p className="mt-1 text-xs text-zinc-500 leading-relaxed max-w-sm">
              Add new items, configure specifications, load galleries, and manage current stock limits.
            </p>
          </div>
          <Link
            href="/seller/products"
            className="flex items-center gap-1 text-xs font-extrabold text-zinc-950 hover:underline"
          >
            Add New Product <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Shortcut Banner 2 */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between h-48">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900">
              <Store className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-extrabold text-zinc-950">Customize Brand Style</h3>
            <p className="mt-1 text-xs text-zinc-500 leading-relaxed max-w-sm">
              Update logo, banners, store summary, and configure theme primary/secondary colors.
            </p>
          </div>
          <Link
            href="/seller/settings"
            className="flex items-center gap-1 text-xs font-extrabold text-zinc-950 hover:underline"
          >
            Edit Settings <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
