import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isPending?: boolean;
};

// Full-width primary call-to-action used at the bottom of each onboarding step.
// Matches the existing app's CTA pattern.
export function PrimaryCta({
  children,
  isPending = false,
  disabled,
  className = "",
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || isPending}
      className={`w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform ${className}`}
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}
