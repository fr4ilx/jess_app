import { useLocation, useNavigate } from "react-router-dom";
import { Home, PlusCircle, BarChart3, User } from "lucide-react";

const navItems = [
  { path: "/today", icon: Home, label: "Today" },
  { path: "/add-meal", icon: PlusCircle, label: "Add" },
  { path: "/insights", icon: BarChart3, label: "Insights" },
  { path: "/profile", icon: User, label: "Profile" },
];

// Paths where the bottom nav should NOT appear (entry/onboarding/auth/detail screens).
const HIDDEN_PREFIXES = ["/meal/", "/onboarding/"];
const HIDDEN_EXACT = new Set(["/", "/welcome", "/signup", "/login"]);

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (HIDDEN_EXACT.has(location.pathname)) return null;
  if (HIDDEN_PREFIXES.some((prefix) => location.pathname.startsWith(prefix))) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-t border-border/50 safe-bottom"
    >
      <div
        className="flex items-center justify-around h-16 max-w-lg mx-auto px-4"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
