"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import FaviconSpinner from "./FaviconSpinner";

export default function NavigationSpinner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  // Hide spinner whenever pathname or searchParams change (navigation finished)
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // Intercept all internal anchor link clicks to show FaviconSpinner instantly
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        !target.getAttribute("target") &&
        href !== pathname
      ) {
        setIsNavigating(true);
      }
    };

    window.addEventListener("click", handleAnchorClick, { capture: true });
    return () => {
      window.removeEventListener("click", handleAnchorClick, { capture: true });
    };
  }, [pathname]);

  if (!isNavigating) return null;

  return <FaviconSpinner fullScreen size="lg" label="Loading Page..." />;
}
