import { useMemo, useState } from "react";
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
} from "lucide-react";
import { DateSelector } from "@/components/DateSelector";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";

type Range = "7d" | "30d" | "90d" | "1y";

const RANGE_LABEL: Record<Range, string> = {
  "7d": "7d",
  "30d": "30d",
  "90d": "90d",
  "1y": "1y",
};

const RANGE_POINTS: Record<Range, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 12,
  "1y": 12,
};

const formatDate = (d: Date) =>
  `${d.getMonth() + 1}/${d.getDate()}`;

const formatDateTime = (d: Date) => {
  const month = d.toLocaleString("en-US", { month: "short" });
  const day = d.getDate();
  const hour = d.getHours();
  const min = d.getMinutes().toString().padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = ((hour + 11) % 12) + 1;
  return `${month} ${day}, ${h12}:${min} ${ampm}`;
};

const formatDateShort = (d: Date) => {
  const month = d.toLocaleString("en-US", { month: "short" });
  return `${month} ${d.getDate()}, ${d.getFullYear()}`;
};

export default function WeeklyInsights() {
  const profile = useCurrentProfile();
  const [range, setRange] = useState<Range>("7d");

  // ---- Derived weight data --------------------------------------------------
  const currentKg = profile.weight_kg ?? 80;
  const targetKg = profile.glp1?.targetWeightKg ?? 75;
  // startedAt sometimes comes in as a bad value (e.g. parsed as year 2000).
  // Treat anything earlier than 2020 or in the future as missing.
  const parsedStart = profile.glp1?.startedAt ? new Date(profile.glp1.startedAt) : null;
  const startedAt =
    parsedStart && parsedStart.getFullYear() >= 2020 && parsedStart.getTime() < Date.now()
      ? parsedStart
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago fallback
  const startKg = currentKg + Math.max(0, currentKg - targetKg) * 0.35 + 4; // mock starting weight

  // Mock chart series — until weight history is persisted in Supabase.
  // We synthesize a gentle descent from startKg → currentKg ending today,
  // with a small projection (dotted) continuing to the right.
  const series = useMemo(() => {
    const points = RANGE_POINTS[range];
    const today = new Date();
    today.setHours(22, 25, 0, 0);

    // Days each point represents
    const span = range === "1y" ? 30 : range === "90d" ? 7 : 1;

    const data: { date: Date; kg: number; projected: boolean; label: string }[] = [];

    for (let i = points - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i * span);
      const progress = (points - 1 - i) / (points - 1); // 0 → 1
      const kg = startKg - (startKg - currentKg) * progress;
      data.push({ date: d, kg: Number(kg.toFixed(1)), projected: false, label: formatDate(d) });
    }

    // Project 2 more points forward (dashed line)
    for (let i = 1; i <= 2; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i * span);
      const slope = (currentKg - startKg) / (points - 1);
      const kg = currentKg + slope * i;
      data.push({ date: d, kg: Number(kg.toFixed(1)), projected: true, label: formatDate(d) });
    }

    return data;
  }, [range, startKg, currentKg]);

  const todayPoint = series.find((p) => !p.projected && p === series[RANGE_POINTS[range] - 1])!;

  const yDomain = useMemo(() => {
    const values = series.map((p) => p.kg);
    const min = Math.floor(Math.min(...values) - 2);
    const max = Math.ceil(Math.max(...values) + 2);
    return [min, max] as [number, number];
  }, [series]);

  // ---- Stat calculations ----------------------------------------------------
  const heightM = (profile.height_cm ?? 170) / 100;
  const bmi = currentKg / (heightM * heightM);

  const diffKg = currentKg - startKg;
  const diffSign = diffKg > 0 ? "+" : diffKg < 0 ? "−" : "";
  const diffAbs = Math.abs(diffKg).toFixed(1);

  const progressPct = startKg <= targetKg
    ? 0
    : Math.max(0, Math.min(100, ((startKg - currentKg) / (startKg - targetKg)) * 100));

  // Timeline math
  const estTotalDays = 120; // mock — until persisted
  const elapsedDays = Math.min(
    estTotalDays,
    Math.floor((Date.now() - startedAt.getTime()) / (24 * 60 * 60 * 1000)),
  );
  const timelinePct = Math.min(100, (elapsedDays / estTotalDays) * 100);
  const estEnd = new Date(startedAt.getTime() + estTotalDays * 24 * 60 * 60 * 1000);

  // ---- Render ---------------------------------------------------------------
  return (
    <div className="min-h-screen bottom-nav-safe px-4 pt-14 space-y-3">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3 px-1"
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

      {/* Weight chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card>
          <div className="flex items-center justify-between">
            <CardHeader
              icon={<Scale className="h-4 w-4 text-primary" />}
              title="Weight (kg)"
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

          <div className="relative mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 30, right: 10, bottom: 6, left: 0 }}>
                <defs>
                  <linearGradient id="weight-fill" x1="0" y1="0" x2="0" y2="1">
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
                  domain={yDomain}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                  tickFormatter={(v) => `${Math.round(v)}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload as { date: Date; kg: number };
                    return (
                      <div className="rounded-xl border border-primary/40 bg-white px-3 py-2 shadow-md">
                        <div className="text-sm font-bold text-ink">{p.kg.toFixed(1)}kg</div>
                        <div className="text-[10px] text-muted-foreground">{formatDateTime(p.date)}</div>
                      </div>
                    );
                  }}
                  cursor={{ stroke: "hsl(var(--primary))", strokeDasharray: "3 3" }}
                />
                <ReferenceLine
                  x={todayPoint.label}
                  stroke="hsl(var(--primary))"
                  strokeDasharray="3 3"
                />
                <Area
                  type="monotone"
                  dataKey="kg"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#weight-fill)"
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    if (!payload.projected) {
                      return <circle key={`d-${cx}`} cx={cx} cy={cy} r={3} fill="hsl(var(--primary))" />;
                    }
                    return <circle key={`d-${cx}`} cx={cx} cy={cy} r={2} fill="hsl(var(--primary))" opacity={0.4} />;
                  }}
                  activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Pinned current tooltip */}
            <div
              className="pointer-events-none absolute"
              style={{
                top: 2,
                left: "50%",
                transform: "translateX(-25%)",
              }}
            >
              <div className="rounded-xl border-2 border-primary bg-white px-3 py-1.5 shadow-md">
                <div className="text-sm font-bold text-ink leading-tight">
                  {currentKg.toFixed(1)}kg
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight">
                  {formatDateTime(todayPoint.date)}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Progress + BMI + Difference (3-up bento) */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        {/* Progress ring (col-span-1, row-span-2) */}
        <Card className="col-span-1 row-span-2 flex flex-col">
          <CardHeader
            icon={<Scale className="h-4 w-4 text-primary" />}
            title="Progress"
          />
          <div className="text-[10px] text-muted-foreground">Goal Weight: {targetKg}kg</div>
          <div className="mt-2 flex flex-1 items-center justify-center">
            <ProgressRing pct={progressPct} />
          </div>
        </Card>

        {/* BMI */}
        <Card>
          <CardHeader
            icon={<Activity className="h-4 w-4 text-primary" />}
            title="BMI"
            trailing={<Info className="h-3.5 w-3.5 text-muted-foreground" />}
          />
          <div className="mt-2 text-3xl font-bold text-ink">{bmi.toFixed(1)}</div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">
            {formatDateTime(new Date())}
          </div>
        </Card>

        {/* Difference */}
        <Card>
          <CardHeader
            icon={<Flag className="h-4 w-4 text-primary" />}
            title="Difference"
          />
          <div className="mt-2 text-3xl font-bold text-ink">
            {diffSign}{diffAbs}<span className="ml-1 text-base font-medium text-muted-foreground">kg</span>
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">
            From {startKg.toFixed(1)} kg, {formatDateShort(startedAt).replace(",", "")}
          </div>
        </Card>
      </motion.section>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <div className="flex items-center justify-between">
            <CardHeader
              icon={<TrendingUp className="h-4 w-4 text-primary" />}
              title="Timeline"
            />
            <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
              <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
              <span>Est. Date {estEnd.toLocaleString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
          </div>

          {/* Top labels — start, current (with marker), target */}
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

          {/* Bar */}
          <div className="relative h-2.5">
            <div className="absolute inset-x-0 top-0 h-2.5 rounded-full bg-muted" />
            <div
              className="absolute left-0 top-0 h-2.5 rounded-full bg-gradient-to-r from-primary/70 to-primary"
              style={{ width: `${timelinePct}%` }}
            />
            {/* dot at current */}
            <div
              className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary"
              style={{ left: `${Math.min(100, Math.max(0, timelinePct))}%` }}
            />
          </div>

          {/* Bottom dates — start, today, estimated end */}
          <div className="relative mt-2 h-4">
            <div className="absolute left-0 text-[10px] text-muted-foreground">
              {formatDateShort(startedAt)}
            </div>
            <div className="absolute right-0 text-[10px] text-muted-foreground">
              Est. {formatDateShort(estEnd)}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

/* ------------------------- Subcomponents ------------------------- */

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
  const size = 110;
  const stroke = 12;
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
      <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-ink">
        {Math.round(pct)}%
      </div>
    </div>
  );
}
