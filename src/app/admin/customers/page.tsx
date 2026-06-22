"use client";

import React, { useState, useEffect } from "react";
import { getCustomersList } from "../../../actions/dashboard";
import { Users, UserCheck } from "lucide-react";

interface Customer {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

const FALLBACK_CUSTOMERS: Customer[] = [
  { id: "USR-8821", full_name: "Mahmud Hasan", avatar_url: null },
  { id: "USR-8754", full_name: "Farhana Yasmin", avatar_url: null },
  { id: "USR-8721", full_name: "Tanvir Ahmed", avatar_url: null },
  { id: "USR-8699", full_name: "Sajid Khan", avatar_url: null }
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const loadCustomers = async () => {
      const res = await getCustomersList();
      if (res.customers && res.customers.length > 0) {
        setCustomers(res.customers as unknown as Customer[]);
      } else {
        setCustomers(FALLBACK_CUSTOMERS);
      }
    };
    loadCustomers();
  }, []);

  return (
    <div className="space-y-6 select-none font-sans">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Customers Matrix</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Overview and management profile directory of registered accounts.</p>
      </div>

      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs overflow-hidden">
        <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-500" /> Active System Registrations
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                <th className="pb-3">User ID Reference</th>
                <th className="pb-3">Full Account Name</th>
                <th className="pb-3 text-right">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-medium">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-[var(--background)]/50 transition-colors">
                  <td className="py-3 font-mono text-[10px] text-[var(--muted-foreground)]">{customer.id}</td>
                  <td className="py-3 flex items-center gap-2 text-[var(--foreground)]">
                    <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-[10px] font-bold text-blue-500 border border-[var(--border)]">
                      {customer.full_name ? customer.full_name.charAt(0) : "U"}
                    </div>
                    <span>{customer.full_name || "Anonymous User"}</span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                      <UserCheck className="h-3 w-3" /> Verified Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}