import { Leaf, Pill } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FadeIn } from "@/components/onboarding/FadeIn";
import { CardButton } from "@/components/onboarding/CardButton";
import { useOnboardingStore } from "@/store/onboarding";
import { useSaveOnboardingStep } from "@/hooks/useSaveOnboardingStep";

export default function Glp1Question() {
  const navigate = useNavigate();
  const { glp1, setGlp1Field } = useOnboardingStore();
  const { save } = useSaveOnboardingStep();

  const handleYes = async () => {
    setGlp1Field("onMedication", true);
    await save();
    navigate("/onboarding/glp1-details");
  };

  const handleNo = async () => {
    setGlp1Field("onMedication", false);
    setGlp1Field("medication", null);
    setGlp1Field("dose_mg", null);
    setGlp1Field("startedAt", null);
    setGlp1Field("targetWeightKg", null);
    await save();
    navigate("/onboarding/targets");
  };

  return (
    <div className="flex-1 px-5 pt-4 pb-8">
      <FadeIn>
        <h1 className="text-3xl font-bold font-display text-foreground leading-tight">
          Are you on a GLP-1 medication?
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Like Ozempic, Wegovy, Mounjaro, or Zepbound. This shapes your nutrition guidance.
        </p>

        <div className="mt-6 space-y-3">
          <CardButton
            Icon={Pill}
            iconTint="bg-primary/10"
            iconColor="text-primary"
            title="Yes, I'm on a GLP-1"
            subtitle="We'll tune your protein and fiber targets"
            selected={glp1.onMedication === true}
            onClick={handleYes}
          />
          <CardButton
            Icon={Leaf}
            iconTint="bg-muted"
            iconColor="text-muted-foreground"
            title="No, not currently"
            subtitle="Standard cardiometabolic targets"
            selected={glp1.onMedication === false}
            onClick={handleNo}
          />
        </div>
      </FadeIn>
    </div>
  );
}
