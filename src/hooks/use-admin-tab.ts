"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

function readTab(defaultTab: string) {
  if (typeof window === "undefined") return defaultTab;
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
