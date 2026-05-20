import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  SlidersHorizontal,
  Scale,
  Activity,
  Flag,
  TrendingUp,
  BookmarkCheck,
  Info,
  Syringe,
  Clock,
  User,
  Droplets,
  Sprout,
  Minus,
  Plus,
  Flame,
  Apple,
} from "lucide-react";
import { DateSelector } from "@/components/DateSelector";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { useMealsToday } from "@/hooks/useMealsToday";
import { getDailyTotals } from "@/lib/nutrition";
import { getWaterToday, setWaterToday } from "@/lib/hydration";

type Range = "7d" | "30d" | "90d" | "1y";

const RANGE_LABEL: Record<Range, string> = {
  "7d": "7d",
  "30d": "30d",
  "90d": "90d",
  "1y": "1y",
};

const RANGE_POINTS: Record<Range, number> = {
  "7d": 7,
  "30d": 14,
  "90d": 12,
  "1y": 12,
};

const formatDate = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;

const formatDateTime = (d: Date) => {
  const month = d.toLocaleString("en-US", { month: "short" });
  const day = d.getDate();
  const hour = d.getHours();
  const min = d.getMinutes().toString().padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = ((hour + 11) % 12) + 1;
  return `${month} ${day}, ${h12}:${min} ${ampm}`;
};

const formatDateLong = (d: Date) => {
  const month = d.toLocaleString("en-US", { month: "short" });
  const day = d.getDate();
  const year = d.getFullYear();
  const hour = d.getHours();
  const min = d.getMinutes().toString().padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = ((hour + 11) % 12) + 1;
  return `${month} ${day} ${year} at ${h12}:${min} ${ampm}`;
};

const formatDateShort = (d: Date) => {
  const month = d.toLocaleString("en-US", { month: "short" });
  return `${month} ${d.getDate()}, ${d.getFullYear()}`;
};

