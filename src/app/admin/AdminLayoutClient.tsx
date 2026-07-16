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
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "order" | "stock" | "system";
}

const PATH_PERMISSION_MAP: Record<string, string> = {
  "/admin/products": "products",
  "/admin/categories": "categories",
  "/admin/brands": "brands",
  "/admin/attributes": "attributes",
  "/admin/tags": "tags",
  "/admin/orders": "orders",
  "/admin/inventory": "inventory",
  "/admin/purchase": "purchase",
  "/admin/customers": "customers",
  "/admin/reviews": "customers",
  "/admin/finance": "finance",
  "/admin/marketing": "marketing",
  "/admin/content": "content",
  "/admin/reports": "reports",
  "/admin/staff": "staff",
  "/admin/stores": "staff",
  "/admin/settings": "settings",
};

function filterMenuItems(items: MenuItem[], permissions: string[], role: string) {
  if (role === "admin" || role === "Super Admin" || role === "Admin") return items;

  return items
    .map((item) => {
      if (item.href) {
        const permKey = PATH_PERMISSION_MAP[item.href];
        if (!permKey || permissions.includes(permKey)) return item;
        return null;
      }

      if (item.subItems) {
        const filteredSubs = item.subItems.filter((sub) => {
          for (const [routePrefix, permKey] of Object.entries(PATH_PERMISSION_MAP)) {
            if (sub.href.startsWith(routePrefix)) {
              return permissions.includes(permKey);
            }
          }
          return true;
        });

        if (filteredSubs.length > 0) {
          return {
            ...item,
            subItems: filteredSubs,
          };
        }
      }

      return null;
    })
    .filter(Boolean) as MenuItem[];
}

interface SubMenuItem {
  name: string;
  href: string;
}

interface MenuItem {
  name: string;
  href?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  return (
    <>
      {menuItems.map((item) => {
        const Icon = item.icon;
        if (item.href) {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-semibold transition-all border-l-2 ${
              isActive 
                ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)] shadow-[0_0_12px_rgba(0,210,255,0.12)]" 
                : "text-[var(--muted-foreground)] border-transparent hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
            }`}>
              <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`} />
              <span>{item.name}</span>
            </Link>
          );
        }

