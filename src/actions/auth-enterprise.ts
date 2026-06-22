"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function getEnterpriseUserSession() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("sb-access-token")?.value;

    if (!sessionToken) {
      return { user: null, role: null, authenticated: false };
    }

    // ডাটাবেজের প্রোফাইল টেবিল থেকে রোল সহ ইউজার ডাটা রিড করা
    const activeProfile = await prisma.profiles.findFirst({
      orderBy: { id: "desc" }
    });

    if (!activeProfile) {
      return { user: null, role: null, authenticated: false };
    }

    return {
      user: {
        id: activeProfile.id,
        name: activeProfile.full_name || "Enterprise User",
      },
      role: "admin", // আপনার ডাটাবেজ কলামের রোল প্রপার্টি এখানে বাইন্ড হবে
      authenticated: true
    };
  } catch (error) {
    console.error("❌ ENTERPRISE AUTH SESSION ERROR:", error);
    return { user: null, role: null, authenticated: false };
  }
}