export default function WeeklyInsights() {
  const profile = useCurrentProfile();
  const { meals } = useMealsToday();
  const [range, setRange] = useState<Range>("7d");
  const [waterOz, setWaterOzState] = useState(0);

  // Sync water from shared hydration store (updated by /log-hydration)
  useEffect(() => {
    setWaterOzState(getWaterToday());
    const handle = () => setWaterOzState(getWaterToday());
    window.addEventListener("pandawell:water-changed", handle);
    window.addEventListener("storage", handle);
    return () => {
      window.removeEventListener("pandawell:water-changed", handle);
      window.removeEventListener("storage", handle);
    };
  }, []);

  const setWaterOz = (next: number | ((v: number) => number)) => {
    const value = typeof next === "function" ? next(waterOz) : next;
    const clamped = Math.max(0, value);
    setWaterOzState(clamped);
    setWaterToday(clamped);
  };
  const [fiberExtraG, setFiberExtraG] = useState(0);

  // ---- Nutrition data -------------------------------------------------------
  const targets = profile.dailyTargets ?? {
    calories: 1893,
    protein: 128,
    carbs: 217,
    fat: 57,
    satFat: 25,
    sodium: 2300,
    fiber: 38,
    addedSugars: 34,
  };
  const totals = getDailyTotals(meals);
  const fiberValue = totals.fiber + fiberExtraG;
  const proteinPct = Math.min(totals.protein / targets.protein, 1);

  // ---- Weight data ----------------------------------------------------------
  const currentKg = profile.weight_kg ?? 80;
  const targetKg = profile.glp1?.targetWeightKg ?? 75;
  const parsedStart = profile.glp1?.startedAt ? new Date(profile.glp1.startedAt) : null;
  const startedAt =
    parsedStart && parsedStart.getFullYear() >= 2020 && parsedStart.getTime() < Date.now()
      ? parsedStart
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const startKg = currentKg + Math.max(0, currentKg - targetKg) * 0.35 + 4;
  const heightM = (profile.height_cm ?? 170) / 100;
  const bmi = currentKg / (heightM * heightM);
  const diffKg = currentKg - startKg;
  const diffSign = diffKg > 0 ? "+" : diffKg < 0 ? "−" : "";
  const diffAbs = Math.abs(diffKg).toFixed(1);
  const progressPct =
    startKg <= targetKg
      ? 0
      : Math.max(0, Math.min(100, ((startKg - currentKg) / (startKg - targetKg)) * 100));
  const estTotalDays = 120;
  const elapsedDays = Math.min(
    estTotalDays,
    Math.floor((Date.now() - startedAt.getTime()) / (24 * 60 * 60 * 1000)),
  );
  const timelinePct = Math.min(100, (elapsedDays / estTotalDays) * 100);
  const estEnd = new Date(startedAt.getTime() + estTotalDays * 24 * 60 * 60 * 1000);

  // ---- Medication data ------------------------------------------------------
  const medRaw = profile.glp1?.medication ?? "ozempic";
  const medName = medRaw.charAt(0).toUpperCase() + medRaw.slice(1);
  const doseMg = profile.glp1?.dose_mg ?? 1.7;
  const schedule = profile.glp1?.schedule ?? "weekly";
  const intervalDays =
    schedule === "daily" ? 1 : schedule === "weekly" ? 7 : schedule === "biweekly" ? 14 : 30;

  const lastDose = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000);
  const nextDose = new Date(lastDose.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  const msUntilNext = nextDose.getTime() - Date.now();
  const daysUntilNext = Math.floor(Math.abs(msUntilNext) / (24 * 60 * 60 * 1000));
  const hoursUntilNext = Math.floor(
    (Math.abs(msUntilNext) % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000),
  );
  const overdue = msUntilNext < 0;

  const medSeries = useMemo(() => {
    const points = RANGE_POINTS[range];
    const today = new Date();
    const span = range === "1y" ? 14 : range === "90d" ? 7 : range === "30d" ? 2 : 1;
    const decayPerDay = 0.905;

    const data: { date: Date; mg: number; projected: boolean; label: string; isToday?: boolean }[] = [];

    for (let i = points - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i * span);
      const daysSinceShot = (Date.now() - lastDose.getTime()) / (24 * 60 * 60 * 1000) - i * span;
      const level = doseMg * Math.pow(decayPerDay, Math.max(0, daysSinceShot));
      data.push({
        date: d,
        mg: Number(level.toFixed(3)),
        projected: false,
        label: formatDate(d),
        isToday: i === 0,
      });
    }

    for (let i = 1; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i * span);
      const daysSinceShot = (Date.now() - lastDose.getTime()) / (24 * 60 * 60 * 1000) + i * span;
      const level = doseMg * Math.pow(decayPerDay, daysSinceShot);
      data.push({
        date: d,
        mg: Number(level.toFixed(3)),
        projected: true,
        label: formatDate(d),
      });
    }

    return data;
  }, [range, doseMg, lastDose]);

  const todayMedPoint = medSeries.find((p) => p.isToday) ?? medSeries[medSeries.length - 4];
  const currentMedLevel = todayMedPoint?.mg ?? 0;

  const mgDomain = useMemo(() => {
    const values = medSeries.map((p) => p.mg);
    const max = Math.ceil(Math.max(...values) * 1.15 * 10) / 10;
    return [0, max] as [number, number];
  }, [medSeries]);

  const lastSite = { region: "Stomach", sub: "Upper Left" };

  return (
    <div className="min-h-screen bottom-nav-safe">
      {/* Sticky header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 space-y-3 bg-background/85 px-5 pb-3 pt-6 backdrop-blur-md"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Progress</h1>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur"
            aria-label="Filters"
          >
            <SlidersHorizontal className="h-4 w-4 text-foreground" />
          </button>
        </div>
        <DateSelector />
      </motion.header>

      <div className="space-y-5 px-4 pt-4">

      {/* ---------------- NUTRITION SECTION ---------------- */}
      <SectionHeader title="Nutrition" icon={<Apple className="h-4 w-4 text-primary" />} />

      <motion.section initial={false} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Card className="col-span-1 row-span-2 flex flex-col">
            <CardHeader icon={<span className="text-amber-500">●</span>} title="Protein" />
            <div className="mt-2 flex flex-1 flex-col items-center justify-center">
              <ProteinRingViz pct={proteinPct} current={totals.protein} target={targets.protein} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{Math.round(Math.max(0, targets.protein - totals.protein))}g to go</span>
              <span className="font-semibold text-foreground">{targets.protein}g goal</span>
            </div>
          </Card>

          <Card>
            <CardHeader
              icon={<Droplets className="h-4 w-4 text-sky-500" fill="currentColor" />}
              title="Hydration"
            />
            <div className="my-2 flex justify-center">
              <WaterGlassViz oz={waterOz} target={64} />
            </div>
            <div className="mt-1 text-center text-2xl font-bold text-ink">{waterOz}oz</div>
            <CounterRow onChange={(d) => setWaterOz((v) => Math.max(0, v + d))} step={8} unit="oz" />
          </Card>

          <Card>
            <CardHeader
              icon={<Sprout className="h-4 w-4 text-emerald-600" fill="currentColor" />}
              title="Fiber"
              trailing={
                <InlineCounter
                  value={fiberValue}
                  onChange={(d) => setFiberExtraG((v) => Math.max(-totals.fiber, v + d))}
                  step={1}
                  unit="g"
                />
              }
            />
            <div className="mt-2 text-3xl font-bold text-ink">
              {fiberValue}g{" "}
              <span className="text-sm font-medium text-muted-foreground">/{targets.fiber}g</span>
            </div>
            <ProgressBar
              pct={Math.min(fiberValue / Math.max(targets.fiber, 1), 1)}
              color="bg-emerald-500"
            />
          </Card>
        </div>

        <Card>
          <CardHeader
            icon={<Flame className="h-4 w-4 text-orange-500" fill="currentColor" />}
            title="Other"
            trailing={
              <span className="text-xs text-muted-foreground">
                {totals.calories} / {targets.calories} cal
              </span>
            }
          />
          <div className="mt-3 grid grid-cols-3 gap-3">
            <MiniMacroCol label="Calories" value={totals.calories} target={targets.calories} unit="" color="bg-orange-400" />
            <MiniMacroCol label="Carbs" value={totals.carbs} target={targets.carbs} unit="g" color="bg-amber-400" />
            <MiniMacroCol label="Fat" value={totals.fat} target={targets.fat} unit="g" color="bg-rose-400" />
          </div>
        </Card>
      </motion.section>

      {/* ---------------- MEDICATION SECTION ---------------- */}
      <SectionHeader title="Medication" icon={<Syringe className="h-4 w-4 text-primary" />} />

      <motion.section initial={false} className="space-y-3">
        <Card>
          <div className="flex items-center justify-between">
            <CardHeader
              icon={<Syringe className="h-4 w-4 text-primary" />}
              title="Medication Level"
              trailing={<Info className="h-3.5 w-3.5 text-muted-foreground" />}
            />
            <div className="inline-flex items-center rounded-full bg-muted p-0.5 text-xs font-semibold">
              {(Object.keys(RANGE_LABEL) as Range[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={`rounded-full px-2.5 py-1 transition-colors ${
                    range === r ? "bg-ink text-white" : "text-muted-foreground"
                  }`}
                >
                  {RANGE_LABEL[r]}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mt-3 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={medSeries} margin={{ top: 30, right: 6, bottom: 4, left: 0 }}>
                <defs>
                  <linearGradient id="med-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--muted))" strokeDasharray="0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={mgDomain}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                  tickFormatter={(v) => v.toFixed(1)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload as { date: Date; mg: number };
                    return (
                      <div className="rounded-xl border border-primary/40 bg-white px-3 py-2 shadow-md">
                        <div className="text-sm font-bold text-ink">{p.mg.toFixed(3)}mg</div>
                        <div className="text-[10px] text-muted-foreground">
                          {formatDateTime(p.date)}
                        </div>
                      </div>
                    );
                  }}
                  cursor={{ stroke: "hsl(var(--primary))", strokeDasharray: "3 3" }}
                />
                {todayMedPoint && (
                  <ReferenceLine
                    x={todayMedPoint.label}
                    stroke="hsl(var(--primary))"
                    strokeDasharray="3 3"
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="mg"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#med-fill)"
                  dot={(props) => {
                    const { cx, cy, payload, index } = props;
                    if (payload.isToday) {
                      return <circle key={`d-${index}`} cx={cx} cy={cy} r={4} fill="hsl(var(--primary))" stroke="white" strokeWidth={2} />;
                    }
                    if (!payload.projected) {
                      return <circle key={`d-${index}`} cx={cx} cy={cy} r={2.5} fill="hsl(var(--primary))" />;
                    }
                    return <circle key={`d-${index}`} cx={cx} cy={cy} r={2} fill="hsl(var(--primary))" opacity={0.4} />;
                  }}
                  activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute" style={{ top: 2, right: 10 }}>
              <div className="rounded-xl bg-white px-3 py-1.5 shadow-md ring-1 ring-border">
                <div className="text-sm font-bold text-ink leading-tight">
                  {currentMedLevel.toFixed(3)}mg
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight">
                  {formatDateTime(new Date())}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader icon={<Syringe className="h-4 w-4 text-primary" />} title="Last dose" />
            <div className="mt-2 text-2xl font-bold text-ink">
              {doseMg} <span className="text-sm font-medium text-muted-foreground">mg</span>
            </div>
            <div className="text-[11px] font-semibold text-primary">{medName}®</div>
            <div className="mt-2 text-[10px] text-muted-foreground">{formatDateLong(lastDose)}</div>
          </Card>

          <Card>
            <CardHeader icon={<Clock className="h-4 w-4 text-primary" />} title="Next dose" />
            <div className="mt-1 text-[10px] text-muted-foreground">{formatDateLong(nextDose)}</div>
            <div className="mt-2 flex justify-center">
              <CountdownRing
                days={overdue ? -daysUntilNext : daysUntilNext}
                hours={overdue ? -hoursUntilNext : hoursUntilNext}
                overdue={overdue}
              />
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <CardHeader icon={<User className="h-4 w-4 text-primary" />} title="Injection" />
              <div className="mt-2 text-2xl font-bold text-ink">{lastSite.region}</div>
              <div className="text-[11px] font-semibold text-muted-foreground">{lastSite.sub}</div>
              <div className="mt-2 text-[10px] text-muted-foreground">{formatDateLong(lastDose)}</div>
            </div>
            <BodyDiagram site={lastSite.region} />
          </div>
        </Card>
      </motion.section>

      {/* ---------------- WEIGHT SECTION ---------------- */}
      <SectionHeader title="Weight" icon={<Scale className="h-4 w-4 text-primary" />} />

      <motion.section initial={false} className="space-y-3">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Current
              </div>
              <div className="mt-1 text-4xl font-bold text-ink">
                {currentKg.toFixed(1)}
                <span className="ml-1 text-base font-medium text-muted-foreground">kg</span>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {diffSign}{diffAbs} kg from {startKg.toFixed(1)} kg start
              </div>
            </div>
            <ProgressRing pct={progressPct} />
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader
              icon={<Activity className="h-4 w-4 text-primary" />}
              title="BMI"
              trailing={<Info className="h-3.5 w-3.5 text-muted-foreground" />}
            />
            <div className="mt-2 text-3xl font-bold text-ink">{bmi.toFixed(1)}</div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">{bmiLabel(bmi)}</div>
          </Card>
          <Card>
            <CardHeader icon={<Flag className="h-4 w-4 text-primary" />} title="Goal" />
            <div className="mt-2 text-3xl font-bold text-ink">
              {targetKg}
              <span className="ml-1 text-base font-medium text-muted-foreground">kg</span>
            </div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">
              {Math.max(0, currentKg - targetKg).toFixed(1)} kg to go
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between">
            <CardHeader icon={<TrendingUp className="h-4 w-4 text-primary" />} title="Timeline" />
            <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
              <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
              <span>Est. {estEnd.toLocaleString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
          </div>

          <div className="relative mt-5 h-5">
            <div className="absolute left-0 text-xs font-bold text-ink">{startKg.toFixed(1)}kg</div>
            <div
              className="absolute -translate-x-1/2 text-xs font-bold text-primary"
              style={{ left: `${Math.min(95, Math.max(5, timelinePct))}%` }}
            >
              {currentKg}kg
            </div>
            <div className="absolute right-0 text-xs font-bold text-muted-foreground">{targetKg}kg</div>
          </div>

          <div className="relative h-2.5">
            <div className="absolute inset-x-0 top-0 h-2.5 rounded-full bg-muted" />
            <div
              className="absolute left-0 top-0 h-2.5 rounded-full bg-gradient-to-r from-primary/70 to-primary"
              style={{ width: `${timelinePct}%` }}
            />
            <div
              className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary"
              style={{ left: `${Math.min(100, Math.max(0, timelinePct))}%` }}
            />
          </div>

          <div className="relative mt-2 h-4">
            <div className="absolute left-0 text-[10px] text-muted-foreground">{formatDateShort(startedAt)}</div>
            <div className="absolute right-0 text-[10px] text-muted-foreground">Est. {formatDateShort(estEnd)}</div>
          </div>
        </Card>
      </motion.section>
      </div>
    </div>
  );
}

/* ------------------------- Subcomponents ------------------------- */

function bmiLabel(bmi: number) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-1 pt-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">{icon}</span>
      <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl bg-white/80 p-4 shadow-[0_8px_24px_-12px_rgba(20,40,30,0.18)] backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({
  icon,
  title,
  trailing,
}: {
  icon: React.ReactNode;
  title: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">{icon}</span>
        <span className="text-sm font-bold text-foreground">{title}</span>
      </div>
      {trailing}
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const size = 90;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-ink">
        {Math.round(pct)}%
      </div>
    </div>
  );
}

function CountdownRing({
  days,
  hours,
  overdue,
}: {
  days: number;
  hours: number;
  overdue: boolean;
}) {
  const size = 84;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = overdue ? 1 : Math.max(0.05, Math.min(1, 1 - (days * 24 + hours) / (7 * 24)));
  const stroke_color = overdue ? "hsl(0 70% 55%)" : "hsl(var(--primary))";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke_color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${pct * c} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`text-base font-bold leading-none ${overdue ? "text-destructive" : "text-ink"}`}>
          {overdue ? "-" : ""}
          {Math.abs(days)}d {Math.abs(hours)}h
        </div>
      </div>
    </div>
  );
}

function BodyDiagram({ site }: { site: string }) {
  const SITES: Record<string, { x: number; y: number }> = {
    Stomach: { x: 50, y: 65 },
    Thigh: { x: 40, y: 95 },
    Arm: { x: 28, y: 50 },
  };
  const target = SITES[site] ?? SITES.Stomach;
  return (
    <svg width="68" height="100" viewBox="0 0 100 140">
      <circle cx="50" cy="14" r="9" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
      <path
        d="M 38 27 L 62 27 L 64 75 L 56 80 L 56 110 L 50 110 L 44 110 L 44 80 L 36 75 Z"
        fill="none"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M 38 30 L 22 55 L 24 70" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" />
      <path d="M 62 30 L 78 55 L 76 70" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" />
      <path d="M 46 110 L 42 135" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" />
      <path d="M 54 110 L 58 135" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" />
      <circle cx={target.x} cy={target.y} r="5" fill="hsl(var(--primary))" />
      <circle cx={target.x} cy={target.y} r="9" fill="hsl(var(--primary))" opacity="0.25" />
    </svg>
  );
}

/* ----- Nutrition subcomponents ----- */

function ProteinRingViz({
  pct,
  current,
  target,
}: {
  pct: number;
  current: number;
  target: number;
}) {
  const size = 130;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dotAngle = pct * 2 * Math.PI - Math.PI / 2;
  const dx = size / 2 + r * Math.cos(dotAngle);
  const dy = size / 2 + r * Math.sin(dotAngle);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--macro-carbs))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${pct * c} ${c}`}
        />
      </svg>
      {pct > 0 && (
        <span
          className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500"
          style={{ left: dx, top: dy }}
        />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xl font-bold text-ink">
          {current}
          <span className="text-base font-semibold text-muted-foreground">/{target}g</span>
        </div>
      </div>
    </div>
  );
}

function WaterGlassViz({ oz, target }: { oz: number; target: number }) {
  const pct = Math.min(oz / target, 1);
  return (
    <div className="relative h-20 w-16 overflow-hidden rounded-b-2xl rounded-t-md border-2 border-muted-foreground/30">
      <div className="absolute inset-x-0 bottom-0 bg-sky-400/70" style={{ height: `${pct * 100}%` }} />
    </div>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct * 100}%` }} />
    </div>
  );
}

