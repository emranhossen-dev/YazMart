"use client";

import React, { useState } from "react";
import { signInAction, signUpAction } from "@/actions/auth";
import Link from "next/link";
import { ShoppingBag, Lock, Mail, User, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";
import { useShopStore } from "@/store/shop-store";
import toast from "react-hot-toast";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setMessage(null);
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        toast.error(`Google Sign-In notice: ${error.message}`);
        setMessage({ type: "error", text: error.message });
      }
    } catch (err: any) {
      toast.error("Failed to connect Google OAuth provider.");
    } finally {
      setGoogleLoading(false);
    }
  };

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
          if (loginRes.session) {
            await supabase.auth.setSession({
              access_token: loginRes.session.access_token,
              refresh_token: loginRes.session.refresh_token,
            });
          }

          if (loginRes.user) {
            useAuthStore.getState().setAuth({
              id: loginRes.user.id,
              fullName: loginRes.user.user_metadata?.full_name || loginRes.user.email?.split("@")[0] || "Customer",
              avatarUrl: null,
              role: loginRes.role || "customer",
              email: loginRes.user.email,
              phone: null,
            });
          }

          const roleLower = loginRes.role?.toLowerCase() || "";
          const emailLower = loginRes.user?.email?.toLowerCase() || "";
          const isAdminOrStaff = roleLower.includes("admin") || roleLower.includes("staff") || emailLower.includes("admin");
          const isSeller = roleLower === "seller" || emailLower.includes("seller");
          const destination = isAdminOrStaff ? "/admin" : isSeller ? "/seller" : "/profile";

          setMessage({
            type: "success",
            text: `Welcome back! Redirecting to ${
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
          useShopStore.getState().clearCart();

          if (signUpRes.session) {
            await supabase.auth.setSession({
              access_token: signUpRes.session.access_token,
              refresh_token: signUpRes.session.refresh_token,
            });

            if (signUpRes.user) {
              useAuthStore.getState().setAuth({
                id: signUpRes.user.id,
                fullName: signUpRes.user.user_metadata?.full_name || signUpRes.user.email?.split("@")[0] || "Customer",
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
      setMessage({ type: "error", text: "Authentication error. Please check your credentials." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased relative overflow-hidden">
      {/* Soft Light Decorative Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-200/40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-200/40 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo yazmart.png"
            alt="YazMart Logo"
            className="h-9 w-auto object-contain"
          />
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Auth Form Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 bg-white shadow-xl space-y-6">
          
          {/* Back to storefront link */}
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff6600] hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Storefront
            </Link>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> SSL Encrypted
            </span>
          </div>

          {/* Title Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
              {isLogin ? "Welcome Back!" : "Create Account"}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {isLogin ? "Sign in to manage orders, cart & reward coins" : "Register to track purchases and earn reward coins"}
            </p>
          </div>

          {/* Tabs switch */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setMessage(null); }}
              className={`flex-1 py-2.5 text-xs font-black uppercase rounded-xl transition-all cursor-pointer ${
                isLogin 
                  ? "bg-[#ff6600] text-white shadow-md shadow-orange-500/25" 
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setMessage(null); }}
              className={`flex-1 py-2.5 text-xs font-black uppercase rounded-xl transition-all cursor-pointer ${
                !isLogin 
                  ? "bg-[#ff6600] text-white shadow-md shadow-orange-500/25" 
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Register
            </button>
          </div>

          {/* GOOGLE SIGN IN BUTTON */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-3 shadow-xs border border-slate-200 disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? "Connecting Google..." : "Sign in with Google"}</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="bg-white px-3 text-[10px] font-black uppercase text-slate-400 tracking-widest shrink-0">
              OR EMAIL {isLogin ? "SIGN IN" : "REGISTER"}
            </span>
          </div>

          {/* Feedback Messages */}
          {message && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold animate-in fade-in duration-150 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-600 border border-rose-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-slate-50 border border-slate-200 w-full focus:outline-none focus:border-[#ff6600] font-semibold text-slate-900 placeholder-slate-400"
                    placeholder="e.g. Rahim Ahmed"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  className="pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-slate-50 border border-slate-200 w-full focus:outline-none focus:border-[#ff6600] font-semibold text-slate-900 placeholder-slate-400"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  required
                  className="pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-slate-50 border border-slate-200 w-full focus:outline-none focus:border-[#ff6600] font-semibold text-slate-900 placeholder-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#ff6600] hover:bg-[#e65c00] text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-orange-500/25 mt-2 flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? "Processing..." : isLogin ? "Sign In to Account" : "Create My Account"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}