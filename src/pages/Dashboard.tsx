import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MacroRing } from "@/components/MacroRing";
import { MacroBar } from "@/components/MacroBar";
import { MealCard } from "@/components/MealCard";
import { sampleTargets, sampleProfile, getDailyTotals } from "@/lib/nutrition";
import { useMealsToday } from "@/hooks/useMealsToday";

export default function Dashboard() {
  const navigate = useNavigate();
  const { meals } = useMealsToday();
  const totals = getDailyTotals(meals);
  const targets = sampleTargets;

  const caloriesLeft = Math.max(targets.calories - totals.calories, 0);

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-muted-foreground">Good day,</p>
          <h1 className="text-2xl font-bold font-display text-foreground">{sampleProfile.name} 👋</h1>
        </motion.div>
      </div>

      {/* Calorie summary card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-5 rounded-2xl bg-primary p-5 text-primary-foreground"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-80">Calories remaining</p>
            <p className="text-3xl font-bold font-display">{caloriesLeft}</p>
          </div>
          <MacroRing
            value={totals.calories}
            target={targets.calories}
            color="calories"
            label=""
            unit=" cal"
            size={70}
            strokeWidth={5}
          />
        </div>
        <div className="flex items-center gap-2 text-xs opacity-70">
          <span>{targets.calories} goal</span>
          <span>−</span>
          <span>{totals.calories} eaten</span>
          <span>=</span>
          <span>{caloriesLeft} left</span>
        </div>
      </motion.div>

      {/* Primary Macros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-around px-5 py-6"
      >
        <MacroRing value={totals.protein} target={targets.protein} color="protein" label="Protein" />
        <MacroRing value={totals.carbs} target={targets.carbs} color="carbs" label="Carbs" />
        <MacroRing value={totals.fat} target={targets.fat} color="fat" label="Fat" />
      </motion.div>

      {/* Additional Nutrients */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="px-5 pb-4"
      >
        <div className="glass-card rounded-2xl p-4 space-y-2">
          <h3 className="text-xs font-semibold font-display text-muted-foreground uppercase tracking-wide mb-2">Additional Nutrients</h3>
          <MacroBar value={totals.saturatedFat} target={targets.saturatedFat} color="saturated-fat" label="Sat. Fat" />
          <MacroBar value={totals.sodium} target={targets.sodium} color="sodium" label="Sodium" unit=" mg" />
          <MacroBar value={totals.fiber} target={targets.fiber} color="fiber" label="Fiber" />
          <MacroBar value={totals.addedSugars} target={targets.addedSugars} color="added-sugars" label="Added Sugars" />
        </div>
      </motion.div>

      {/* Meals */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold font-display text-foreground">Today's Meals</h2>
          <button
            onClick={() => navigate("/add-meal")}
            className="flex items-center gap-1 text-sm font-medium text-primary"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onClick={() => navigate(`/meal/${meal.id}`)}
            />
          ))}
        </motion.div>

        {meals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No meals logged yet</p>
            <p className="text-xs text-muted-foreground mt-1">Tap "Add" to log your first meal</p>
          </div>
        )}
      </div>
    </div>
  );
}
