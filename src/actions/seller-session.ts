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

    let store: any = null;
    let isImpersonating = false;

    // 1. If overrideStoreId is passed in URL query (e.g. ?store_id=... from Admin panel)
    if (overrideStoreId) {
      store = await prisma.store.findUnique({
        where: { id: overrideStoreId }
      });
      if (store) {
        isImpersonating = true;
      }
    }

    // 2. Look up store owned by logged-in user
    if (!store && session.user?.id) {
      store = await prisma.store.findFirst({
        where: { owner_id: session.user.id }
      });
    }

    // 3. Fallback: find any active store
    if (!store) {
      store = await prisma.store.findFirst({
        where: { status: "ACTIVE" }
      }) || await prisma.store.findFirst();
    }

    // 4. Auto-create store if database is empty
    if (!store) {
      const ownerId = session.user?.id || "default-seller-owner";
      store = await prisma.store.create({
        data: {
          owner_id: ownerId,
          name: "YazMart Main Store",
          slug: "yazmart-main-store",
          status: "ACTIVE",
          description: "Primary enterprise seller store"
        }
      });
    }

    const fallbackUser = session.user || { id: store.owner_id, name: "Seller Merchant" };

    return {
      store: {
        ...store,
        createdAt: store.createdAt ? store.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: store.updatedAt ? store.updatedAt.toISOString() : new Date().toISOString(),
      },
      isImpersonating,
      user: fallbackUser,
    };
  } catch (error) {
    console.error("❌ RESOLVE ACTIVE SELLER SESSION ERROR:", error);
    return null;
  }
}
