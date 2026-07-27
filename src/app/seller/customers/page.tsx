import React from "react";
import { notFound } from "next/navigation";
import { getActiveSellerStore } from "@/actions/seller-session";
import { prisma } from "@/lib/prisma";
import { Users, Mail, Phone, MapPin, ShoppingBag } from "lucide-react";

interface CustomerLog {
  name: string;
  email: string;
  phone: string;
  address: string;
  orderCount: number;
  totalSpent: number;
}

export default async function SellerCustomersPage({
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

  // Fetch sub-orders belonging to this store
  const subOrders = await prisma.subOrder.findMany({
    where: { store_id: store.id },
    include: {
      parent: true
    }
  });

  // Group customer log matrix by email or phone
  const customerMap: Record<string, CustomerLog> = {};

  subOrders.forEach((so) => {
    const parent = so.parent;
    if (!parent) return;

    const email = parent.customer_email || "N/A";
    const phone = parent.phone || "-";
    const key = `${email}-${phone}`;

    if (!customerMap[key]) {
      customerMap[key] = {
        name: parent.customer_name,
        email,
        phone,
        address: parent.shipping_address,
        orderCount: 0,
        totalSpent: 0
      };
    }

    customerMap[key].orderCount += 1;
    customerMap[key].totalSpent += Number(so.total_amount);
  });

  const customersList = Object.values(customerMap);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Buyer Log Directory</h1>
        <p className="text-xs font-semibold text-zinc-400">View customer contact details and transaction metrics for clients who purchased from your store.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-zinc-600">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Shipping Address</th>
                <th className="px-6 py-4 text-center">Orders Count</th>
                <th className="px-6 py-4 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {customersList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-400">
                    <Users className="mx-auto h-10 w-10 opacity-45 mb-2" />
                    No customers have ordered from your store yet.
                  </td>
                </tr>
              ) : (
                customersList.map((customer, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 font-bold uppercase">
                          {customer.name.charAt(0)}
                        </div>
                        <span className="font-extrabold text-zinc-950">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-800">
                        <Mail className="h-3.5 w-3.5 text-zinc-400" />
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-800">
                        <Phone className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="font-mono">{customer.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-1 text-zinc-600">
                        <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 max-w-[240px] leading-relaxed">{customer.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-800 border border-zinc-200">
                        {customer.orderCount} Orders
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-zinc-950">
                      ৳{customer.totalSpent.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
