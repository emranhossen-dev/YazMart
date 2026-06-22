"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Megaphone, Ticket, Image as ImageIcon, Mail, Bell, Plus, Trash2 } from "lucide-react";

const CAMPAIGNS = [
  { id: "CAM-01", name: "Eid Festive Campaign 2026", type: "Discount Rate", reach: "14.2K reached", conversion: "8.5%", status: "ACTIVE" },
  { id: "CAM-02", name: "App Install Push Discount", type: "Free Shipping Coupon", reach: "8.5K reached", conversion: "12.1%", status: "ACTIVE" }
];

const COUPONS = [
  { code: "EID2026", discount: "20% OFF", minOrder: "৳2,000", limit: "500 redemptions", expiry: "2026-07-15", status: "ACTIVE" },
  { code: "FREEPAY", discount: "Free shipping", minOrder: "৳1,000", limit: "Unlimited", expiry: "2026-09-30", status: "ACTIVE" }
];

const BANNERS = [
  { id: "BAN-1", title: "Eid Festive Collection Hero Slider", dimensions: "1920x600 px", clicks: "4,250 clicks", status: "ACTIVE" },
  { id: "BAN-2", title: "Accessories Corner Promo Offer", dimensions: "400x250 px", clicks: "820 clicks", status: "ACTIVE" }
];

const NEWSLETTERS = [
  { id: "NW-01", subject: "Eid Super Sale is Now Live! Shop best choices", sentCount: "4,820 addresses", openRate: "42.1%", date: "2026-06-22" }
];

const NOTIFICATIONS = [
  { id: "NT-01", message: "Free Shipping on orders above ৳1,000 this weekend!", type: "Web Banner Push", clickRate: "18.4%", status: "PUBLISHED" }
];

function MarketingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams ? searchParams.get("tab") || "campaigns" : "campaigns";

  const selectTab = (tabName: string) => {
    if (tabName === "campaigns") {
      router.push("/admin/marketing");
    } else {
      router.push(`/admin/marketing?tab=${tabName}`);
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Marketing Deck</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Manage promotional campaigns, store discount coupons, banners slider, and newsletter logs.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-px overflow-x-auto custom-scrollbar">
        <button 
          onClick={() => selectTab("campaigns")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            tab === "campaigns" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Campaigns
        </button>
        <button 
          onClick={() => selectTab("coupons")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            tab === "coupons" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Coupons
        </button>
        <button 
          onClick={() => selectTab("banners")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            tab === "banners" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Banners Slider
        </button>
        <button 
          onClick={() => selectTab("newsletter")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            tab === "newsletter" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Newsletter
        </button>
        <button 
          onClick={() => selectTab("notifications")}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            tab === "notifications" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Notifications
        </button>
      </div>

      {/* Table Card */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        {tab === "campaigns" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-blue-500" /> Active Marketing Campaigns
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Campaign ID</th>
                    <th className="pb-3">Campaign Name</th>
                    <th className="pb-3">Type Metric</th>
                    <th className="pb-3">Total Impression</th>
                    <th className="pb-3">Conversion Rate</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {CAMPAIGNS.map((cam) => (
                    <tr key={cam.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{cam.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{cam.name}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{cam.type}</td>
                      <td className="py-3.5 font-mono text-[10px] text-[var(--foreground)] font-bold">{cam.reach}</td>
                      <td className="py-3.5 text-blue-500 font-bold">{cam.conversion}</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase">
                          {cam.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "coupons" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <Ticket className="h-4 w-4 text-blue-500" /> Discount Coupons Ledger
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Coupon Code</th>
                    <th className="pb-3">Discount Ratio</th>
                    <th className="pb-3">Minimum Order required</th>
                    <th className="pb-3">Quota Limits</th>
                    <th className="pb-3">Expiry Timestamp</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {COUPONS.map((cp) => (
                    <tr key={cp.code} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] font-bold text-blue-500">#{cp.code}</td>
                      <td className="py-3.5 font-bold text-emerald-500">{cp.discount}</td>
                      <td className="py-3.5 text-[var(--foreground)]">{cp.minOrder}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)] font-semibold">{cp.limit}</td>
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{cp.expiry}</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase">
                          {cp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "banners" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-blue-500" /> Campaign Banners Directory
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Banner Ref</th>
                    <th className="pb-3">Banner Description Title</th>
                    <th className="pb-3">Layout Dimensions</th>
                    <th className="pb-3">Clicks Tracker</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {BANNERS.map((bn) => (
                    <tr key={bn.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{bn.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{bn.title}</td>
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{bn.dimensions}</td>
                      <td className="py-3.5 text-blue-500 font-bold">{bn.clicks}</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase">
                          {bn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "newsletter" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" /> Newsletter & Email Campaign Logs
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Newsletter ID</th>
                    <th className="pb-3">Subject line</th>
                    <th className="pb-3">Address list Count</th>
                    <th className="pb-3">Open Rate Ratio</th>
                    <th className="pb-3 text-right">Dispatch Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {NEWSLETTERS.map((nw) => (
                    <tr key={nw.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{nw.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{nw.subject}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)] font-semibold">{nw.sentCount}</td>
                      <td className="py-3.5 text-emerald-500 font-black">{nw.openRate}</td>
                      <td className="py-3.5 text-right font-mono text-[10px] text-[var(--muted-foreground)]">{nw.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "notifications" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-500" /> Push Notifications Logs
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Notify ID</th>
                    <th className="pb-3">Display Message content</th>
                    <th className="pb-3">Delivery Channel</th>
                    <th className="pb-3">Interaction Click Rate</th>
                    <th className="pb-3 text-right">Publish status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {NOTIFICATIONS.map((nt) => (
                    <tr key={nt.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{nt.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{nt.message}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{nt.type}</td>
                      <td className="py-3.5 text-blue-500 font-black">{nt.clickRate}</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase">
                          {nt.status}
                        </span>
                      </td>
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

export default function MarketingPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-[var(--muted-foreground)]">Loading Marketing Deck...</div>}>
      <MarketingPageContent />
    </Suspense>
  );
}
