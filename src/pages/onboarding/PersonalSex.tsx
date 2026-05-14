import { ArrowRight, CircleUser, User, UserCircle2, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FadeIn } from "@/components/onboarding/FadeIn";
import { CardButton } from "@/components/onboarding/CardButton";
import { PrimaryCta } from "@/components/onboarding/PrimaryCta";
import { useOnboardingStore } from "@/store/onboarding";
import { useSaveOnboardingStep } from "@/hooks/useSaveOnboardingStep";
import type { Sex } from "@/lib/calculateTargets";

type SexOption = {
  value: Sex;
  title: string;
  Icon: typeof User;
  iconTint: string;
  iconColor: string;
};

const options: SexOption[] = [
  {
    value: "female",
    title: "Female",
    Icon: UserRound,
    iconTint: "bg-macro-fat/15",
    iconColor: "text-macro-fat",
  },
  {
    value: "male",
    title: "Male",
    Icon: User,
    iconTint: "bg-macro-protein/15",
    iconColor: "text-macro-protein",
  },
  {
    value: "other",
    title: "Other",
    Icon: UserCircle2,
    iconTint: "bg-accent/15",
    iconColor: "text-accent",
  },
  {
    value: "prefer-not",
    title: "Prefer not to say",
    Icon: CircleUser,
    iconTint: "bg-muted",
    iconColor: "text-muted-foreground",
  },
];

export default function PersonalSex() {
  const navigate = useNavigate();
  const { sex, setField } = useOnboardingStore();
  const { save, isPending } = useSaveOnboardingStep();

  const canContinue = sex != null;

  const handleContinue = async () => {
    if (!canContinue) return;
    await save();
    navigate("/onboarding/height");
  };

  return (
    <div className="flex-1 px-5 pt-6 pb-8">
      <FadeIn>
        <h1 className="text-2xl font-bold font-display text-foreground leading-snug">
          Sex at birth
        </h1>
        <p className="text-base text-muted-foreground mt-2">
          This helps us estimate your daily energy needs more accurately.
        </p>

        <div className="mt-8 space-y-3">
          {options.map((opt) => (
            <CardButton
              key={opt.value}
              Icon={opt.Icon}
              iconTint={opt.iconTint}
              iconColor={opt.iconColor}
              title={opt.title}
              selected={sex === opt.value}
              onClick={() => setField("sex", opt.value)}
            />
          ))}
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
