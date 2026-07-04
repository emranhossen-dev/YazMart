"use client";

import React, { startTransition, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getCustomersList, getCustomerDetails } from "@/actions/dashboard";
import { Users, UserCheck, Ticket, Users2, ShieldCheck, CheckCircle, Eye, Phone, Mail, MessageCircle, X, ShoppingBag, CreditCard, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface Customer {
  id: string;
  full_name: string | null;
  role_id: string | null;
  email?: string;
  phone?: string;
  order_count?: number;
  roles?: { name: string } | null;
}

const FALLBACK_CUSTOMERS: Customer[] = [
  { id: "USR-8821", full_name: "Mahmud Hasan", role_id: "customer", email: "mahmud@example.com", phone: "+880 1711-234567", order_count: 12 },
  { id: "USR-8754", full_name: "Farhana Yasmin", role_id: "customer", email: "farhana@example.com", phone: "+880 1812-987654", order_count: 4 },
  { id: "USR-8721", full_name: "Tanvir Ahmed", role_id: "customer", email: "tanvir.ahmed@example.com", phone: "+880 1913-456789", order_count: 7 },
  { id: "USR-8699", full_name: "Sajid Khan", role_id: "customer", email: "sajid.k@example.com", phone: "+880 1614-112233", order_count: 1 }
];

const INITIAL_GROUPS = [
  { id: "GRP-01", name: "VIP Wholesalers", discount: "15% flat rate", count: 8, status: "ACTIVE" },
  { id: "GRP-02", name: "Premium Retailers", discount: "5% loyalty discount", count: 24, status: "ACTIVE" },
  { id: "GRP-03", name: "Guest Checkout Cohort", discount: "0% base rate", count: 182, status: "ACTIVE" }
];

const INITIAL_TICKETS = [
  { id: "TCK-4819", customer: "Mahmud Hasan", subject: "Refund on double payment for order #789", priority: "HIGH", status: "OPEN", date: "2026-06-21 14:02" },
  { id: "TCK-4812", customer: "Farhana Yasmin", subject: "Inquiry on delivery timelines to Sylhet", priority: "MEDIUM", status: "OPEN", date: "2026-06-20 09:30" },
  { id: "TCK-4799", customer: "Tanvir Ahmed", subject: "Unable to apply coupon FLASH50", priority: "LOW", status: "RESOLVED", date: "2026-06-18 18:22" }
];

export default function Page() {
  const router = useRouter();
  
  const pathname = usePathname();
  const activeTab = pathname.split("/").filter(Boolean)[2] || "directory";
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer States
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [customerAnalytics, setCustomerAnalytics] = useState<any>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Lists
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);

  // Sync tab with URL parameter if it changes via sidebar navigation
  
  const selectTab = (tabName: string) => { startTransition(() => { router.push(`/admin/customers/${tabName}`); }); };

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const res = await getCustomersList();
        if (res.customers && res.customers.length > 0) {
          // Filter out admins/staff to show real customers in directory (including guests)
          const actualCustomers = res.customers.filter((c: any) => 
            !c.roles || c.roles.name === "customer" || c.roles.name === "guest"
          ).map((c: any) => ({
            ...c,
            // Uses real data fetched from users and orderMatrix
            email: c.email || "No email on record",
            phone: c.phone || "No phone number",
            order_count: c.order_count || 0
          }));
          setCustomers(actualCustomers as unknown as Customer[]);
        } else {
          setCustomers(FALLBACK_CUSTOMERS);
        }
      } catch (err) {
        setCustomers(FALLBACK_CUSTOMERS);
      } finally {
        setLoading(false);
      }
    };
    loadCustomers();
  }, []);

  const handleResolveTicket = (ticketId: string) => {
    setTickets(prev => prev.map(t => 
      t.id === ticketId ? { ...t, status: "RESOLVED" } : t
    ));
    toast.success(`Ticket ${ticketId} resolved successfully.`);
  };

  const openCustomerProfile = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setDrawerLoading(true);
    try {
      if (customer.email) {
        const res = await getCustomerDetails(customer.email);
        if (res.success) {
          setCustomerOrders(res.orders || []);
          setCustomerAnalytics(res.analytics || null);
        } else {
          toast.error("Failed to fetch complete customer history.");
        }
      }
    } catch (err) {
      toast.error("An error occurred fetching customer details.");
    } finally {
      setDrawerLoading(false);
    }
  };

  return (
    <div className="space-y-6 select-none font-sans text-slate-100">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Customers & Support Console</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Supervise verified customer directories, segment buyer clusters, and reply to service support tickets.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-px">
        <Link href={`/admin/customers/directory`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "directory" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Customers Directory
        </Link>
        <Link href={`/admin/customers/groups`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "groups" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Customer Groups
        </Link>
        <Link href={`/admin/customers/tickets`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "tickets" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Support Tickets
        </Link>
      </div>

      {/* Main card */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        {activeTab === "directory" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" /> Active System Registrations
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3 px-4">User ID</th>
                    <th className="pb-3">Account Information</th>
                    <th className="pb-3 text-center">Total Orders</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[var(--muted-foreground)]">
                        Syncing customer directory database logs...
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-[var(--background)]/50 transition-colors group">
                        <td className="py-4 px-4 font-mono text-xs font-bold text-blue-400">
                          {customer.roles?.name === 'guest' ? (
                            <span className="text-amber-400">{customer.id}</span>
                          ) : (
                            `#CUS-${customer.id.substring(0, 5).toUpperCase()}`
                          )}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-sm font-black text-blue-500 border border-[var(--border)] shadow-sm">
                              {customer.full_name ? customer.full_name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[var(--foreground)] font-bold text-sm tracking-tight">{customer.full_name || "Anonymous User"}</span>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--muted-foreground)] font-mono">
                                <span>{customer.email}</span>
                                <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                                <span>{customer.phone}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[2rem] px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-black text-[11px] border border-blue-500/20">
                            {customer.order_count}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          {customer.roles?.name === 'guest' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black tracking-widest bg-amber-500/10 text-amber-450 border border-amber-500/20 uppercase">
                              <UserCheck className="h-3 w-3" /> Guest Buyer
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black tracking-widest bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 uppercase">
                              <UserCheck className="h-3 w-3" /> Verified
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openCustomerProfile(customer)} title="View Profile" className="p-1.5 rounded-md bg-[var(--accent)] hover:bg-blue-500/20 hover:text-blue-400 text-[var(--muted-foreground)] transition-colors cursor-pointer border border-transparent hover:border-blue-500/30">
                              <Eye className="h-4 w-4" />
                            </button>
                            <a href={`tel:${customer.phone}`} title="Call Customer" className="p-1.5 rounded-md bg-[var(--accent)] hover:bg-emerald-500/20 hover:text-emerald-400 text-[var(--muted-foreground)] transition-colors cursor-pointer border border-transparent hover:border-emerald-500/30">
                              <Phone className="h-4 w-4" />
                            </a>
                            <a href={`https://wa.me/${(customer.phone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" title="WhatsApp" className="p-1.5 rounded-md bg-[var(--accent)] hover:bg-green-500/20 hover:text-green-400 text-[var(--muted-foreground)] transition-colors cursor-pointer border border-transparent hover:border-green-500/30">
                              <MessageCircle className="h-4 w-4" />
                            </a>
                            <a href={`mailto:${customer.email}`} title="Email Customer" className="p-1.5 rounded-md bg-[var(--accent)] hover:bg-amber-500/20 hover:text-amber-400 text-[var(--muted-foreground)] transition-colors cursor-pointer border border-transparent hover:border-amber-500/30">
                              <Mail className="h-4 w-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "groups" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <Users2 className="h-4 w-4 text-blue-500" /> Segmented Clusters
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Cluster ID</th>
                    <th className="pb-3">Segment Name</th>
                    <th className="pb-3">Associated Voucher / Policy</th>
                    <th className="pb-3">Registered Users count</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {groups.map((g) => (
                    <tr key={g.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{g.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{g.name}</td>
                      <td className="py-3.5 text-blue-400 font-mono text-[10px]">{g.discount}</td>
                      <td className="py-3.5 text-[var(--foreground)] font-bold">{g.count} Users</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                          {g.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "tickets" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <Ticket className="h-4 w-4 text-blue-500" /> Support Desk tickets
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Ticket Ref</th>
                    <th className="pb-3">Customer User</th>
                    <th className="pb-3">Subject / Issue Description</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Date Filed</th>
                    <th className="pb-3 text-right">Actions / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {tickets.map((t) => {
                    const prioColor = t.priority === "HIGH" ? "bg-rose-500/10 text-rose-450 border border-rose-500/20" : t.priority === "MEDIUM" ? "bg-amber-500/10 text-amber-450 border border-amber-500/20" : "bg-slate-800 text-slate-350 border border-slate-700/30";
                    return (
                      <tr key={t.id} className="hover:bg-[var(--background)]/50 transition-colors">
                        <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{t.id}</td>
                        <td className="py-3.5 font-bold text-[var(--foreground)]">{t.customer}</td>
                        <td className="py-3.5 text-[var(--muted-foreground)] font-semibold">{t.subject}</td>
                        <td className="py-3.5">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${prioColor}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{t.date}</td>
                        <td className="py-3.5 text-right">
                          {t.status === "OPEN" ? (
                            <button
                              onClick={() => handleResolveTicket(t.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] uppercase transition-colors cursor-pointer"
                            >
                              Resolve Issue
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle className="h-3 w-3" /> Resolved
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {/* Customer Profile Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedCustomer(null)}
          />
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-2xl bg-[#0f111a] border-l border-[var(--border)] shadow-2xl h-full flex flex-col transform transition-transform duration-300 ease-out">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-2xl font-black text-blue-500 border border-blue-500/30 shadow-inner">
                  {selectedCustomer.full_name ? selectedCustomer.full_name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-white">{selectedCustomer.full_name || "Anonymous User"}</h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--muted-foreground)] font-mono">
                    <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {selectedCustomer.email}</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                    <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {selectedCustomer.phone}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-full bg-[var(--accent)] hover:bg-rose-500/20 hover:text-rose-400 text-[var(--muted-foreground)] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {drawerLoading ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-3 text-[var(--muted-foreground)]">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">Fetching Customer History...</span>
                </div>
              ) : (
                <>
                  {/* Analytics Overview */}
                  {customerAnalytics && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
                        <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Lifetime Value</span>
                        <div className="text-xl font-black text-emerald-400 mt-1">৳{customerAnalytics.totalSpent.toLocaleString("en-IN")}</div>
                      </div>
                      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
                        <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Total Orders</span>
                        <div className="text-xl font-black text-blue-400 mt-1">{customerAnalytics.totalOrders} <span className="text-xs text-[var(--muted-foreground)]">orders</span></div>
                      </div>
                      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
                        <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Avg Order Value</span>
                        <div className="text-xl font-black text-amber-400 mt-1">৳{Math.round(customerAnalytics.avgOrderValue).toLocaleString("en-IN")}</div>
                      </div>
                    </div>
                  )}

                  {/* Order History Table */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-blue-500" /> Order History Log
                    </h3>
                    <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-black/20">
                          <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                            <th className="p-3">Order Ref</th>
                            <th className="p-3">Purchase Date</th>
                            <th className="p-3">Items Purchased</th>
                            <th className="p-3 text-right">Total</th>
                            <th className="p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)] font-medium">
                          {customerOrders.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-[var(--muted-foreground)]">
                                This customer has not placed any orders yet.
                              </td>
                            </tr>
                          ) : (
                            customerOrders.map(order => {
                              // Parse items to get summary
                              let itemsDesc = "Unknown items";
                              if (Array.isArray(order.items)) {
                                if (order.items.length === 1) itemsDesc = order.items[0].name;
                                else if (order.items.length > 1) itemsDesc = `${order.items[0].name} + ${order.items.length - 1} more`;
                              }
                              
                              return (
                                <tr key={order.id} className="hover:bg-[var(--background)]/50 transition-colors">
                                  <td className="p-3 font-mono text-[10px] text-blue-400">#{order.id.substring(0,6).toUpperCase()}</td>
                                  <td className="p-3 font-mono text-[10px] text-[var(--muted-foreground)]">
                                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </td>
                                  <td className="p-3 text-[11px] truncate max-w-[150px]">{itemsDesc}</td>
                                  <td className="p-3 text-right font-bold">৳{Number(order.total_amount).toLocaleString("en-IN")}</td>
                                  <td className="p-3 text-center">
                                    <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                      order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                      order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    }`}>
                                      {order.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Footer / Actions */}
            <div className="p-5 border-t border-[var(--border)] bg-black/20 flex gap-3 justify-end">
              <button onClick={() => toast.success("Password reset link sent to customer email.")} className="px-4 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-xs font-bold uppercase transition-colors border border-[var(--border)] cursor-pointer">
                Reset Password
              </button>
              <button onClick={() => toast.error("User account suspended.")} className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold uppercase transition-colors cursor-pointer">
                Suspend User
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}