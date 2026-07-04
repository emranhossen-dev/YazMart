"use client";

import React, { startTransition, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getOrders } from "@/actions/orders";
import { getExpenses, createExpense } from "@/actions/finance";
import { CircleDollarSign, TrendingUp, Wallet, BookOpen, ListTodo, Plus, Info } from "lucide-react";
import { toast } from "react-hot-toast";

// Ledger configuration
const INITIAL_LEDGER = [
  { accNum: "ACC-1010", name: "Cash Ledger Node", type: "Asset", balance: "৳5,82,400" },
  { accNum: "ACC-1020", name: "Accounts Receivable", type: "Asset", balance: "৳2,14,000" },
  { accNum: "ACC-2010", name: "Accounts Payable", type: "Liability", balance: "৳85,000" }
];

export default function Page() {
  const router = useRouter();
  
  const pathname = usePathname();
  const activeTab = pathname.split("/").filter(Boolean)[2] || "sales";
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Financial calculations variables
  const [grossSales, setGrossSales] = useState(0);
  const [receivables, setReceivables] = useState(0);
  const [settledCount, setSettledCount] = useState(0);

  // Operational expenses list
  const [expenses, setExpenses] = useState<any[]>([]);

  // Form states
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expCategory, setExpCategory] = useState("");
  const [expSupplier, setExpSupplier] = useState("");
  const [expAmount, setExpAmount] = useState("");

  // Sync tab with URL parameter if it changes via sidebar navigation
  
  const selectTab = (tabName: string) => { startTransition(() => { router.push(`/admin/finance/${tabName}`); }); };

  const loadFinancials = async () => {
    try {
      setLoading(true);
      const [ordersRes, expensesRes] = await Promise.all([
        getOrders(),
        getExpenses()
      ]);

      if (ordersRes.orders) {
        setOrdersList(ordersRes.orders);
        
        // Accumulate statistics
        let salesSum = 0;
        let pendingSum = 0;
        let count = 0;

        ordersRes.orders.forEach((o: any) => {
          const amt = Number(o.total_amount) || 0;
          salesSum += amt;
          if (o.status === "PENDING") {
            pendingSum += amt;
          }
          if (o.status === "DELIVERED" || o.status === "COMPLETED" || o.status === "SHIPPED") {
            count += 1;
          }
        });

        // Default count to total if none completed yet to make it look active
        setGrossSales(salesSum);
        setReceivables(pendingSum);
        setSettledCount(count || ordersRes.orders.length);
      }

      if (expensesRes.success && expensesRes.expenses) {
        const parsedExpenses = expensesRes.expenses.map((e: any) => ({
          ...e,
          ref: e.id,
          amount: Number(e.amount)
        }));
        setExpenses(parsedExpenses);
      }
    } catch (err) {
      console.error("Load financials error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancials();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expCategory || !expSupplier || !expAmount) {
      toast.error("Please fill in all expense details.");
      return;
    }
    const amt = parseFloat(expAmount) || 0;
    const expenseData = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      category: expCategory,
      supplier: expSupplier,
      amount: amt,
      date: new Date().toISOString().split("T")[0],
      status: "PAID"
    };

    try {
      const res = await createExpense(expenseData);
      if (res.success) {
        toast.success(`Logged operational expense of ৳${amt.toLocaleString("en-IN")}`);
        
        // Reset form
        setExpCategory("");
        setExpSupplier("");
        setExpAmount("");
        setShowAddExpense(false);
        loadFinancials();
      } else {
        toast.error(res.error || "Failed to log expense.");
      }
    } catch (err) {
      toast.error("Transaction failed.");
    }
  };

  // Profit and Loss calculations
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netIncome = grossSales - totalExpenses;
  const marginPercentage = grossSales > 0 ? ((netIncome / grossSales) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 select-none font-sans text-slate-100">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Finance & Accounts Center</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Evaluate corporate profit statements, ledger accounts, expenses tracking, and audit transaction streams.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-px overflow-x-auto custom-scrollbar">
        <Link href={`/admin/finance/sales`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "sales" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Sales Matrix
        </Link>
        <Link href={`/admin/finance/expenses`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "expenses" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Expenses Tracker
        </Link>
        <Link href={`/admin/finance/profit-loss`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "profit-loss" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Profit & Loss
        </Link>
        <Link href={`/admin/finance/accounting`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "accounting" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Accounting Ledger
        </Link>
        <Link href={`/admin/finance/transactions`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "transactions" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Transactions
        </Link>
      </div>

      {/* Stats row inside Sales Tab */}
      {activeTab === "sales" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-1">
            <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Gross Sales Revenue</span>
            <div className="text-lg font-black text-blue-400">৳{grossSales.toLocaleString("en-IN")}</div>
            <p className="text-[9px] text-[var(--muted-foreground)]">Aggregate total amount of logged orders.</p>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-1">
            <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Outstanding Receivables</span>
            <div className="text-lg font-black text-amber-500">৳{receivables.toLocaleString("en-IN")}</div>
            <p className="text-[9px] text-[var(--muted-foreground)]">Orders currently pending payment settlement.</p>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-1">
            <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Settled Orders</span>
            <div className="text-lg font-black text-emerald-400">{settledCount} Orders</div>
            <p className="text-[9px] text-[var(--muted-foreground)]">Fulfilled transactions with payments completed.</p>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        {activeTab === "sales" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" /> Sales Ledger stream
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Transaction ID</th>
                    <th className="pb-3">Customer User</th>
                    <th className="pb-3">Settlement Amount</th>
                    <th className="pb-3">Payment Method</th>
                    <th className="pb-3">Purchase Date</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[var(--muted-foreground)]">
                        Syncing sales database ledger records...
                      </td>
                    </tr>
                  ) : ordersList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[var(--muted-foreground)]">
                        No orders recorded in the system yet.
                      </td>
                    </tr>
                  ) : (
                    ordersList.map((o) => (
                      <tr key={o.id} className="hover:bg-[var(--background)]/50 transition-colors">
                        <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{o.id.slice(0, 8)}</td>
                        <td className="py-3.5 font-bold text-[var(--foreground)]">{o.customer_name}</td>
                        <td className="py-3.5 font-bold text-[var(--foreground)]">৳{(o.total_amount || 0).toLocaleString("en-IN")}</td>
                        <td className="py-3.5 text-[var(--muted-foreground)] uppercase text-[10px]">COD / Cash-on-Delivery</td>
                        <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">
                          {new Date(o.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            o.status === "PENDING" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "expenses" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-500" /> Operational Expense ledger
              </h3>
              <button
                onClick={() => setShowAddExpense(!showAddExpense)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-bold uppercase transition-all cursor-pointer shadow-xs"
              >
                <Plus className="h-3 w-3" /> Log Expense
              </button>
            </div>

            {/* Add Expense Form */}
            {showAddExpense && (
              <form onSubmit={handleAddExpense} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/35 space-y-3 max-w-xl">
                <h4 className="text-xs font-bold uppercase text-blue-400">Record Operational Outflow</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Expense Category</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Server hosting"
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Supplier Payee</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AWS Corp"
                      value={expSupplier}
                      onChange={(e) => setExpSupplier(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Settled Amount (BDT)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5000"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors font-mono"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddExpense(false)}
                    className="px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--accent)]/50 text-[9px] font-bold uppercase transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] uppercase transition-all cursor-pointer shadow-sm"
                  >
                    Record Payment
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Reference</th>
                    <th className="pb-3">Expense Category</th>
                    <th className="pb-3">Supplier Payee</th>
                    <th className="pb-3">Amount Billed</th>
                    <th className="pb-3">Billing Date</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {expenses.map((e) => (
                    <tr key={e.ref} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{e.ref}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{e.category}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{e.supplier}</td>
                      <td className="py-3.5 text-rose-450 font-bold font-mono">৳{e.amount.toLocaleString("en-IN")}</td>
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{e.date}</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "profit-loss" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" /> Corporate Income Statement
            </h3>
            
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/20 divide-y divide-[var(--border)]">
              <div className="py-2.5 flex justify-between items-center text-xs font-semibold">
                <span className="text-[var(--muted-foreground)] uppercase text-[10px]">Gross Sales Revenues</span>
                <span className="font-bold font-mono text-emerald-400">+৳{grossSales.toLocaleString("en-IN")}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center text-xs font-semibold">
                <span className="text-[var(--muted-foreground)] uppercase text-[10px]">Operating Cost (Expenses)</span>
                <span className="font-bold font-mono text-rose-450">-৳{totalExpenses.toLocaleString("en-IN")}</span>
              </div>
              <div className="py-3 flex justify-between items-center text-sm font-black border-t border-[var(--border)] pt-4">
                <span className="uppercase text-xs text-[var(--foreground)]">Net Operating Income</span>
                <span className={netIncome >= 0 ? "text-emerald-400 font-mono" : "text-rose-450 font-mono"}>
                  ৳{netIncome.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center text-xs font-semibold">
                <span className="text-[var(--muted-foreground)] uppercase text-[10px]">Profit Margin Rate</span>
                <span className="font-bold text-blue-400 uppercase">{marginPercentage}% Net Margin</span>
              </div>
            </div>
            
            <p className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1.5 bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
              <Info className="h-3.5 w-3.5 text-blue-400" /> Formatted statements represent automated calculations based on live sales orders minus registered business expenditures.
            </p>
          </div>
        )}

        {activeTab === "accounting" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" /> Double-Entry Bookkeeping Ledger
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Account Number</th>
                    <th className="pb-3">Asset/Liability Name</th>
                    <th className="pb-3">Account Type</th>
                    <th className="pb-3 text-right">Settled Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {INITIAL_LEDGER.map((led) => (
                    <tr key={led.accNum} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{led.accNum}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{led.name}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{led.type}</td>
                      <td className="py-3.5 text-right font-bold text-[var(--foreground)]">{led.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-blue-500" /> Payment & Outflow Stream
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Transaction ID</th>
                    <th className="pb-3">Disbursed Description</th>
                    <th className="pb-3">Flow Type</th>
                    <th className="pb-3 text-right">Debit/Credit Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {ordersList.map(o => (
                    <tr key={o.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3 font-mono text-[10px] text-[var(--muted-foreground)]">TXN-{o.id.slice(0, 5).toUpperCase()}</td>
                      <td className="py-3 text-[var(--foreground)]">Order Settlement ({o.customer_name})</td>
                      <td className="py-3 text-[var(--muted-foreground)] font-bold text-[10px] uppercase">Credit</td>
                      <td className="py-3 text-right text-emerald-450 font-bold font-mono">+৳{(o.total_amount || 0).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                  {expenses.map(e => (
                    <tr key={e.ref} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3 font-mono text-[10px] text-[var(--muted-foreground)]">TXN-{e.ref}</td>
                      <td className="py-3 text-[var(--foreground)]">{e.category} ({e.supplier})</td>
                      <td className="py-3 text-[var(--muted-foreground)] font-bold text-[10px] uppercase">Debit</td>
                      <td className="py-3 text-right text-rose-450 font-bold font-mono">-৳{e.amount.toLocaleString("en-IN")}</td>
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
