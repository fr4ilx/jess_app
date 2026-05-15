// Inverse of toProfilePatch: maps a Supabase profiles row back to the
// OnboardingState shape so the app can read from the durable Supabase row
// once the user has signed in and completed onboarding.
//
// Lossy spots mirror toProfilePatch:
//   • DB sex 'intersex' → spec 'other'
//   • DB sex 'prefer_not_to_say' → spec 'prefer-not'
//   • DB goal only has 3 values; we pick 'lose-safe' for 'lose' and 'maintain'
//     for 'maintain' / 'gain'. The original 4-way intent ('heart-focus',
//     'maintain-after-loss') isn't recoverable from the DB.
//   • date_of_birth → age via (today.getFullYear() - dob.getFullYear()).

import type { Tables } from "@/integrations/supabase/types";
import type { OnboardingState } from "@/store/onboarding";

type ProfileRow = Tables<"profiles">;

const sexMap: Record<NonNullable<ProfileRow["sex_at_birth"]>, OnboardingState["sex"]> = {
  female: "female",
  male: "male",
  intersex: "other",
  prefer_not_to_say: "prefer-not",
};

const goalMap: Record<NonNullable<ProfileRow["goal"]>, OnboardingState["goal"]> = {
  lose: "lose-safe",
  maintain: "maintain",
  gain: "maintain",
};

function ageFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 ? age : null;
}

export function fromProfileRow(row: ProfileRow): OnboardingState {
  return {
    name: "",
    age: ageFromDob(row.date_of_birth),
    sex: row.sex_at_birth ? sexMap[row.sex_at_birth] : null,
    height_cm: row.height_cm ?? null,
    weight_kg: row.weight_kg != null ? Number(row.weight_kg) : null,
    activity: row.activity_level ?? null,
    goal: row.goal ? goalMap[row.goal] : null,
    glp1: {
      onMedication: row.glp1_question_answered ? row.glp1_medication != null : null,
      medication: (row.glp1_brand as OnboardingState["glp1"]["medication"]) ?? null,
      dose_mg: row.glp1_dose_mg != null ? Number(row.glp1_dose_mg) : null,
      startedAt: row.glp1_start_date ?? null,
      targetWeightKg: null,
    },
    dailyTargets: null,
  };
}
