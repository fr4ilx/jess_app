import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FadeIn } from "@/components/onboarding/FadeIn";
import { PrimaryCta } from "@/components/onboarding/PrimaryCta";
import { useOnboardingStore } from "@/store/onboarding";
import { useSaveOnboardingStep } from "@/hooks/useSaveOnboardingStep";

type Unit = "cm" | "ftin";

const cmFromFeetInches = (feet: number, inches: number) => feet * 30.48 + inches * 2.54;
const feetInchesFromCm = (cm: number) => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  return { feet, inches };
};

export default function PersonalHeight() {
  const navigate = useNavigate();
  const { height_cm, setField } = useOnboardingStore();
  const { save, isPending } = useSaveOnboardingStep();
  const [unit, setUnit] = useState<Unit>("cm");

  const feetInches = height_cm != null ? feetInchesFromCm(height_cm) : { feet: 0, inches: 0 };
  const canContinue = height_cm != null && height_cm >= 80 && height_cm <= 250;

  const handleContinue = async () => {
    if (!canContinue) return;
    await save();
    navigate("/onboarding/weight");
  };

  const handleCm = (s: string) => {
    const n = Number(s);
    setField("height_cm", Number.isFinite(n) && n > 0 ? n : null);
  };
  const handleFt = (s: string) => {
    const f = Number(s);
    if (!Number.isFinite(f)) return;
    setField("height_cm", Math.round(cmFromFeetInches(f, feetInches.inches)));
  };
  const handleIn = (s: string) => {
    const i = Number(s);
    if (!Number.isFinite(i)) return;
    setField("height_cm", Math.round(cmFromFeetInches(feetInches.feet, i)));
  };

  const inputClass =
    "w-full px-4 py-4 rounded-2xl bg-secondary text-base text-foreground border-0 focus:ring-2 focus:ring-primary outline-none";

  return (
    <div className="flex-1 px-5 pt-6 pb-8">
      <FadeIn>
        <h1 className="text-2xl font-bold font-display text-foreground leading-snug">
          How tall are you?
        </h1>
        <p className="text-base text-muted-foreground mt-2">
          Your height helps us estimate your daily energy needs.
        </p>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="height-input" className="text-sm text-muted-foreground">
              Your height
            </label>
            <button
              type="button"
              onClick={() => setUnit(unit === "cm" ? "ftin" : "cm")}
              className="text-sm text-primary font-medium"
            >
              Switch to {unit === "cm" ? "ft / in" : "cm"}
            </button>
          </div>

          {unit === "cm" ? (
            <div className="relative">
              <input
                id="height-input"
                type="number"
                inputMode="numeric"
                min={80}
                max={250}
                autoFocus
                value={height_cm ?? ""}
                onChange={(e) => handleCm(e.target.value)}
                placeholder="e.g. 170"
                className={`${inputClass} pr-14`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground pointer-events-none">
                cm
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  id="height-ft"
                  type="number"
                  inputMode="numeric"
                  min={3}
                  max={8}
                  autoFocus
                  value={feetInches.feet || ""}
                  onChange={(e) => handleFt(e.target.value)}
                  placeholder="5"
                  className={`${inputClass} pr-12`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground pointer-events-none">
                  ft
                </span>
              </div>
              <div className="relative">
                <input
                  id="height-in"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={11}
                  value={feetInches.inches || ""}
                  onChange={(e) => handleIn(e.target.value)}
                  placeholder="7"
                  className={`${inputClass} pr-12`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground pointer-events-none">
                  in
                </span>
              </div>
            </div>
          )}
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
