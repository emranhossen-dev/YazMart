import { prisma } from "@/lib/prisma";
import {
  DEV_ADMIN_EMAIL,
  DEV_ADMIN_FULL_NAME,
  DEV_ADMIN_PASSWORD,
} from "@/lib/admin-credentials";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

async function getOrCreateAdminRoleId() {
  let role = await prisma.roles.findUnique({
    where: { name: "admin" },
  });

  if (!role) {
    role = await prisma.roles.create({
      data: { name: "admin" },
    });
  }

  return role.id;
}

async function ensureAdminProfile(userId: string) {
  const roleId = await getOrCreateAdminRoleId();

  await prisma.profiles.upsert({
    where: { id: userId },
    create: {
      id: userId,
      full_name: DEV_ADMIN_FULL_NAME,
      role_id: roleId,
    },
    update: {
      full_name: DEV_ADMIN_FULL_NAME,
      role_id: roleId,
    },
  });
}

export async function seedAdminUser() {
  const supabaseAdmin = createSupabaseAdminClient();

  const { data: listData, error: listError } =
    await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    throw new Error(`Failed to list Supabase users: ${listError.message}`);
  }

  let user = listData.users.find(
    (entry) => entry.email?.toLowerCase() === DEV_ADMIN_EMAIL.toLowerCase()
  );

  if (!user) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: DEV_ADMIN_EMAIL,
      password: DEV_ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: DEV_ADMIN_FULL_NAME,
      },
    });

    if (error || !data.user) {
      throw new Error(error?.message || "Failed to create admin user.");
    }

    user = data.user;
  } else {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: DEV_ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: DEV_ADMIN_FULL_NAME,
      },
    });

    if (error) {
      throw new Error(`Failed to update admin user: ${error.message}`);
    }
  }

  await ensureAdminProfile(user.id);

  return {
    email: DEV_ADMIN_EMAIL,
    password: DEV_ADMIN_PASSWORD,
    userId: user.id,
  };
}
