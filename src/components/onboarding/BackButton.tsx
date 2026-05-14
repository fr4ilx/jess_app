import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
  to?: string;
  ariaLabel?: string;
};

// 40px circular back button — top-left of every onboarding step.
export function BackButton({ to, ariaLabel = "Back" }: Props) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      aria-label={ariaLabel}
      className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
    >
      <ChevronLeft className="w-5 h-5 text-foreground" aria-hidden="true" />
    </button>
  );
}
