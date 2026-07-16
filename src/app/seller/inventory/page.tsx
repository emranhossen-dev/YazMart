import React from "react";
import { notFound } from "next/navigation";
import { getActiveSellerStore } from "@/actions/seller-session";
import { prisma } from "@/lib/prisma";
import { Warehouse, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

export const unstable_instant = false;

export default async function SellerInventoryPage({
  searchParams
}: {
  searchParams: Promise<{ store_id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const storeSession = await getActiveSellerStore(resolvedParams.store_id);

  if (!storeSession) {
    notFound();
  }

  const { store } = storeSession;

  // Fetch store's product inventories
  const products = await prisma.pimProducts.findMany({
    where: { store_id: store.id },
    select: {
      id: true,
      name: true,
      sku: true,
      current_stock: true,
      low_stock_alert: true,
      featured_image: true
    },
    orderBy: { current_stock: "asc" }
  });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Inventory Manager</h1>
        <p className="text-xs font-semibold text-zinc-400">Monitor stock levels, set low-stock thresholds, and track product warehouse allocations.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-zinc-600">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4 text-center">Alert Limit</th>
                <th className="px-6 py-4 text-center">Physical Stock</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-400">
                    <Warehouse className="mx-auto h-10 w-10 opacity-45 mb-2" />
                    No products found in inventory.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const stock = product.current_stock;
                  const limit = product.low_stock_alert;
                  
                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600 border border-emerald-100">
                      <CheckCircle className="h-3 w-3" /> Sufficient
                    </span>
                  );

                  if (stock === 0) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50/10 px-2 py-0.5 text-[9px] font-bold text-rose-500 border border-rose-100">
                        <AlertCircle className="h-3 w-3" /> Out of Stock
                      </span>
                    );
                  } else if (stock <= limit) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-600 border border-amber-100">
                        <AlertTriangle className="h-3 w-3" /> Low Stock
                      </span>
                    );
                  }

                  return (
                    <tr key={product.id} className="hover:bg-zinc-50/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white p-1">
                            {product.featured_image ? (
                              <img src={product.featured_image} alt={product.name} className="max-h-full max-w-full object-contain rounded" />
                            ) : (
                              <Warehouse className="h-4 w-4 text-zinc-300" />
                            )}
                          </div>
                          <span className="font-extrabold text-zinc-950 truncate max-w-[220px]">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-zinc-800">{product.sku}</td>
                      <td className="px-6 py-4 text-center font-bold text-zinc-500">{limit} units</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-extrabold text-sm ${stock <= limit ? "text-amber-600" : "text-zinc-900"}`}>
                          {stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">{statusBadge}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
