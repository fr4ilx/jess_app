import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { profileQueryKey, type ProfileRow } from "@/hooks/useProfile";

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patch: TablesUpdate<"profiles">): Promise<ProfileRow> => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    // Optimistic merge so step navigation doesn't flicker waiting on the network.
    onMutate: async (patch) => {
      if (!user) return { previous: undefined as ProfileRow | undefined };
      const key = profileQueryKey(user.id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ProfileRow>(key);
      if (previous) {
        queryClient.setQueryData<ProfileRow>(key, { ...previous, ...patch } as ProfileRow);
      }
      return { previous };
    },
    onError: (error, _patch, context) => {
      if (context?.previous && user) {
        queryClient.setQueryData(profileQueryKey(user.id), context.previous);
      }
      const message = error instanceof Error ? error.message : "Failed to save";
      toast.error(message);
    },
    onSuccess: (data) => {
      if (user) queryClient.setQueryData(profileQueryKey(user.id), data);
    },
  });
}
