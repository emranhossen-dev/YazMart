"use server";

import { supabase, supabaseAdmin } from "@/lib/supabase";
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

  // 1. Check if email already exists in users table (prevent duplicate signup and rate limit issues)
  try {
    const existingUser = await prisma.users.findFirst({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (existingUser) {
      return { error: "This email is already registered. Please Sign In." };
    }
  } catch (dbErr) {
    console.error("Error checking existing user:", dbErr);
  }

  // 2. Register user in Supabase Auth
  let signUpError = null;

  if (supabaseAdmin) {
    // If admin client is available, create pre-verified user
    const { data: adminData, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // AUTO-CONFIRM email so they don't need manual verification
      user_metadata: {
        full_name: fullName || "",
      },
    });
    signUpError = adminErr;
  } else {
    // Fallback: normal signup
    const { data: clientData, error: clientErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || "",
        },
      },
    });
    signUpError = clientErr;
  }

  if (signUpError) {
    return { error: signUpError.message };
  }

  // 3. Auto-login immediately after successful registration
  try {
    return await signInAction(formData);
  } catch (loginErr) {
    console.error("Auto-login failed:", loginErr);
    return { success: "Registration successful! You can now Sign In." };
  }
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
      secure: false,
      sameSite: "lax",
      maxAge: data.session.expires_in,
    });
    cookieStore.set("yazmart-session-token", data.session.access_token, {
      path: "/",
      secure: false,
      sameSite: "lax",
      maxAge: data.session.expires_in,
    });
    cookieStore.set("yazmart-user-id", data.user.id, {
      path: "/",
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    const profile = await syncAndGetUserProfile(
      data.user.id,
      data.user.email,
      data.user.user_metadata?.full_name
    );

    return {
      success: "Login successful!",
      session: data.session,
      user: data.user,
      role: profile?.role ?? "customer",
    };
  }

  return { success: "Login successful!", session: data.session, user: data.user, role: "customer" };
}

// ৩. লগআউট অ্যাকশন
export async function signOutAction() {
  const { error } = await supabase.auth.signOut();
  if (error) return { error: error.message };

  const cookieStore = await cookies();
  cookieStore.delete("sb-access-token");
  cookieStore.delete("yazmart-session-token");
  cookieStore.delete("yazmart-user-id");

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
    const profileSelect = {
      id: true,
      full_name: true,
      avatar_url: true,
      role_id: true,
      created_at: true,
      roles: true,
    };

    let profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: profileSelect
    });

    const emailLower = email?.toLowerCase() || "";
    const isAdminEmail = emailLower.includes("admin");
    const isSellerEmail = emailLower.includes("seller");

    if (!profile) {
      const totalProfiles = await prisma.profiles.count();
      const roleName = (totalProfiles === 0 || isAdminEmail) ? "admin" : isSellerEmail ? "seller" : "customer";
      const roleId = await getOrCreateRoleId(roleName);

      try {
        profile = await prisma.profiles.create({
          data: {
            id: userId,
            full_name: fullName || email?.split("@")[0] || "User",
            role_id: roleId
          },
          select: profileSelect
        });
      } catch (createErr: any) {
        if (createErr.code === "P2002") {
          profile = await prisma.profiles.findUnique({
            where: { id: userId },
            select: profileSelect
          });
        } else {
          throw createErr;
        }
      }
    } else {
      // Auto-sync role if email matches admin/seller patterns
      const targetRoleName = isAdminEmail ? "admin" : isSellerEmail ? "seller" : null;
      if (targetRoleName && profile.roles?.name !== targetRoleName) {
        const targetRoleId = await getOrCreateRoleId(targetRoleName);
        profile = await prisma.profiles.update({
          where: { id: userId },
          data: { role_id: targetRoleId },
          select: profileSelect
        });
      }
    }

    if (!profile) {
      return null;
    }

    const currentRole = profile.roles ? profile.roles.name : "customer";

    // Auto-provision seller store if seller user doesn't have one
    if (currentRole === "seller") {
      const existingStore = await prisma.store.findFirst({ where: { owner_id: userId } });
      if (!existingStore) {
        const storeSlug = `seller-${userId.slice(0, 8)}`;
        await prisma.store.create({
          data: {
            owner_id: userId,
            name: fullName ? `${fullName}'s Store` : "Seller Store",
            slug: storeSlug,
            status: "ACTIVE"
          }
        });
      }
    }

    return {
      id: profile.id,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      role: currentRole,
      email: email || null,
      phone: (profile as any).phone || null,
    };
  } catch (error) {
    console.error("❌ ERROR IN SYNC AND GET USER PROFILE ACTION:", error);
    return null;
  }
}