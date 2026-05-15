import { useOnboardingStore, type OnboardingState } from "@/store/onboarding";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { fromProfileRow } from "@/lib/onboarding/fromProfileRow";
import { calculateTargets, type DailyTargets } from "@/lib/calculateTargets";

export type CurrentProfile = OnboardingState & {
  dailyTargets: DailyTargets | null;
  /** True when all required onboarding inputs are present (the user has completed at least the About-you + Activity/Goal sections). */
  hasProfileData: boolean;
};

/**
 * Reads the current user's profile + computed daily targets.
 *
 * Source of truth:
 * - **Authenticated** → Supabase `profiles` row (durable). The Zustand store
 *   provides the `name` field (which isn't persisted server-side) and a
 *   fallback for fields the server row may not yet have if onboarding was
 *   interrupted mid-flow.
 * - **Sandbox (no session)** → Zustand store (localStorage-persisted).
 *
 * Targets are computed on the fly from the resolved inputs whenever the
 * required fields are present.
 */
export function useCurrentProfile(): CurrentProfile {
  const { user } = useAuth();
  const local = useOnboardingStore();
  const { data: profileRow } = useProfile();

  // Prefer server fields when available; fall back to local store per-field.
  const server = profileRow ? fromProfileRow(profileRow) : null;
  const pick = <K extends keyof OnboardingState>(key: K): OnboardingState[K] => {
    if (server && server[key] != null) return server[key];
    return local[key];
  };

  const resolved: OnboardingState = user && server
    ? {
        // Name lives only in the local store (not persisted to profiles).
        name: local.name,
        age: pick("age"),
        sex: pick("sex"),
        height_cm: pick("height_cm"),
        weight_kg: pick("weight_kg"),
        activity: pick("activity"),
        goal: pick("goal"),
        glp1: {
          onMedication: server.glp1.onMedication ?? local.glp1.onMedication,
          medication: server.glp1.medication ?? local.glp1.medication,
          dose_mg: server.glp1.dose_mg ?? local.glp1.dose_mg,
          startedAt: server.glp1.startedAt ?? local.glp1.startedAt,
          targetWeightKg: local.glp1.targetWeightKg,
        },
        dailyTargets: local.dailyTargets,
      }
    : local;

  const hasProfileData =
    resolved.age != null &&
    resolved.sex != null &&
    resolved.height_cm != null &&
    resolved.weight_kg != null &&
    resolved.activity != null &&
    resolved.goal != null;

  // Use stored targets if present (e.g. user revisited TargetsReveal which sets them),
  // otherwise compute on the fly from the inputs.
  let dailyTargets: DailyTargets | null = resolved.dailyTargets;
  if (!dailyTargets && hasProfileData) {
    dailyTargets = calculateTargets({
      age: resolved.age!,
      sex: resolved.sex!,
      height_cm: resolved.height_cm!,
      weight_kg: resolved.weight_kg!,
      activity: resolved.activity!,
      goal: resolved.goal!,
    });
  }

  return {
    ...resolved,
    dailyTargets,
    hasProfileData,
  };
}
