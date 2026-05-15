import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateTargets, type Activity, type DailyTargets, type Goal, type Sex } from "@/lib/calculateTargets";

export type Glp1Medication = "ozempic" | "wegovy" | "mounjaro" | "zepbound" | "other";

export type Glp1State = {
  onMedication: boolean | null;
  medication: Glp1Medication | null;
  dose_mg: number | null;
  startedAt: string | null; // ISO date
  targetWeightKg: number | null;
};

export type OnboardingState = {
  name: string;
  age: number | null;
  sex: Sex | null;
  height_cm: number | null;
  weight_kg: number | null;
  activity: Activity | null;
  goal: Goal | null;
  glp1: Glp1State;
  dailyTargets: DailyTargets | null;
};

type OnboardingActions = {
  setField: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void;
  setGlp1Field: <K extends keyof Glp1State>(key: K, value: Glp1State[K]) => void;
  calculateAndSetTargets: () => void;
  reset: () => void;
};

const initialState: OnboardingState = {
  name: "",
  age: null,
  sex: null,
  height_cm: null,
  weight_kg: null,
  activity: null,
  goal: null,
  glp1: {
    onMedication: null,
    medication: null,
    dose_mg: null,
    startedAt: null,
    targetWeightKg: null,
  },
  dailyTargets: null,
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setField: (key, value) =>
        set((state) => {
          const patch: Partial<OnboardingState> = { [key]: value };
          // Invalidate cached targets whenever a field that feeds calculateTargets changes.
          // Otherwise edits in Profile leave TargetsReveal / useCurrentProfile reading
          // stale numbers computed from the previous inputs.
          const targetKeys = ["age", "sex", "height_cm", "weight_kg", "activity", "goal"] as const;
          if ((targetKeys as readonly string[]).includes(key) && state.dailyTargets) {
            patch.dailyTargets = null;
          }
          return patch;
        }),

      setGlp1Field: (key, value) =>
        set((state) => ({ glp1: { ...state.glp1, [key]: value } })),

      calculateAndSetTargets: () => {
        const { age, sex, height_cm, weight_kg, activity, goal } = get();
        if (
          age == null ||
          sex == null ||
          height_cm == null ||
          weight_kg == null ||
          activity == null ||
          goal == null
        ) {
          return;
        }
        const targets = calculateTargets({ age, sex, height_cm, weight_kg, activity, goal });
        set({ dailyTargets: targets });
      },

      reset: () => set(initialState),
    }),
    {
      name: "onboarding-v1",
    }
  )
);
