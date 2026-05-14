import { MealCardData } from "@/components/MealCard";

export interface UserProfile {
  name: string;
  age: number;
  sex: "male" | "female";
  height: number; // cm
  weight: number; // kg
  activityLevel: "sedentary" | "light" | "moderate" | "high";
  goal: "lose" | "maintain" | "gain";
  allowImageStorage: boolean;
  // Custom target overrides (optional — if set, override calculated defaults)
  customSaturatedFat?: number;
  customSodium?: number;
  customFiber?: number;
  customAddedSugars?: number;
}

export interface DailyTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  saturatedFat: number;
  sodium: number;   // mg
  fiber: number;    // g
  addedSugars: number; // g
}

export function calculateTargets(profile: UserProfile): DailyTargets {
  // Mifflin-St Jeor
  let bmr: number;
  if (profile.sex === "male") {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  }

  const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, high: 1.725 };
  let tdee = bmr * activityMultipliers[profile.activityLevel];

  if (profile.goal === "lose") tdee -= 500;
  if (profile.goal === "gain") tdee += 300;

  const calories = Math.round(tdee);
  const protein = Math.round(profile.weight * (profile.goal === "gain" ? 2.0 : 1.6));
  const fat = Math.round((calories * 0.25) / 9);
  const carbCalories = calories - protein * 4 - fat * 9;
  const carbs = Math.round(carbCalories / 4);

  const saturatedFat = profile.customSaturatedFat ?? Math.round(fat * 0.33);
  const sodium = profile.customSodium ?? 2300;
  const fiber = profile.customFiber ?? (profile.sex === "male" ? 38 : 25);
  const addedSugars = profile.customAddedSugars ?? Math.round(calories * 0.05 / 4);

  return { calories, protein, carbs, fat, saturatedFat, sodium, fiber, addedSugars };
}

// Sample data for demo
export const sampleProfile: UserProfile = {
  name: "Alex",
  age: 30,
  sex: "male",
  height: 178,
  weight: 80,
  activityLevel: "moderate",
  goal: "maintain",
  allowImageStorage: true,
};

export const sampleTargets = calculateTargets(sampleProfile);

export const sampleMeals: MealCardData[] = [];

export function getDailyTotals(meals: MealCardData[]) {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
      saturatedFat: acc.saturatedFat + m.saturatedFat,
      sodium: acc.sodium + m.sodium,
      fiber: acc.fiber + m.fiber,
      addedSugars: acc.addedSugars + m.addedSugars,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, saturatedFat: 0, sodium: 0, fiber: 0, addedSugars: 0 }
  );
}
