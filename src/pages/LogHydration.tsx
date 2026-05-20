import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Minus, Plus, Droplet } from "lucide-react";
import { toast } from "sonner";
import { getWaterToday, setWaterToday } from "@/lib/hydration";

const TARGET_OZ = 64;
const QUICK_ADDS = [8, 12, 16, 24, 34] as const;

export default function LogHydration() {
  const navigate = useNavigate();
  const [oz, setOz] = useState<number>(0);
  const [step] = useState<number>(8);

  useEffect(() => {
    setOz(getWaterToday());
  }, []);

  const fillPct = Math.min(oz / TARGET_OZ, 1);

  const handleSave = () => {
    setWaterToday(oz);
    toast.success(`Water updated to ${oz}oz`, {
      description:
        oz >= TARGET_OZ
          ? "Goal hit! Nice work."
          : `${TARGET_OZ - oz}oz to your daily goal`,
    });
    navigate(-1);
  };

  return (
    <div className="flex min-h-screen flex-col px-5 pb-6 pt-12">
      {/* Header */}
      <header className="relative flex items-center justify-center pb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors active:bg-muted"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Water Log
        </h1>
      </header>

      {/* Glass card */}
      <div className="rounded-3xl bg-muted/40 p-6">
        <div className="flex items-center gap-2">
          <Droplet
            className="h-5 w-5 text-sky-500"
            fill="currentColor"
            strokeWidth={1.5}
          />
          <span className="text-base font-bold text-foreground">Water</span>
        </div>

        <div className="mt-4 flex justify-center">
          <GlassVisual oz={oz} fillPct={fillPct} />
        </div>

        <div className="mt-6 flex items-center justify-center gap-5">
          <CounterBtn
            onClick={() => setOz((v) => Math.max(0, v - step))}
            icon={<Minus className="h-4 w-4" />}
          />
          <span className="min-w-[3rem] text-center text-base font-semibold text-foreground">
            {step}oz
          </span>
          <CounterBtn
            onClick={() => setOz((v) => v + step)}
            icon={<Plus className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Quick add */}
      <section className="mt-6">
        <h2 className="text-lg font-bold text-foreground">Quick Add</h2>
        <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {QUICK_ADDS.map((q, i) => (
            <button
              key={q}
              type="button"
              onClick={() => setOz((v) => v + q)}
              className="flex h-[100px] w-[88px] shrink-0 flex-col items-center justify-end gap-2 rounded-2xl bg-muted/40 p-3 transition-colors active:bg-muted/70"
            >
              <QuickAddIcon variant={i} />
              <span className="text-sm font-medium text-muted-foreground">
                + {q}oz
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Update CTA */}
      <button
        type="button"
        onClick={handleSave}
        className="mt-auto w-full rounded-full bg-ink py-4 text-base font-semibold text-white transition-transform active:scale-[0.98]"
      >
        Update
      </button>
    </div>
  );
}

/* ----- Subcomponents ----- */

function GlassVisual({ oz, fillPct }: { oz: number; fillPct: number }) {
  return (
    <div className="relative h-56 w-44">
      {/* Glass outline (trapezoid shape via clipping) */}
      <svg
        viewBox="0 0 180 230"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <clipPath id="glass-inside">
            <path d="M 24 16 Q 24 14 26 14 L 154 14 Q 156 14 156 16 L 146 210 Q 146 214 142 214 L 38 214 Q 34 214 34 210 Z" />
          </clipPath>
        </defs>

        {/* Glass body */}
        <path
          d="M 22 14 Q 22 8 28 8 L 152 8 Q 158 8 158 14 L 148 214 Q 148 220 142 220 L 38 220 Q 32 220 32 214 Z"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        {/* Water fill */}
        <g clipPath="url(#glass-inside)">
          <rect
            x="0"
            y={230 - fillPct * 200}
            width="180"
            height="230"
            fill="#7CC4F2"
          />
        </g>
      </svg>

      {/* Big oz number */}
      <div className="absolute inset-0 flex items-center justify-center pb-12">
        <span className="text-5xl font-bold text-ink">{oz}oz</span>
      </div>
    </div>
  );
}

function CounterBtn({
  onClick,
  icon,
}: {
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/70 active:scale-95"
    >
      {icon}
    </button>
  );
}

function QuickAddIcon({ variant }: { variant: number }) {
  // Five vessel illustrations of escalating size: 8 / 12 / 16 / 24 / 34 oz
  // Simple SVG cups/glasses/bottles
  const sky = "#7CC4F2";
  const stroke = "hsl(var(--border))";

  switch (variant) {
    case 0:
      // Small glass
      return (
        <svg viewBox="0 0 48 56" className="h-12 w-10" aria-hidden>
          <path
            d="M 10 8 L 38 8 L 35 50 Q 35 54 31 54 L 17 54 Q 13 54 13 50 Z"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M 13 38 L 35 38 L 33 50 Q 33 52 31 52 L 17 52 Q 15 52 15 50 Z"
            fill={sky}
          />
        </svg>
      );
    case 1:
      // Mug
      return (
        <svg viewBox="0 0 48 56" className="h-12 w-12" aria-hidden>
          <path
            d="M 8 14 L 36 14 L 36 50 Q 36 54 32 54 L 12 54 Q 8 54 8 50 Z"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Handle */}
          <path
            d="M 36 22 Q 44 22 44 32 Q 44 42 36 42"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect x="10" y="30" width="24" height="22" rx="1" fill={sky} />
        </svg>
      );
    case 2:
      // Bottle
      return (
        <svg viewBox="0 0 48 56" className="h-12 w-8" aria-hidden>
          <path d="M 18 4 L 30 4 L 30 12" fill="none" stroke={stroke} strokeWidth="2" />
          <path
            d="M 30 12 Q 36 18 36 26 L 36 50 Q 36 54 32 54 L 16 54 Q 12 54 12 50 L 12 26 Q 12 18 18 12 Z"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <rect x="14" y="28" width="20" height="24" rx="1" fill={sky} />
        </svg>
      );
    case 3:
      // Shaker
      return (
        <svg viewBox="0 0 48 56" className="h-12 w-10" aria-hidden>
          <path d="M 14 6 L 34 6 L 34 12 L 14 12 Z" fill="none" stroke={stroke} strokeWidth="2" />
          <path
            d="M 10 12 L 38 12 L 36 50 Q 36 54 32 54 L 16 54 Q 12 54 12 50 Z"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Tick marks */}
          <line x1="13" y1="22" x2="17" y2="22" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="13" y1="30" x2="17" y2="30" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="13" y1="38" x2="17" y2="38" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <rect x="12" y="22" width="24" height="30" rx="1" fill={sky} />
        </svg>
      );
    default:
      // Big bottle / pitcher
      return (
        <svg viewBox="0 0 48 56" className="h-12 w-11" aria-hidden>
          <path d="M 16 4 L 32 4 L 32 10 L 16 10 Z" fill="none" stroke={stroke} strokeWidth="2" />
          <path
            d="M 8 14 L 40 14 L 38 50 Q 38 54 34 54 L 14 54 Q 10 54 10 50 Z"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <rect x="10" y="18" width="28" height="34" rx="1" fill={sky} />
        </svg>
      );
  }
}
