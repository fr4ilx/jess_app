import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FadeIn } from "@/components/onboarding/FadeIn";
import { PrimaryCta } from "@/components/onboarding/PrimaryCta";
import { useOnboardingStore } from "@/store/onboarding";
import type { DailyTargets } from "@/lib/calculateTargets";

type TargetCard = {
  key: keyof DailyTargets;
  label: string;
  unit: string;
  cardio?: boolean;
};

const targetCards: TargetCard[] = [
  { key: "calories", label: "Calories", unit: "" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
  { key: "satFat", label: "Sat Fat", unit: "g", cardio: true },
  { key: "sodium", label: "Sodium", unit: "mg", cardio: true },
  { key: "fiber", label: "Fiber", unit: "g", cardio: true },
  { key: "addedSugars", label: "Added Sugars", unit: "g", cardio: true },
];

export default function TargetsReveal() {
  const navigate = useNavigate();
  const { dailyTargets, calculateAndSetTargets } = useOnboardingStore();

  // Always recompute on visit so stale cached values can't linger after edits.
  useEffect(() => {
    calculateAndSetTargets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 px-5 pt-4 pb-8">
      <FadeIn>
        <h1 className="text-3xl font-bold font-display text-foreground leading-tight">
          Your daily targets
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Calculated from what you shared. You can adjust these anytime in profile.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {targetCards.map((card) => (
            <div
              key={card.key}
              className="glass-card rounded-2xl p-4 relative"
            >
              {card.cardio && (
                <span className="absolute top-2 right-3 text-[10px] font-semibold text-primary uppercase tracking-wide">
                  cardio
                </span>
              )}
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {card.label}
              </p>
              <p className="mt-1">
                <span className="text-2xl font-bold font-display text-foreground">
                  {dailyTargets?.[card.key] ?? "—"}
                </span>
                {card.unit && (
                  <span className="text-sm text-muted-foreground ml-1">{card.unit}</span>
                )}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <PrimaryCta onClick={() => navigate("/onboarding/welcome-panda")}>
            Looks good
          </PrimaryCta>
        </div>
      </FadeIn>
    </div>
  );
}
