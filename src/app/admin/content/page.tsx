"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminTab } from "@/hooks/use-admin-tab";
import { FileText, HelpCircle, Image as ImageIcon, Plus, Trash2, Edit, ExternalLink } from "lucide-react";

const BLOGS = [
  { id: "BLG-881", title: "Top 5 E-commerce Buying Trends for 2026", author: "Emran Admin", views: "1.4K views", date: "2026-06-21", status: "PUBLISHED" },
  { id: "BLG-880", title: "Why Leather Quality Matters in Fashion Goods", author: "Faisal Staff", views: "820 views", date: "2026-06-18", status: "DRAFT" }
];

const FAQS = [
  { id: "FAQ-01", question: "What is the standard delivery timeline?", category: "Shipping", answersCount: 1, status: "ACTIVE" },
  { id: "FAQ-02", question: "How can I request a refund?", category: "Refund Policies", answersCount: 1, status: "ACTIVE" }
];

const MEDIA = [
  { id: "MED-201", fileName: "eid_collection_hero.jpg", size: "384 KB", url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=150&fit=crop&q=60" },
  { id: "MED-202", fileName: "shoes_promo_banner.png", size: "812 KB", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&fit=crop&q=60" }
];

export default function ContentPage() {
  const router = useRouter();
  const tab = useAdminTab("blogs");

  const selectTab = (tabName: string) => {
    if (tabName === "blogs") {
      router.push("/admin/content");
    } else {
      router.push(`/admin/content/${tabName}`);
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Content Management</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Supervise educational blog entries, system help FAQs matrices, and digital assets media library nodes.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-px">
        <button 
          onClick={() => selectTab("blogs")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "blogs" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Blogs Management
        </button>
        <button 
          onClick={() => selectTab("faq")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "faq" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          FAQ Matrix
        </button>
        <button 
          onClick={() => selectTab("media")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            tab === "media" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Media Library
        </button>
      </div>

      {/* Content Container */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        {tab === "blogs" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" /> Blog Articles Ledger
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Article ID</th>
                    <th className="pb-3">Post Title</th>
                    <th className="pb-3">Author Profile</th>
                    <th className="pb-3">Impression Views</th>
                    <th className="pb-3">Creation Date</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {BLOGS.map((blog) => (
                    <tr key={blog.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{blog.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{blog.title}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{blog.author}</td>
                      <td className="py-3.5 font-mono text-[10px] text-[var(--foreground)]">{blog.views}</td>
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{blog.date}</td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          blog.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-400"
                        }`}>
                          {blog.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "faq" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-blue-500" /> FAQ Matrices
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">FAQ Reference</th>
                    <th className="pb-3">FAQ Question Prompt</th>
                    <th className="pb-3">Help Taxonomy Category</th>
                    <th className="pb-3">Total Answers</th>
                    <th className="pb-3 text-right">Status Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {FAQS.map((faq) => (
                    <tr key={faq.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{faq.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{faq.question}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{faq.category}</td>
                      <td className="py-3.5 font-mono text-[10px]">{faq.answersCount} Record</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase">
                          {faq.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "media" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-blue-500" /> Uploaded CDN Assets Media
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {MEDIA.map((med) => (
                <div key={med.id} className="p-3 border border-[var(--border)] rounded-lg bg-[var(--background)] flex gap-3 items-center group relative">
                  <div className="w-12 h-12 rounded border border-[var(--border)] overflow-hidden bg-black flex items-center justify-center">
                    <img src={med.url} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate text-[var(--foreground)]">{med.fileName}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] font-mono">{med.size}</p>
                  </div>
                  <a href={med.url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-[var(--accent)] rounded text-[var(--muted-foreground)] hover:text-blue-500 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
