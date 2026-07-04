"use server";

import { prisma } from "@/lib/prisma";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// 1. Get all staff members (profiles that are not customers)
export async function getStaffMembers() {
  try {
    const staff = await prisma.profiles.findMany({
      where: {
        roles: {
          name: {
            not: "customer"
          }
        }
      },
      include: {
        roles: true
      },
      orderBy: {
        created_at: "desc"
      }
    });
    return { staff };
  } catch (error: any) {
    console.error("❌ GET STAFF MEMBERS ERROR:", error);
    return { error: "Failed to fetch staff directory.", staff: [] };
  }
}

// 2. Get all system roles
export async function getSystemRoles() {
  try {
    const roles = await prisma.roles.findMany({
      orderBy: {
        name: "asc"
      }
    });
    
    // Calculate users count for each role dynamically
    const rolesWithCount = await Promise.all(
      roles.map(async (role) => {
        const usersCount = await prisma.profiles.count({
          where: { role_id: role.id }
        });
        
        let permissions: string[] = [];
        if (Array.isArray(role.permissions)) {
          permissions = role.permissions as string[];
        } else if (role.permissions && typeof role.permissions === 'string') {
          try {
            permissions = JSON.parse(role.permissions);
          } catch (_) {}
        }

        return {
          id: role.id,
          name: role.name,
          permissions,
          usersCount
        };
      })
    );

    return { roles: rolesWithCount };
  } catch (error: any) {
    console.error("❌ GET SYSTEM ROLES ERROR:", error);
    return { error: "Failed to fetch system roles.", roles: [] };
  }
}

// 3. Assign a role to a staff member
export async function updateStaffMemberRole(profileId: string, roleId: string) {
  try {
    const updated = await prisma.profiles.update({
      where: { id: profileId },
      data: { role_id: roleId },
      include: { roles: true }
    });
    
    revalidatePath("/admin/staff");
    return { success: true, updated };
  } catch (error: any) {
    console.error("❌ UPDATE STAFF ROLE ERROR:", error);
    return { error: error?.message || "Failed to update staff member's role." };
  }
}

// 4. Create or update a role with permissions checklist
export async function createOrUpdateRole(name: string, permissions: string[], roleId?: string) {
  try {
    if (!name) return { error: "Role name is required." };
    
    let role;
    if (roleId) {
      // Update existing role
      role = await prisma.roles.update({
        where: { id: roleId },
        data: {
          name,
          permissions: permissions // JSON Array
        }
      });
    } else {
      // Create new role
      role = await prisma.roles.create({
        data: {
          name,
          permissions: permissions // JSON Array
        }
      });
    }

    revalidatePath("/admin/staff");
    return { success: true, role };
  } catch (error: any) {
    console.error("❌ CREATE/UPDATE ROLE ERROR:", error);
    return { error: error?.message || "Failed to save role and permissions." };
  }
}

// 5. Delete a role
export async function deleteRole(roleId: string) {
  try {
    // Check if any users are assigned to this role
    const usersCount = await prisma.profiles.count({
      where: { role_id: roleId }
    });

    if (usersCount > 0) {
      return { error: `Cannot delete role. There are ${usersCount} staff members assigned to it. Reassign them first.` };
    }

    await prisma.roles.delete({
      where: { id: roleId }
    });

    revalidatePath("/admin/staff");
    return { success: true };
  } catch (error: any) {
    console.error("❌ DELETE ROLE ERROR:", error);
    return { error: error?.message || "Failed to delete role." };
  }
}

// 6. Create a new staff member account (Supabase Auth + Database Profile)
export async function createStaffMember(fullName: string, email: string, password: string, roleId: string) {
  try {
    if (!fullName || !email || !password || !roleId) {
      return { error: "All fields are required." };
    }

    // 1. Create user in Supabase Auth (Server-side scope)
    let authData, authError;
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // AUTO-CONFIRM email so staff can log in immediately!
        user_metadata: {
          full_name: fullName
        }
      });
      authData = data;
      authError = error;
    } else {
      // Fallback to normal signup if admin key is not available
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      authData = data;
      authError = error;
    }

    if (authError) {
      console.error("Supabase user creation error:", authError);
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: "Could not create authentication user." };
    }

    const userId = authData.user.id;

    // 2. Create the database profile record
    const profile = await prisma.profiles.create({
      data: {
        id: userId,
        full_name: fullName,
        role_id: roleId
      },
      include: {
        roles: true
      }
    });

    revalidatePath("/admin/staff");
    return { success: true, profile };
  } catch (error: any) {
    console.error("❌ CREATE STAFF MEMBER ERROR:", error);
    return { error: error?.message || "Failed to create staff member account." };
  }
}
