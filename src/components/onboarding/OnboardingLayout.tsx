import { Outlet, useLocation } from "react-router-dom";
import { BackButton } from "@/components/onboarding/BackButton";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { StepIndicator } from "@/components/onboarding/StepIndicator";

const TOTAL_SECTIONS = 4;

// Each route → { section: 1..4 (which major step), local: 0..1 (progress within section).
// Older audience: the StepIndicator shows only major sections (1 of 4) so the
// flow doesn't feel marathon-like, while the progress bar advances smoothly
// across the single-input sub-screens.
const ROUTE_PROGRESS: Record<string, { section: number; local: number }> = {
  // Section 1 — About you (5 sub-screens)
  "/onboarding/name":         { section: 1, local: 0.2 },
  "/onboarding/age":          { section: 1, local: 0.4 },
  "/onboarding/sex":          { section: 1, local: 0.6 },
  "/onboarding/height":       { section: 1, local: 0.8 },
  "/onboarding/weight":       { section: 1, local: 1.0 },

  // Section 2 — Activity & goal
  "/onboarding/activity":     { section: 2, local: 1.0 },

  // Section 3 — GLP-1
  "/onboarding/glp1":         { section: 3, local: 0.4 },
  "/onboarding/glp1-details": { section: 3, local: 1.0 },

  // Section 4 — Targets review
  "/onboarding/targets":      { section: 4, local: 1.0 },
};

export function OnboardingLayout() {
  const location = useLocation();
  const info = ROUTE_PROGRESS[location.pathname];
  const overallProgress = info ? (info.section - 1 + info.local) / TOTAL_SECTIONS : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-5 pt-12 pb-2">
        <div className="flex items-center justify-between mb-3">
          <BackButton />
          {info && <StepIndicator current={info.section} total={TOTAL_SECTIONS} />}
          <div className="w-10 h-10" aria-hidden="true" />
        </div>
        {info && <ProgressBar value={overallProgress} />}
      </div>
      <Outlet />
    </div>
  );
}
