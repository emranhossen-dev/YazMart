import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEnterpriseUserSession } from "@/actions/auth-enterprise";
import { getSellerStore } from "@/actions/seller";
import { 
  LayoutDashboard, ShoppingBag, Receipt, Settings, Home, LogOut, Store as StoreIcon 
} from "lucide-react";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await getEnterpriseUserSession();

  if (!session.authenticated || !session.user) {
    notFound();
  }

  // Get seller store if it exists
  const storeRes = await getSellerStore(session.user.id);
  const store = storeRes.store;

  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Sidebar Navigation */}
      <aside className="hidden w-64 border-r border-zinc-200 bg-white p-5 md:flex md:flex-col md:justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white font-black text-sm">
              YM
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Seller Hub</span>
              <h2 className="text-sm font-extrabold text-zinc-950 tracking-tight leading-none">YazMart</h2>
            </div>
          </div>

          <nav className="space-y-1">
            <Link 
              href="/seller" 
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            {store && (
              <>
                <Link 
                  href="/seller/products" 
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                >
                  <ShoppingBag className="h-4 w-4" /> My Products
                </Link>
                <Link 
                  href="/seller/orders" 
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                >
                  <Receipt className="h-4 w-4" /> Orders Ledger
                </Link>
                <Link 
                  href="/seller/settings" 
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                >
                  <Settings className="h-4 w-4" /> Store Settings
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="space-y-2 border-t border-zinc-100 pt-4">
          {store && (
            <a 
              href={`/stores/${store.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <StoreIcon className="h-4 w-4" /> View Storefront
            </a>
          )}
          <Link 
            href="/" 
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Home className="h-4 w-4" /> Back to YazMart
          </Link>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-sm font-extrabold text-zinc-950">YazMart Hub</span>
          </div>

          <div className="hidden items-center gap-2.5 md:flex">
            {store ? (
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-bold text-zinc-800">
                Active Store: <strong className="text-zinc-950">{store.name}</strong>
              </span>
            ) : (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
                Onboarding Needed
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-extrabold text-zinc-900">{session.user.name}</p>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{session.role}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 font-mono text-xs font-bold uppercase text-white">
              {session.user.name?.charAt(0) || "U"}
            </div>
          </div>
        </header>

        {/* Dashboard Area */}
        <main className="flex-1 overflow-y-auto bg-zinc-50 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
