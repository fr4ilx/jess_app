// Same hide-list shape as src/components/BottomNav.tsx so visibility rules stay
// parallel between the bottom nav and the floating Panda.

const HIDDEN_EXACT = new Set(["/", "/welcome", "/signup", "/login"]);
const HIDDEN_PREFIXES = ["/onboarding/"];

export function shouldShowFloatingPanda(pathname: string): boolean {
  if (HIDDEN_EXACT.has(pathname)) return false;
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return false;
  return true;
}
