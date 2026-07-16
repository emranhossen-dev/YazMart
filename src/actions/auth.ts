"use server";

import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";


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
  return { success: "Registration successful! You can now Sign In." };
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

  if (data.session && data.user) {
    const cookieStore = await cookies();
    cookieStore.set("sb-access-token", data.session.access_token, {
      path: "/",
      secure: false, // Set to false to support both HTTP and HTTPS staging/live environments
      sameSite: "lax",
      maxAge: data.session.expires_in,
    });

    const profile = await syncAndGetUserProfile(
      data.user.id,
      data.user.email,
      data.user.user_metadata?.full_name
    );

    return {
      success: "Login successful!",
      user: data.user,
      role: profile?.role ?? "customer",
    };
  }

  return { success: "Login successful!", user: data.user, role: "customer" };
}

// ৩. লগআউট অ্যাকশন
export async function signOutAction() {
  const { error } = await supabase.auth.signOut();
  if (error) return { error: error.message };

  const cookieStore = await cookies();
  cookieStore.delete("sb-access-token");

  return { success: "Logged out successfully!" };
}

async function getOrCreateRoleId(roleName: string) {
  let role = await prisma.roles.findUnique({
    where: { name: roleName }
  });
  if (!role) {
    role = await prisma.roles.create({
      data: { name: roleName }
    });
  }
  return role.id;
}

export async function syncAndGetUserProfile(userId: string, email?: string, fullName?: string) {
  try {
    let profile = await prisma.profiles.findUnique({
      where: { id: userId },
      include: { roles: true }
    });

    if (!profile) {
      const totalProfiles = await prisma.profiles.count();
      const isAdminEmail = email === "admin@yazmart.com" || email?.startsWith("admin");
      const roleName = (totalProfiles === 0 || isAdminEmail) ? "admin" : "customer";
      const roleId = await getOrCreateRoleId(roleName);

      try {
        profile = await prisma.profiles.create({
          data: {
            id: userId,
            full_name: fullName || email?.split("@")[0] || "User",
            role_id: roleId
          },
          include: { roles: true }
        });
      } catch (createErr: any) {
        if (createErr.code === "P2002") {
          profile = await prisma.profiles.findUnique({
            where: { id: userId },
            include: { roles: true }
          });
        } else {
          throw createErr;
        }
      }
    }

    if (!profile) {
      return null;
    }

    const roleName = profile.roles ? profile.roles.name : "customer";

    return {
      id: profile.id,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      role: roleName,
    };
  } catch (error) {
    console.error("❌ ERROR IN SYNC AND GET USER PROFILE ACTION:", error);
    return null;
  }
}