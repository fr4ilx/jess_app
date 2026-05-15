import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { MacroBar } from "@/components/MacroBar";
import { sampleTargets } from "@/lib/nutrition";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { useMeal } from "@/hooks/useMealsToday";

const typeLabels: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export default function MealDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: meal, isLoading } = useMeal(id);
  const profile = useCurrentProfile();
  const t = profile.dailyTargets;
  const targets = {
    calories: t?.calories ?? sampleTargets.calories,
    protein: t?.protein ?? sampleTargets.protein,
    carbs: t?.carbs ?? sampleTargets.carbs,
    fat: t?.fat ?? sampleTargets.fat,
    saturatedFat: t?.satFat ?? sampleTargets.saturatedFat,
    sodium: t?.sodium ?? sampleTargets.sodium,
    fiber: t?.fiber ?? sampleTargets.fiber,
    addedSugars: t?.addedSugars ?? sampleTargets.addedSugars,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-muted-foreground">Meal not found</p>
        <button onClick={() => navigate(-1)} className="text-sm text-primary font-medium">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="p-1 text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold font-display text-foreground">{typeLabels[meal.type]}</h1>
        <span className="text-sm text-muted-foreground ml-auto">{meal.time}</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 space-y-4">
        {/* Image */}
        <div className="w-full h-48 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden">
          {meal.imageUrl ? (
            <img src={meal.imageUrl} alt={typeLabels[meal.type]} className="w-full h-full object-cover" />
          ) : (
            <p className="text-sm text-muted-foreground">📸 No photo</p>
          )}
        </div>

        {/* Foods */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold font-display text-foreground">Detected Foods</h2>
            <button className="text-primary text-xs font-medium flex items-center gap-1">
              <Pencil className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="space-y-2">
            {meal.foods.length === 0 ? (
              <p className="text-xs text-muted-foreground">No foods recorded.</p>
            ) : (
              meal.foods.map((food, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm text-foreground">{food}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Macros */}
        <div className="glass-card rounded-2xl p-4">
          <h2 className="text-sm font-semibold font-display text-foreground mb-3">Nutrition</h2>
          <div className="space-y-3">
            <MacroBar value={meal.calories} target={targets.calories} color="calories" label="Calories" unit=" cal" />
            <MacroBar value={meal.protein} target={targets.protein} color="protein" label="Protein" />
            <MacroBar value={meal.carbs} target={targets.carbs} color="carbs" label="Carbs" />
            <MacroBar value={meal.fat} target={targets.fat} color="fat" label="Fat" />
            <MacroBar value={meal.saturatedFat} target={targets.saturatedFat} color="saturated-fat" label="Sat. Fat" />
            <MacroBar value={meal.sodium} target={targets.sodium} color="sodium" label="Sodium" unit=" mg" />
            <MacroBar value={meal.fiber} target={targets.fiber} color="fiber" label="Fiber" />
            <MacroBar value={meal.addedSugars} target={targets.addedSugars} color="added-sugars" label="Added Sugars" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
