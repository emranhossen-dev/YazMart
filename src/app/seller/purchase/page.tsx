"use client";

import React, { useState } from "react";
import { Plus, Factory, Mail, Phone, Trash2 } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  productLine: string;
}

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: "SPL-001", name: "Dhaka Leather Wholesale Ltd", contactPerson: "Siddique Rahman", phone: "01712345678", email: "rahman@leatherwholesale.com", productLine: "Leather Shoes & Belts" },
  { id: "SPL-002", name: "Chittagong Canvas & Apparel Ltd", contactPerson: "Asif Iqbal", phone: "01812345678", email: "asif@ctgapparel.com", productLine: "Clothing, Shirts & Jeans" },
];

export default function SellerPurchasePage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [productLine, setProductLine] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSupplier: Supplier = {
      id: `SPL-${Date.now().toString().slice(-3)}`,
      name,
      contactPerson,
      phone,
      email,
      productLine
    };

    setSuppliers([...suppliers, newSupplier]);
    setName("");
    setContactPerson("");
    setPhone("");
    setEmail("");
    setProductLine("");
  };

  const handleDelete = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6 select-none font-sans">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Wholesale Suppliers</h1>
        <p className="text-xs font-semibold text-zinc-400">Catalog and manage your wholesale procurement supplier details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Creator Form */}
        <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-zinc-400 flex items-center gap-2">
            <Plus className="h-4 w-4 text-zinc-600" /> Register Supplier
          </h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Company Name *</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none" 
                placeholder="e.g. Apex Wholesales Ltd" 
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Contact Person Name</label>
              <input 
                type="text" 
                value={contactPerson} 
                onChange={(e) => setContactPerson(e.target.value)} 
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none" 
                placeholder="e.g. John Doe" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Phone Number</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none" 
                placeholder="e.g. 01700000000" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none" 
                placeholder="e.g. contact@supplier.com" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Product Category Lines</label>
              <input 
                type="text" 
                value={productLine} 
                onChange={(e) => setProductLine(e.target.value)} 
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none" 
                placeholder="e.g. Canvas Sneakers" 
              />
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-1.5 rounded-full bg-zinc-950 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 cursor-pointer">
              Register Supplier
            </button>
          </form>
        </div>

        {/* List View */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-zinc-400">Registered Wholesale Suppliers</h3>
          
          <div className="divide-y divide-zinc-100">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="flex items-start justify-between py-4 first:pt-0 last:pb-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-zinc-950 flex items-center gap-1">
                      <Factory className="h-4 w-4 text-zinc-500" /> {supplier.name}
                    </span>
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-zinc-500">{supplier.id}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-400 font-semibold pt-1">
                    {supplier.contactPerson && <span>Contact: {supplier.contactPerson}</span>}
                    {supplier.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {supplier.phone}</span>}
                    {supplier.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {supplier.email}</span>}
                  </div>
                  
                  {supplier.productLine && (
                    <p className="text-[10px] font-semibold text-zinc-500 pt-1">Product Scope: <strong className="text-zinc-700">{supplier.productLine}</strong></p>
                  )}
                </div>

                <button 
                  onClick={() => handleDelete(supplier.id)} 
                  className="rounded-xl border border-zinc-200 p-2 text-zinc-400 hover:border-rose-500 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
