"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  LayoutDashboard, Package, ShoppingBag, Warehouse, 
  Factory, Users, CircleDollarSign, Megaphone, FileText, 
  Settings, ChevronDown, ChevronRight, Menu, X, LogOut, Home, Store as StoreIcon, ShieldAlert 
} from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { supabase } from "@/lib/supabase";

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

import { getStoreById } from "@/actions/seller";

export default function SellerLayoutClient({
  session,
  store: initialStore,
  children
}: {
  session: any;
  store: any;
  children: React.ReactNode;
}) {
  const [store, setStore] = useState(initialStore);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Catalog: false,
    Orders: false,
    Inventory: false,
    Purchase: false,
    Customers: false,
    Finance: false,
    Marketing: false,
    Content: false,
  });

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const overrideStoreId = searchParams.get("store_id");

  useEffect(() => {
    if (overrideStoreId) {
      getStoreById(overrideStoreId).then(res => {
        if (res.store) {
          setStore(res.store);
        }
      });
    } else {
      setStore(initialStore);
    }
  }, [overrideStoreId, initialStore]);

  // Keep admin impersonation param query persistent on click links
  const getLinkHref = (baseHref: string) => {
    return overrideStoreId ? `${baseHref}?store_id=${overrideStoreId}` : baseHref;
  };

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  // Open default menus on page load matching current route
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.subItems) {
        const hasActiveSub = item.subItems.some(sub => pathname === sub.href);
        if (hasActiveSub) {
          setOpenMenus(prev => ({
            ...prev,
            [item.name]: true
          }));
        }
      }
    });
  }, [pathname]);

  const menuItems: MenuItem[] = [
    { name: "Dashboard", href: "/seller", icon: LayoutDashboard },
    {
      name: "Catalog",
      icon: Package,
      subItems: [
        { name: "All Products", href: "/seller/products" },
        { name: "Categories Map", href: "/seller/categories" },
        { name: "Brand Registry", href: "/seller/brands" },
        { name: "Attributes Spec", href: "/seller/attributes" },
        { name: "Inventory Tags", href: "/seller/tags" },
      ]
    },
    {
      name: "Orders Ledger",
      icon: ShoppingBag,
      subItems: [
        { name: "Orders List", href: "/seller/orders" },
        { name: "Refund Requests", href: "/seller/orders/refunds" },
        { name: "Customer Returns", href: "/seller/orders/returns" },
      ]
    },
    {
      name: "Inventory Manager",
      icon: Warehouse,
      subItems: [
        { name: "Stock Level", href: "/seller/inventory" },
      ]
    },
    {
      name: "Purchase Suite",
      icon: Factory,
      subItems: [
        { name: "Suppliers Profile", href: "/seller/purchase" },
      ]
    },
    {
      name: "Customers & Reviews",
      icon: Users,
      subItems: [
        { name: "Buyer Log Directory", href: "/seller/customers" },
      ]
    },
    {
      name: "Finance Center",
      icon: CircleDollarSign,
      subItems: [
        { name: "Earnings Summary", href: "/seller/finance" },
      ]
    },
    {
      name: "Marketing Campaigns",
      icon: Megaphone,
      subItems: [
        { name: "Discount Coupons", href: "/seller/marketing/coupons" },
      ]
    },
    {
      name: "Store Content",
      icon: FileText,
      subItems: [
        { name: "Store FAQs", href: "/seller/content" },
      ]
    },
    { name: "Theme Settings", href: "/seller/settings", icon: Settings },
  ];

  // Dynamic theme colors setup
  const primaryColor = store.colors?.primary || "#18181b";
  const secondaryColor = store.colors?.secondary || "#71717a";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await signOutAction();
    router.push("/auth");
  };

  return (
    <div 
      className="h-screen flex bg-zinc-50 font-sans text-zinc-900 overflow-hidden"
      style={{
        // Set CSS variables for store branding color palette
        ["--primary" as any]: primaryColor,
        ["--accent" as any]: secondaryColor,
      }}
    >
      {/* Mobile Drawer Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar for Desktop & Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 bg-white flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:h-auto ${
        sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      }`}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-100 bg-zinc-50/50">
          <Link href={getLinkHref("/seller")} onClick={() => setSidebarOpen(false)} className="flex items-center gap-2.5">
            <img src="/logo yazmart.png" alt="YazMart Logo" className="h-8 w-auto object-contain max-w-[120px]" />
            <div>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Seller Hub</span>
              <h2 className="text-xs font-black text-zinc-950 truncate max-w-[100px]">{store.name}</h2>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 text-zinc-500 hover:bg-zinc-100 rounded-lg cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            if (item.href) {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={getLinkHref(item.href)} 
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border-l-2 ${
                    isActive 
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-sm" 
                      : "text-zinc-500 border-transparent hover:bg-zinc-50 hover:text-zinc-950"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            }

            const isMenuOpen = openMenus[item.name];
            return (
              <div key={item.name} className="space-y-1">
                <button 
                  type="button" 
                  onClick={() => toggleMenu(item.name)} 
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {isMenuOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </button>
                {isMenuOpen && item.subItems && (
                  <div className="pl-6 space-y-1 border-l border-zinc-100 ml-5 mt-0.5">
                    {item.subItems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link 
                          key={sub.name} 
                          href={getLinkHref(sub.href)} 
                          onClick={() => setSidebarOpen(false)}
                          className={`block px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors border-l-2 ${
                            isSubActive 
                              ? "text-zinc-950 bg-zinc-100/70 border-zinc-950" 
                              : "text-zinc-400 border-transparent hover:text-zinc-900 hover:bg-zinc-50"
                          }`}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-100 space-y-2">
          <a
            href={`/stores/${store.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
          >
            <StoreIcon className="h-4 w-4" />
            <span>View Storefront</span>
          </a>
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
          >
            <Home className="h-4 w-4" />
            <span>Back to YazMart</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50/40 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Impersonation Banner Alert */}
        {overrideStoreId && (
          <div className="bg-amber-500 text-white px-3 py-2 text-[10px] sm:text-[11px] font-extrabold flex items-center gap-2 justify-center shadow-sm select-none z-40 animate-pulse text-center">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>IMPERSONATION CONSOLE: Managing "{store.name}" as Admin.</span>
          </div>
        )}

        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between border-b border-zinc-200 bg-white px-3 sm:px-6 md:px-8 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-xl cursor-pointer">
              <Menu className="h-5 w-5" />
            </button>
            <div className="truncate">
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-[10px] sm:text-xs font-bold text-zinc-800 border border-zinc-200 truncate">
                <span className="hidden sm:inline">Managed Store:</span>
                <strong className="text-zinc-950 truncate max-w-[120px] sm:max-w-[200px]">{store.name}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-extrabold text-zinc-900">{session.user.name}</p>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{session.role}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950 font-mono text-xs font-bold uppercase text-white shadow-inner">
              {session.user.name?.charAt(0) || "U"}
            </div>
          </div>
        </header>

        {/* Dashboard Area */}
        <main className="flex-1 overflow-y-auto bg-zinc-50 p-3 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
