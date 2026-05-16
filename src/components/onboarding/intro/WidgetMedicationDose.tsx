const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const ACTIVE = 2;

export const WidgetMedicationDose = () => (
  <div className="space-y-3">
    <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-[0_20px_60px_-20px_rgba(80,120,90,0.55)]">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium tracking-wider text-white/70">NEXT DOSE</div>
          <div className="mt-1 text-3xl font-bold">Wednesday</div>
          <div className="mt-1 text-sm text-white/80">9:00 AM · Ozempic 0.5mg</div>
        </div>
        <div className="h-9 w-6 rounded-full bg-white/25">
          <div className="mx-auto mt-1 h-3 w-3 rounded-full bg-white" />
        </div>
      </div>

      <div className="mt-5 flex gap-1.5">
        {DAYS.map((d, i) => (
          <div
            key={i}
            className={`flex h-9 flex-1 items-center justify-center rounded-xl text-sm font-medium ${
              i === ACTIVE
                ? "border border-white/70 bg-white/10 text-white"
                : "bg-white/10 text-white/55"
            }`}
          >
            {d}
          </div>
        ))}
      </div>
    </div>

    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_10px_30px_-10px_rgba(20,40,30,0.15)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blob-sage/70 text-sm font-bold text-primary">
        N
      </div>
      <div>
        <div className="text-sm font-semibold text-ink">Dose day tomorrow</div>
        <div className="text-xs text-muted-foreground">
          Prepare your injection site and rotate from last week's spot.
        </div>
      </div>
    </div>
  </div>
);
