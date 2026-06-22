"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, Users, Eye, KeyRound, Clock, Plus, Trash2 } from "lucide-react";

const STAFF_MEMBERS = [
  { id: "STF-01", name: "Emran Hossen", email: "emran@yazmart.com", role: "Super Admin", status: "ACTIVE" },
  { id: "STF-02", name: "Faisal Ahmed", email: "faisal@yazmart.com", role: "Catalog Manager", status: "ACTIVE" },
  { id: "STF-03", name: "Tasnim Ara", email: "tasnim@yazmart.com", role: "Support Staff", status: "ACTIVE" }
];

const ROLES_LIST = [
  { role: "Super Admin", usersCount: 1, permissions: "Full Access control over system databases & setups" },
  { role: "Catalog Manager", usersCount: 1, permissions: "Product and Category creation and CRUD operations" },
  { role: "Support Staff", usersCount: 1, permissions: "Review approvals, customer tickers access" }
];

const ACTIVITIES = [
  { id: "ACT-701", user: "Emran Hossen", action: "Configured Store Layout", target: "Homepage config deck", time: "2026-06-22 09:30" },
  { id: "ACT-702", user: "Faisal Ahmed", action: "Created Catalog Category", target: "Smart Electronics", time: "2026-06-22 08:14" },
  { id: "ACT-703", user: "Tasnim Ara", action: "Approved Review Ticket", target: "REV-501 (Leather Shoes)", time: "2026-06-21 17:45" }
];

function StaffPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams ? searchParams.get("tab") || "users" : "users";

  const selectTab = (tabName: string) => {
    if (tabName === "users") {
      router.push("/admin/staff");
    } else {
      router.push(`/admin/staff?tab=${tabName}`);
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Staff & Permissions</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Supervise team access permissions, edit role taxonomy mappings, and inspect security audit logs.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-px">
        <button 
          onClick={() => selectTab("users")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "users" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Staff Directory
        </button>
        <button 
          onClick={() => selectTab("roles")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "roles" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Roles & RBAC
        </button>
        <button 
          onClick={() => selectTab("logs")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "logs" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Activity Logs
        </button>
      </div>

      {/* Table Card */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" /> Active System Administrators
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Staff ID</th>
                    <th className="pb-3">Full Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Assigned Role</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {STAFF_MEMBERS.map((st) => (
                    <tr key={st.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{st.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{st.name}</td>
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{st.email}</td>
                      <td className="py-3.5 font-semibold text-blue-500">{st.role}</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase">
                          {st.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "roles" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-blue-500" /> System Role Permissions Schema (RBAC)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Security Role Name</th>
                    <th className="pb-3">Assigned Operators</th>
                    <th className="pb-3">Policy Access Rules</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {ROLES_LIST.map((rl) => (
                    <tr key={rl.role} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-bold text-blue-500">{rl.role}</td>
                      <td className="py-3.5 text-[var(--foreground)] font-bold">{rl.usersCount} Staff members</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{rl.permissions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "logs" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" /> Administrative Audit Trail
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Audit Reference</th>
                    <th className="pb-3">Operating User</th>
                    <th className="pb-3">Performed Action</th>
                    <th className="pb-3">Target Node</th>
                    <th className="pb-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {ACTIVITIES.map((act) => (
                    <tr key={act.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{act.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{act.user}</td>
                      <td className="py-3.5 text-blue-500 font-semibold">{act.action}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{act.target}</td>
                      <td className="py-3.5 text-right font-mono text-[10px] text-[var(--muted-foreground)]">{act.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StaffPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-[var(--muted-foreground)]">Loading Staff & Permissions...</div>}>
      <StaffPageContent />
    </Suspense>
  );
}
