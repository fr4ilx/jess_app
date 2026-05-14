import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";

export type ProfileRow = Tables<"profiles">;

export function profileQueryKey(userId: string | undefined) {
  return ["profile", userId] as const;
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: profileQueryKey(user?.id),
    enabled: !!user,
    staleTime: 30_000,
    // The profiles row is created by an auth.users insert trigger. If the query
    // races the trigger we get PGRST116 (zero rows); a few retries handle that.
    retry: 3,
    queryFn: async (): Promise<ProfileRow | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) {
        // Surface the full PostgrestError shape to devtools so the user can debug.
        // Common cases: relation-doesn't-exist (migration missing) or PGRST116 (trigger
        // hasn't fired yet — useQuery's retry should recover).
        console.error("[useProfile] supabase error:", error);
        throw error;
      }
      return data;
    },
  });
}
