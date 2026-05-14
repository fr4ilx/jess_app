import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FadeIn } from "@/components/onboarding/FadeIn";
import { PillButton } from "@/components/onboarding/PillButton";
import { PrimaryCta } from "@/components/onboarding/PrimaryCta";
import { TextField } from "@/components/onboarding/TextField";
import { useOnboardingStore, type Glp1Medication } from "@/store/onboarding";
import { useSaveOnboardingStep } from "@/hooks/useSaveOnboardingStep";

const medications: { value: Glp1Medication; label: string }[] = [
  { value: "ozempic", label: "Ozempic" },
  { value: "wegovy", label: "Wegovy" },
  { value: "mounjaro", label: "Mounjaro" },
  { value: "zepbound", label: "Zepbound" },
  { value: "other", label: "Other" },
];

export default function Glp1Details() {
  const navigate = useNavigate();
  const { glp1, setGlp1Field } = useOnboardingStore();
  const { save, isPending } = useSaveOnboardingStep();

  const canContinue =
    glp1.medication != null &&
    glp1.dose_mg != null &&
    glp1.dose_mg > 0 &&
    !!glp1.startedAt;

  const handleContinue = async () => {
    if (!canContinue) return;
    await save();
    navigate("/onboarding/targets");
  };

  return (
    <div className="flex-1 px-5 pt-4 pb-8">
      <FadeIn>
        <h1 className="text-3xl font-bold font-display text-foreground leading-tight">
          Tell us about your medication.
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          This stays private. We use it to tune your protein and fiber targets.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <span className="text-xs text-muted-foreground mb-2 block">Medication</span>
            <div className="flex flex-wrap gap-2">
              {medications.map((m) => (
                <PillButton
                  key={m.value}
                  label={m.label}
                  selected={glp1.medication === m.value}
                  onClick={() => setGlp1Field("medication", m.value)}
                />
              ))}
            </div>
          </div>

          <TextField
            id="dose"
            label="Current dose"
            type="number"
            inputMode="decimal"
            step="0.25"
            min={0}
            max={50}
            value={glp1.dose_mg ?? ""}
            onChange={(e) => {
              const n = Number(e.target.value);
              setGlp1Field("dose_mg", Number.isFinite(n) && n > 0 ? n : null);
            }}
            suffix="mg"
          />

          <TextField
            id="started"
            label="Started on"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={glp1.startedAt ?? ""}
            onChange={(e) => setGlp1Field("startedAt", e.target.value || null)}
          />

          <div>
            <label htmlFor="target-weight" className="text-xs text-muted-foreground mb-1 block">
              Target weight{" "}
              <span className="text-muted-foreground/70 normal-case">(optional)</span>
            </label>
            <div className="relative">
              <input
                id="target-weight"
                type="number"
                inputMode="decimal"
                step="0.1"
                min={25}
                max={400}
                value={glp1.targetWeightKg ?? ""}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setGlp1Field("targetWeightKg", Number.isFinite(n) && n > 0 ? n : null);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                kg
              </span>
            </div>
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
