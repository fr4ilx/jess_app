import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";

type Props = {
  Icon: LucideIcon;
  iconTint?: string; // tailwind background class, e.g. "bg-primary/10"
  iconColor?: string; // tailwind text class, e.g. "text-primary"
  title: string;
  subtitle?: string;
  selected: boolean;
  onClick: () => void;
};

// Large tappable card for big binary/quaternary choices (sex, goal, GLP-1 yes/no).
// Uses the existing glass-card surface so it sits inside the app's design system.
export function CardButton({
  Icon,
  iconTint = "bg-primary/10",
  iconColor = "text-primary",
  title,
  subtitle,
  selected,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left transition-colors active:scale-[0.98] ${
        selected ? "ring-2 ring-primary border-primary/40" : ""
      }`}
    >
      <div className={`w-11 h-11 rounded-xl ${iconTint} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold font-display text-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {selected && <Check className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />}
    </button>
  );
}
