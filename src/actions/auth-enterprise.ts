"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

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

export async function getEnterpriseUserSession() {
  const cookieStore = await cookies();
  try {
    const sessionToken = cookieStore.get("sb-access-token")?.value;

    if (!sessionToken) {
      return { user: null, role: null, authenticated: false };
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(sessionToken);

    if (error || !user) {
      return { user: null, role: null, authenticated: false };
    }

    // Fetch user profile from database with role info
    let profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      include: { roles: true }
    });

    // If profile is missing in local DB, auto-provision it
    if (!profile) {
      const totalProfiles = await prisma.profiles.count();
      const isAdminEmail = user.email === "admin@yazmart.com" || user.email?.startsWith("admin");
      // First user or admin emails get admin role, others get customer
      const roleName = (totalProfiles === 0 || isAdminEmail) ? "admin" : "customer";
      const roleId = await getOrCreateRoleId(roleName);

      profile = await prisma.profiles.create({
        data: {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          role_id: roleId
        },
        include: { roles: true }
      });
    }

    const roleName = profile.roles ? profile.roles.name : "customer";
    const rawPerms = profile.roles ? (profile.roles.permissions as any) : null;
    let permissions: string[] = [];
    if (Array.isArray(rawPerms)) {
      permissions = rawPerms as string[];
    } else if (rawPerms && typeof rawPerms === 'string') {
      try {
        permissions = JSON.parse(rawPerms);
      } catch (_) {}
    }

    return {
      user: {
        id: profile.id,
        name: profile.full_name || "Enterprise User",
      },
      role: roleName,
      permissions,
      authenticated: true
    };
  } catch (error) {
    console.error("❌ ENTERPRISE AUTH SESSION ERROR:", error);
    return { user: null, role: null, authenticated: false };
  }
}