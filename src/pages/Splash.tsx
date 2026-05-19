import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FadeIn } from "@/components/onboarding/FadeIn";
import { PandaLogo } from "@/components/onboarding/PandaLogo";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate("/onboarding/name", { replace: true }), 1800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <FadeIn duration={600}>
        <div className="flex flex-col items-center">
          <PandaLogo size={120} className="mb-5" />
          <p className="font-display text-3xl text-foreground font-bold">Panda AI</p>
        </div>
      </FadeIn>
    </div>
  );
}
