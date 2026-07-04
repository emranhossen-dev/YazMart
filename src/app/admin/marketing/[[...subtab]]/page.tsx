"use client";

import React, { startTransition, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getVouchers, createVoucher } from "@/actions/finance";
import { Megaphone, Ticket, Image as ImageIcon, Mail, Bell, Plus } from "lucide-react";
import { toast } from "react-hot-toast";

const INITIAL_CAMPAIGNS = [
  { id: "CAM-01", name: "Eid Festive Campaign 2026", type: "Discount Rate", reach: "14.2K reached", conversion: "8.5%", status: "ACTIVE" },
  { id: "CAM-02", name: "App Install Push Discount", type: "Free Shipping Coupon", reach: "8.5K reached", conversion: "12.1%", status: "ACTIVE" }
];

const INITIAL_BANNERS = [
  { id: "BAN-1", title: "Eid Festive Collection Hero Slider", dimensions: "1920x600 px", clicks: "4,250 clicks", status: "ACTIVE" },
  { id: "BAN-2", title: "Accessories Corner Promo Offer", dimensions: "400x250 px", clicks: "820 clicks", status: "ACTIVE" }
];

export default function Page() {
  const router = useRouter();
  
  const pathname = usePathname();
  const activeTab = pathname.split("/").filter(Boolean)[2] || "campaigns";

  // States
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [banners, setBanners] = useState(INITIAL_BANNERS);
  const [newsletters, setNewsletters] = useState([
    { id: "NW-01", subject: "Eid Super Sale is Now Live! Shop best choices", sentCount: "4,820 addresses", openRate: "42.1%", date: "2026-06-22" }
  ]);
  const [notifications, setNotifications] = useState([
    { id: "NT-01", message: "Free Shipping on orders above ৳1,000 this weekend!", type: "Web Banner Push", clickRate: "18.4%", status: "PUBLISHED" }
  ]);

  // Form states
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState("");
  const [couponMinOrder, setCouponMinOrder] = useState("");
  const [couponLimit, setCouponLimit] = useState("");
  const [couponExpiry, setCouponExpiry] = useState("");

  const [showAddBanner, setShowAddBanner] = useState(false);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerDimensions, setBannerDimensions] = useState("1920x600 px");

  const [showAddNewsletter, setShowAddNewsletter] = useState(false);
  const [newsSubject, setNewsSubject] = useState("");

  // Sync tab with URL parameter if it changes via sidebar navigation
  
  const selectTab = (tabName: string) => { startTransition(() => { router.push(`/admin/marketing/${tabName}`); }); };

  const fetchVouchersList = async () => {
    try {
      const res = await getVouchers();
      if (res.success && res.vouchers) {
        const mapped = res.vouchers.map((c: any) => ({
          code: c.code,
          discount: c.discount,
          minOrder: `৳${Number(c.min_order).toLocaleString("en-IN")}`,
          limit: c.quota_limit || "Unlimited",
          expiry: c.expiry || "Never",
          status: c.status
        }));
        setCoupons(mapped);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVouchersList();
  }, []);

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !couponDiscount || !couponMinOrder) {
      toast.error("Please fill in coupon details.");
      return;
    }
    const cleanCode = couponCode.toUpperCase().replace(/\s+/g, "");
    const minOrderVal = parseFloat(couponMinOrder) || 0;

    const voucherData = {
      code: cleanCode,
      discount: couponDiscount,
      min_order: minOrderVal,
      quota_limit: couponLimit ? `${couponLimit} redemptions` : "Unlimited",
      expiry: couponExpiry || "Never",
      status: "ACTIVE"
    };

    try {
      const res = await createVoucher(voucherData);
      if (res.success) {
        toast.success(`Discount Voucher "${couponCode}" compiled successfully!`);
        
        // Reset Form
        setCouponCode("");
        setCouponDiscount("");
        setCouponMinOrder("");
        setCouponLimit("");
        setCouponExpiry("");
        setShowAddCoupon(false);
        fetchVouchersList();
      } else {
        toast.error(res.error || "Failed to create voucher.");
      }
    } catch (err) {
      toast.error("Transaction failed.");
    }
  };

  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle) {
      toast.error("Please fill in banner details.");
      return;
    }
    const newBanner = {
      id: `BAN-${Math.floor(10 + Math.random() * 90)}`,
      title: bannerTitle,
      dimensions: bannerDimensions,
      clicks: "0 clicks",
      status: "ACTIVE"
    };

    setBanners(prev => [newBanner, ...prev]);
    toast.success(`Banner slider asset "${bannerTitle}" created.`);
    setBannerTitle("");
    setShowAddBanner(false);
  };

  const handleAddNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsSubject) return;

    const newMail = {
      id: `NW-${Math.floor(10 + Math.random() * 90)}`,
      subject: newsSubject,
      sentCount: "1,250 addresses",
      openRate: "0.0%",
      date: new Date().toISOString().split("T")[0]
    };

    setNewsletters(prev => [newMail, ...prev]);
    toast.success("Newsletter email dispatch queued successfully.");
    setNewsSubject("");
    setShowAddNewsletter(false);
  };

  return (
    <div className="space-y-6 select-none font-sans text-slate-100">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Marketing & Promo Center</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Manage active campaigns registry, issue discount coupon codes, register slider banners, and dispatch newsletters.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-px overflow-x-auto custom-scrollbar">
        <Link href={`/admin/marketing/campaigns`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "campaigns" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Campaigns
        </Link>
        <Link href={`/admin/marketing/coupons`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "coupons" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Coupons
        </Link>
        <Link href={`/admin/marketing/banners`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "banners" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Banners Slider
        </Link>
        <Link href={`/admin/marketing/newsletter`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "newsletter" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Newsletter
        </Link>
        <Link href={`/admin/marketing/notifications`}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "notifications" ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Notifications
        </Link>
      </div>

      {/* Container */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        {activeTab === "campaigns" && (
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
                  {campaigns.map((cam) => (
                    <tr key={cam.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{cam.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{cam.name}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{cam.type}</td>
                      <td className="py-3.5 font-mono text-[10px] text-[var(--foreground)] font-bold">{cam.reach}</td>
                      <td className="py-3.5 text-blue-450 font-bold">{cam.conversion}</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
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

        {activeTab === "coupons" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                <Ticket className="h-4 w-4 text-blue-500" /> Discount Coupons Ledger
              </h3>
              <button
                onClick={() => setShowAddCoupon(!showAddCoupon)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-bold uppercase transition-all cursor-pointer shadow-xs"
              >
                <Plus className="h-3 w-3" /> Create Coupon
              </button>
            </div>

            {/* Create Coupon Form */}
            {showAddCoupon && (
              <form onSubmit={handleAddCoupon} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/35 space-y-3 max-w-xl">
                <h4 className="text-xs font-bold uppercase text-blue-400">Compile Promo Voucher Code</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Voucher Promo Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SUMMER50"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors uppercase font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Discount Ratio Value</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 15% OFF or ৳500 OFF"
                      value={couponDiscount}
                      onChange={(e) => setCouponDiscount(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Minimum Order required (BDT)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1000"
                      value={couponMinOrder}
                      onChange={(e) => setCouponMinOrder(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Quota Limits (Redemptions)</label>
                    <input
                      type="number"
                      placeholder="e.g. 100 (leave blank for unlimited)"
                      value={couponLimit}
                      onChange={(e) => setCouponLimit(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors font-mono"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Voucher Expiry Date</label>
                    <input
                      type="date"
                      value={couponExpiry}
                      onChange={(e) => setCouponExpiry(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddCoupon(false)}
                    className="px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--accent)]/50 text-[9px] font-bold uppercase transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] uppercase transition-all cursor-pointer shadow-sm"
                  >
                    Compile Code
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                    <th className="pb-3">Coupon Code</th>
                    <th className="pb-3">Discount Ratio</th>
                    <th className="pb-3">Minimum Order required</th>
                    <th className="pb-3">Quota Limits</th>
                    <th className="pb-3">Expiry Date</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {coupons.map((cp) => (
                    <tr key={cp.code} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] font-bold text-blue-400">#{cp.code}</td>
                      <td className="py-3.5 font-bold text-emerald-400">{cp.discount}</td>
                      <td className="py-3.5 text-[var(--foreground)]">{cp.minOrder}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)] font-semibold">{cp.limit}</td>
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{cp.expiry}</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
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

        {activeTab === "banners" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-500" /> Campaign Banners Directory
              </h3>
              <button
                onClick={() => setShowAddBanner(!showAddBanner)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-bold uppercase transition-all cursor-pointer shadow-xs"
              >
                <Plus className="h-3 w-3" /> Upload Banner
              </button>
            </div>

            {/* Add Banner Form */}
            {showAddBanner && (
              <form onSubmit={handleAddBanner} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/35 space-y-3 max-w-xl">
                <h4 className="text-xs font-bold uppercase text-blue-400">Configure Landing Slider Banner</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Banner Describing Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Winter Jackets Hero Slider"
                      value={bannerTitle}
                      onChange={(e) => setBannerTitle(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Banner Layout Dimensions</label>
                    <select
                      value={bannerDimensions}
                      onChange={(e) => setBannerDimensions(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors cursor-pointer"
                    >
                      <option value="1920x600 px">1920x600 px (Hero Carousel)</option>
                      <option value="400x250 px">400x250 px (Grid Banner)</option>
                      <option value="728x90 px">728x90 px (Leaderboard Row)</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddBanner(false)}
                    className="px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--accent)]/50 text-[9px] font-bold uppercase transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] uppercase transition-all cursor-pointer shadow-sm"
                  >
                    Deploy Slider
                  </button>
                </div>
              </form>
            )}

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
                  {banners.map((bn) => (
                    <tr key={bn.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{bn.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{bn.title}</td>
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{bn.dimensions}</td>
                      <td className="py-3.5 text-blue-400 font-bold">{bn.clicks}</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
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

        {activeTab === "newsletter" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" /> Newsletter & Email Campaign Logs
              </h3>
              <button
                onClick={() => setShowAddNewsletter(!showAddNewsletter)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-bold uppercase transition-all cursor-pointer shadow-xs"
              >
                <Plus className="h-3 w-3" /> Compose Newsletter
              </button>
            </div>

            {/* Compose Newsletter Form */}
            {showAddNewsletter && (
              <form onSubmit={handleAddNewsletter} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/35 space-y-3 max-w-xl">
                <h4 className="text-xs font-bold uppercase text-blue-400">Compose Newsletter Email</h4>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Email Subject Line</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Free delivery on all products this weekend only!"
                    value={newsSubject}
                    onChange={(e) => setNewsSubject(e.target.value)}
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddNewsletter(false)}
                    className="px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--accent)]/50 text-[9px] font-bold uppercase transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] uppercase transition-all cursor-pointer shadow-sm"
                  >
                    Queue Mail
                  </button>
                </div>
              </form>
            )}

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
                  {newsletters.map((nw) => (
                    <tr key={nw.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{nw.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{nw.subject}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)] font-semibold">{nw.sentCount}</td>
                      <td className="py-3.5 text-emerald-450 font-black">{nw.openRate}</td>
                      <td className="py-3.5 text-right font-mono text-[10px] text-[var(--muted-foreground)]">{nw.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
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
                  {notifications.map((nt) => (
                    <tr key={nt.id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{nt.id}</td>
                      <td className="py-3.5 font-bold text-[var(--foreground)]">{nt.message}</td>
                      <td className="py-3.5 text-[var(--muted-foreground)]">{nt.type}</td>
                      <td className="py-3.5 text-blue-400 font-black">{nt.clickRate}</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
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
