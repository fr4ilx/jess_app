import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FadeIn } from "@/components/onboarding/FadeIn";
import { PrimaryCta } from "@/components/onboarding/PrimaryCta";
import { useOnboardingStore } from "@/store/onboarding";
import { useSaveOnboardingStep } from "@/hooks/useSaveOnboardingStep";

export default function PersonalAge() {
  const navigate = useNavigate();
  const { age, setField } = useOnboardingStore();
  const { save, isPending } = useSaveOnboardingStep();

  const canContinue = age != null && age > 0 && age <= 120;

  const handleContinue = async () => {
    if (!canContinue) return;
    await save();
    navigate("/onboarding/sex");
  };

  return (
    <div className="flex-1 px-5 pt-6 pb-8">
      <FadeIn>
        <h1 className="text-2xl font-bold font-display text-foreground leading-snug">
          How old are you?
        </h1>
        <p className="text-base text-muted-foreground mt-2">
          We use this to calculate your daily targets.
        </p>

        <div className="mt-8">
          <label htmlFor="age" className="text-sm text-muted-foreground mb-2 block">
            Your age
          </label>
          <input
            id="age"
            type="number"
            inputMode="numeric"
            min={1}
            max={120}
            autoFocus
            value={age ?? ""}
            onChange={(e) => {
              const n = Number(e.target.value);
              setField("age", Number.isFinite(n) && n > 0 ? n : null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canContinue) handleContinue();
            }}
            placeholder="e.g. 58"
            className="w-full px-4 py-4 rounded-2xl bg-secondary text-base text-foreground border-0 focus:ring-2 focus:ring-primary outline-none"
          />
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
