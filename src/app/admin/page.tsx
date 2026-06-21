"use client";

import React from "react";
import { Package, Layers, Users, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  // ডেমো স্ট্যাটস ডেটা (পরবর্তীতে আমরা এটিকে ডাটাবেজ থেকে ডাইনামিক করব)
  const stats = [
    { name: "Total Revenue", value: "$45,231.89", icon: DollarSign, change: "+20.1% from last month" },
    { name: "Products In Stock", value: "2,405", icon: Package, change: "+12 new added today" },
    { name: "Categories", value: "48", icon: Layers, change: "Organized perfectly" },
    { name: "Active Customers", value: "1,249", icon: Users, change: "+4.3% engagement" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-[var(--muted-foreground)]">Welcome to your enterprise ERP & E-commerce command center.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="p-6 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-sm"
            >
              <div className="flex items-center justify-between space-y-0 pb-2">
                <span className="text-sm font-medium text-[var(--muted-foreground)]">
                  {stat.name}
                </span>
                <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity/Placeholder Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 p-6 rounded-lg border border-[var(--border)] bg-[var(--card)] min-h-[300px]">
          <h3 className="font-semibold mb-2">Sales Overview</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Charts and analytics visualization will integration here.</p>
        </div>
        <div className="col-span-3 p-6 rounded-lg border border-[var(--border)] bg-[var(--card)] min-h-[300px]">
          <h3 className="font-semibold mb-2">Recent Orders</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Real-time purchase flow monitoring stream.</p>
        </div>
      </div>
    </div>
  );
}