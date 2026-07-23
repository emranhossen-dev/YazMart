import type { Metadata } from "next";
import React, { Suspense } from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "react-hot-toast";
import MobileBottomNav from "@/components/MobileBottomNav";
import AuthModal from "@/components/AuthModal";
import NavigationSpinner from "@/components/NavigationSpinner";
import "./globals.css";

export const metadata: Metadata = {
  title: "YazMart | Bangladesh's Premier E-Commerce Marketplace",
  description: "Shop quality electronics, fashion, and everyday essentials on YazMart with live order tracking and fast delivery.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg?v=2" type="image/svg+xml" />
        <link rel="icon" href="/icon.png?v=2" type="image/png" sizes="32x32" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
      </head>
      <body className="antialiased pb-14 md:pb-0">
        <ThemeProvider
          attribute="data-theme"
          forcedTheme="light"
          enableSystem={false}
        >
          <AuthProvider>
            <Suspense fallback={null}>
              <NavigationSpinner />
            </Suspense>
            <Suspense fallback={null}>
              {children}
            </Suspense>
            <Suspense fallback={null}>
              <MobileBottomNav />
            </Suspense>
            <AuthModal />
            <Toaster position="top-right" reverseOrder={false} />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}