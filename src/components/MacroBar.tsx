type MacroColor = "protein" | "carbs" | "fat" | "calories" | "saturated-fat" | "sodium" | "fiber" | "added-sugars";

interface MacroBarProps {
  value: number;
  target: number;
  color: MacroColor;
  label: string;
  unit?: string;
}

const bgMap: Record<MacroColor, string> = {
  protein: "bg-macro-protein",
  carbs: "bg-macro-carbs",
  fat: "bg-macro-fat",
  calories: "bg-macro-calories",
  "saturated-fat": "bg-macro-saturated-fat",
  sodium: "bg-macro-sodium",
  fiber: "bg-macro-fiber",
  "added-sugars": "bg-macro-added-sugars",
};

export function MacroBar({ value, target, color, label, unit = "g" }: MacroBarProps) {
  const pct = Math.min((value / target) * 100, 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">
          {value} / {target}
          {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${bgMap[color]} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
