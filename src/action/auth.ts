"use server";

import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

// ১. ইমেইল ও পাসওয়ার্ড দিয়ে সাইন-আপ বা রেজিস্ট্রেশন অ্যাকশন
export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || "",
      },
    },
  });

  if (error) return { error: error.message };
  return { success: "Registration successful! Please check your email for confirmation." };
}

// ২. লগইন বা সাইন-ইন অ্যাকশন
export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };

  // মিডলওয়্যার ট্র্যাকিংয়ের জন্য কুকি সেট করা
  if (data.session) {
    const cookieStore = await cookies();
    cookieStore.set("sb-access-token", data.session.access_token, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: data.session.expires_in,
    });
  }

  return { success: "Login successful!", user: data.user };
}

// ৩. লগআউট অ্যাকশন
export async function signOutAction() {
  const { error } = await supabase.auth.signOut();
  if (error) return { error: error.message };

  const cookieStore = await cookies();
  cookieStore.delete("sb-access-token");

  return { success: "Logged out successfully!" };
}