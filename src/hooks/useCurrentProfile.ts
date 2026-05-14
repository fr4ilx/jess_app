import { useOnboardingStore, type OnboardingState } from "@/store/onboarding";
import { calculateTargets, type DailyTargets } from "@/lib/calculateTargets";

export type CurrentProfile = OnboardingState & {
  dailyTargets: DailyTargets | null;
  /** True when all required onboarding inputs are present (the user has completed at least the About-you + Activity/Goal sections). */
  hasProfileData: boolean;
};

/**
 * Reads the current user's profile + computed daily targets.
 *
 * Source of truth is Zustand (localStorage-persisted). Per-step writes to
 * Supabase happen via useSaveOnboardingStep — Supabase is the durable store,
 * Zustand is the in-flight working copy. For this prototype phase we read
 * exclusively from Zustand; cross-device hydration from Supabase is a follow-up.
 */
export function useCurrentProfile(): CurrentProfile {
  const state = useOnboardingStore();

  const hasProfileData =
    state.age != null &&
    state.sex != null &&
    state.height_cm != null &&
    state.weight_kg != null &&
    state.activity != null &&
    state.goal != null;

  // Use stored targets if present (e.g. user revisited TargetsReveal which sets them),
  // otherwise compute on the fly from the inputs.
  let dailyTargets: DailyTargets | null = state.dailyTargets;
  if (!dailyTargets && hasProfileData) {
    dailyTargets = calculateTargets({
      age: state.age!,
      sex: state.sex!,
      height_cm: state.height_cm!,
      weight_kg: state.weight_kg!,
      activity: state.activity!,
      goal: state.goal!,
    });
  }

  return {
    ...state,
    dailyTargets,
    hasProfileData,
  };
}
