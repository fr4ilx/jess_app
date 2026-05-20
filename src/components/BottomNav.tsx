import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  TrendingUp,
  MessageCircle,
  User,
  Plus,
  Camera,
  Syringe,
  Droplets,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

type Item = { path: string; icon: typeof Home; label: string };

const LEFT: Item[] = [
  { path: "/today", icon: Home, label: "Home" },
  { path: "/insights", icon: TrendingUp, label: "Progress" },
];
const RIGHT: Item[] = [
  { path: "/coach", icon: MessageCircle, label: "Coach" },
  { path: "/profile", icon: User, label: "Profile" },
];

const HIDDEN_PREFIXES = ["/meal/", "/onboarding/"];
const HIDDEN_EXACT = new Set(["/", "/welcome", "/signup", "/login"]);

type QuickAction = {
  key: string;
  label: string;
  icon: typeof Home;
  tint: string;
  run: (nav: ReturnType<typeof useNavigate>) => void;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    key: "meal",
    label: "Add Meal",
    icon: Camera,
    tint: "bg-primary/15 text-primary",
    run: (nav) => nav("/add-meal"),
  },
  {
    key: "hydration",
    label: "Add Hydration",
    icon: Droplets,
    tint: "bg-sky-100 text-sky-600",
    run: () => toast.success("Added 8oz of water", { description: "Logged for today" }),
  },
  {
    key: "shot",
    label: "Add Shot",
    icon: Syringe,
    tint: "bg-blob-sage/70 text-primary",
    run: (nav) => nav("/log-shot"),
  },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (HIDDEN_EXACT.has(location.pathname)) return null;
  if (HIDDEN_PREFIXES.some((p) => location.pathname.startsWith(p))) return null;

  const renderTab = ({ path, icon: Icon, label }: Item) => {
    const active = location.pathname === path;
    return (
      <button
        key={path}
        onClick={() => navigate(path)}
        className="flex flex-1 flex-col items-center justify-center gap-1 py-2"
      >
        <span
          className={`flex h-9 w-12 items-center justify-center rounded-2xl transition-colors ${
            active ? "bg-muted" : ""
          }`}
        >
          <Icon
            className={`h-5 w-5 ${active ? "text-foreground" : "text-muted-foreground"}`}
            strokeWidth={active ? 2.4 : 1.8}
            fill={active ? "currentColor" : "none"}
          />
        </span>
        <span
          className={`text-[11px] ${
            active ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
          }`}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="relative mx-auto max-w-lg">
        {/* Notch cut-out behind the FAB */}
        <svg
          aria-hidden
          viewBox="0 0 200 80"
          preserveAspectRatio="none"
          className="absolute -top-[1px] left-1/2 h-20 w-[120px] -translate-x-1/2"
        >
          <path
            d="M0,30 Q0,0 30,0 Q60,0 70,15 Q85,40 100,40 Q115,40 130,15 Q140,0 170,0 Q200,0 200,30 L200,80 L0,80 Z"
            fill="hsl(var(--card))"
          />
        </svg>

        {/* Floating Add FAB */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label="Quick actions"
          className={`pointer-events-auto absolute left-1/2 -top-7 z-10 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-ink text-white shadow-[0_10px_25px_-8px_rgba(20,40,30,0.55)] transition-transform active:scale-95 ${
            sheetOpen ? "rotate-45" : ""
          } duration-200`}
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent
            side="bottom"
            className="rounded-t-3xl border-none bg-card p-0 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Quick log</SheetTitle>
            </SheetHeader>
            <div className="space-y-1 p-3">
              {QUICK_ACTIONS.map(({ key, label, icon: Icon, tint, run }) => (
                <button
                  key={key}
                  onClick={() => {
                    setSheetOpen(false);
                    run(navigate);
                  }}
                  className="flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-muted/60 active:bg-muted"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tint}`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className="text-base font-semibold text-foreground">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <nav
          className="pointer-events-auto bg-card/95 backdrop-blur-lg"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="flex h-16 items-center">
            {LEFT.map(renderTab)}
            <div className="w-16" aria-hidden />
            {RIGHT.map(renderTab)}
          </div>
        </nav>
      </div>
    </div>
  );
}
