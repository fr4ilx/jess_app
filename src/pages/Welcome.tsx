import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FadeIn } from "@/components/onboarding/FadeIn";
import { PrimaryCta } from "@/components/onboarding/PrimaryCta";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col px-5 pt-16 pb-8">
      <FadeIn className="flex-1 flex flex-col justify-center">
        <h1 className="text-4xl font-bold font-display text-foreground leading-tight">
          Nutrition for your GLP-1 journey.
        </h1>
        <p className="text-base text-muted-foreground mt-3 max-w-sm leading-relaxed">
          Built for people on Ozempic, Wegovy, Mounjaro, and Zepbound — to help you hit your
          protein, ease side effects, and protect your heart.
        </p>
      </FadeIn>

      <PrimaryCta onClick={() => navigate("/onboarding/intro/photos")}>
        Get started
        <ArrowRight className="w-4 h-4" />
      </PrimaryCta>
    </div>
  );
}
