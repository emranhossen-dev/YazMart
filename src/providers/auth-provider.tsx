"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";
import { syncAndGetUserProfile } from "@/actions/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const getUserProfile = async (userId: string, email?: string, fullName?: string) => {
      try {
        const profile = await syncAndGetUserProfile(userId, email, fullName);

        if (profile) {
          setAuth({
            id: profile.id,
            fullName: profile.fullName,
            avatarUrl: profile.avatarUrl,
            role: profile.role,
          });
        } else {
          setAuth(null);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setAuth(null);
      } finally {
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Synchronize Supabase access token to browser cookies for SSR/Server Components on mount
        const maxAge = session.expires_in || 3600;
        const secureFlag = window.location.protocol === "https:" ? "Secure" : "";
        document.cookie = `yazmart-session-token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; ${secureFlag}`;

        getUserProfile(
          session.user.id,
          session.user.email,
          session.user.user_metadata?.full_name || ""
        );
      } else {
        setAuth(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Synchronize Supabase access token to browser cookies for SSR/Server Components
          const maxAge = session.expires_in || 3600;
          const secureFlag = window.location.protocol === "https:" ? "Secure" : "";
          document.cookie = `yazmart-session-token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; ${secureFlag}`;

          const user = session.user;
          await getUserProfile(
            user.id,
            user.email,
            user.user_metadata?.full_name || ""
          );
        } else {
          // Clear cookie on logout
          document.cookie = "yazmart-session-token=; path=/; max-age=0; SameSite=Lax";
          setAuth(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, setLoading]);

  return <>{children}</>;
}