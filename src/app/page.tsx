import React, { Suspense } from "react";
import { getShopData } from "../actions/shop";
import { getHomepageConfig } from "../actions/homepage";
import HomePageClient from "../components/HomePageClient";

export const unstable_instant = { prefetch: "static" };

export default async function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] font-sans">
        <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)] mt-3">Loading YazMart...</p>
      </div>
    }>
      <HomePageLoader />
    </Suspense>
  );
}

async function HomePageLoader() {
  const shopData = await getShopData("all");
  const configRes = await getHomepageConfig();

  return (
    <HomePageClient
      initialShopData={shopData || {}}
      initialConfig={configRes?.config || null}
    />
  );
}