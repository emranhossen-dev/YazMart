import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Store, ArrowRight, ShieldCheck, Star } from "lucide-react";

export const unstable_instant = false;

export default async function StoresDirectoryPage() {
  const stores = await prisma.store.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff6600]/20 border border-[#ff6600]/30 text-[#ff6600] text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" /> 100% Verified Merchant Partners
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Explore Official Brand & Seller Stores
            </h1>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Discover authentic products directly from certified merchants, manufacturers, and local vendors across Bangladesh.
            </p>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
            <Store className="h-80 w-80 text-white" />
          </div>
        </div>

        {/* Stores Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-950">Active Stores ({stores.length})</h2>
          </div>

          {stores.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-3">
              <Store className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="text-base font-bold text-slate-700">No active stores found</h3>
              <p className="text-xs">Check back soon for new seller store launches!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((s) => (
                <div key={s.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition-all space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-white shrink-0 overflow-hidden">
                        {s.logo_url ? (
                          <img src={s.logo_url} alt={s.name} className="h-full w-full object-cover" />
                        ) : (
                          s.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-slate-950">{s.name}</h3>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase">Verified</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-current" /> 4.9 Rating
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                      {s.description || "Official seller store on YazMart marketplace offering authentic high-quality items with fast delivery."}
                    </p>
                  </div>

                  <Link
                    href={`/stores/${s.slug}`}
                    className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all text-center flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <span>Visit Store</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
