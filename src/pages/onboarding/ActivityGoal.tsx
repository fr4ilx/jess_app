import { ArrowRight, Heart, MoveRight, Scale, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FadeIn } from "@/components/onboarding/FadeIn";
import { PillButton } from "@/components/onboarding/PillButton";
import { CardButton } from "@/components/onboarding/CardButton";
import { PrimaryCta } from "@/components/onboarding/PrimaryCta";
import { useOnboardingStore } from "@/store/onboarding";
import { useSaveOnboardingStep } from "@/hooks/useSaveOnboardingStep";
import type { Activity, Goal } from "@/lib/calculateTargets";

const activities: { value: Activity; label: string }[] = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "high", label: "High" },
];

const goals: {
  value: Goal;
  title: string;
  subtitle: string;
  Icon: typeof Heart;
  iconTint: string;
  iconColor: string;
}[] = [
  {
    value: "lose-safe",
    title: "Lose weight safely",
    subtitle: "Slow, sustainable, muscle-preserving",
    Icon: MoveRight,
    iconTint: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    value: "maintain",
    title: "Maintain current weight",
    subtitle: "Stay where you are with steady energy",
    Icon: Scale,
    iconTint: "bg-accent/15",
    iconColor: "text-accent",
  },
  {
    value: "maintain-after-loss",
    title: "Maintain after weight loss",
    subtitle: "Hold your progress without rebound",
    Icon: ShieldCheck,
    iconTint: "bg-macro-fiber/15",
    iconColor: "text-macro-fiber",
  },
  {
    value: "heart-focus",
    title: "Heart health focus",
    subtitle: "Prioritize cardiovascular markers",
    Icon: Heart,
    iconTint: "bg-macro-fat/15",
    iconColor: "text-macro-fat",
  },
];

export default function ActivityGoal() {
  const navigate = useNavigate();
  const { activity, goal, setField } = useOnboardingStore();
  const { save, isPending } = useSaveOnboardingStep();

  const canContinue = activity != null && goal != null;

  const handleContinue = async () => {
    if (!canContinue) return;
    await save();
    navigate("/onboarding/glp1");
  };

  return (
    <div className="flex-1 px-5 pt-4 pb-8">
      <FadeIn>
        <h1 className="text-3xl font-bold font-display text-foreground leading-tight">
          What are you working toward?
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          We'll tune your targets to match.
        </p>

        <section className="mt-6">
          <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3">
            Activity Level
          </p>
          <div className="flex flex-wrap gap-2">
            {activities.map((a) => (
              <PillButton
                key={a.value}
                label={a.label}
                selected={activity === a.value}
                onClick={() => setField("activity", a.value)}
              />
            ))}
          </div>
        </section>

        <section className="mt-6">
          <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3">
            Goal
          </p>
          <div className="space-y-3">
            {goals.map((g) => (
              <CardButton
                key={g.value}
                Icon={g.Icon}
                iconTint={g.iconTint}
                iconColor={g.iconColor}
                title={g.title}
                subtitle={g.subtitle}
                selected={goal === g.value}
                onClick={() => setField("goal", g.value)}
              />
            ))}
          </div>
        </section>

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
