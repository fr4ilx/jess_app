import { useMemo } from "react";

interface MacroRingProps {
  value: number;
  target: number;
  size?: number;
  strokeWidth?: number;
  color: "protein" | "carbs" | "fat" | "calories" | "saturated-fat" | "sodium" | "fiber" | "added-sugars";
  label: string;
  unit?: string;
}

const colorMap: Record<string, string> = {
  protein: "var(--macro-protein)",
  carbs: "var(--macro-carbs)",
  fat: "var(--macro-fat)",
  calories: "var(--macro-calories)",
  "saturated-fat": "var(--macro-saturated-fat)",
  sodium: "var(--macro-sodium)",
  fiber: "var(--macro-fiber)",
  "added-sugars": "var(--macro-added-sugars)",
};

export function MacroRing({ value, target, size = 80, strokeWidth = 6, color, label, unit = "g" }: MacroRingProps) {
  const percentage = useMemo(() => Math.min((value / target) * 100, 100), [value, target]);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="macro-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`hsl(${colorMap[color]})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-sm font-semibold font-display text-foreground">{value}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-[10px] text-muted-foreground">/ {target}{unit}</span>
    </div>
  );
}
