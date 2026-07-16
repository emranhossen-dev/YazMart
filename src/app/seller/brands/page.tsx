import React from "react";
import { notFound } from "next/navigation";
import { getActiveSellerStore } from "@/actions/seller-session";
import { prisma } from "@/lib/prisma";
import { Award } from "lucide-react";

export const unstable_instant = false;

export default async function SellerBrandsPage({
  searchParams
}: {
  searchParams: Promise<{ store_id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const storeSession = await getActiveSellerStore(resolvedParams.store_id);

  if (!storeSession) {
    notFound();
  }

  // Fetch active brands
  const brands = await prisma.brandMatrix.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Brand Registry</h1>
        <p className="text-xs font-semibold text-zinc-400">Browse all authorized brand tags. Associate them with your products for search visibility.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {brands.length === 0 ? (
          <div className="col-span-full border border-dashed border-zinc-200 rounded-2xl py-12 text-center text-zinc-400">
            <Award className="mx-auto h-10 w-10 opacity-45 mb-2" />
            No active brands found in the registry.
          </div>
        ) : (
          brands.map((brand) => (
            <div key={brand.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-2 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                  <Award className="h-4 w-4" />
                </div>
                <h4 className="font-extrabold text-sm text-zinc-900 truncate">{brand.name}</h4>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono select-all truncate">ID: {brand.id}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
