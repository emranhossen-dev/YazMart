"use client";

import React, { useState } from "react";
import { signInAction, signUpAction } from "@/actions/auth";
import Link from "next/link";
import { ShoppingBag, Lock, Mail, User, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";
import { useShopStore } from "@/store/shop-store";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);

    try {
      if (isLogin) {
        const res = await signInAction(formData);
        const loginRes = res as any;
        if (loginRes.error) {
          setMessage({ type: "error", text: loginRes.error });
        } else {
          // Set session client-side
          if (loginRes.session) {
            await supabase.auth.setSession({
              access_token: loginRes.session.access_token,
              refresh_token: loginRes.session.refresh_token,
            });
          }

          if (loginRes.user) {
            useAuthStore.getState().setAuth({
              id: loginRes.user.id,
              fullName: loginRes.user.user_metadata?.full_name || loginRes.user.email?.split("@")[0] || "User",
              avatarUrl: null,
              role: loginRes.role || "customer",
              email: loginRes.user.email,
              phone: null,
            });
          }

          const roleLower = loginRes.role?.toLowerCase() || "";
          const isAdminOrStaff = roleLower.includes("admin") || roleLower.includes("staff");
          const isSeller = roleLower === "seller";
          const destination = isAdminOrStaff ? "/admin" : isSeller ? "/seller" : "/profile";

          setMessage({
            type: "success",
            text: `Login successful! Redirecting to ${
              isAdminOrStaff ? "admin dashboard" : isSeller ? "seller hub" : "customer profile"
            }...`,
          });

          window.location.href = destination;
        }
      } else {
        const res = await signUpAction(formData);
        const signUpRes = res as any;
        if (signUpRes.error) {
          setMessage({ type: "error", text: signUpRes.error });
        } else {
          // Clear cart for newly registered user so they start fresh with 0 items
          useShopStore.getState().clearCart();

          // Check if registration returned session (auto-login succeeded)
          if (signUpRes.session) {
            await supabase.auth.setSession({
              access_token: signUpRes.session.access_token,
              refresh_token: signUpRes.session.refresh_token,
            });

            if (signUpRes.user) {
              useAuthStore.getState().setAuth({
                id: signUpRes.user.id,
                fullName: signUpRes.user.user_metadata?.full_name || signUpRes.user.email?.split("@")[0] || "User",
                avatarUrl: null,
                role: signUpRes.role || "customer",
                email: signUpRes.user.email,
                phone: null,
              });
            }

            const roleLower = signUpRes.role?.toLowerCase() || "";
            const isAdminOrStaff = roleLower.includes("admin") || roleLower.includes("staff");
            const isSeller = roleLower === "seller";
            const destination = isAdminOrStaff ? "/admin" : isSeller ? "/seller" : "/profile";

            setMessage({
              type: "success",
              text: `Registration successful! Redirecting to ${
                isAdminOrStaff ? "admin dashboard" : isSeller ? "seller hub" : "customer profile"
              }...`,
            });

            window.location.href = destination;
          } else {
            setMessage({ type: "success", text: signUpRes.success || "Registration successful! You can now Sign In." });
            setIsLogin(true);
          }
        }
      }
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans antialiased">
      {/* Header */}
      <header className="h-16 border-b border-[var(--border)] bg-[var(--card)] px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link href="/" className="inline-block">
          <img
            src="/logo yazmart.png"
            alt="YazMart Logo"
            className="h-10 w-auto object-contain max-w-[150px]"
          />
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Auth Form Section */}
      <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-blue-900/5 via-zinc-950/10 to-zinc-900/5">
        <div className="w-full max-w-md p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl relative overflow-hidden space-y-6">
          
          {/* Back to storefront link */}
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:underline">
            <ArrowLeft className="h-3 w-3" /> Back to Storefront
          </Link>

          {/* Title Header */}
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[var(--foreground)]">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              {isLogin ? "Sign in to access your YazMart account" : "Sign up to track orders and save your wishlist"}
            </p>
          </div>

          {/* Tabs switch */}
          <div className="flex border border-[var(--border)] bg-[var(--background)] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setMessage(null); }}
              className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
                isLogin 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setMessage(null); }}
              className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
                !isLogin 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Register
            </button>
          </div>

          {/* Feedback Messages */}
          {message && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold animate-fade-in ${
                message.type === "success"
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="block text-[9px] font-bold uppercase text-[var(--muted-foreground)]">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--background)] border border-[var(--border)] w-full focus:outline-none focus:border-blue-500 font-medium text-[var(--foreground)] placeholder-[var(--muted-foreground)]"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase text-[var(--muted-foreground)]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
                <input
                  type="email"
                  name="email"
                  required
                  className="pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--background)] border border-[var(--border)] w-full focus:outline-none focus:border-blue-500 font-medium text-[var(--foreground)] placeholder-[var(--muted-foreground)]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase text-[var(--muted-foreground)]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
                <input
                  type="password"
                  name="password"
                  required
                  className="pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--background)] border border-[var(--border)] w-full focus:outline-none focus:border-blue-500 font-medium text-[var(--foreground)] placeholder-[var(--muted-foreground)]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-sm mt-2"
            >
              {loading ? "Processing..." : isLogin ? "Sign In" : "Register"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}