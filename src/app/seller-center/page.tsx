import React from "react";
import Link from "next/link";
import { getEnterpriseUserSession } from "@/actions/auth-enterprise";
import { getSellerStore } from "@/actions/seller";
import SellerOnboarding from "@/components/SellerOnboarding";
import { 
  ShoppingBag, ShieldAlert, Clock, CheckCircle2, ChevronRight, Lock, UserCheck 
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const unstable_instant = false;

export default async function SellerCenterPage() {
  const session = await getEnterpriseUserSession();

  // 1. Unauthenticated State
  if (!session.authenticated || !session.user) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans antialiased">
        <header className="h-16 border-b border-[var(--border)] bg-[var(--card)] px-6 flex items-center justify-between sticky top-0 z-50">
          <Link href="/" className="text-xl font-black tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <ShoppingBag className="h-5 w-5" />
            </div>
            Yaz<span className="text-blue-500">Mart</span>
          </Link>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-blue-900/5 via-zinc-950/10 to-zinc-900/5">
          <div className="w-full max-w-md p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl text-center space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
              <Lock className="h-6 w-6" />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold tracking-tight">Access Restricted</h2>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Please Sign In to request a seller account. You can register a customer account and apply instantly.
              </p>
            </div>

            <Link
              href="/auth"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 py-3 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
            >
              Sign In to Continue <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
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
    // Show under review screen
    contentBlock = (
      <div className="mx-auto max-w-md p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 animate-pulse">
          <Clock className="h-6 w-6" />
        </div>
        
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold tracking-tight">Application Under Review</h2>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Your store request for <strong className="text-[var(--foreground)]">{store.name}</strong> is currently pending admin approval. We will review and activate it shortly.
          </p>
        </div>

        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] py-3 text-xs font-bold uppercase tracking-wider text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  } else if (store.status === "ACTIVE") {
    // Show store is active screen
    contentBlock = (
      <div className="mx-auto max-w-md p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold tracking-tight">Storefront is Active</h2>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Your store <strong className="text-[var(--foreground)]">{store.name}</strong> is fully active! You have seller privileges and can access the dashboard.
          </p>
        </div>

        <div className="space-y-2.5">
          <Link
            href="/seller"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 py-3 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
          >
            Enter Seller Hub <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/stores/${store.slug}`}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] py-3 text-xs font-bold uppercase tracking-wider text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            Browse My Storefront
          </Link>
        </div>
      </div>
    );
  } else {
    // Show disabled/inactive screen
    contentBlock = (
      <div className="mx-auto max-w-md p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <ShieldAlert className="h-6 w-6" />
        </div>
        
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold tracking-tight">Store Inactive</h2>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Your store has been deactivated. Please contact support if you believe this is an error.
          </p>
        </div>

        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] py-3 text-xs font-bold uppercase tracking-wider text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans antialiased">
      <header className="h-16 border-b border-[var(--border)] bg-[var(--card)] px-6 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="text-xl font-black tracking-tight flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white">
            <ShoppingBag className="h-5 w-5" />
          </div>
          Yaz<span className="text-blue-500">Mart</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-extrabold text-[var(--foreground)]">{session.user.name}</p>
            <p className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Account Active</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-blue-900/5 via-zinc-950/10 to-zinc-900/5">
        {contentBlock}
      </main>
    </div>
  );
}
