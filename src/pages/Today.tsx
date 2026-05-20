import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Syringe,
  Scale,
  Check,
  Utensils,
  Flame,
  Sparkles,
} from "lucide-react";
import { DateSelector } from "@/components/DateSelector";
import { PandaLogo } from "@/components/onboarding/PandaLogo";
import { PrimaryCta } from "@/components/onboarding/PrimaryCta";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { useMealsToday } from "@/hooks/useMealsToday";

type DiaryEvent = {
  id: string;
  time: Date;
  kind: "meal" | "shot" | "weight";
  title: string;
  details: string;
  status?: string;
  imageUrl?: string;
  onClick?: () => void;
};

const HOUR_BUCKETS = [
  "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM",
  "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM",
  "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM",
];

const formatTimeOnly = (d: Date) => {
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${m} ${ampm}`;
};

const bucketLabelFor = (d: Date) => HOUR_BUCKETS[d.getHours()];

export default function Today() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  const { meals } = useMealsToday();

  // ---- Build unified diary event list ---------------------------------------
  const events: DiaryEvent[] = useMemo(() => {
    const all: DiaryEvent[] = [];

    // Meals — from real data
    meals.forEach((m) => {
      const time = parseTimeString(m.time);
      const foodList = m.foods?.join(", ");
      all.push({
        id: m.id,
        time,
        kind: "meal",
        title: foodList || (m.type ?? "Meal"),
        details: `${m.calories} cal · ${m.protein}g protein`,
        status: `Logged at ${m.time}`,
        imageUrl: m.imageUrl,
        onClick: () => navigate(`/meal/${m.id}`),
      });
    });

    // Mock shot entry — until shot history is persisted in Supabase
    if (profile.glp1?.medication) {
      const lastShotTime = new Date();
      lastShotTime.setHours(9, 0, 0, 0);
      const medName =
        profile.glp1.medication.charAt(0).toUpperCase() +
        profile.glp1.medication.slice(1);
      all.push({
        id: "mock-shot-1",
        time: lastShotTime,
        kind: "shot",
        title: medName,
        details: `${profile.glp1.dose_mg ?? 1.7} mg · Left abdomen`,
        status: `Logged at ${formatTimeOnly(lastShotTime)}`,
        onClick: () => navigate("/log-shot"),
      });
    }

    // Sort newest first
    return all.sort((a, b) => b.time.getTime() - a.time.getTime());
  }, [meals, profile.glp1, navigate]);

  // Group events by hour bucket
  const grouped = useMemo(() => {
    const groups: { label: string; events: DiaryEvent[] }[] = [];
    for (const event of events) {
      const label = bucketLabelFor(event.time);
      const last = groups[groups.length - 1];
      if (last && last.label === label) {
        last.events.push(event);
      } else {
        groups.push({ label, events: [event] });
      }
    }
    return groups;
  }, [events]);

  // No profile data yet — onboarding redirect
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

  return (
    <div className="min-h-screen bottom-nav-safe">
      {/* Sticky header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 space-y-3 bg-background/85 px-5 pb-3 pt-6 backdrop-blur-md"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PandaLogo size={40} />
            <span className="text-xl font-bold tracking-tight text-foreground">PandaWell</span>
          </div>
          <div className="flex items-center gap-1.5">
            <StreakBadge count={7} />
            <PointsBadge count={250} />
          </div>
        </div>
        <DateSelector />
      </motion.header>

      <div className="space-y-4 px-4 pt-4">

      {/* Diary list */}
      {grouped.length === 0 ? (
        <EmptyDiary />
      ) : (
        <div className="space-y-5 pt-2">
          {grouped.map((group) => (
            <section key={group.label} className="space-y-2">
              <h3 className="px-1 text-base font-bold text-foreground">{group.label}</h3>
              <div className="space-y-2">
                {group.events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

/* ----- Helpers ----- */

function parseTimeString(timeStr: string): Date {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  const d = new Date();
  if (!match) return d;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3]?.toUpperCase();
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  d.setHours(h, m, 0, 0);
  return d;
}

/* ----- Subcomponents ----- */

function StreakBadge({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 px-3 py-1.5 ring-1 ring-orange-200/60">
      <Flame
        className="h-4 w-4 text-orange-500"
        fill="currentColor"
        strokeWidth={1.5}
      />
      <span className="text-sm font-bold text-orange-700">{count}</span>
    </div>
  );
}

function PointsBadge({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-primary/15 to-primary/25 px-3 py-1.5 ring-1 ring-primary/30">
      <Sparkles
        className="h-4 w-4 text-primary"
        fill="currentColor"
        strokeWidth={1.5}
      />
      <span className="text-sm font-bold text-primary">{count}</span>
    </div>
  );
}

function EventCard({ event }: { event: DiaryEvent }) {
  return (
    <button
      type="button"
      onClick={event.onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-white/85 p-3 text-left shadow-[0_6px_18px_-10px_rgba(20,40,30,0.18)] backdrop-blur transition-colors hover:bg-white"
    >
      <EventIcon event={event} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-ink truncate">{event.title}</div>
        <div className="text-xs text-muted-foreground truncate">{event.details}</div>
        {event.status && (
          <div className="mt-0.5 text-[10px] text-muted-foreground/80">{event.status}</div>
        )}
      </div>
    </button>
  );
}

function EventIcon({ event }: { event: DiaryEvent }) {
  if (event.kind === "meal" && event.imageUrl) {
    return (
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
          <Check className="h-2.5 w-2.5" strokeWidth={3} />
        </div>
      </div>
    );
  }

  const config: Record<
    DiaryEvent["kind"],
    { Icon: typeof Utensils; bg: string; fg: string }
  > = {
    meal: { Icon: Utensils, bg: "bg-amber-100", fg: "text-amber-700" },
    shot: { Icon: Syringe, bg: "bg-primary/15", fg: "text-primary" },
    weight: { Icon: Scale, bg: "bg-blob-peach", fg: "text-accent-foreground" },
  };
  const { Icon, bg, fg } = config[event.kind];

  return (
    <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${bg}`}>
      <Icon className={`h-5 w-5 ${fg}`} />
      <div className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
        <Check className="h-2.5 w-2.5" strokeWidth={3} />
      </div>
    </div>
  );
}

function EmptyDiary() {
  return (
    <div className="flex flex-col items-center text-center px-5 pt-16">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Camera className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-lg font-bold text-foreground">Nothing logged yet</h2>
      <p className="mt-1 text-sm text-muted-foreground max-w-xs">
        Scan a meal or log a shot — entries will show up here in chronological order.
      </p>
    </div>
  );
}
