import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FadeIn } from "@/components/onboarding/FadeIn";
import { PandaLogo } from "@/components/onboarding/PandaLogo";
import { PrimaryCta } from "@/components/onboarding/PrimaryCta";
import { useAuth } from "@/hooks/useAuth";
import { useSaveOnboardingStep } from "@/hooks/useSaveOnboardingStep";
import { useOnboardingStore } from "@/store/onboarding";

export default function PandaWelcome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { save, isPending } = useSaveOnboardingStep();
  const { name } = useOnboardingStore();

  // Sandbox-friendly: writes only happen if a session exists. In sandbox the
  // user still lands on /today without any backend round-trip.
  // We deliberately do NOT call reset() — Zustand persists the inputs so the
  // home screen and other pages can read from them.
  const handleGo = async () => {
    await save({ final: true });
    toast.success(user ? "All set" : "All set (sandbox mode)");
    navigate("/today", { replace: true });
  };

  const displayName = name.trim() || "there";

  return (
    <div className="min-h-screen flex flex-col px-5 pt-16 pb-8">
      <FadeIn className="flex-1 flex flex-col items-center justify-center text-center">
        <PandaLogo size={160} className="mb-8" />

        <h1 className="text-3xl font-bold font-display text-foreground leading-tight">
          Hey {displayName}, I'm Panda.
        </h1>
        <p className="text-base text-muted-foreground mt-4 leading-relaxed max-w-sm">
          I'll be here with you — answering questions about food, helping you log meals,
          and keeping an eye on what matters for your heart and your medication.
        </p>
      </FadeIn>

      <PrimaryCta onClick={handleGo} isPending={isPending}>
        Let's go
        <ArrowRight className="w-4 h-4" />
      </PrimaryCta>
    </div>
  );
}
