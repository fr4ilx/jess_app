import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import type { MealCardData } from "@/components/MealCard";

type MealRow = Tables<"meals">;
type MealInsert = TablesInsert<"meals">;

export function mealsTodayQueryKey(userId: string | undefined) {
  return ["meals", "today", userId] as const;
}

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function rowToMealCard(row: MealRow): MealCardData {
  const rawFoods = Array.isArray(row.foods) ? row.foods : [];
  const foodNames: string[] = rawFoods
    .map((f) => {
      if (typeof f === "string") return f;
      if (f && typeof f === "object" && "name" in f && typeof (f as { name: unknown }).name === "string") {
        return (f as { name: string }).name;
      }
      return null;
    })
    .filter((name): name is string => !!name);

  return {
    id: row.id,
    type: row.type,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    saturatedFat: row.saturated_fat,
    sodium: row.sodium,
    fiber: row.fiber,
    addedSugars: row.added_sugars,
    imageUrl: row.image_url ?? undefined,
    foods: foodNames,
    time: formatTime(row.logged_at),
  };
}

export function useMeal(id: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["meals", "byId", id, user?.id] as const,
    enabled: !!user && !!id,
    queryFn: async (): Promise<MealCardData | null> => {
      if (!user || !id) return null;
      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        console.error("[useMeal] supabase error:", error);
        throw error;
      }
      return data ? rowToMealCard(data) : null;
    },
  });
}

export function useMealsToday() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: mealsTodayQueryKey(user?.id),
    enabled: !!user,
    staleTime: 10_000,
    queryFn: async (): Promise<MealCardData[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .gte("logged_at", startOfTodayIso())
        .order("logged_at", { ascending: false });
      if (error) {
        console.error("[useMealsToday] supabase error:", error);
        throw error;
      }
      return (data ?? []).map(rowToMealCard);
    },
  });

  return {
    meals: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

export type AddMealInput = Omit<MealInsert, "user_id" | "id" | "created_at" | "logged_at"> & {
  logged_at?: string;
};

export function useAddMeal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddMealInput): Promise<MealRow> => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("meals")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: mealsTodayQueryKey(user.id) });
      }
    },
  });
}
