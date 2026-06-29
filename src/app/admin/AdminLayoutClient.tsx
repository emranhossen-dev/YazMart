"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Package, ShoppingCart, Warehouse, 
  Factory, Users, CircleDollarSign, Megaphone, FileText, 
  BarChart3, ShieldAlert, Settings, ChevronDown, ChevronRight, 
  Menu, X, LogOut, Bell, Search
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { signOutAction } from "@/actions/auth";
import { getEnterpriseUserSession } from "@/actions/auth-enterprise";
import { useQueryTab } from "@/hooks/use-admin-tab";

interface SubMenuItem {
  name: string;
  href: string;
}

interface MenuItem {
  name: string;
  href?: string;
  icon: React.ComponentType<any>;
  subItems?: SubMenuItem[];
}

function AdminSidebarNav({
  menuItems,
  openMenus,
  toggleMenu,
  pathname,
}: {
  menuItems: MenuItem[];
  openMenus: Record<string, boolean>;
  toggleMenu: (name: string) => void;
  pathname: string;
}) {
  const currentTab = useQueryTab();

  return (
    <>
      {menuItems.map((item) => {
        const Icon = item.icon;
        if (item.href) {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
              isActive ? "bg-blue-600 text-white shadow-sm" : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
            }`}>
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        }

        const isMenuOpen = openMenus[item.name];
        return (
          <div key={item.name} className="space-y-1">
            <button type="button" onClick={() => toggleMenu(item.name)} className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {isMenuOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
            {isMenuOpen && item.subItems && (
              <div className="pl-9 space-y-1 border-l border-[var(--border)] ml-5 mt-1">
                {item.subItems.map((sub) => {
                  const isSubActive = sub.href.includes("?")
                    ? pathname === sub.href.split("?")[0] && currentTab === new URLSearchParams(sub.href.split("?")[1]).get("tab")
                    : pathname === sub.href && !currentTab;
                  return (
                    <Link key={sub.name} href={sub.href} className={`block px-3 py-1.5 rounded text-[11px] font-medium transition-colors ${
                      isSubActive ? "text-blue-500 font-bold bg-blue-500/5" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}>
                      {sub.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Catalog: true,
    Orders: false,
    Inventory: false,
  });
  const [userData, setUserData] = useState({ name: "Emran Hossen", role: "Super Admin" });
  
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const syncSession = async () => {
      const session = await getEnterpriseUserSession();
      if (session.authenticated && session.user) {
        setUserData({
          name: session.user.name,
          role: session.role === "admin" ? "Super Admin" : "Staff Member"
        });
      }
    };
    syncSession();
  }, []);

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const menuItems: MenuItem[] = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    {
      name: "Catalog",
      icon: Package,
      subItems: [
        { name: "Products", href: "/admin/products" },
        { name: "Categories", href: "/admin/categories" },
        { name: "Brands", href: "/admin/brands" },
        { name: "Attributes", href: "/admin/attributes" },
        { name: "Tags", href: "/admin/tags" },
        { name: "Reviews", href: "/admin/reviews" },
      ]
    },
    {
      name: "Orders",
      icon: ShoppingCart,
      subItems: [
        { name: "Orders List", href: "/admin/orders" },
        { name: "Returns", href: "/admin/orders?tab=returns" },
        { name: "Refunds", href: "/admin/orders?tab=refunds" },
      ]
    },
    {
      name: "Inventory",
      icon: Warehouse,
      subItems: [
        { name: "Stock Matrix", href: "/admin/inventory" },
        { name: "Warehouses", href: "/admin/inventory?tab=warehouses" },
        { name: "Stock Transfer", href: "/admin/inventory?tab=transfer" },
        { name: "Stock History", href: "/admin/inventory?tab=history" },
      ]
    },
    {
      name: "Purchase",
      icon: Factory,
      subItems: [
        { name: "Suppliers", href: "/admin/purchase?tab=suppliers" },
        { name: "Purchase Orders", href: "/admin/purchase" },
        { name: "Purchase Returns", href: "/admin/purchase?tab=returns" },
      ]
    },
    {
      name: "Customers",
      icon: Users,
      subItems: [
        { name: "Customers Directory", href: "/admin/customers" },
        { name: "Customer Groups", href: "/admin/customers?tab=groups" },
        { name: "Support Tickets", href: "/admin/customers?tab=tickets" },
      ]
    },
    {
      name: "Finance",
      icon: CircleDollarSign,
      subItems: [
        { name: "Sales Matrix", href: "/admin/finance" },
        { name: "Expenses Tracker", href: "/admin/finance?tab=expenses" },
        { name: "Profit & Loss", href: "/admin/finance?tab=profit-loss" },
        { name: "Accounting Ledger", href: "/admin/finance?tab=accounting" },
        { name: "Transactions", href: "/admin/finance?tab=transactions" },
      ]
    },
    {
      name: "Marketing",
      icon: Megaphone,
      subItems: [
        { name: "Coupons", href: "/admin/marketing?tab=coupons" },
        { name: "Banners Slider", href: "/admin/marketing?tab=banners" },
        { name: "Campaigns", href: "/admin/marketing" },
        { name: "Newsletter", href: "/admin/marketing?tab=newsletter" },
        { name: "Notifications", href: "/admin/marketing?tab=notifications" },
      ]
    },
    {
      name: "Content",
      icon: FileText,
      subItems: [
        { name: "Blogs Management", href: "/admin/content" },
        { name: "FAQ Matrix", href: "/admin/content?tab=faq" },
        { name: "Media Library", href: "/admin/content?tab=media" },
      ]
    },
    {
      name: "Reports",
      icon: BarChart3,
      subItems: [
        { name: "Sales Report", href: "/admin/reports" },
        { name: "Inventory Report", href: "/admin/reports?tab=inventory" },
        { name: "Finance Report", href: "/admin/reports?tab=finance" },
        { name: "Customer Report", href: "/admin/reports?tab=customers" },
      ]
    },
    {
      name: "Staff Control",
      icon: ShieldAlert,
      subItems: [
        { name: "Users Directory", href: "/admin/staff" },
        { name: "Roles & RBAC", href: "/admin/staff?tab=roles" },
        { name: "Activity Logs", href: "/admin/staff?tab=logs" },
      ]
    },
    {
      name: "Settings",
      icon: Settings,
      subItems: [
        { name: "Homepage Layout", href: "/admin/settings" },
        { name: "Payment Gateway", href: "/admin/settings?tab=payment" },
        { name: "Shipping Matrix", href: "/admin/settings?tab=shipping" },
        { name: "SEO Optimizer", href: "/admin/settings?tab=seo" },
      ]
    }
  ];

  const handleLogout = async () => {
    const res = await signOutAction();
    if (!res.error) router.push("/auth");
  };

  return (
    <div className="min-h-screen flex bg-[var(--background)] text-[var(--foreground)] font-sans antialiased selection:bg-blue-500/30">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Advanced Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-68 bg-[var(--card)] border-r border-[var(--border)] flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--border)] bg-[var(--background)]/40 backdrop-blur-md">
          <Link href="/admin" className="text-md font-extrabold tracking-wider uppercase bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Enterprise OS v1.0
          </Link>
          <button type="button" className="lg:hidden p-1.5 rounded hover:bg-[var(--accent)]" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar select-none">
          <AdminSidebarNav
            menuItems={menuItems}
            openMenus={openMenus}
            toggleMenu={toggleMenu}
            pathname={pathname}
          />
        </nav>

        <div className="p-3 border-t border-[var(--border)] bg-[var(--background)]/30">
          <button type="button" onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer">
            <LogOut className="h-4 w-4" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-[var(--card)] border-b border-[var(--border)] flex items-center justify-between px-6 sticky top-0 z-30 shadow-xs">
          <button type="button" className="p-2 -ml-2 rounded-md lg:hidden hover:bg-[var(--accent)]" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden md:flex items-center gap-2 max-w-sm w-full bg-[var(--background)] border border-[var(--border)] px-3 py-1.5 rounded-md focus-within:border-blue-500 transition-colors">
            <Search className="h-4 w-4 text-[var(--muted-foreground)]" />
            <input type="text" placeholder="Global Search (Ctrl + K)..." className="bg-transparent border-none text-xs focus:outline-none w-full" />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button type="button" className="p-2 rounded-md hover:bg-[var(--accent)] text-[var(--muted-foreground)] relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
            </button>
            <ThemeToggle />
            <div className="h-6 w-px bg-[var(--border)]" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                E
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-none">{userData.name}</p>
                <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{userData.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-8 bg-[var(--background)] text-[var(--foreground)]">
          {children}
        </main>
      </div>
    </div>
  );
}
