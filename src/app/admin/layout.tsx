"use client";

import React, { useState } from "react";
import Link from "next/link"; // ফিক্সড: 'next/link' থেকে ইমপোর্ট করা হলো
import { usePathname, useRouter } from "next/navigation"; // ফিক্সড: useRouter ও এখানে নিয়ে আসা হলো
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Users, 
  Menu, 
  X, 
  LogOut 
} from "lucide-react";
import { ThemeToggle } from "../../components/ui/theme-toggle";
import { signOutAction } from "@/action/auth"; // ফিক্সড রিলেটিভ পাথ

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: Layers },
    { name: "Customers", href: "/admin/customers", icon: Users },
  ];

  const handleLogout = async () => {
    const res = await signOutAction();
    if (!res.error) {
      router.push("/auth");
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--background)] text-[var(--foreground)]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--card)] border-r border-[var(--border)] transform transition-transform duration-300 lg:translate-x-0 lg:static lg:flex lg:flex-col ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)]">
          <Link href="/admin" className="text-lg font-bold tracking-tight">
            Enterprise <span className="text-blue-500">ERP</span>
          </Link>
          <button type="button" className="lg:hidden p-1" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]" 
                    : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer (Logout) */}
        <div className="p-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar Component */}
        <header className="h-16 bg-[var(--card)] border-b border-[var(--border)] flex items-center justify-between px-6">
          <button 
            type="button"
            className="p-2 -ml-2 rounded-md lg:hidden hover:bg-[var(--accent)]"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <ThemeToggle />
            <div className="h-8 w-px bg-[var(--border)]" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-sm text-blue-500">
                A
              </div>
              <span className="text-sm font-medium hidden sm:inline-block">Admin Panel</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}