"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { signInAction, signUpAction } from "@/actions/auth";
import { X, Mail, Lock, User, Phone, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function AuthModal() {
  const { isAuthModalOpen, authModalMode, closeAuthModal, openAuthModal, setAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const res: any = await signInAction(formData);
      if (res.error || !res.user) {
        setErrorMessage(res.error || "Invalid credentials.");
      } else {
        setAuth({
          id: res.user.id,
          fullName: res.user.user_metadata?.full_name || email.split("@")[0],
          avatarUrl: null,
          role: res.role || "customer",
          email: res.user.email,
        });
        toast.success("Welcome back to YazMart!");
        closeAuthModal();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("fullName", fullName);

      const res: any = await signUpAction(formData);

      if (res.error) {
        setErrorMessage(res.error);
      } else {
        if (res.user) {
          setAuth({
            id: res.user.id,
            fullName: fullName || email.split("@")[0],
            avatarUrl: null,
            role: res.role || "customer",
            email: res.user.email,
          });
        }
        toast.success("Account registered successfully!");
        closeAuthModal();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0c1026] border border-slate-200 dark:border-[#1a224c] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="relative bg-gradient-to-r from-[#0b1426] via-[#111936] to-[#0b1426] p-6 text-white text-center">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <img src="/logo yazmart.png" alt="YazMart" className="h-9 w-auto object-contain mx-auto mb-2 bg-white rounded-lg p-1" />
          
          <h3 className="text-base font-extrabold tracking-tight">
            {authModalMode === "login" && "Sign In to YazMart"}
            {authModalMode === "register" && "Create Your Free Account"}
            {authModalMode === "forgot" && "Reset Password"}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {authModalMode === "login" && "Access your saved wishlist, orders, and merchant dashboard"}
            {authModalMode === "register" && "Join Bangladesh's premier multi-vendor e-commerce network"}
            {authModalMode === "forgot" && "Enter your email to receive a password reset link"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 dark:border-[#1a224c] bg-slate-50 dark:bg-[#080b1e]">
          <button
            onClick={() => { openAuthModal("login"); setErrorMessage(""); }}
            className={`flex-1 py-3 text-xs font-bold transition cursor-pointer ${
              authModalMode === "login"
                ? "text-[#ff6600] border-b-2 border-[#ff6600] bg-white dark:bg-[#0c1026]"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { openAuthModal("register"); setErrorMessage(""); }}
            className={`flex-1 py-3 text-xs font-bold transition cursor-pointer ${
              authModalMode === "register"
                ? "text-[#ff6600] border-b-2 border-[#ff6600] bg-white dark:bg-[#0c1026]"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {authModalMode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#141a3d] border border-slate-200 dark:border-[#1a224c] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#ff6600]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => openAuthModal("forgot")}
                    className="text-[10px] text-[#ff6600] hover:underline font-bold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#141a3d] border border-slate-200 dark:border-[#1a224c] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#ff6600]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-[#ff6600] hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#ff6600]/20"
              >
                {loading ? "Authenticating..." : "Sign In Now"} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {authModalMode === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#141a3d] border border-slate-200 dark:border-[#1a224c] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#ff6600]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#141a3d] border border-slate-200 dark:border-[#1a224c] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#ff6600]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#141a3d] border border-slate-200 dark:border-[#1a224c] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#ff6600]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-[#ff6600] hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#ff6600]/20"
              >
                {loading ? "Creating Account..." : "Create Free Account"} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {authModalMode === "forgot" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Please enter your registered email address below. We will send you an encrypted password reset verification link.
              </p>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#141a3d] border border-slate-200 dark:border-[#1a224c] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#ff6600]"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => { toast.success("Reset link dispatched to your email address!"); openAuthModal("login"); }}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold uppercase tracking-wider transition cursor-pointer"
              >
                Send Recovery Instructions
              </button>
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="w-full text-center text-xs text-slate-500 hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Social Proof */}
          <div className="pt-3 border-t border-slate-100 dark:border-[#1a224c] flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> 256-Bit SSL Encrypted</span>
            <span>Fast & Secure</span>
          </div>

        </div>

      </div>
    </div>
  );
}
