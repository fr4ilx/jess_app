import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MacroRing } from "@/components/MacroRing";
import { MacroBar } from "@/components/MacroBar";
import { PandaLogo } from "@/components/onboarding/PandaLogo";
import { PrimaryCta } from "@/components/onboarding/PrimaryCta";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";

export default function Today() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();

  // No onboarding data yet (e.g. user cleared localStorage and visited /today directly).
  if (!profile.hasProfileData || !profile.dailyTargets) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 text-center">
        <PandaLogo size={96} className="mb-5" />
        <h1 className="text-2xl font-bold font-display text-foreground">Let's get to know you</h1>
        <p className="text-base text-muted-foreground mt-2 max-w-xs">
          Tell Panda a bit about yourself so we can personalize your daily targets.
        </p>
        <div className="mt-8 w-full max-w-xs">
          <PrimaryCta onClick={() => navigate("/welcome")}>Begin onboarding</PrimaryCta>
        </div>
      </div>
    );
  }

  const targets = profile.dailyTargets;
  const eaten = 0; // No meal tracking yet.
  const caloriesLeft = Math.max(targets.calories - eaten, 0);
  const greetingName = profile.name.trim() || "there";

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-muted-foreground">Good day,</p>
          <h1 className="text-2xl font-bold font-display text-foreground">{greetingName} 👋</h1>
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
            value={eaten}
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
          <span>{eaten} eaten</span>
          <span>=</span>
          <span>{caloriesLeft} left</span>
        </div>
      </motion.div>

      {/* Primary macros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-around px-5 py-6"
      >
        <MacroRing value={0} target={targets.protein} color="protein" label="Protein" />
        <MacroRing value={0} target={targets.carbs} color="carbs" label="Carbs" />
        <MacroRing value={0} target={targets.fat} color="fat" label="Fat" />
      </motion.div>

      {/* Cardio nutrients */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="px-5 pb-4"
      >
        <div className="glass-card rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xs font-semibold font-display text-muted-foreground uppercase tracking-wide">
              Cardio nutrients
            </h3>
            <Sparkles className="w-3 h-3 text-primary" aria-hidden="true" />
          </div>
          <MacroBar value={0} target={targets.satFat} color="saturated-fat" label="Sat. Fat" />
          <MacroBar value={0} target={targets.sodium} color="sodium" label="Sodium" unit=" mg" />
          <MacroBar value={0} target={targets.fiber} color="fiber" label="Fiber" />
          <MacroBar value={0} target={targets.addedSugars} color="added-sugars" label="Added Sugars" />
        </div>
      </motion.div>

      {/* Today's meals */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold font-display text-foreground">Today's meals</h2>
          <button
            onClick={() => navigate("/add-meal")}
            className="flex items-center gap-1 text-sm font-medium text-primary"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No meals logged yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tap "Add" to log your first meal
          </p>
        </div>
      </div>
    </div>
  );
}
