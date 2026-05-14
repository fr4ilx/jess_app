import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FadeIn } from "@/components/onboarding/FadeIn";
import { PrimaryCta } from "@/components/onboarding/PrimaryCta";
import { useOnboardingStore } from "@/store/onboarding";
import { useSaveOnboardingStep } from "@/hooks/useSaveOnboardingStep";

type Unit = "kg" | "lb";

const kgFromLb = (lb: number) => lb * 0.45359237;
const lbFromKg = (kg: number) => kg / 0.45359237;

export default function PersonalWeight() {
  const navigate = useNavigate();
  const { weight_kg, setField } = useOnboardingStore();
  const { save, isPending } = useSaveOnboardingStep();
  const [unit, setUnit] = useState<Unit>("kg");

  const lbValue = weight_kg != null ? Math.round(lbFromKg(weight_kg) * 10) / 10 : "";
  const canContinue = weight_kg != null && weight_kg >= 25 && weight_kg <= 400;

  const handleContinue = async () => {
    if (!canContinue) return;
    await save();
    navigate("/onboarding/activity");
  };

  const handleKg = (s: string) => {
    const n = Number(s);
    setField("weight_kg", Number.isFinite(n) && n > 0 ? n : null);
  };
  const handleLb = (s: string) => {
    const n = Number(s);
    setField("weight_kg", Number.isFinite(n) && n > 0 ? Math.round(kgFromLb(n) * 10) / 10 : null);
  };

  const inputClass =
    "w-full px-4 py-4 rounded-2xl bg-secondary text-base text-foreground border-0 focus:ring-2 focus:ring-primary outline-none pr-14";

  return (
    <div className="flex-1 px-5 pt-6 pb-8">
      <FadeIn>
        <h1 className="text-2xl font-bold font-display text-foreground leading-snug">
          What's your weight?
        </h1>
        <p className="text-base text-muted-foreground mt-2">
          Don't worry — this stays private. We use it to tune your daily targets.
        </p>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="weight-input" className="text-sm text-muted-foreground">
              Your weight
            </label>
            <button
              type="button"
              onClick={() => setUnit(unit === "kg" ? "lb" : "kg")}
              className="text-sm text-primary font-medium"
            >
              Switch to {unit === "kg" ? "lb" : "kg"}
            </button>
          </div>

          <div className="relative">
            <input
              id="weight-input"
              type="number"
              inputMode="decimal"
              step="0.1"
              min={unit === "kg" ? 25 : 55}
              max={unit === "kg" ? 400 : 880}
              autoFocus
              value={unit === "kg" ? weight_kg ?? "" : lbValue}
              onChange={(e) => (unit === "kg" ? handleKg(e.target.value) : handleLb(e.target.value))}
              placeholder={unit === "kg" ? "e.g. 80" : "e.g. 175"}
              className={inputClass}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground pointer-events-none">
              {unit}
            </span>
          </div>
        </div>

        <div className="mt-8">
          <PrimaryCta onClick={handleContinue} disabled={!canContinue} isPending={isPending}>
            Continue
            <ArrowRight className="w-4 h-4" />
          </PrimaryCta>
        </div>
      </FadeIn>
    </div>
  );
}
