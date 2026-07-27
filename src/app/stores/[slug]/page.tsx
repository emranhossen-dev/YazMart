import React from "react";
import { Metadata } from "next";
import { headers } from "next/headers";
import { getStoreData } from "@/actions/shop";
import StorePageClient from "@/components/StorePageClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await getStoreData(slug);
  if (!res || !res.store) {
    return {
      title: "Store Not Found",
    };
  }

  const store = res.store;
  const headerList = await headers();
  const host = headerList.get("host") || "";
  const siteName = host.toLowerCase().includes("gadgetbro") ? "GadgetBro" : "YazMart";

  const seoTitle = `${store.name} | ${siteName}`;
  const seoDesc = store.description || `Browse and buy online from ${store.name} at ${siteName}.`;

  return {
    title: seoTitle,
    description: seoDesc,
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      type: "website",
    },
  };
}

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await getStoreData(slug);

  if (!res || res.error || !res.store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] gap-3 text-[var(--foreground)] font-sans">
        <p className="text-sm font-bold uppercase">Store not found</p>
        <a href="/" className="px-4 py-2 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase hover:bg-zinc-700">Go to storefront</a>
      </div>
    );
  }

  return (
    <StorePageClient
      store={res.store}
      initialProducts={res.products || []}
      storeCategories={res.storeCategories || []}
    />
  );
}
