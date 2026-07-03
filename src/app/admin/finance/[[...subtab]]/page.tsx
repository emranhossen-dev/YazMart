"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CircleDollarSign, TrendingUp, Wallet, BookOpen, ListTodo } from "lucide-react";

const SALES_MATRIX = [
  { month: "June 2026", grossSales: "৳14,20,500", discountValue: "৳45,200", netSales: "৳13,75,300", margin: "64.2%" },
  { month: "May 2026", grossSales: "৳18,50,000", discountValue: "৳62,000", netSales: "৳17,88,000", margin: "62.8%" }
];

const EXPENSES = [
  { ref: "EXP-981", category: "Cloud Infrastructure", supplier: "Amazon Web Services", amount: "৳42,500", date: "2026-06-20", status: "PAID" },
  { ref: "EXP-980", category: "Office Lease", supplier: "Baitul Mukarram Tower", amount: "৳1,10,000", date: "2026-06-01", status: "PAID" }
];

const PL_SUMMARY = {
  grossProfit: "৳8,42,100",
  operationalExpense: "৳2,45,000",
  netIncome: "৳5,97,100",
  marginRate: "43.4% Net Margin"
};

const LEDGER = [
  { accNum: "ACC-1010", name: "Cash Ledger Node", type: "Asset", balance: "৳5,82,400" },
  { accNum: "ACC-1020", name: "Accounts Receivable", type: "Asset", balance: "৳2,14,000" },
  { accNum: "ACC-2010", name: "Accounts Payable", type: "Liability", balance: "৳85,000" }
];

const TRANSACTIONS = [
  { id: "TXN-8742", desc: "Stripe Checkout Deposit", amt: "+৳4,520", type: "Credit", date: "2026-06-22 10:14" },
  { id: "TXN-8699", desc: "Amazon AWS Server Invoice", amt: "-৳580", type: "Debit", date: "2026-06-22 09:12" }
];

export default function FinancePage() {
  const router = useRouter();
  const params = useParams();
  const subtab = params.subtab as string[] | undefined;
  const tab = subtab?.[0] || "sales";

  const selectTab = (tabName: string) => {
    if (tabName === "sales") {
      router.push("/admin/finance");
    } else {
      router.push(`/admin/finance/${tabName}`);
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Finance Center</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Evaluate corporate profit statements, ledger matrices, expenses tracking, and audit transactions.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-px overflow-x-auto custom-scrollbar">
        <button 
          onClick={() => selectTab("sales")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            tab === "sales" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Sales Matrix
        </button>
        <button 
          onClick={() => selectTab("expenses")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            tab === "expenses" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Expenses Tracker
        </button>
        <button 
          onClick={() => selectTab("profit-loss")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            tab === "profit-loss" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Profit & Loss
        </button>
        <button 
          onClick={() => selectTab("accounting")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            tab === "accounting" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Accounting Ledger
        </button>
        <button 
          onClick={() => selectTab("transactions")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            tab === "transactions" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Transactions
        </button>
      </div>

      {/* Table Card */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        {tab === "sales" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" /> Gross & Net Sales Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Financial Period</th>
                    <th className="pb-3">Gross Invoice Sales</th>
                    <th className="pb-3">Promotional Discount Deduct</th>
                    <th className="pb-3">Net Realized Revenue</th>
                    <th className="pb-3 text-right">Gross Profit Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {SALES_MATRIX.map((sm) => (
                    <tr key={sm.month} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{sm.month}</td>
                      <td className="py-3.5 text-[var(--foreground)]">{sm.grossSales}</td>
                      <td className="py-3.5 text-rose-500 font-bold">{sm.discountValue}</td>
                      <td className="py-3.5 text-blue-500 font-black">{sm.netSales}</td>
                      <td className="py-3.5 text-right font-black text-emerald-500">{sm.margin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "expenses" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-500" /> Operational Expenditures
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Expense ID</th>
                    <th className="pb-3">Category Title</th>
                    <th className="pb-3">Supplier Vendor</th>
                    <th className="pb-3">Billed Sum</th>
                    <th className="pb-3">Payment Timestamp</th>
                    <th className="pb-3 text-right">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {EXPENSES.map((ex) => (
                    <tr key={ex.ref} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{ex.ref}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{ex.category}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{ex.supplier}</td>
                      <td className="py-3.5 font-black text-rose-500">{ex.amount}</td>
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{ex.date}</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase">
                          {ex.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "profit-loss" && (
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4 text-blue-500" /> Profit & Loss Statement (P&L)
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background)]/60">
                <span className="text-[9px] font-black uppercase tracking-wider text-[var(--muted-foreground)]">Gross Profit Matrix</span>
                <p className="text-xl font-black text-[var(--foreground)] mt-1">{PL_SUMMARY.grossProfit}</p>
              </div>
              <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background)]/60">
                <span className="text-[9px] font-black uppercase tracking-wider text-[var(--muted-foreground)]">Operational Expenses (OPEX)</span>
                <p className="text-xl font-black text-rose-500 mt-1">{PL_SUMMARY.operationalExpense}</p>
              </div>
              <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background)]/60">
                <span className="text-[9px] font-black uppercase tracking-wider text-[var(--muted-foreground)]">Net Realized Income</span>
                <p className="text-xl font-black text-emerald-500 mt-1">{PL_SUMMARY.netIncome}</p>
              </div>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/10 text-emerald-500 rounded-lg text-xs font-bold text-center">
              ▲ performance index rate: {PL_SUMMARY.marginRate}
            </div>
          </div>
        )}

        {tab === "accounting" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" /> General Ledger Accounts
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Account Number</th>
                    <th className="pb-3">Account Title Name</th>
                    <th className="pb-3">Account Taxonomy</th>
                    <th className="pb-3 text-right">Outstanding Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {LEDGER.map((led) => (
                    <tr key={led.accNum} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{led.accNum}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{led.name}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{led.type}</td>
                      <td className="py-3.5 text-right font-black text-blue-500">{led.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "transactions" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-blue-500" /> Financial Transaction Logs
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Tx ID Reference</th>
                    <th className="pb-3">Transaction Description</th>
                    <th className="pb-3">Transfer Amount</th>
                    <th className="pb-3">Debit/Credit Taxonomy</th>
                    <th className="pb-3 text-right">System Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {TRANSACTIONS.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{tx.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{tx.desc}</td>
                      <td className={`py-3.5 font-mono font-bold ${tx.amt.startsWith("+") ? "text-emerald-500" : "text-rose-500"}`}>{tx.amt}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)] font-semibold">{tx.type}</td>
                      <td className="py-3.5 text-right font-mono text-[10px] text-[var(--muted-foreground)]">{tx.date}</td>
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
