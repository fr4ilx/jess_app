# PandaWell — Claude context

A nutrition + medication tracking app for adults on GLP-1 medications (Ozempic, Wegovy, Mounjaro, Zepbound). Audience skews 30+, so design favors plain language, large readable type, and minimal cognitive load. Brand voice is warm/conversational with serif italic accents.

## Stack

- **Vite + React 18 + TypeScript** (`src/`)
- **Tailwind CSS** + **shadcn/ui** (Radix primitives) in `src/components/ui/`
- **React Router v6** — routes registered in [src/App.tsx](src/App.tsx)
- **TanStack Query** for server state
- **Supabase** for auth + data ([src/integrations/supabase/](src/integrations/supabase/)), edge functions for AI (`detect-foods`, `panda-chat`)
- **Recharts** available but only lightly used so far
- **Framer Motion** for transitions
- **Sonner** for toasts
- Deployed on **Vercel** (project `panda-ai`, `.vercel/project.json` linked). Live: https://panda-ai-pearl.vercel.app

## Commands

```bash
npm run dev      # vite, default port 8080
npm run build    # production build
npm run lint     # eslint
npm run test     # vitest run
vercel --prod    # deploy to production (project already linked)
```

When running the dev server through `preview_start`, the launch config is `vite-dev` in `.claude/launch.json`.

## Routing map

Top-level routes in [src/App.tsx](src/App.tsx):

- `/` → `Splash` (1.8s timer, redirects to `/welcome`)
- `/welcome`, `/signup`, `/login` — auth/entry
- `/onboarding/intro/{photos,medication,food,insights,targets}` — App Store-style intro carousel (sage palette, serif italic headlines)
- `/onboarding/{name,age,sex,height,weight,activity,glp1,glp1-details,targets}` — data-collection (wrapped in `OnboardingLayout` with top progress bar)
- `/onboarding/welcome-panda` — celebratory finish, no layout
- `/today` — **Home** (PandaWell header, nutrition bento, medication + weight + other macros)
- `/insights` — Progress (currently the old WeeklyInsights — slated to absorb medication chart + weight trend from Home)
- `/add-meal` — meal photo + macro logging
- `/coach` — Panda AI chat (full page; replaced the floating drag-and-drop chat button)
- `/log-shot` — GLP-1 dose entry (medication / dose chips / datetime / injection site)
- `/log-weight` — daily weigh-in entry
- `/profile` — profile editor
- `/meal/:id` — meal detail

`BottomNav` ([src/components/BottomNav.tsx](src/components/BottomNav.tsx)) is hidden on auth/onboarding/meal-detail routes via `HIDDEN_EXACT` / `HIDDEN_PREFIXES`.

## Navigation pattern

Four tabs + a center FAB:

- **Home** (/today), **Progress** (/insights), **Coach** (/coach), **Profile** (/profile)
- Center dark **+** FAB opens a Quick log sheet (no title, just icon rows): Scan Food → `/add-meal`, Log a shot → `/log-shot`, Search Food → `/add-meal`, Add Today's Weight → `/log-weight`
- Sheet slides up from the bottom of the screen, rounded only on top

## Design system

CSS variables in [src/index.css](src/index.css):

- **Primary sage**: `--primary: 145 25% 42%` (HSL). Use `text-primary` / `bg-primary`
- **Background**: warm cream (`40 30% 97%`) with a fixed sage + peach radial-gradient glow applied to `body` — pages should NOT set `bg-background`, they're transparent
- **Blob accents**: `--blob-sage` (`145 35% 85%`), `--blob-peach` (`25 80% 92%`) — used for soft tints on chips and widgets
- **Ink**: `--ink: 150 35% 10%` — the near-black used for CTAs, primary text on light cards, and the FAB
- **Fonts**:
  - `font-display` → DM Sans (UI bold / numerals)
  - `font-body` → Inter (default)
  - `font-serif` → Fraunces (italic display accents — "*transformation*", "*a dose*", greeting names)
- **Macro tokens**: `--macro-protein`, `--macro-carbs`, `--macro-fat`, `--macro-fiber`, `--macro-saturated-fat`, `--macro-sodium`, `--macro-added-sugars`, `--macro-calories` — used for ring + bar colors. Available as Tailwind classes `bg-macro-*` / `text-macro-*`.
- **Card style**: `rounded-3xl bg-white/80 backdrop-blur` + soft shadow. Don't put solid `bg-background` on page wrappers — it covers the glow.
- **`.bottom-nav-safe`** utility adds `padding-bottom: env(safe-area-inset-bottom) + 6.5rem` so save CTAs clear the FAB.

## Data hooks

- [useCurrentProfile](src/hooks/useCurrentProfile.ts) — merges local + server profile. Exposes `name`, `weight_kg`, `glp1.{ medication, dose_mg, schedule, startedAt }`, `dailyTargets`, `hasProfileData`
- [useMealsToday](src/hooks/useMealsToday.ts) + `getDailyTotals(meals)` in [src/lib/nutrition.ts](src/lib/nutrition.ts) — accumulates today's macros: calories, protein, carbs, fat, satFat, sodium, fiber, addedSugars

No tables yet for **shot history** or **weight log**. The `/log-shot` and `/log-weight` pages currently toast + `navigate(-1)` with a `// TODO: persist to Supabase` comment. Medication chart on Home uses a `MOCK_MED_LEVELS` constant in [src/pages/Today.tsx](src/pages/Today.tsx).

## Component conventions

- Reusable form pieces in [src/components/onboarding/](src/components/onboarding/) — `PrimaryCta`, `PillButton`, `CardButton`, `BackButton`, `StepIndicator`, `ProgressBar`, `FadeIn`, `TextField`, `PandaLogo`
- Intro carousel widgets in [src/components/onboarding/intro/](src/components/onboarding/intro/) — `IntroScreen` (layout), `PaginationDots`, plus five mock-widget components
- shadcn/ui primitives in [src/components/ui/](src/components/ui/) — only override via the `className` prop; the components already merge classes with `cn()` (tailwind-merge)

When adding a new page that scrolls and has a save button, use `bottom-nav-safe` instead of `pb-N` (Tailwind utilities will override the safe padding).

## What's intentionally NOT here

- **No remote git** — Vercel deploys from `vercel --prod` CLI, not git push. If you set up a GitHub remote later, Vercel can be reconnected via the dashboard.
- **No Floating Panda chat bubble** — removed; the chat is now `/coach`. Don't reintroduce a draggable floating button.
- **Brainstorm artifacts** under `.superpowers/` are git-ignored.

## Known follow-ups (in priority order)

1. Wire `/log-shot` and `/log-weight` to Supabase tables (currently toast-only)
2. Replace the Home `MOCK_MED_LEVELS` with real dose decay calc from `glp1_start_date` + `glp1_schedule` + actual shot history
3. Migrate Medication chart + Current Weight off Home onto `/insights` (Progress tab) — Home should be a status check, not a dashboard
4. Hydration + extra-fiber persistence (currently `useState`; needs localStorage or Supabase)
5. There's a paused redesign plan at `/Users/syeo/.claude/plans/this-kind-of-feels-enumerated-hummingbird.md` proposing a single combined nutrition widget — revisit if the multi-card Home still feels overwhelming.

## Working style notes

- Plan-mode-driven design conversations have happened via `superpowers:brainstorming`; mockups land in `.superpowers/brainstorm/*/content/` and the browser companion runs on a random port.
- When testing UI changes, use the `mcp__Claude_Preview__*` tools — `preview_start` `vite-dev`, then `preview_screenshot` at 375×812 mobile preset.
