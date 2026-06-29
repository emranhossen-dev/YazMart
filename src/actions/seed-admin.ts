"use server";

import { seedAdminUser } from "@/lib/seed-admin-user";

export async function seedAdminUserAction() {
  if (process.env.NODE_ENV === "production") {
    return { error: "Admin seeding is disabled in production." };
  }

  try {
    const result = await seedAdminUser();
    return {
      success: `Admin user ready: ${result.email}`,
      email: result.email,
      password: result.password,
    };
  } catch (error) {
    console.error("❌ ADMIN SEED ERROR:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to seed admin user.",
    };
  }
}
