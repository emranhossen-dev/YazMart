"use client";

import React, { useState, useEffect } from "react";
import { getCustomersList } from "../../../actions/dashboard";
import { Users, UserCheck } from "lucide-react";

interface Customer {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const loadCustomers = async () => {
      const res = await getCustomersList();
      if (res.customers) setCustomers(res.customers as unknown as Customer[]);
    };
    loadCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers Matrix</h1>
        <p className="text-[var(--muted-foreground)]">Overview and management profile directory of registered accounts.</p>
      </div>

      <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="h-4 w-4" /> Active Subscriptions
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                <th className="pb-3 font-medium">User ID</th>
                <th className="pb-3 font-medium">Full Name</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-[var(--muted-foreground)]">No registered customers found.</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[var(--background)]/50 transition-colors">
                    <td className="py-3.5 font-mono text-xs text-[var(--muted-foreground)]">{customer.id}</td>
                    <td className="py-3.5 font-medium flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold text-[var(--primary)]">
                        {customer.full_name ? customer.full_name.charAt(0) : "U"}
                      </div>
                      {customer.full_name || "Anonymous User"}
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-500">
                        <UserCheck className="h-3 w-3" /> Active
                      </span>
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