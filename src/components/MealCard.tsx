import { Camera, Utensils } from "lucide-react";

export interface MealCardData {
  id: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  saturatedFat: number;
  sodium: number;
  fiber: number;
  addedSugars: number;
  imageUrl?: string;
  foods: string[];
  time: string;
}

const typeLabels: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

const typeEmojis: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍎",
};

interface MealCardProps {
  meal: MealCardData;
  onClick?: () => void;
}

export function MealCard({ meal, onClick }: MealCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full glass-card rounded-xl p-3 flex items-center gap-3 text-left hover:shadow-md transition-shadow active:scale-[0.98] transition-transform"
    >
      <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
        {meal.imageUrl ? (
          <img src={meal.imageUrl} alt={typeLabels[meal.type]} className="w-full h-full object-cover" />
        ) : (
          <Utensils className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{typeEmojis[meal.type]}</span>
          <span className="text-sm font-semibold font-display text-foreground">{typeLabels[meal.type]}</span>
          <span className="text-xs text-muted-foreground ml-auto">{meal.time}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {meal.foods.join(", ")}
        </p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs font-medium text-macro-calories">{meal.calories} cal</span>
          <span className="text-xs text-macro-protein">P {meal.protein}g</span>
          <span className="text-xs text-macro-carbs">C {meal.carbs}g</span>
          <span className="text-xs text-macro-fat">F {meal.fat}g</span>
        </div>
      </div>
    </button>
  );
}
