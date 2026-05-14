import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FadeIn } from "@/components/onboarding/FadeIn";
import { PrimaryCta } from "@/components/onboarding/PrimaryCta";
import { useOnboardingStore } from "@/store/onboarding";
import { useSaveOnboardingStep } from "@/hooks/useSaveOnboardingStep";

export default function PersonalName() {
  const navigate = useNavigate();
  const { name, setField } = useOnboardingStore();
  const { save, isPending } = useSaveOnboardingStep();

  const canContinue = name.trim().length > 0;

  const handleContinue = async () => {
    if (!canContinue) return;
    await save();
    navigate("/onboarding/age");
  };

  return (
    <div className="flex-1 px-5 pt-6 pb-8">
      <FadeIn>
        <h1 className="text-2xl font-bold font-display text-foreground leading-snug">
          What should we call you?
        </h1>
        <p className="text-base text-muted-foreground mt-2">
          Panda will use this when greeting you.
        </p>

        <div className="mt-8">
          <label htmlFor="name" className="text-sm text-muted-foreground mb-2 block">
            Your name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="given-name"
            autoFocus
            value={name}
            onChange={(e) => setField("name", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canContinue) handleContinue();
            }}
            placeholder="Type your name"
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
