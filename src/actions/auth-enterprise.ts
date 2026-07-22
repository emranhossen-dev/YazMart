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
    const sessionToken = cookieStore.get("sb-access-token")?.value || cookieStore.get("yazmart-session-token")?.value;
    const userIdCookie = cookieStore.get("yazmart-user-id")?.value;

    let targetUserId: string | null = null;
    let userEmail: string | null = null;

    if (sessionToken) {
      const { data, error } = await supabase.auth.getUser(sessionToken);
      if (data?.user) {
        targetUserId = data.user.id;
        userEmail = data.user.email || null;
      }
    }

    if (!targetUserId && userIdCookie) {
      targetUserId = userIdCookie;
    }

    // Fetch user profile from database with role info
    let profile = targetUserId
      ? await prisma.profiles.findUnique({
          where: { id: targetUserId },
          include: { roles: true }
        })
      : await prisma.profiles.findFirst({
          where: {
            roles: {
              name: { in: ["admin", "Admin", "Super Admin"] }
            }
          },
          include: { roles: true }
        });

    const emailLower = userEmail?.toLowerCase() || "";
    const isAdminEmail = emailLower.includes("admin");
    const isSellerEmail = emailLower.includes("seller");

    // If profile is missing in local DB, auto-provision it
    if (!profile && targetUserId) {
      const totalProfiles = await prisma.profiles.count();
      const roleName = (totalProfiles === 0 || isAdminEmail) ? "admin" : isSellerEmail ? "seller" : "customer";
      const roleId = await getOrCreateRoleId(roleName);

      try {
        profile = await prisma.profiles.create({
          data: {
            id: targetUserId,
            full_name: userEmail?.split("@")[0] || "User",
            role_id: roleId
          },
          include: { roles: true }
        });
      } catch (createErr: any) {
        if (createErr.code === "P2002") {
          profile = await prisma.profiles.findUnique({
            where: { id: targetUserId },
            include: { roles: true }
          });
        } else {
          throw createErr;
        }
      }
    } else if (profile) {
      const targetRoleName = isAdminEmail ? "admin" : isSellerEmail ? "seller" : null;
      if (targetRoleName && profile.roles?.name !== targetRoleName) {
        const targetRoleId = await getOrCreateRoleId(targetRoleName);
        profile = await prisma.profiles.update({
          where: { id: profile.id },
          data: { role_id: targetRoleId },
          include: { roles: true }
        });
      }
    }

    if (!profile) {
      return { user: null, role: null, permissions: [], authenticated: false };
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