"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const getUserProfile = async (userId: string) => {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, roles(name)")
          .eq("id", userId)
          .single();

        if (error) throw error;

        if (profile) {
          const rawRole = profile.roles as unknown as { name: string } | null;
          setAuth({
            id: profile.id,
            fullName: profile.full_name,
            avatarUrl: profile.avatar_url,
            role: rawRole ? rawRole.name : "customer",
          });
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setAuth(null);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await getUserProfile(session.user.id);
        } else {
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