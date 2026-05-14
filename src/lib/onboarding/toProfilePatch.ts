// Maps the Zustand onboarding state to a Supabase `profiles` UPDATE patch.
// Called on every step's Continue (incremental write) and again at the end of
// the flow with { final: true } to set the completion timestamps.
//
// Schema mismatches (documented):
//   • spec's sex 'other' maps to DB 'intersex'
//   • spec's sex 'prefer-not' maps to DB 'prefer_not_to_say'
//   • spec's goal has 4 values; DB has 3. We collapse:
//       'lose-safe' → 'lose'
//       'maintain' / 'maintain-after-loss' / 'heart-focus' → 'maintain'
//     The full 4-way intent is lost on the DB side for now — extend the enum later.
//   • spec collects 'age', DB stores 'date_of_birth'. We approximate DOB = today − age years.

import type { TablesUpdate } from "@/integrations/supabase/types";
import type { OnboardingState } from "@/store/onboarding";

type ProfileUpdate = TablesUpdate<"profiles">;

type Options = {
  /**
   * When true, also writes the completion timestamps
   * (cardiac_step_completed_at, goals_step_completed_at, onboarding_completed_at).
   * Set this on the FINAL save in PandaWelcome only.
   */
  final?: boolean;
};

const sexMap = {
  female: "female",
  male: "male",
  other: "intersex",
  "prefer-not": "prefer_not_to_say",
} as const satisfies Record<NonNullable<OnboardingState["sex"]>, ProfileUpdate["sex_at_birth"]>;

const goalMap = {
  "lose-safe": "lose",
  maintain: "maintain",
  "maintain-after-loss": "maintain",
  "heart-focus": "maintain",
} as const satisfies Record<NonNullable<OnboardingState["goal"]>, ProfileUpdate["goal"]>;

function approxDateOfBirth(age: number): string {
  const now = new Date();
  return `${now.getFullYear() - age}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function toProfilePatch(state: OnboardingState, options: Options = {}): ProfileUpdate {
  const patch: ProfileUpdate = {};

  if (state.age != null) patch.date_of_birth = approxDateOfBirth(state.age);
  if (state.sex) patch.sex_at_birth = sexMap[state.sex];
  if (state.height_cm != null) patch.height_cm = state.height_cm;
  if (state.weight_kg != null) patch.weight_kg = state.weight_kg;
  if (state.activity) patch.activity_level = state.activity;
  if (state.goal) patch.goal = goalMap[state.goal];

  // GLP-1 question only counted as answered once the user has actually answered it.
  if (state.glp1.onMedication !== null) {
    patch.glp1_question_answered = true;
    patch.glp1_medication = state.glp1.onMedication
      ? state.glp1.medication ?? "semaglutide"
      : null;
  }
  if (state.glp1.medication) patch.glp1_brand = state.glp1.medication;
  if (state.glp1.dose_mg != null) patch.glp1_dose_mg = state.glp1.dose_mg;
  if (state.glp1.startedAt) patch.glp1_start_date = state.glp1.startedAt;

  if (options.final) {
    const now = new Date().toISOString();
    patch.cardiac_step_completed_at = now;
    patch.goals_step_completed_at = now;
    patch.onboarding_completed_at = now;
  }

  return patch;
}
