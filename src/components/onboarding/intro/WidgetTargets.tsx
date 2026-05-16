const Ring = ({
  color,
  pct,
  size = 40,
  stroke = 4,
}: {
  color: string;
  pct: number;
  size?: number;
  stroke?: number;
}) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`}
      />
    </svg>
  );
};

export const WidgetTargets = () => (
  <div className="rounded-3xl bg-white p-6 shadow-[0_20px_60px_-20px_rgba(20,40,30,0.18)]">
    <div className="flex items-center gap-5">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="72 100"
            pathLength={100}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-ink">1,840</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">cal/day</div>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {[
          { label: "Protein", val: "140g", color: "hsl(var(--macro-protein))", pct: 80 },
          { label: "Carbs", val: "180g", color: "hsl(var(--macro-carbs))", pct: 60 },
          { label: "Fat", val: "62g", color: "hsl(var(--macro-fat))", pct: 45 },
        ].map((m) => (
          <div key={m.label} className="flex items-center gap-3">
            <Ring color={m.color} pct={m.pct} />
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {m.label}
              </div>
              <div className="text-sm font-bold text-ink">{m.val}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-4 rounded-2xl bg-blob-peach/60 px-4 py-3 text-xs font-medium text-ink">
      Tuned for your weight, activity, and GLP-1 schedule.
    </div>
  </div>
);
