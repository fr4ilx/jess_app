export const WidgetProgressPhotos = () => (
  <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-[0_20px_60px_-20px_rgba(20,40,30,0.18)] backdrop-blur">
    <div className="grid grid-cols-2 gap-3">
      {/* Week 1 */}
      <div className="rounded-2xl bg-muted/70 p-4">
        <div className="mx-auto mb-4 h-36 w-20 rounded-full bg-muted-foreground/15">
          <div className="mx-auto mt-3 h-14 w-10 rounded-full bg-muted-foreground/25" />
        </div>
        <div className="text-center">
          <div className="text-[10px] font-medium tracking-wider text-muted-foreground">WEEK 1</div>
          <div className="text-lg font-bold text-ink">196 lbs</div>
        </div>
      </div>
      {/* Week 12 */}
      <div className="rounded-2xl bg-primary/15 p-4 ring-1 ring-primary/30">
        <div className="relative mx-auto mb-4 h-36 w-20 rounded-full bg-primary/30">
          <div className="mx-auto mt-3 h-14 w-9 rounded-full bg-primary/60" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        </div>
        <div className="text-center">
          <div className="text-[10px] font-medium tracking-wider text-primary/80">WEEK 12</div>
          <div className="text-lg font-bold text-primary">168 lbs</div>
        </div>
      </div>
    </div>

    <div className="mt-5 flex items-end justify-around pt-2">
      <div className="text-center">
        <div className="text-lg font-bold text-emerald-600">-28 lbs</div>
        <div className="text-[11px] text-muted-foreground">Lost</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-primary">Preserved</div>
        <div className="text-[11px] text-muted-foreground">Muscle</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-accent-foreground">12</div>
        <div className="text-[11px] text-muted-foreground">Weeks</div>
      </div>
    </div>
  </div>
);
