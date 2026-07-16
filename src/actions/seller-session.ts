"use server";

import { getEnterpriseUserSession } from "@/actions/auth-enterprise";
import { prisma } from "@/lib/prisma";

export interface ActiveStoreSession {
  store: {
    id: string;
    owner_id: string;
    name: string;
    slug: string;
    logo_url?: string | null;
    banner_url?: string | null;
    description?: string | null;
    status: string;
    colors?: any;
    createdAt: string;
    updatedAt: string;
  };
  isImpersonating: boolean;
  user: {
    id: string;
    name: string;
  };
}

export async function getActiveSellerStore(overrideStoreId?: string | null): Promise<ActiveStoreSession | null> {
  try {
    const session = await getEnterpriseUserSession();

    if (!session.authenticated || !session.user) {
      return null;
    }

    const isAdmin = session.role === "admin" || session.role === "Super Admin" || session.role === "Admin";

    // 1. If overrideStoreId is requested and user is an administrator, return target store
    if (overrideStoreId && isAdmin) {
      const store = await prisma.store.findUnique({
        where: { id: overrideStoreId }
      });
      if (store) {
        return {
          store: {
            ...store,
            createdAt: store.createdAt.toISOString(),
            updatedAt: store.updatedAt.toISOString(),
          },
          isImpersonating: true,
          user: session.user,
        };
      }
    }

    // 2. Otherwise return the store owned by the logged-in user
    let store = await prisma.store.findFirst({
      where: { owner_id: session.user.id }
    });

    let isImpersonating = false;
    if (!store && isAdmin) {
      store = await prisma.store.findFirst({
        where: { status: "ACTIVE" }
      });
      isImpersonating = true;
    }

    if (!store || store.status !== "ACTIVE") {
      return null;
    }

    return {
      store: {
        ...store,
        createdAt: store.createdAt.toISOString(),
        updatedAt: store.updatedAt.toISOString(),
      },
      isImpersonating,
      user: session.user,
    };
  } catch (error) {
    console.error("❌ RESOLVE ACTIVE SELLER SESSION ERROR:", error);
    return null;
  }
}