function CounterRow({
  onChange,
  step,
  unit,
}: {
  onChange: (delta: number) => void;
  step: number;
  unit: string;
}) {
  return (
    <div className="mt-2 flex items-center justify-center gap-3">
      <CounterBtn onClick={() => onChange(-step)} icon={<Minus className="h-3.5 w-3.5" />} />
      <span className="text-xs font-medium text-muted-foreground">
        {step}
        {unit}
      </span>
      <CounterBtn onClick={() => onChange(step)} icon={<Plus className="h-3.5 w-3.5" />} />
    </div>
  );
}

function InlineCounter({
  value,
  onChange,
  step,
  unit,
}: {
  value: number;
  onChange: (delta: number) => void;
  step: number;
  unit: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <CounterBtn onClick={() => onChange(-step)} icon={<Minus className="h-3 w-3" />} />
      <span className="min-w-[2ch] text-center text-xs font-semibold text-foreground">
        {value}
        {unit}
      </span>
      <CounterBtn onClick={() => onChange(step)} icon={<Plus className="h-3 w-3" />} />
    </div>
  );
}

function CounterBtn({ onClick, icon }: { onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/70 active:scale-95"
    >
      {icon}
    </button>
  );
}

function MiniMacroCol({
  label,
  value,
  target,
  unit,
  color,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}) {
  const pct = Math.min(value / Math.max(target, 1), 1);
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-base font-bold text-ink">
        {value}
        <span className="text-xs font-medium text-muted-foreground">
          /{target}
          {unit}
        </span>
      </div>
      <ProgressBar pct={pct} color={color} />
    </div>
  );
}
