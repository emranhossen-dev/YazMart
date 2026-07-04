"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

function readTab(defaultTab: string, currentPathname: string | null) {
  if (!currentPathname) {
    if (typeof window === "undefined") return defaultTab;
    currentPathname = window.location.pathname;
  }
  
  const parts = currentPathname.split("/").filter(Boolean);
  if (parts.length > 2 && parts[0] === "admin") {
    const knownPages = [
      "products", "categories", "brands", "attributes", "tags", 
      "reviews", "orders", "inventory", "purchase", "customers", 
      "finance", "marketing", "content", "reports", "staff", "settings"
    ];
    // parts[0] = admin
    // parts[1] = module (e.g. inventory)
    // parts[2] = subtab (e.g. warehouses)
    if (knownPages.includes(parts[1]) && parts[2]) {
      return parts[2];
    }
  }

  return defaultTab;
}

function readQueryParam(key: string) {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(key);
}

export function useAdminTab(defaultTab: string) {
  const pathname = usePathname();
  return useMemo(() => readTab(defaultTab, pathname), [pathname, defaultTab]);
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
