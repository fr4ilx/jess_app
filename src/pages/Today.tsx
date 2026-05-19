import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Droplets,
  Sprout,
  Minus,
  Plus,
  Syringe,
  Scale,
  Flame,
} from "lucide-react";
import { DateSelector } from "@/components/DateSelector";
import { PandaLogo } from "@/components/onboarding/PandaLogo";
import { PrimaryCta } from "@/components/onboarding/PrimaryCta";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { useMealsToday } from "@/hooks/useMealsToday";
import { getDailyTotals } from "@/lib/nutrition";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Mock weekly medication levels until shot history is persisted
const MOCK_MED_LEVELS = [0.42, 0.48, 0.51, 0.49, 0.513, 0.46, 0.38];

const lbFromKg = (kg: number) => Math.round(kg / 0.45359237);

export default function Today() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  const { meals } = useMealsToday();
  const [waterOz, setWaterOz] = useState(0);
  const [fiberExtraG, setFiberExtraG] = useState(0);

  if (!profile.hasProfileData || !profile.dailyTargets) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <PandaLogo size={96} className="mb-5" />
        <h1 className="text-2xl font-bold font-display text-foreground">Let's get to know you</h1>
        <p className="text-base text-muted-foreground mt-2 max-w-xs">
          Tell Panda a bit about yourself so we can personalize your daily targets.
        </p>
        <div className="mt-8 w-full max-w-xs">
          <PrimaryCta onClick={() => navigate("/welcome")}>Begin onboarding</PrimaryCta>
        </div>
      </div>
    );
  }

  const targets = profile.dailyTargets;
  const totals = getDailyTotals(meals);
  const fiberValue = totals.fiber + fiberExtraG;
  const proteinPct = Math.min(totals.protein / targets.protein, 1);
  const todayIdx = (new Date().getDay() + 6) % 7; // Monday=0
  const medLevel = MOCK_MED_LEVELS[todayIdx];
  const weightLb = profile.weight_kg ? lbFromKg(profile.weight_kg) : null;
  const targetLb = profile.glp1?.targetWeightKg ? lbFromKg(profile.glp1.targetWeightKg) : null;
  const medName = profile.glp1?.medication
    ? profile.glp1.medication.charAt(0).toUpperCase() + profile.glp1.medication.slice(1)
    : "Mounjaro";

  return (
    <div className="min-h-screen bottom-nav-safe px-4 pt-14 pb-4 space-y-3">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3 px-1"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PandaLogo size={40} />
            <span className="text-xl font-bold tracking-tight text-foreground">PandaWell</span>
          </div>
        </div>
        <DateSelector />
      </motion.header>

      {/* 2-column bento grid */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 gap-3"
      >
        {/* Protein — large card with ring */}
        <Card className="col-span-1 row-span-2 flex flex-col">
          <CardHeader icon={<span className="text-amber-500">●</span>} title="Protein" />
          <div className="mt-2 flex flex-1 flex-col items-center justify-center">
            <ProteinRing pct={proteinPct} current={totals.protein} target={targets.protein} />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{Math.round(targets.protein - totals.protein)}g to go</span>
            <span className="font-semibold text-foreground">{targets.protein}g goal</span>
          </div>
        </Card>

        {/* Hydration */}
        <Card>
          <CardHeader
            icon={<Droplets className="h-4 w-4 text-sky-500" fill="currentColor" />}
            title="Hydration"
          />
          <div className="my-2 flex justify-center">
            <WaterGlass oz={waterOz} target={64} />
          </div>
          <div className="mt-1 text-center text-2xl font-bold text-ink">{waterOz}oz</div>
          <Counter
            value={waterOz}
            onChange={(d) => setWaterOz((v) => Math.max(0, v + d))}
            step={8}
            unit="oz"
          />
        </Card>

        {/* Fiber */}
        <Card>
          <CardHeader
            icon={<Sprout className="h-4 w-4 text-emerald-600" fill="currentColor" />}
            title="Fiber"
            trailing={
              <Counter
                inline
                value={fiberValue}
                onChange={(d) => setFiberExtraG((v) => Math.max(-totals.fiber, v + d))}
                step={1}
                unit="g"
              />
            }
          />
          <div className="mt-2 text-3xl font-bold text-ink">
            {fiberValue}g <span className="text-sm font-medium text-muted-foreground">/{targets.fiber}g</span>
          </div>
          <Bar pct={Math.min(fiberValue / targets.fiber, 1)} color="bg-emerald-500" />
        </Card>
      </motion.section>

      {/* Medication card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <div className="flex items-start justify-between">
            <CardHeader
              icon={<Syringe className="h-4 w-4 text-primary" />}
              title="Medication Level"
            />
            <span className="text-xs font-medium text-muted-foreground">{medName}®</span>
          </div>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <div className="text-3xl font-bold text-ink">{medLevel.toFixed(3)}mg</div>
              <div className="text-xs text-muted-foreground">Current estimate</div>
            </div>
            <MedChart levels={MOCK_MED_LEVELS} highlight={todayIdx} />
          </div>
        </Card>
      </motion.div>

      {/* Current Weight card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <div className="flex items-start justify-between">
            <CardHeader
              icon={<Scale className="h-4 w-4 text-accent-foreground" />}
              title="Current Weight"
            />
            <button
              type="button"
              onClick={() => navigate("/log-weight")}
              className="text-xs font-semibold text-primary"
            >
              Log today
            </button>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-ink">
                {weightLb}<span className="ml-1 text-base font-medium text-muted-foreground">lb</span>
              </div>
              {targetLb && (
                <div className="text-xs text-muted-foreground">
                  Goal · {targetLb} lb ({Math.max(weightLb! - targetLb, 0)} to go)
                </div>
              )}
            </div>
            <WeightSpark />
          </div>
        </Card>
      </motion.div>

      {/* Other macros — moved to bottom */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader
            icon={<Flame className="h-4 w-4 text-orange-500" fill="currentColor" />}
            title="Other"
            trailing={<span className="text-xs text-muted-foreground">{totals.calories} / {targets.calories} cal</span>}
          />
          <div className="mt-3 grid grid-cols-3 gap-3">
            <MiniMacro label="Calories" value={totals.calories} target={targets.calories} unit="" color="bg-orange-400" />
            <MiniMacro label="Carbs" value={totals.carbs} target={targets.carbs} unit="g" color="bg-amber-400" />
            <MiniMacro label="Fat" value={totals.fat} target={targets.fat} unit="g" color="bg-rose-400" />
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
        <span className="flex h-6 w-6 items-center justify-center">{icon}</span>
        <span className="text-sm font-bold text-foreground">{title}</span>
      </div>
      {trailing}
    </div>
  );
}

function Counter({
  value,
  onChange,
  step = 1,
  unit,
  inline = false,
}: {
  value: number;
  onChange: (delta: number) => void;
  step?: number;
  unit: string;
  inline?: boolean;
}) {
  if (inline) {
    return (
      <div className="flex items-center gap-1">
        <CounterBtn onClick={() => onChange(-step)} icon={<Minus className="h-3 w-3" />} />
        <span className="min-w-[2ch] text-center text-xs font-semibold text-foreground">
          {value}{unit}
        </span>
        <CounterBtn onClick={() => onChange(step)} icon={<Plus className="h-3 w-3" />} />
      </div>
    );
  }
  return (
    <div className="mt-2 flex items-center justify-center gap-3">
      <CounterBtn onClick={() => onChange(-step)} icon={<Minus className="h-3.5 w-3.5" />} />
      <span className="text-xs font-medium text-muted-foreground">{step}{unit}</span>
      <CounterBtn onClick={() => onChange(step)} icon={<Plus className="h-3.5 w-3.5" />} />
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

function ProteinRing({
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
          {current}<span className="text-base font-semibold text-muted-foreground">/{target}g</span>
        </div>
      </div>
    </div>
  );
}

function WaterGlass({ oz, target }: { oz: number; target: number }) {
  const pct = Math.min(oz / target, 1);
  return (
    <div className="relative h-20 w-16 overflow-hidden rounded-b-2xl rounded-t-md border-2 border-muted-foreground/30">
      <div
        className="absolute inset-x-0 bottom-0 bg-sky-400/70"
        style={{ height: `${pct * 100}%` }}
      />
    </div>
  );
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct * 100}%` }} />
    </div>
  );
}

function MiniMacro({
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
  const pct = Math.min(value / target, 1);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="mt-0.5 text-base font-bold text-ink">
        {value}<span className="text-xs font-medium text-muted-foreground">/{target}{unit}</span>
      </div>
      <Bar pct={pct} color={color} />
    </div>
  );
}

function MedChart({ levels, highlight }: { levels: number[]; highlight: number }) {
  const max = Math.max(...levels);
  return (
    <div className="flex h-16 items-end gap-1">
      {levels.map((v, i) => {
        const h = (v / max) * 100;
        const active = i === highlight;
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`w-3 rounded-md ${active ? "bg-primary" : "bg-muted"}`}
              style={{ height: `${h}%`, minHeight: 6 }}
            />
            <span className="text-[9px] text-muted-foreground">{DAYS[i][0]}</span>
          </div>
        );
      })}
    </div>
  );
}

function WeightSpark() {
  // simple mock 7-pt trend
  const pts = [78, 77.6, 77.3, 77.8, 77.1, 76.7, 76.4];
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;
  const w = 90;
  const h = 40;
  const path = pts
    .map((p, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((pts[pts.length - 1] - min) / range) * h} r={3.5} fill="hsl(var(--primary))" />
    </svg>
  );
}
