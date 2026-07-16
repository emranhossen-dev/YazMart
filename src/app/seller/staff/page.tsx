"use client";

import React, { useState } from "react";
import { Plus, Shield, User, Mail, Trash2 } from "lucide-react";

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const INITIAL_STAFF: Staff[] = [
  { id: "STF-001", name: "Salim Ahmed", email: "salim@merchant.com", role: "Store Manager", status: "Active" },
  { id: "STF-002", name: "Jasmine Akter", email: "jasmine@merchant.com", role: "Order Dispatcher", status: "Active" },
];

export default function SellerStaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>(INITIAL_STAFF);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Order Dispatcher");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newStaff: Staff = {
      id: `STF-${Date.now().toString().slice(-3)}`,
      name,
      email,
      role,
      status: "Active"
    };

    setStaffList([...staffList, newStaff]);
    setName("");
    setEmail("");
    setRole("Order Dispatcher");
  };

  const handleDelete = (id: string) => {
    setStaffList(staffList.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6 select-none font-sans">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Store Staff Control</h1>
        <p className="text-xs font-semibold text-zinc-400">Invite, register, and manage access credentials for your store employees.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Creator Form */}
        <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-zinc-400 flex items-center gap-2">
            <Plus className="h-4 w-4 text-zinc-600" /> Invite Staff
          </h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Staff Member Name *</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none" 
                placeholder="e.g. Salim Ahmed" 
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Email Address *</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none" 
                placeholder="e.g. salim@merchant.com" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Dashboard Role Scope *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="Store Manager">Store Manager (Read/Write Catalog & Orders)</option>
                <option value="Order Dispatcher">Order Dispatcher (Process & Ship Orders Only)</option>
                <option value="Inventory Analyst">Inventory Analyst (Update Product Stock Levels)</option>
              </select>
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-1.5 rounded-full bg-zinc-950 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 cursor-pointer">
              Send Invitation
            </button>
          </form>
        </div>

        {/* List View */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-zinc-400">Active Staff Directory</h3>
          
          <div className="divide-y divide-zinc-100">
            {staffList.map((staff) => (
              <div key={staff.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-zinc-950 flex items-center gap-1">
                      <User className="h-4 w-4 text-zinc-500" /> {staff.name}
                    </span>
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-zinc-500">{staff.id}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-semibold pt-1">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {staff.email}</span>
                    <span className="flex items-center gap-1 text-zinc-600"><Shield className="h-3 w-3 text-zinc-400" /> {staff.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600 border border-emerald-100">{staff.status}</span>
                  <button 
                    onClick={() => handleDelete(staff.id)} 
                    className="rounded-xl border border-zinc-200 p-2 text-zinc-400 hover:border-rose-500 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
