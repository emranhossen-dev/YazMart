"use client";

import React, { useState } from "react";
import { signInAction, signUpAction } from "@/action/auth"; 
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      if (isLogin) {
        const res = await signInAction(formData);
        if (res.error) {
          setMessage({ type: "error", text: res.error });
        } else {
          setMessage({ type: "success", text: "Login successful! Redirecting..." });
          setTimeout(() => router.push("/"), 1500);
        }
      } else {
        const res = await signUpAction(formData);
        if (res.error) {
          setMessage({ type: "error", text: res.error });
        } else {
          setMessage({ type: "success", text: res.success || "" });
        }
      }
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally { // বানান ফিক্স করা হলো (finally)
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md p-8 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-xl">
        <div className="flex justify-center mb-6 border-b border-[var(--border)]">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setMessage(null); }}
            className={`pb-2 px-4 font-medium transition-colors cursor-pointer ${
              isLogin ? "border-b-2 border-[var(--primary)] text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setMessage(null); }}
            className={`pb-2 px-4 font-medium transition-colors cursor-pointer ${
              !isLogin ? "border-b-2 border-[var(--primary)] text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
            }`}
          >
            Register
          </button>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-[var(--foreground)]">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        {message && (
          <div
            className={`p-3 rounded mb-4 text-sm ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--muted-foreground)]">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                className="w-full px-3 py-2 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--muted-foreground)]">Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-3 py-2 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--muted-foreground)]">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-3 py-2 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded bg-[var(--primary)] text-[var(--primary-foreground)] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}