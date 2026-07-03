"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

function readTab(defaultTab: string) {
  if (typeof window === "undefined") return defaultTab;
  
  // Try parsing tab from pathname first: e.g. /admin/orders/returns -> 'returns'
  const pathname = window.location.pathname;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length > 2 && parts[0] === "admin") {
    const knownPages = [
      "products", "categories", "brands", "attributes", "tags", 
      "reviews", "orders", "inventory", "purchase", "customers", 
      "finance", "marketing", "content", "reports", "staff", "settings"
    ];
    const lastPart = parts[parts.length - 1];
    if (!knownPages.includes(lastPart)) {
      return lastPart;
    }
  }

  return new URLSearchParams(window.location.search).get("tab") || defaultTab;
}

function readQueryParam(key: string) {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(key);
}

export function useAdminTab(defaultTab: string) {
  const pathname = usePathname();
  return useMemo(() => readTab(defaultTab), [pathname, defaultTab]);
}

export function useQueryTab() {
  const pathname = usePathname();
  return useMemo(() => readQueryParam("tab"), [pathname]);
}

export function useQueryParam(key: string, defaultValue = "") {
  const pathname = usePathname();
  return useMemo(() => {
    if (typeof window === "undefined") return defaultValue;
    return new URLSearchParams(window.location.search).get(key) || defaultValue;
  }, [pathname, key, defaultValue]);
}
