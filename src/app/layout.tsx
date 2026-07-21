import type { Metadata } from "next";
import React, { Suspense } from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "react-hot-toast";
import MobileBottomNav from "@/components/MobileBottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "YazMart | Bangladesh's Premier E-Commerce Marketplace",
  description: "Shop quality electronics, fashion, and everyday essentials on YazMart with live order tracking and fast delivery.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased pb-14 md:pb-0">
        <ThemeProvider
          attribute="data-theme"
          forcedTheme="light"
          enableSystem={false}
        >
          <AuthProvider>
            <Suspense fallback={null}>
              {children}
            </Suspense>
            <Suspense fallback={null}>
              <MobileBottomNav />
            </Suspense>
            <Toaster position="top-right" reverseOrder={false} />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}