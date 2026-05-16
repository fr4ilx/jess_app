const BARS = [40, 55, 38, 70, 48, 82, 65];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export const WidgetInsights = () => (
  <div className="rounded-3xl bg-white p-5 shadow-[0_20px_60px_-20px_rgba(20,40,30,0.18)]">
    <div className="flex items-end justify-between">
      <div>
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          This week
        </div>
        <div className="mt-1 text-3xl font-bold text-ink">
          1,840<span className="text-base font-medium text-muted-foreground"> cal/day avg</span>
        </div>
      </div>
      <div className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
        +12%
      </div>
    </div>

    <div className="mt-6 flex h-32 items-end gap-2">
      {BARS.map((h, i) => (
        <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <div
            className={`w-full rounded-t-lg ${
              i === 5 ? "bg-primary" : "bg-primary/30"
            }`}
            style={{ height: `${h}%` }}
          />
          <div className="text-[10px] text-muted-foreground">{DAYS[i]}</div>
        </div>
      ))}
    </div>

    <div className="mt-4 flex items-center justify-between rounded-2xl bg-blob-sage/40 px-3 py-2.5">
      <div className="text-xs font-medium text-ink">Best protein day: Saturday</div>
      <div className="text-xs font-bold text-primary">108g</div>
    </div>
  </div>
);
