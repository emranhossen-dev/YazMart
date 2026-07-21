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

        setAuth({
          id: userId,
          fullName: profile?.fullName || fullName || email?.split("@")[0] || "Customer",
          avatarUrl: profile?.avatarUrl || null,
          role: profile?.role || (email === "admin@yazmart.com" || email?.startsWith("admin") ? "admin" : "customer"),
          email: email || profile?.email || null,
          phone: profile?.phone || null,
        });
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setAuth({
          id: userId,
          fullName: fullName || email?.split("@")[0] || "Customer",
          avatarUrl: null,
          role: email === "admin@yazmart.com" || email?.startsWith("admin") ? "admin" : "customer",
          email: email || null,
          phone: null,
        });
      } finally {
        setLoading(false);
      }
    };

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Synchronize Supabase access token to browser cookies for SSR/Server Components on mount
          const maxAge = session.expires_in || 3600;
          const secureFlag = window.location.protocol === "https:" ? "Secure" : "";
          document.cookie = `yazmart-session-token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; ${secureFlag}`;

          await getUserProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.full_name || ""
          );
        } else {
          // Fallback: check if we have a session token cookie
          const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(";").shift();
            return null;
          };
          const cookieToken = getCookie("yazmart-session-token");

          if (cookieToken) {
            const { data: { user: cookieUser }, error } = await supabase.auth.getUser(cookieToken);

            if (cookieUser && !error) {
              await getUserProfile(
                cookieUser.id,
                cookieUser.email,
                cookieUser.user_metadata?.full_name || ""
              );
              return;
            }
          }

          // If no active session or cookie token found, keep existing persisted user if any or stop loading
          setLoading(false);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        setLoading(false);
      }
    };

    initializeAuth();

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
          // Only clear the session cookie if the user explicitly signs out
          if (event === "SIGNED_OUT") {
            document.cookie = "yazmart-session-token=; path=/; max-age=0; SameSite=Lax";
            setAuth(null);
          }
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