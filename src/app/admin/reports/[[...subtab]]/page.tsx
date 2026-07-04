"use client";

import React, { startTransition, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getOrders } from "@/actions/orders";
import { getEnterpriseProducts } from "@/actions/pim-products";
import { getExpenses } from "@/actions/finance";
import { getCustomersList } from "@/actions/dashboard";
import { BarChart3, LineChart, PieChart, Users, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";

export default function Page() {
  const router = useRouter();
  
  const pathname = usePathname();
  const activeTab = pathname.split("/").filter(Boolean)[2] || "sales";
  const [loading, setLoading] = useState(true);

  // Sales metrics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);

  // Inventory metrics
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [totalSkus, setTotalSkus] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);
  const [outOfStockItems, setOutOfStockItems] = useState(0);

  // Finance metrics
  const [grossRevenue, setGrossRevenue] = useState(0);
  const [totalExpenseAmt, setTotalExpenseAmt] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);

  // Customer metrics
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [orderingCustomers, setOrderingCustomers] = useState(0);
  const [repeatRate, setRepeatRate] = useState(0);
  const [avgClv, setAvgClv] = useState(0);

  
  const selectTab = (tabName: string) => { startTransition(() => { router.push(`/admin/reports/${tabName}`); }); };

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        const [ordersRes, productsRes, expensesRes, customersRes] = await Promise.all([
          getOrders(),
          getEnterpriseProducts({ limit: 500 }),
          getExpenses(),
          getCustomersList()
        ]);

        const orders = ordersRes.orders || [];
        const products = productsRes.products || [];
        const expenses = (expensesRes.success && expensesRes.expenses) ? expensesRes.expenses : [];
        const customers = customersRes.customers || [];

        // --- Sales Metrics ---
        const revenue = orders.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);
        const pending = orders.filter((o: any) => o.status === "PENDING").length;
        const completed = orders.filter((o: any) => ["DELIVERED", "COMPLETED", "SHIPPED"].includes(o.status)).length;
        const aov = orders.length > 0 ? revenue / orders.length : 0;

        setTotalRevenue(revenue);
        setTotalOrders(orders.length);
        setAvgOrderValue(Math.round(aov));
        setPendingOrders(pending);
        setCompletedOrders(completed);

        // --- Inventory Metrics ---
        const stockVal = products.reduce((sum: number, p: any) => {
          const buyPrice = Number(p.buying_price) || 0;
          const stock = Number(p.current_stock) || 0;
          return sum + (buyPrice * stock);
        }, 0);
        const lowStock = products.filter((p: any) => {
          const stock = Number(p.current_stock) || 0;
          const alert = Number(p.low_stock_alert) || 5;
          return stock > 0 && stock <= alert;
        }).length;
        const oos = products.filter((p: any) => (Number(p.current_stock) || 0) === 0).length;

        setTotalStockValue(stockVal);
        setTotalSkus(products.length);
        setLowStockItems(lowStock);
        setOutOfStockItems(oos);

        // --- Finance Metrics ---
        const expenseTotal = expenses.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
        const net = revenue - expenseTotal;
        const margin = revenue > 0 ? (net / revenue) * 100 : 0;

        setGrossRevenue(revenue);
        setTotalExpenseAmt(expenseTotal);
        setNetProfit(net);
        setProfitMargin(Math.round(margin * 10) / 10);

        // --- Customer Metrics ---
        setTotalCustomers(customers.length);
        const uniqueOrderCustomers = new Set(orders.map((o: any) => o.customer_email)).size;
        setOrderingCustomers(uniqueOrderCustomers);
        
        // Repeat rate: customers who ordered more than once
        const emailCounts: Record<string, number> = {};
        orders.forEach((o: any) => {
          emailCounts[o.customer_email] = (emailCounts[o.customer_email] || 0) + 1;
        });
        const repeatCount = Object.values(emailCounts).filter(c => c > 1).length;
        const rr = uniqueOrderCustomers > 0 ? (repeatCount / uniqueOrderCustomers) * 100 : 0;
        setRepeatRate(Math.round(rr * 10) / 10);

        // Average CLV = total revenue / unique ordering customers
        const clv = uniqueOrderCustomers > 0 ? revenue / uniqueOrderCustomers : 0;
        setAvgClv(Math.round(clv));

      } catch (err) {
        console.error("Reports load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  const fmt = (n: number) => `৳${n.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6 select-none font-sans text-slate-100">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Business Reports</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Live analytics computed from database records — orders, products, expenses, and customer profiles.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-px overflow-x-auto custom-scrollbar">
        {[
          { key: "sales", label: "Sales Report" },
          { key: "inventory", label: "Inventory Report" },
          { key: "finance", label: "Finance Report" },
          { key: "customers", label: "Customer Report" }
        ].map(t => (
          <Link href={`/admin/reports/${t.key}`}
            key={t.key}
            
            className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === t.key ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Container */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-[var(--muted-foreground)]">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-xs font-bold uppercase">Computing report metrics from database...</span>
          </div>
        ) : (
          <>
            {activeTab === "sales" && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-blue-500" /> Sales Turnover & Conversion Report
                </h3>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border border-[var(--border)] bg-[var(--background)]/60 rounded-lg space-y-2">
                    <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Total Revenue (Gross)</p>
                    <p className="text-2xl font-black text-emerald-400">{fmt(totalRevenue)}</p>
                  </div>
                  <div className="p-4 border border-[var(--border)] bg-[var(--background)]/60 rounded-lg space-y-2">
                    <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Average Order Value (AOV)</p>
                    <p className="text-2xl font-black">{fmt(avgOrderValue)}</p>
                  </div>
                  <div className="p-4 border border-[var(--border)] bg-[var(--background)]/60 rounded-lg space-y-2">
                    <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Total Orders Placed</p>
                    <p className="text-2xl font-black">{totalOrders}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border border-[var(--border)] bg-[var(--background)]/30 rounded-lg space-y-2">
                    <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Order Fulfillment Breakdown</p>
                    <div className="space-y-1.5 text-xs font-medium">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-400">✓ Completed / Shipped</span>
                        <span className="font-bold">{completedOrders} orders</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-amber-400">⏳ Pending</span>
                        <span className="font-bold">{pendingOrders} orders</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--muted-foreground)]">📊 Fulfillment Rate</span>
                        <span className="font-bold text-blue-400">
                          {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border border-[var(--border)] bg-[var(--background)]/30 rounded-lg space-y-2">
                    <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Conversion Metrics</p>
                    <div className="space-y-1.5 text-xs font-medium">
                      <div className="flex justify-between items-center">
                        <span>Unique Customers Who Ordered</span>
                        <span className="font-bold">{orderingCustomers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Repeat Purchase Rate</span>
                        <span className="font-bold text-emerald-400">{repeatRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "inventory" && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-blue-500" /> Stock Valuation & Aging Analysis
                </h3>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border border-[var(--border)] bg-[var(--background)]/60 rounded-lg space-y-1">
                    <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Total Stock Asset Valuation</p>
                    <p className="text-xl font-black text-blue-400">{fmt(totalStockValue)}</p>
                    <p className="text-[9px] text-[var(--muted-foreground)]">Buying price × current stock</p>
                  </div>
                  <div className="p-4 border border-[var(--border)] bg-[var(--background)]/60 rounded-lg space-y-1">
                    <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Total Active SKUs</p>
                    <p className="text-xl font-black text-[var(--foreground)]">{totalSkus} products</p>
                  </div>
                  <div className="p-4 border border-[var(--border)] bg-[var(--background)]/60 rounded-lg space-y-1">
                    <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Stock Health Alert</p>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {lowStockItems} Low Stock
                      </p>
                      <p className="text-sm font-black text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {outOfStockItems} Out of Stock
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "finance" && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" /> Margins, Costs & Profitability Summary
                </h3>

                <div className="space-y-3 font-medium text-xs">
                  <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                    <span>Gross Sales Revenue</span>
                    <span className="font-bold text-emerald-400 font-mono">+{fmt(grossRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                    <span>Total Operating Expenses</span>
                    <span className="font-bold text-rose-400 font-mono">-{fmt(totalExpenseAmt)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                    <span>Estimated VAT & Tax Liability (15%)</span>
                    <span className="font-bold text-rose-400 font-mono">-{fmt(Math.round(grossRevenue * 0.15))}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-t-2 border-[var(--border)] text-sm">
                    <span className="font-black uppercase">Net Operating Profit</span>
                    <span className={`font-black font-mono ${netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {fmt(netProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>Net Profit Margin Rate</span>
                    <span className="font-bold text-blue-400">{profitMargin}%</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "customers" && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" /> Retention Ratio & Customer Lifetime Value (CLV)
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border border-[var(--border)] bg-[var(--background)]/60 rounded-lg space-y-2">
                    <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Total Registered Profiles</p>
                    <p className="text-2xl font-black">{totalCustomers}</p>
                  </div>
                  <div className="p-4 border border-[var(--border)] bg-[var(--background)]/60 rounded-lg space-y-2">
                    <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Customers Who Placed Orders</p>
                    <p className="text-2xl font-black text-emerald-400">{orderingCustomers}</p>
                  </div>
                  <div className="p-4 border border-[var(--border)] bg-[var(--background)]/60 rounded-lg space-y-2">
                    <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Repeat Purchase Rate</p>
                    <p className="text-2xl font-black">{repeatRate}%</p>
                    <p className="text-[9px] text-[var(--muted-foreground)]">Customers with 2+ orders</p>
                  </div>
                  <div className="p-4 border border-[var(--border)] bg-[var(--background)]/60 rounded-lg space-y-2">
                    <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Average Customer Lifetime Value (CLV)</p>
                    <p className="text-2xl font-black text-blue-400">{fmt(avgClv)}</p>
                    <p className="text-[9px] text-[var(--muted-foreground)]">Total revenue ÷ unique ordering customers</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
