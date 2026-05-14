// Mifflin-St Jeor BMR + activity multiplier + goal adjustment.
// Hardcoded cardio nutrient defaults (AHA): sat fat 25g, sodium 2300mg, fiber 38g, added sugars 34g.
// Protein 1.6g/kg, fat ~27% of calories, carbs fill remainder.

export type Sex = "female" | "male" | "other" | "prefer-not";
export type Activity = "sedentary" | "light" | "moderate" | "high";
export type Goal = "lose-safe" | "maintain" | "maintain-after-loss" | "heart-focus";

export type DailyTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  satFat: number;
  sodium: number;
  fiber: number;
  addedSugars: number;
};

export type CalculateInput = {
  age: number;
  sex: Sex;
  height_cm: number;
  weight_kg: number;
  activity: Activity;
  goal: Goal;
};

const activityMultipliers: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
};

const goalAdjustments: Record<Goal, number> = {
  "lose-safe": -500,
  maintain: 0,
  "maintain-after-loss": 0,
  "heart-focus": 0,
};

// Sex offset in Mifflin-St Jeor: male +5, female -161.
// For non-binary / prefer-not we use the midpoint (-78).
const sexOffset: Record<Sex, number> = {
  male: 5,
  female: -161,
  other: -78,
  "prefer-not": -78,
};

export function calculateTargets(input: CalculateInput): DailyTargets {
  const { age, sex, height_cm, weight_kg, activity, goal } = input;

  const bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + sexOffset[sex];
  const tdee = bmr * activityMultipliers[activity];
  const calories = Math.max(1200, Math.round(tdee + goalAdjustments[goal]));

  const protein = Math.round(weight_kg * 1.6);
  const fatPct = 0.27;
  const fat = Math.round((calories * fatPct) / 9);
  const carbCalories = calories - protein * 4 - fat * 9;
  const carbs = Math.max(0, Math.round(carbCalories / 4));

  return {
    calories,
    protein,
    carbs,
    fat,
    satFat: 25,
    sodium: 2300,
    fiber: 38,
    addedSugars: 34,
  };
}
