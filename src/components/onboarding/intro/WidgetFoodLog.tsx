export const WidgetFoodLog = () => (
  <div className="rounded-3xl bg-white p-5 shadow-[0_20px_60px_-20px_rgba(20,40,30,0.18)]">
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-blob-peach via-amber-200 to-blob-sage">
        <div className="absolute left-3 top-3 h-7 w-7 rounded-full bg-amber-300/90" />
        <div className="absolute bottom-3 right-2 h-9 w-10 rounded-full bg-green-400/70" />
        <div className="absolute right-5 top-6 h-4 w-4 rounded-full bg-red-300/80" />
      </div>
      <div className="flex-1">
        <div className="text-[10px] font-medium tracking-wider text-muted-foreground">12:42 PM</div>
        <div className="text-base font-bold text-ink">Grain bowl, salmon</div>
        <div className="mt-1 text-sm text-muted-foreground">540 cal · logged</div>
      </div>
      <div className="relative h-14 w-14">
        <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="68 100"
            pathLength={100}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-ink">
          68%
        </div>
      </div>
    </div>

    <div className="mt-4 grid grid-cols-3 gap-2">
      {[
        { label: "Protein", val: "32g", color: "bg-macro-protein" },
        { label: "Carbs", val: "48g", color: "bg-macro-carbs" },
        { label: "Fat", val: "18g", color: "bg-macro-fat" },
      ].map((m) => (
        <div key={m.label} className="rounded-xl bg-muted/60 p-2.5">
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${m.color}`} />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {m.label}
            </span>
          </div>
          <div className="mt-0.5 text-sm font-bold text-ink">{m.val}</div>
        </div>
      ))}
    </div>
  </div>
);