        const isMenuOpen = openMenus[item.name];
        return (
          <div key={item.name} className="space-y-1">
            <button type="button" onClick={() => toggleMenu(item.name)} className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-semibold text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {isMenuOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
            {isMenuOpen && item.subItems && (
              <div className="pl-6 space-y-1 border-l border-[var(--border)] ml-5 mt-1">
                {item.subItems.map((sub) => {
                  const isSubActive = pathname === sub.href;
                  return (
                    <Link key={sub.name} href={sub.href} className={`block px-3 py-2 rounded text-[11px] font-semibold transition-colors border-l-2 ${
                      isSubActive 
                        ? "text-[var(--primary)] bg-[var(--primary)]/5 border-[var(--primary)] font-bold" 
                        : "text-[var(--muted-foreground)] border-transparent hover:text-[var(--foreground)] hover:bg-[var(--accent)]/30"
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
    Purchase: false,
    Customers: false,
    Finance: false,
    Marketing: false,
    Content: false,
    Reports: false,
    "Staff Control": false,
    Settings: false,
  });
  const [userData, setUserData] = useState({ name: "Emran Hossen", role: "Super Admin", permissions: [] as string[] });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();

  const isAuthorized = () => {
    const role = userData.role;
    if (role === "Super Admin" || role === "admin" || role === "Admin") return true;
    if (pathname === "/admin") return true; // dashboard open to all staff members
    
    // Match prefix in PATH_PERMISSION_MAP
    for (const [routePrefix, permKey] of Object.entries(PATH_PERMISSION_MAP)) {
      if (pathname.startsWith(routePrefix)) {
        return userData.permissions.includes(permKey);
      }
    }
    return true; // default to true for unlisted routes
  };

  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.3);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.12); // A5
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn("Audio Context blocked:", e);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("yazmart_notifications");
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        const initial: NotificationItem[] = [
          {
            id: "1",
            title: "System Online",
            message: "YazMart Operations console initialized successfully.",
            time: new Date().toLocaleTimeString(),
            read: false,
            type: "system"
          }
        ];
        setNotifications(initial);
        localStorage.setItem("yazmart_notifications", JSON.stringify(initial));
      }
    }
  }, []);

  useEffect(() => {
    // Supabase postgres replication listener for OrderMatrix and PimProducts
    const channel = supabase
      .channel("admin-realtime-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "OrderMatrix" },
        (payload) => {
          const newOrder = payload.new as any;
          if (newOrder) {
            playNotificationSound();

            let itemsSummary = "";
            try {
              const itemsList = typeof newOrder.items === "string" 
                ? JSON.parse(newOrder.items) 
                : newOrder.items;
              if (Array.isArray(itemsList) && itemsList.length > 0) {
                itemsSummary = itemsList
                  .map((item: any) => `${item.name || item.productName || "Product"} (x${item.quantity})`)
                  .join(", ");
              }
            } catch (e) {
              console.warn("Failed to parse order items:", e);
            }

            const customerInfo = newOrder.customer_email 
              ? `(${newOrder.customer_email})` 
              : newOrder.phone 
                ? `(${newOrder.phone})` 
                : "";

            toast.success(`New order placed by ${newOrder.customer_name}!`, {
              icon: "🛍️",
              duration: 6000,
            });

            const notification: NotificationItem = {
              id: newOrder.id || Math.random().toString(),
              title: "New Order Received",
              message: `Order #${newOrder.id?.slice(0, 8) || "REF"} by ${newOrder.customer_name} ${customerInfo} for ৳${Number(newOrder.total_amount).toLocaleString()}${itemsSummary ? `. Items: ${itemsSummary}` : ""}`,
              time: new Date().toLocaleTimeString(),
              read: false,
              type: "order"
            };

            setNotifications((prev) => {
              const updated = [notification, ...prev];
              localStorage.setItem("yazmart_notifications", JSON.stringify(updated));
              return updated;
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "PimProducts" },
        (payload) => {
          const newProduct = payload.new as any;
          const oldProduct = payload.old as any;
          if (newProduct) {
            const isStockOut = newProduct.current_stock === 0;
            const wasNotStockOut = !oldProduct || oldProduct.current_stock > 0;
            const isLowStock = newProduct.current_stock <= newProduct.low_stock_alert;
            const wasNotLowStock = !oldProduct || oldProduct.current_stock > newProduct.low_stock_alert;

            if ((isStockOut && wasNotStockOut) || (isLowStock && wasNotLowStock)) {
              playNotificationSound();
              const title = isStockOut ? "Stock Depleted Alert!" : "Low Stock Warning";
              const message = isStockOut 
                ? `${newProduct.name} is completely out of stock!` 
                : `${newProduct.name} is running low (Only ${newProduct.current_stock} items remaining).`;

              if (isStockOut) {
                toast.error(`Out of stock: ${newProduct.name}!`, { icon: "🚨", duration: 6000 });
              } else {
                toast.error(`Stock low: ${newProduct.name}!`, { icon: "⚠️", duration: 5000 });
              }

              const notification: NotificationItem = {
                id: Math.random().toString(),
                title,
                message,
                time: new Date().toLocaleTimeString(),
                read: false,
                type: "stock"
              };

              setNotifications((prev) => {
                const updated = [notification, ...prev];
                localStorage.setItem("yazmart_notifications", JSON.stringify(updated));
                return updated;
              });
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Store" },
        (payload) => {
          const newStore = payload.new as any;
          if (newStore) {
            playNotificationSound();
            toast.success(`New seller store request: ${newStore.name}!`, {
              icon: "🏪",
              duration: 8000,
            });

            const notification: NotificationItem = {
              id: newStore.id || Math.random().toString(),
              title: "New Store Application",
              message: `Store "${newStore.name}" (slug: ${newStore.slug}) is awaiting admin verification.`,
              time: new Date().toLocaleTimeString(),
              read: false,
              type: "system"
            };

            setNotifications((prev) => {
              const updated = [notification, ...prev];
              localStorage.setItem("yazmart_notifications", JSON.stringify(updated));
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("yazmart_notifications", JSON.stringify(updated));
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("yazmart_notifications");
    }
  };



  const handleNotificationClick = (n: NotificationItem) => {
    // 1. Mark as read
    const updated = notifications.map(item => item.id === n.id ? { ...item, read: true } : item);
    setNotifications(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("yazmart_notifications", JSON.stringify(updated));
    }

    // 2. Navigate based on type
    if (n.type === "order") {
      router.push("/admin/orders");
    } else if (n.type === "stock") {
      router.push("/admin/products");
    } else if (n.title.includes("Store") || n.title.includes("Seller")) {
      router.push("/admin/stores");
    }
    
    // 3. Close panel
    setShowNotifications(false);
  };

  useEffect(() => {
    const syncSession = async () => {
      const session = await getEnterpriseUserSession();
      if (session.authenticated && session.user) {
        setUserData({
          name: session.user.name,
          role: session.role === "admin" ? "Super Admin" : session.role || "Staff Member",
          permissions: (session as any).permissions || []
        });
      }
    };
    syncSession();
  }, []);

  // Update menu open states for pathname matching on page load
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

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const menuItems: MenuItem[] = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    {
      name: "Catalog",
      icon: Package,
      subItems: [
        { name: "All Products", href: "/admin/products" },
        { name: "Add Product", href: "/admin/products/add" },
        { name: "Categories", href: "/admin/categories" },
        { name: "Brands", href: "/admin/brands" },
        { name: "Attributes", href: "/admin/attributes" },
        { name: "Tags", href: "/admin/tags" },
      ]
    },
    {
      name: "Orders",
      icon: ShoppingCart,
      subItems: [
        { name: "Orders List", href: "/admin/orders" },
        { name: "Returns", href: "/admin/orders/returns" },
        { name: "Refunds", href: "/admin/orders/refunds" },
      ]
    },
    {
      name: "Inventory",
      icon: Warehouse,
      subItems: [
        { name: "Stock Matrix", href: "/admin/inventory/matrix" },
        { name: "Warehouses", href: "/admin/inventory/warehouses" },
        { name: "Stock Transfer", href: "/admin/inventory/transfer" },
        { name: "Stock History", href: "/admin/inventory/history" },
      ]
    },
    {
      name: "Purchase",
      icon: Factory,
      subItems: [
        { name: "Suppliers", href: "/admin/purchase/suppliers" },
        { name: "Purchase Orders", href: "/admin/purchase/orders" },
        { name: "Purchase Returns", href: "/admin/purchase/returns" },
      ]
    },
    {
      name: "Customers",
      icon: Users,
      subItems: [
        { name: "Customers Directory", href: "/admin/customers/directory" },
        { name: "Customer Groups", href: "/admin/customers/groups" },
        { name: "Support Tickets", href: "/admin/customers/tickets" },
        { name: "Product Reviews", href: "/admin/reviews" },
      ]
    },
    {
      name: "Finance",
      icon: CircleDollarSign,
      subItems: [
        { name: "Sales Matrix", href: "/admin/finance/sales" },
        { name: "Expenses Tracker", href: "/admin/finance/expenses" },
        { name: "Profit & Loss", href: "/admin/finance/profit-loss" },
        { name: "Accounting Ledger", href: "/admin/finance/accounting" },
        { name: "Transactions", href: "/admin/finance/transactions" },
      ]
    },
    {
      name: "Marketing",
      icon: Megaphone,
      subItems: [
        { name: "Coupons", href: "/admin/marketing/coupons" },
        { name: "Banners Slider", href: "/admin/marketing/banners" },
        { name: "Campaigns", href: "/admin/marketing/campaigns" },
        { name: "Newsletter", href: "/admin/marketing/newsletter" },
        { name: "Notifications", href: "/admin/marketing/notifications" },
      ]
    },
    {
      name: "Content",
      icon: FileText,
      subItems: [
        { name: "Blogs Management", href: "/admin/content" },
        { name: "FAQ Matrix", href: "/admin/content/faq" },
        { name: "Media Library", href: "/admin/content/media" },
      ]
    },
    {
      name: "Reports",
      icon: BarChart3,
      subItems: [
        { name: "Sales Report", href: "/admin/reports" },
        { name: "Inventory Report", href: "/admin/reports/inventory" },
        { name: "Finance Report", href: "/admin/reports/finance" },
        { name: "Customer Report", href: "/admin/reports/customers" },
      ]
    },
    {
      name: "Staff Control",
      icon: ShieldAlert,
      subItems: [
        { name: "Users Directory", href: "/admin/staff" },
        { name: "Roles & RBAC", href: "/admin/staff/roles" },
        { name: "Activity Logs", href: "/admin/staff/logs" },
      ]
    },
    {
      name: "Sellers",
      icon: Users,
      subItems: [
        { name: "Sellers Directory", href: "/admin/stores" },
      ]
    },
    {
      name: "Settings",
      icon: Settings,
      subItems: [
        { name: "Homepage Layout", href: "/admin/settings" },
        { name: "Payment Gateway", href: "/admin/settings/payment" },
        { name: "Shipping Matrix", href: "/admin/settings/shipping" },
        { name: "SEO Optimizer", href: "/admin/settings/seo" },
      ]
    }
  ];

  const handleLogout = async () => {
    const res = await signOutAction();
    if (!res.error) router.push("/auth");
  };

  const filteredMenus = filterMenuItems(menuItems, userData.permissions, userData.role);

  if (!isAuthorized()) {
    return (
      <div className="admin-theme h-screen flex bg-[var(--background)] text-[var(--foreground)] font-sans antialiased overflow-hidden">
        {/* Advanced Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-50 w-68 bg-[var(--card)] border-r border-[var(--border)] flex flex-col transform translate-x-0 lg:translate-x-0">
          <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--border)] bg-[var(--background)]/40 backdrop-blur-md">
            <Link href="/admin" className="text-[15px] font-black tracking-widest uppercase bg-gradient-to-r from-[#00d2ff] to-[#0066ff] bg-clip-text text-transparent">
              YazMart // OS
            </Link>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar select-none">
            <AdminSidebarNav
              menuItems={filteredMenus}
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
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-68">
          <header className="h-16 bg-[var(--card)] border-b border-[var(--border)] flex items-center justify-between px-6 sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-4 ml-auto">
              <ThemeToggle />
              <div className="h-6 w-px bg-[var(--border)]" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#00d2ff] to-[#0066ff] flex items-center justify-center font-bold text-xs text-[#060813]">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold leading-none text-slate-200">{userData.name}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{userData.role}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-8 bg-[var(--background)] flex flex-col items-center justify-center space-y-4">
            <div className="text-center space-y-2 select-none">
              <h1 className="text-5xl font-black tracking-widest uppercase bg-gradient-to-r from-[#ff3b30] to-[#ff9500] bg-clip-text text-transparent animate-pulse">404</h1>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-200">Access Restricted</p>
              <p className="text-[11px] text-[var(--muted-foreground)] max-w-xs leading-normal mx-auto">
                Your assigned security policy does not grant clearance to access this console node path.
              </p>
            </div>
            <Link href="/admin" className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase transition-all shadow-md">
              Return to Deck
            </Link>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-theme h-screen flex bg-[var(--background)] text-[var(--foreground)] font-sans antialiased selection:bg-[var(--primary)]/30 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Advanced Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-68 bg-[var(--card)] border-r border-[var(--border)] flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--border)] bg-[var(--background)]/40 backdrop-blur-md">
          <Link href="/admin" className="text-[15px] font-black tracking-widest uppercase bg-gradient-to-r from-[#00d2ff] to-[#0066ff] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(0,210,255,0.35)]">
            YazMart // OS
          </Link>
          <button type="button" className="lg:hidden p-1.5 rounded hover:bg-[var(--accent)]" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar select-none">
          <AdminSidebarNav
            menuItems={filteredMenus}
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-68">
        <header className="h-16 bg-[var(--card)] border-b border-[var(--border)] flex items-center justify-between px-6 sticky top-0 z-30 shadow-xs">
          <button type="button" className="p-2 -ml-2 rounded-md lg:hidden hover:bg-[var(--accent)]" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden md:flex items-center gap-2 max-w-sm w-full bg-[var(--background)] border border-[var(--border)] px-3 py-1.5 rounded-md focus-within:border-[var(--primary)] transition-colors">
            <Search className="h-4 w-4 text-[var(--muted-foreground)]" />
            <input type="text" placeholder="Global Search (Ctrl + K)..." className="bg-transparent border-none text-xs focus:outline-none w-full text-slate-200 placeholder-slate-500" />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Realtime Notification Panel */}
            <div className="relative">
              <button 
                type="button" 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-md hover:bg-[var(--accent)] text-[var(--muted-foreground)] relative cursor-pointer flex items-center justify-center animate-[pulse_3s_infinite]"
                title="System Notifications"
              >
                <Bell className="h-4 w-4" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden text-xs text-[var(--foreground)]">
                  {/* Dropdown Header */}
                  <div className="p-3 border-b border-[var(--border)] flex justify-between items-center bg-[var(--background)]/60">
                    <span className="font-black uppercase tracking-wider text-[10px]">Realtime Logs</span>
                    {notifications.some(n => !n.read) && (
                      <button 
                        type="button"
                        onClick={markAllAsRead}
                        className="text-[10px] font-bold text-blue-500 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>



                  {/* Notification List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border)] custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-[var(--muted-foreground)]">
                        No active logs.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 transition-colors cursor-pointer hover:bg-[var(--accent)]/40 ${n.read ? "opacity-60 bg-transparent" : "bg-[var(--primary)]/5 border-l-2 border-[var(--primary)]"}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-0.5">
                              <p className="font-bold text-[11px] text-[var(--foreground)]">{n.title}</p>
                              <p className="text-[10px] text-[var(--muted-foreground)] leading-normal">{n.message}</p>
                            </div>
                            <span className="text-[8px] text-[var(--muted-foreground)] font-mono whitespace-nowrap">{n.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer Action */}
                  {notifications.length > 0 && (
                    <div className="p-2 border-t border-[var(--border)] text-center bg-[var(--background)]/30">
                      <button 
                        type="button"
                        onClick={clearNotifications}
                        className="text-[10px] text-rose-500 font-bold hover:underline cursor-pointer"
                      >
                        Clear All Logs
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <ThemeToggle />
            <div className="h-6 w-px bg-[var(--border)]" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#00d2ff] to-[#0066ff] flex items-center justify-center font-bold text-xs text-[#060813] shadow-[0_0_10px_rgba(0,210,255,0.4)]">
                {userData.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-none text-slate-200">{userData.name}</p>
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
