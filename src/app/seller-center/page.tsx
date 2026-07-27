import React from "react";
import Link from "next/link";
import { getEnterpriseUserSession } from "@/actions/auth-enterprise";
import { getSellerStore } from "@/actions/seller";
import SellerOnboarding from "@/components/SellerOnboarding";
import { 
  ShoppingBag, ShieldAlert, Clock, CheckCircle2, ChevronRight, Lock, UserCheck, Store 
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { redirect } from "next/navigation";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function SellerCenterPage() {
  const session = await getEnterpriseUserSession();

  // 1. Unauthenticated State — Show inviting merchant introduction
  if (!session.authenticated || !session.user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Header />

        <main className="flex-1 flex items-center justify-center p-6 py-12">
          <div className="w-full max-w-lg p-8 md:p-10 rounded-3xl border border-slate-200 bg-white shadow-xl text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#ff6600] border border-orange-200 shadow-2xs">
              <Store className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#ff6600] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                Become a Verified Merchant
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Start Selling on YazMart</h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Join thousands of Bangladesh merchants selling electronics, fashion, and lifestyle items. Create your store, upload catalog items & receive orders instantly.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200 text-[11px] font-bold text-slate-700">
              <div className="space-y-1">
                <p className="text-[#ff6600]">🚀 Fast Setup</p>
                <p className="text-[10px] text-slate-500 font-normal">2-minute registration</p>
              </div>
              <div className="space-y-1">
                <p className="text-emerald-600">৳0 Commission</p>
                <p className="text-[10px] text-slate-500 font-normal">Keep 100% of sales</p>
              </div>
              <div className="space-y-1">
                <p className="text-blue-600">⚡ Live Tracking</p>
                <p className="text-[10px] text-slate-500 font-normal">Automated dispatch</p>
              </div>
            </div>

            <Link
              href="/auth"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff6600] hover:bg-orange-700 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-all shadow-md cursor-pointer"
            >
              Sign In / Register Store <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // 2. Authenticated State - Check store status
  const storeRes = await getSellerStore(session.user.id);
  const store = storeRes.store;

  let contentBlock = null;

  if (!store) {
    // Show onboarding form to request store
    contentBlock = <SellerOnboarding userId={session.user.id} />;
  } else if (store.status === "PENDING") {
    // Show under review screen with Admin Contact manual & buttons
    contentBlock = (
      <div className="mx-auto max-w-xl p-8 md:p-10 rounded-3xl border border-slate-200 bg-white shadow-xl text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 animate-pulse">
          <Clock className="h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider border border-amber-200">
            Status: Pending Approval
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Application Under Review</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            Your merchant store application for <strong className="text-slate-900 font-bold">{store.name}</strong> has been submitted. Contact Admin directly below for instant approval!
          </p>
        </div>

        {/* Admin Direct Verification Contact Box & Manual */}
        <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-5 text-left space-y-4">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-[#ff6600]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Admin Instant Approval Guide & Support</h3>
          </div>
          
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Send a quick message or call our Admin team with your store name (<span className="font-bold text-[#ff6600]">{store.name}</span>) to get verified in under 2 minutes:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <a
              href="tel:+8801700000000"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase transition-colors shadow-xs"
            >
              <span>📞 Call Admin Now</span>
            </a>
            <a
              href={`https://wa.me/8801700000000?text=${encodeURIComponent(`Hello Admin, I have submitted my YazMart Seller Store application for store: ${store.name}. Please approve my account!`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase transition-colors shadow-xs"
            >
              <span>💬 WhatsApp Admin</span>
            </a>
          </div>

          <a
            href={`mailto:shop@yazmart.com?subject=${encodeURIComponent(`Merchant Store Approval Request - ${store.name}`)}&body=${encodeURIComponent(`Store Name: ${store.name}\nOwner Name: ${session.user.name || ''}\nOwner ID: ${session.user.id}\n\nPlease approve my seller store on YazMart.`)}`}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase transition-colors shadow-xs"
          >
            <span>✉️ Send Approval Request Email</span>
          </a>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition-colors"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  } else if (store.status === "ACTIVE") {
    redirect("/seller");
  } else {
    // Show disabled/inactive screen
    contentBlock = (
      <div className="mx-auto max-w-md p-8 rounded-3xl border border-slate-200 bg-white shadow-xl text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <ShieldAlert className="h-6 w-6" />
        </div>
        
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold tracking-tight">Store Inactive</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your store has been deactivated. Please contact support if you believe this is an error.
          </p>
        </div>

        <a
          href="mailto:shop@yazmart.com?subject=Reactivate%20Store%20Request"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
        >
          Contact Support Team
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center p-6 py-12">
        {contentBlock}
      </main>

      <Footer />
    </div>
  );
}
