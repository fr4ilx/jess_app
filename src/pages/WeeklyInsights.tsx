import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MacroBar } from "@/components/MacroBar";
import { sampleTargets } from "@/lib/nutrition";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";

interface InsightItem {
  icon: typeof TrendingUp;
  text: string;
  type: "positive" | "negative" | "neutral";
}

const weeklyAvg = {
  calories: 2180,
  protein: 118,
  carbs: 245,
  fat: 72,
  saturatedFat: 22,
  sodium: 1950,
  fiber: 18,
  addedSugars: 28,
};

const insights: InsightItem[] = [
  { icon: TrendingDown, text: "You averaged 220 fewer calories than your target — great for your goal!", type: "positive" },
  { icon: TrendingDown, text: "Protein goals were met on only 3 of 7 days.", type: "negative" },
  { icon: TrendingUp, text: "Lunch contained the highest calories most days this week.", type: "neutral" },
];

const recommendation = "Try adding a high-protein snack in the morning, like Greek yogurt or a protein shake, to hit your protein target more consistently.";

const iconColorMap = {
  positive: "text-primary",
  negative: "text-destructive",
  neutral: "text-accent",
};

const bgColorMap = {
  positive: "bg-primary/10",
  negative: "bg-destructive/10",
  neutral: "bg-accent/10",
};

export default function WeeklyInsights() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  // Read user's computed daily targets; fall back to the sample defaults if
  // they haven't completed onboarding yet (e.g. cleared localStorage).
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

  return (
    <div className="min-h-screen bottom-nav-safe">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="p-1 text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold font-display text-foreground">Weekly Insights</h1>
      </div>

      {/* Weekly averages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-5 glass-card rounded-2xl p-5 mb-5"
      >
        <h2 className="text-base font-semibold font-display text-foreground mb-1">Weekly Averages</h2>
        <p className="text-xs text-muted-foreground mb-4">Mar 18 – Mar 24</p>
        <div className="space-y-3">
          <MacroBar value={weeklyAvg.calories} target={targets.calories} color="calories" label="Calories" unit=" cal" />
          <MacroBar value={weeklyAvg.protein} target={targets.protein} color="protein" label="Protein" />
          <MacroBar value={weeklyAvg.carbs} target={targets.carbs} color="carbs" label="Carbs" />
          <MacroBar value={weeklyAvg.fat} target={targets.fat} color="fat" label="Fat" />
          <MacroBar value={weeklyAvg.saturatedFat} target={targets.saturatedFat} color="saturated-fat" label="Sat. Fat" />
          <MacroBar value={weeklyAvg.sodium} target={targets.sodium} color="sodium" label="Sodium" unit=" mg" />
          <MacroBar value={weeklyAvg.fiber} target={targets.fiber} color="fiber" label="Fiber" />
          <MacroBar value={weeklyAvg.addedSugars} target={targets.addedSugars} color="added-sugars" label="Added Sugars" />
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-5 mb-5"
      >
        <h2 className="text-base font-semibold font-display text-foreground mb-3">Behavior Insights</h2>
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const Icon = insight.icon;
            return (
              <div key={i} className="glass-card rounded-xl p-3.5 flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${bgColorMap[insight.type]} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${iconColorMap[insight.type]}`} />
                </div>
                <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-5 rounded-2xl bg-primary/5 border border-primary/20 p-5"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">💡</span>
          <h2 className="text-base font-semibold font-display text-foreground">This Week's Tip</h2>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">{recommendation}</p>
      </motion.div>
    </div>
  );
}
