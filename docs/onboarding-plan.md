# CardioNutriSnap — Onboarding Flow Plan

## Context

CardioNutriSnap is a mobile-first PWA for cardiometabolic nutrition tracking with optional GLP-1 medication support. The codebase is scaffolded but has **no auth UI, no profile persistence, no migrations, and no onboarding**. Today, [Dashboard](../src/pages/Dashboard.tsx) and [Profile](../src/pages/Profile.tsx) read from `sampleProfile` / `sampleMeals` in [src/lib/nutrition.ts](../src/lib/nutrition.ts); `AddMeal`'s confirm step just `navigate('/')`. Supabase client persists session to localStorage but is otherwise unused.

To ship a usable product (and pass App Store review), the app needs a real `signup → onboarding → /app/*` flow that captures medical context (date of birth, sex at birth, body metrics, activity, goal, GLP-1 medication context, cardiovascular conditions, comorbidities, other meds, dietary restrictions, food allergies, target overrides) and gates `/app/*` until complete.

**Why this matters:** medical onboarding takes 3–5 minutes; users will bail mid-flow. The plan optimizes for **resumability** (write to `profiles` per step, server is source of truth), **type-safe validation** (zod per step), and **visual consistency** with the existing AddMeal/Profile/Dashboard style (mobile column, framer-motion transitions, glass-card surfaces).

---

## 0. Design System References (read first)

This plan covers **architecture, data, validation, navigation logic, and tests.** All **visual rules** — Tailwind class strings, color tokens, motion timing, spacing — live in the design-system files:

- **[`design-system/MASTER.md`](../design-system/MASTER.md)** — global design language as currently shipped.
- **[`design-system/pages/onboarding.md`](../design-system/pages/onboarding.md)** — onboarding-specific page guidance.

**Match the existing style exactly.** The Dashboard / AddMeal / Profile patterns (mobile column, glass-card surfaces, framer-motion `y:20 → 0` transitions, emoji meal-type signifiers, current macro colors) are canonical. Any accessibility improvements that affect appearance (focus tokens, on-surface text colors, lucide-instead-of-emoji) are tracked in MASTER §13 as recommendations but **are not gates for this work** — defer them.

The inline `className` examples in §2 below are illustrative of *behavior* (selected state, layout); for canonical strings always defer to the design-system files.

---

## 1. Route Structure

### 1.1 New route table (in [src/App.tsx](../src/App.tsx))

The existing flat routes (`/`, `/add-meal`, `/insights`, `/profile`, `/meal/:id`) move under `/app/*`. New top-level groups:

```
PUBLIC
  /signup
  /login

ONBOARDING (auth required, onboarding incomplete)
  /onboarding/welcome
  /onboarding/profile
  /onboarding/glp1-question
  /onboarding/medication
  /onboarding/cardiac
  /onboarding/goals
  /onboarding/done

APP (auth required, onboarding complete)
  /app/today              [was /]
  /app/add-meal           [was /add-meal]
  /app/insights           [was /insights]
  /app/profile            [was /profile]
  /app/meal/:id           [was /meal/:id]

REDIRECTS / FALLBACK
  /                       → resolves via auth + onboarding state
  *                       → NotFound
```

Use **react-router-dom v6 nested routes** so the OnboardingLayout doesn't unmount on step navigation (preserves AnimatePresence cross-fades):

```tsx
<Routes>
  <Route path="/" element={<RootRedirect />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/login" element={<Login />} />

  <Route element={<RequireAuth />}>
    <Route element={<RequireOnboardingPending />}>
      <Route element={<OnboardingLayout />}>
        <Route path="/onboarding/welcome" element={<Welcome />} />
        <Route path="/onboarding/profile" element={<ProfileStep />} />
        <Route path="/onboarding/glp1-question" element={<Glp1Question />} />
        <Route path="/onboarding/medication" element={<MedicationStep />} />
        <Route path="/onboarding/cardiac" element={<CardiacStep />} />
        <Route path="/onboarding/goals" element={<GoalsStep />} />
        <Route path="/onboarding/done" element={<Done />} />
      </Route>
    </Route>

    <Route element={<RequireOnboarding />}>
      <Route path="/app/today" element={<Dashboard />} />
      <Route path="/app/add-meal" element={<AddMeal />} />
      <Route path="/app/insights" element={<WeeklyInsights />} />
      <Route path="/app/profile" element={<Profile />} />
      <Route path="/app/meal/:id" element={<MealDetail />} />
    </Route>
  </Route>

  <Route path="*" element={<NotFound />} />
</Routes>
```

Wrap the whole tree in a new `<AuthProvider>` mounted between `QueryClientProvider` and `BrowserRouter`.

### 1.2 New files

```
src/pages/auth/Signup.tsx
src/pages/auth/Login.tsx
src/pages/auth/RootRedirect.tsx          // resolves "/" by auth + onboarding state
src/pages/onboarding/Welcome.tsx
src/pages/onboarding/ProfileStep.tsx
src/pages/onboarding/Glp1Question.tsx
src/pages/onboarding/MedicationStep.tsx
src/pages/onboarding/CardiacStep.tsx
src/pages/onboarding/GoalsStep.tsx
src/pages/onboarding/Done.tsx

src/components/onboarding/OnboardingLayout.tsx
src/components/onboarding/StepIndicator.tsx
src/components/onboarding/StepFooter.tsx
src/components/onboarding/MultiSelectChips.tsx
src/components/onboarding/RadioCardGroup.tsx
src/components/onboarding/FullScreenSpinner.tsx

src/components/auth/AuthProvider.tsx
src/components/auth/RequireAuth.tsx
src/components/auth/RequireOnboarding.tsx
src/components/auth/RequireOnboardingPending.tsx

src/lib/onboarding/schemas.ts
src/lib/onboarding/steps.ts
src/lib/onboarding/resolveStep.ts
src/lib/onboarding/profileMapping.ts
src/lib/onboarding/options.ts             // curated lists for chips

src/hooks/useAuth.ts
src/hooks/useProfile.ts
src/hooks/useUpdateProfile.ts
```

---

## 2. Component Hierarchy

### 2.1 OnboardingLayout

`src/components/onboarding/OnboardingLayout.tsx` — parent route element; mounts once, persists across step nav.

```tsx
<div className="min-h-screen bg-background">
  <div className="px-5 pt-12 pb-2 flex items-center gap-3">
    <BackButton />                        {/* hidden on welcome + done */}
    <h1 className="text-xl font-bold font-display">Set up your profile</h1>
  </div>
  <StepIndicator />
  <AnimatePresence mode="wait">
    <Outlet />                            {/* each step is a keyed motion.div */}
  </AnimatePresence>
</div>
```

Each step page wraps its content in:

```tsx
<motion.div
  key={location.pathname}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  className="px-5"
>
```

This mirrors the AddMeal step machine exactly.

### 2.2 StepIndicator

`src/components/onboarding/StepIndicator.tsx`

- Reads current step from `useLocation().pathname` and step list from `getVisibleSteps(profile)` in [steps.ts](#5-conditional-flow-handling).
- Renders 5–6 pill segments (welcome and done are excluded from the visible count); past + current are `bg-primary`, future are `bg-secondary`.
- Hides the medication pill dynamically when `profile.glp1_medication === null`.

```tsx
type Props = { current: OnboardingRoute; profile: ProfileRow | null };
```

### 2.3 StepFooter

`src/components/onboarding/StepFooter.tsx` — pinned-bottom CTA row used by every step except welcome and done.

```tsx
type Props = {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;        // default "Continue"; "Finish" on goals
  nextDisabled?: boolean;
  isPending?: boolean;       // shows Loader2 from lucide-react
};
```

Visual: full-width primary button (`bg-primary text-primary-foreground rounded-xl py-3.5`) for Next, ghost button for Back. Matches the AddMeal "Confirm Meal" button style.

### 2.4 RadioCardGroup

`src/components/onboarding/RadioCardGroup.tsx` — used for sex at birth, activity level, goal, GLP-1 yes/no, medication name, schedule.

```tsx
type Option = { value: string; label: string; description?: string; emoji?: string };
type Props = { options: Option[]; value: string; onChange: (v: string) => void };
```

Visual: stacked `glass-card rounded-2xl p-4 cursor-pointer` cards; selected adds `ring-2 ring-primary`. Wraps shadcn [RadioGroup](../src/components/ui/radio-group.tsx) for keyboard a11y.

### 2.5 MultiSelectChips

`src/components/onboarding/MultiSelectChips.tsx` — used for cardiac arrays.

```tsx
type Props = {
  options: string[];                 // curated; from src/lib/onboarding/options.ts
  value: string[];
  onChange: (v: string[]) => void;
  allowCustom?: boolean;             // exposes inline Input "Add other..."
  placeholder?: string;
};
```

Visual: chip cloud — selected chips `bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-sm`, unselected `bg-secondary text-secondary-foreground` with same shape. When `allowCustom`, an `Input` with Enter-to-add appears under the cloud.

### 2.6 Step pages — common shape

Each step page follows this skeleton (Welcome/Done diverge):

```tsx
export default function ProfileStep() {
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const update = useUpdateProfile();
  const form = useForm<ProfileStepInput>({
    resolver: zodResolver(profileStepSchema),
    defaultValues: profileRowToFormDefaults(profile).profile,
  });

  const onSubmit = async (input: ProfileStepInput) => {
    await update.mutateAsync(profileStepToPatch(input));
    navigate('/onboarding/' + getNextStep('profile', { ...profile, ...profileStepToPatch(input) }));
  };

  return (
    <motion.div ...>
      <Form {...form}>{/* shadcn Form/FormField for each control */}</Form>
      <StepFooter
        onBack={() => navigate('/onboarding/' + getPreviousStep('profile', profile)!)}
        onNext={form.handleSubmit(onSubmit)}
        isPending={update.isPending}
        nextDisabled={!form.formState.isValid}
      />
    </motion.div>
  );
}
```

- **Welcome:** no form, single CTA. Mirrors AddMeal's `upload` step visual (large icon, headline, subhead).
- **ProfileStep:** [Calendar](../src/components/ui/calendar.tsx) for DOB (in a [Popover](../src/components/ui/popover.tsx)), [Input type="number"](../src/components/ui/input.tsx) for height/weight, RadioCardGroup for sex/activity/goal.
- **Glp1Question:** single RadioCardGroup with two options (Yes — emoji 💉; No — emoji ❌).
- **MedicationStep:** RadioCardGroup for medication (semaglutide / tirzepatide / liraglutide / other), Input for brand override + dose, Calendar for start date, RadioCardGroup for schedule.
- **CardiacStep:** five MultiSelectChips blocks separated by `<Separator>`, each labeled with `text-sm font-semibold font-display mb-2`.
- **GoalsStep:** reuses [MacroRing](../src/components/MacroRing.tsx) and [MacroBar](../src/components/MacroBar.tsx) to show computed targets from `calculateTargets()`. A "Customize targets" toggle (shadcn [Switch](../src/components/ui/switch.tsx)) reveals Inputs for overrides.
- **Done:** mirrors AddMeal's confirm step (spring-scaled Check icon, "All set!", auto-navigate to `/app/today` after 1.5s).

### 2.7 Auth pages

`src/pages/auth/Signup.tsx` and `Login.tsx` — single shadcn `Card` centered in `min-h-screen`, email + password fields, primary button. After signup, `signUp()` then `navigate('/onboarding/welcome')`. After login, `signIn()` then `navigate('/')` and let `<RootRedirect>` resolve where they go.

---

## 3. State Management

### 3.1 Recommendation: per-step Supabase write + TanStack Query cache + react-hook-form per step

```
react-hook-form (in-step edits)
   └── on submit ──► useUpdateProfile() ──► supabase.from('profiles').update(...)
                                     │
                                     └── invalidates ──► useProfile() cache
                                                              │
                                                              └── feeds defaults of next step
```

### 3.2 Why this beats the alternatives

| Approach | Verdict | Reason |
|---|---|---|
| **Per-step Supabase write + Query cache** | ✅ chosen | Single source of truth = `profiles` row. Resumable cross-device. Optimistic updates make navigation feel instant. |
| Single in-memory React Context, batch flush at /done | ❌ | Loses everything on refresh. Cross-device resume impossible. Medical data sitting in memory then flushed at the end is the worst kind of partial state. |
| localStorage only | ❌ | Cross-device bail/resume impossible. Plaintext PHI in localStorage is a compliance smell. |
| Hybrid (localStorage + final flush) | ❌ | Adds complexity without solving cross-device. |

### 3.3 Hook contracts

```ts
// src/hooks/useAuth.ts
export function useAuth(): {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signUp(email: string, password: string): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
};
// Backed by AuthProvider; subscribes once to supabase.auth.onAuthStateChange.
```

```ts
// src/hooks/useProfile.ts
export function useProfile(): UseQueryResult<ProfileRow | null>;
// queryKey: ['profile', userId]
// queryFn: supabase.from('profiles').select('*').eq('id', userId).single()
// staleTime: 30_000
// enabled: !!userId
// retry: 3 (handles signup-trigger race; see edge case 7)
```

```ts
// src/hooks/useUpdateProfile.ts
export function useUpdateProfile(): UseMutationResult<ProfileRow, PostgrestError, Partial<ProfileRow>>;
// onMutate: optimistically merge patch into cached profile
// onSuccess: setQueryData(['profile', userId], updated)
// onError: rollback + sonner toast
```

### 3.4 No global onboarding context

A single `useProfile()` query is sufficient — there's no in-memory "draft" state to share. This avoids prop-drilling and prevents duplicate sources of truth.

---

## 4. Validation

### 4.1 Schemas — `src/lib/onboarding/schemas.ts`

Operate on the **TypeScript view** (camelCase). DB-column conversion lives in `profileMapping.ts` (§8.4).

```ts
import { z } from "zod";

export const profileStepSchema = z.object({
  dateOfBirth: z.string().refine(isValidPastDate, "Enter a valid date"),
  sexAtBirth: z.enum(["male", "female", "intersex", "prefer_not_to_say"]),
  heightCm: z.number().int().min(80).max(250),
  weightKg: z.number().min(25).max(400),
  activityLevel: z.enum(["sedentary", "light", "moderate", "high"]),
  goal: z.enum(["lose", "maintain", "gain"]),
});

export const glp1QuestionSchema = z.object({
  onGlp1: z.boolean(),
});

export const medicationStepSchema = z.object({
  glp1Medication: z.enum(["semaglutide", "tirzepatide", "liraglutide", "other"]),
  glp1Brand: z.string().min(1).max(100).optional(),
  glp1DoseMg: z.number().positive().max(50),
  glp1StartDate: z.string().refine(isValidPastDate, "Enter a valid date"),
  glp1Schedule: z.enum(["daily", "weekly", "biweekly", "monthly"]),
});

export const cardiacStepSchema = z.object({
  cardiovascularConditions: z.array(z.string()).max(20),
  comorbidities:            z.array(z.string()).max(20),
  otherMedications:         z.array(z.string()).max(40),
  dietaryRestrictions:      z.array(z.string()).max(20),
  foodAllergies:            z.array(z.string()).max(40),
});

export const goalsStepSchema = z.object({
  customCalories:     z.number().int().positive().optional(),
  customProtein:      z.number().int().positive().optional(),
  customCarbs:        z.number().int().positive().optional(),
  customFat:          z.number().int().positive().optional(),
  customSaturatedFat: z.number().int().positive().optional(),
  customSodium:       z.number().int().positive().optional(),
  customFiber:        z.number().int().positive().optional(),
  customAddedSugars:  z.number().int().positive().optional(),
});

export type ProfileStepInput     = z.infer<typeof profileStepSchema>;
export type Glp1QuestionInput    = z.infer<typeof glp1QuestionSchema>;
export type MedicationStepInput  = z.infer<typeof medicationStepSchema>;
export type CardiacStepInput     = z.infer<typeof cardiacStepSchema>;
export type GoalsStepInput       = z.infer<typeof goalsStepSchema>;
```

### 4.2 Derived "is complete" check

`onboarding_completed_at !== null` is the canonical signal. Per-step `safeParse` calls in `resolveOnboardingStep` (§6.1) act as belt-and-suspenders against partial corruption.

---

## 5. Conditional Flow Handling

### 5.1 Static route table; dynamic walker — `src/lib/onboarding/steps.ts`

```ts
export type OnboardingRoute =
  | "welcome" | "profile" | "glp1-question"
  | "medication" | "cardiac" | "goals" | "done";

export const ROUTE_ORDER: OnboardingRoute[] =
  ["welcome", "profile", "glp1-question", "medication", "cardiac", "goals", "done"];

export function getNextStep(current: OnboardingRoute, profile: ProfileRow): OnboardingRoute {
  const idx = ROUTE_ORDER.indexOf(current);
  let next = ROUTE_ORDER[idx + 1];
  if (next === "medication" && profile.glp1_medication === null) next = "cardiac";
  return next;
}

export function getPreviousStep(current: OnboardingRoute, profile: ProfileRow): OnboardingRoute | null {
  const idx = ROUTE_ORDER.indexOf(current);
  if (idx <= 0) return null;
  let prev = ROUTE_ORDER[idx - 1];
  if (prev === "medication" && profile.glp1_medication === null) prev = "glp1-question";
  return prev;
}

export function getVisibleSteps(profile: ProfileRow | null): OnboardingRoute[] {
  // For StepIndicator. Hide welcome and done from the indicator.
  const all: OnboardingRoute[] = ["profile", "glp1-question", "medication", "cardiac", "goals"];
  if (profile?.glp1_medication === null) return all.filter(s => s !== "medication");
  return all;
}
```

### 5.2 Forward navigation from `/onboarding/glp1-question`

User submits `onGlp1: false`:
1. `useUpdateProfile.mutateAsync({ glp1_medication: null, glp1_question_answered: true })`
2. `getNextStep('glp1-question', updatedProfile)` → `"cardiac"` (medication skipped)
3. `navigate('/onboarding/cardiac')`

User submits `onGlp1: true`:
1. `useUpdateProfile.mutateAsync({ glp1_medication: 'semaglutide', glp1_question_answered: true })` — `'semaglutide'` is the default; user refines on next step.
2. `getNextStep` → `"medication"`
3. `navigate('/onboarding/medication')`

### 5.3 Back from `/onboarding/cardiac`

Both paths converge at `/cardiac`. We do **not** rely on `navigate(-1)` — browser history is unreliable after refreshes/deep links. Instead, `StepFooter`'s onBack calls `getPreviousStep(currentStep, profile)`, which returns:

- `"medication"` when `glp1_medication !== null` (Yes branch)
- `"glp1-question"` when `glp1_medication === null` (No branch)

This is symmetric with `getNextStep` and works correctly on cold loads.

---

## 6. Resume Capability

### 6.1 `resolveOnboardingStep` — `src/lib/onboarding/resolveStep.ts`

```ts
export function resolveOnboardingStep(profile: ProfileRow | null): string {
  if (!profile) return "/onboarding/welcome";
  if (profile.onboarding_completed_at) return "/app/today";

  if (!profile.date_of_birth || !profile.sex_at_birth || !profile.height_cm
      || !profile.weight_kg || !profile.activity_level || !profile.goal) {
    return "/onboarding/profile";
  }

  if (!profile.glp1_question_answered) return "/onboarding/glp1-question";

  if (profile.glp1_medication !== null) {
    if (!profile.glp1_brand || profile.glp1_dose_mg == null
        || !profile.glp1_start_date || !profile.glp1_schedule) {
      return "/onboarding/medication";
    }
  }

  if (!profile.cardiac_step_completed_at) return "/onboarding/cardiac";
  if (!profile.goals_step_completed_at)   return "/onboarding/goals";

  return "/onboarding/done";
}
```

Signature: `(profile: ProfileRow | null) => string` (path).

### 6.2 Why `*_step_completed_at` markers

Cardiac arrays default to `'{}'` (empty) and goals overrides default to `NULL`. Without an explicit marker we can't distinguish "haven't reached this step" from "reached and submitted with empty selections." Two extra columns on `profiles` resolve this:

- `cardiac_step_completed_at timestamptz null`
- `goals_step_completed_at timestamptz null`

Same logic for GLP-1: `glp1_question_answered boolean default false` flips true on submission whether the answer is Yes or No. (See §11 Open Questions — these may need to be added to the migration if not already present.)

### 6.3 Welcome on resume

Welcome only fires for fresh accounts (`profile === null`, the trigger hasn't fired yet, or the profile is entirely blank). Once any required field is set, resume skips welcome.

---

## 7. Route Guards

### 7.1 `<RequireAuth />` — `src/components/auth/RequireAuth.tsx`

```tsx
export function RequireAuth() {
  const { session, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <FullScreenSpinner />;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
```

### 7.2 `<RequireOnboarding />` — gates `/app/*`

```tsx
export function RequireOnboarding() {
  const { isLoading: authLoading } = useAuth();
  const { data: profile, isLoading } = useProfile();
  if (authLoading || isLoading) return <FullScreenSpinner />;
  if (!profile?.onboarding_completed_at) {
    return <Navigate to={resolveOnboardingStep(profile ?? null)} replace />;
  }
  return <Outlet />;
}
```

### 7.3 `<RequireOnboardingPending />` — gates `/onboarding/*`

```tsx
export function RequireOnboardingPending() {
  const { data: profile, isLoading } = useProfile();
  if (isLoading) return <FullScreenSpinner />;
  if (profile?.onboarding_completed_at) return <Navigate to="/app/today" replace />;
  return <Outlet />;
}
```

### 7.4 `<RootRedirect />` for `/`

```tsx
export function RootRedirect() {
  const { session, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  if (authLoading || (session && profileLoading)) return <FullScreenSpinner />;
  if (!session) return <Navigate to="/login" replace />;
  if (!profile?.onboarding_completed_at)
    return <Navigate to={resolveOnboardingStep(profile ?? null)} replace />;
  return <Navigate to="/app/today" replace />;
}
```

### 7.5 Loop avoidance

- Never `<Navigate>` while loading; always render the spinner. This is the single most common source of redirect loops.
- Auth pages (`/signup`, `/login`) are not wrapped in any guard. They handle "already signed in" themselves with a one-way `<Navigate>` after auth resolves.
- The resolver returns a single canonical destination; the graph is acyclic: signed out → `/login`; signed in + incomplete → onboarding step (via resolver); signed in + complete → `/app/today`.

### 7.6 Spinner

`src/components/onboarding/FullScreenSpinner.tsx`: `min-h-screen bg-background flex items-center justify-center` with `<Loader2 className="w-6 h-6 animate-spin text-primary" />`. Reuses the visual idiom from AddMeal's "detecting" step.

---

## 8. Schema Interactions Per Step

### 8.1 Decision: **per-step writes** (not batched at /done)

Per-step writes are mandatory because §6 (resumability) depends on them. Batched-at-end is rejected — it would lose every byte of partial state on refresh.

### 8.2 Columns written per step

| Step | Columns set on `profiles` |
|---|---|
| `welcome` | (none — UI only) |
| `profile` | `date_of_birth`, `sex_at_birth`, `height_cm`, `weight_kg`, `activity_level`, `goal` |
| `glp1-question` | `glp1_medication` (text or null), `glp1_question_answered` (true) |
| `medication` | `glp1_medication` (refined), `glp1_brand`, `glp1_dose_mg`, `glp1_start_date`, `glp1_schedule` |
| `cardiac` | `cardiovascular_conditions`, `comorbidities`, `other_medications`, `dietary_restrictions`, `food_allergies`, `cardiac_step_completed_at = now()` |
| `goals` | `custom_calories_target`, `custom_protein_target`, `custom_carbs_target`, `custom_fat_target`, `custom_saturated_fat_target`, `custom_sodium_target`, `custom_fiber_target`, `custom_added_sugars_target`, `goals_step_completed_at = now()` |
| `done` | `onboarding_completed_at = now()` |

### 8.3 The `done` step

Set timestamps client-side via `new Date().toISOString()` for v1. A server-side `complete_onboarding()` Postgres function would be marginally better (avoids clock skew) but is overkill until we have evidence skew matters.

### 8.4 camelCase ↔ snake_case mapping — `src/lib/onboarding/profileMapping.ts`

Isolates DB column names from the component layer.

```ts
export function profileRowToFormDefaults(p: ProfileRow | null): {
  profile: Partial<ProfileStepInput>;
  glp1Question: Partial<Glp1QuestionInput>;
  medication: Partial<MedicationStepInput>;
  cardiac: Partial<CardiacStepInput>;
  goals: Partial<GoalsStepInput>;
};

export function profileStepToPatch(input: ProfileStepInput):       Partial<ProfileRow>;
export function glp1QuestionToPatch(input: Glp1QuestionInput):     Partial<ProfileRow>;
export function medicationStepToPatch(input: MedicationStepInput): Partial<ProfileRow>;
export function cardiacStepToPatch(input: CardiacStepInput):       Partial<ProfileRow>;
export function goalsStepToPatch(input: GoalsStepInput):           Partial<ProfileRow>;

export function profileRowToUserProfile(p: ProfileRow): UserProfile; // bridges to existing nutrition.ts math
```

### 8.5 Reusing existing nutrition math

The goals step uses the existing `calculateTargets()` from [nutrition.ts](../src/lib/nutrition.ts) via `profileRowToUserProfile`. The current `UserProfile` interface uses `age: number`; the adapter converts `date_of_birth` → age. No changes to `nutrition.ts` itself.

---

## 9. Edge Cases

1. **User signs up but never starts onboarding.** Postgres trigger on `auth.users` insert creates the `profiles` row with all-null fields. Next sign-in: `RootRedirect` calls `resolveOnboardingStep(profile)` → `/onboarding/welcome` (fresh profile = welcome). They land there.

2. **User completes onboarding, edits Profile later, unsets GLP-1.** `onboarding_completed_at` is **sticky**; never re-set. The post-onboarding `/app/profile` editor handles GLP-1 as an inline edit (a sub-form revealed when `glp1_medication !== null`), not by re-running onboarding. This is by design — onboarding is a one-time information collection flow, not a state machine on profile mutations.

3. **User on partial onboarding signs out, signs back in.** Auth restores → `useProfile` fetches → `RootRedirect`/`RequireOnboarding` calls `resolveOnboardingStep` → returns the first incomplete step. The step's `useForm` defaults are populated from existing profile values via `profileRowToFormDefaults`, so they don't re-enter previously-saved data.

4. **User hits Back from `/onboarding/done`.** Two sub-cases:
   - **Before the 1.5s redirect fires:** they re-render Done. `useUpdateProfile` is idempotent — re-writing `onboarding_completed_at` is a no-op (or a same-timestamp overwrite, harmless).
   - **After the redirect fires:** browser history pops them back to `/onboarding/done`. `RequireOnboardingPending` now sees `onboarding_completed_at` set and forwards to `/app/today`. Brief flicker, no loop.

5. **Email is unverified.** Supabase sign-in succeeds without verification by default. **Recommendation: allow onboarding to proceed**, show a persistent "Verify your email" banner in `OnboardingLayout`. Blocking creates a 2-step modal hell that hurts conversion. Verification can be enforced later for sensitive features (clinician sharing, password reset). Configure Supabase auth: do not require email confirmation for first sign-in.

6. **Weak/no internet during a step.** The mutation's `onError` shows a sonner toast; react-hook-form preserves the form state. The Next button enters `isPending` (Loader2 + disabled). No data is lost — user retries. Optimistic updates roll back on failure.

7. **Race: profile row not yet inserted by signup trigger.** `useProfile`'s `.single()` returns `PGRST116` (zero rows). With `retry: 3` and exponential backoff (TanStack default), this resolves within ~2s. Show spinner during. After 3 failed retries, show error with manual retry CTA.

8. **User deep-links to `/onboarding/cardiac` without prerequisites.** Each step page calls `resolveOnboardingStep(profile)` on mount; if it returns a path other than the current one, redirect. Defense in depth against guard misconfiguration.

9. **Stale tab — user finishes onboarding in another tab.** On submit in the stale tab, `useUpdateProfile` succeeds, query invalidates, profile cache updates, `RequireOnboardingPending` re-evaluates, redirects to `/app/today`. No data loss; brief jump.

10. **User changes height/weight in `/app/profile` post-onboarding.** Daily targets recalculate via `calculateTargets()`. Custom overrides remain sticky (existing `nutrition.ts` behavior — preserved).

---

## 10. Test Plan

### 10.1 Unit (Vitest)

- `src/lib/onboarding/__tests__/schemas.test.ts`
  - `profileStepSchema` — happy path; each invalid field (DOB in future, height < 80, weight ≤ 25, bad enum) rejects with expected `ZodIssue.path`.
  - `medicationStepSchema` — dose ≤ 0 rejected; bad schedule enum rejected.
  - `cardiacStepSchema` — empty arrays accepted; >20-element rejected.
  - `goalsStepSchema` — all-undefined accepted; partial overrides accepted; negative numbers rejected.

- `src/lib/onboarding/__tests__/resolveStep.test.ts`
  - `null` → `/onboarding/welcome`
  - profile with `onboarding_completed_at` → `/app/today`
  - missing `date_of_birth` → `/onboarding/profile`
  - profile complete + `glp1_question_answered: false` → `/onboarding/glp1-question`
  - `glp1_medication: null` + cardiac done + goals done → `/onboarding/done`
  - `glp1_medication: 'semaglutide'` + missing `glp1_brand` → `/onboarding/medication`
  - `cardiac_step_completed_at: null` → `/onboarding/cardiac`

- `src/lib/onboarding/__tests__/steps.test.ts`
  - `getNextStep('glp1-question', { glp1_medication: null })` → `'cardiac'`
  - `getNextStep('glp1-question', { glp1_medication: 'semaglutide' })` → `'medication'`
  - `getPreviousStep('cardiac', { glp1_medication: null })` → `'glp1-question'`
  - `getPreviousStep('cardiac', { glp1_medication: 'semaglutide' })` → `'medication'`
  - `getVisibleSteps` excludes medication when `glp1_medication === null`

- `src/lib/onboarding/__tests__/profileMapping.test.ts`
  - Round-trip: `profileStepToPatch` then read columns matches DB schema.
  - `profileRowToUserProfile` — DOB-to-age math correct around year boundaries.

### 10.2 Component (Vitest + Testing Library)

Mock surface: stub `useAuth`, `useProfile`, `useUpdateProfile` via a test wrapper. The existing `src/test/setup.ts` already mocks `matchMedia`.

- `src/pages/onboarding/__tests__/ProfileStep.test.tsx` — renders, validation errors show on bad submit, valid submit calls `useUpdateProfile` with correct snake_case patch, navigates to `/onboarding/glp1-question`.
- `src/pages/onboarding/__tests__/Glp1Question.test.tsx` — Yes path mutates with default medication + navigates to `/onboarding/medication`; No path mutates with `glp1_medication: null` + navigates to `/onboarding/cardiac`.
- `src/pages/onboarding/__tests__/MedicationStep.test.tsx`
- `src/pages/onboarding/__tests__/CardiacStep.test.tsx` — chip selection toggles, custom-add via Enter works, submit sets `cardiac_step_completed_at`.
- `src/pages/onboarding/__tests__/GoalsStep.test.tsx` — computed targets render via MacroRing/MacroBar; toggle reveals overrides; override persists in patch.
- `src/components/auth/__tests__/RequireOnboarding.test.tsx` — redirects to resolver result when incomplete; renders Outlet when complete.

### 10.3 E2E (Playwright)

- `e2e/onboarding-glp1-yes.spec.ts` — sign up → walk every step (incl. medication) → land on `/app/today` → reload → still `/app/today`.
- `e2e/onboarding-glp1-no.spec.ts` — sign up → answer No on glp1-question → assert URL never equals `/onboarding/medication` during the run → land on `/app/today`.
- `e2e/onboarding-resume.spec.ts` — sign up, complete profile + glp1-question only → sign out → sign back in → assert URL becomes `/onboarding/medication` (Yes) or `/onboarding/cardiac` (No).

E2E uses a dedicated test Supabase project (or local `supabase start`) with the same migrations applied. Test users created/torn down per spec via the admin API.

---

## 11. Open Questions

1. **`glp1_medication` data type.** Plan assumes `text` (medication name; `null` = answered No). If migration defines it as `boolean`, change the §5/§6/§8 logic to `glp1_medication === false` and store medication name elsewhere. **Need confirmation.**

2. **Step-completion marker columns.** Plan adds `glp1_question_answered boolean default false`, `cardiac_step_completed_at timestamptz null`, `goals_step_completed_at timestamptz null` to `profiles`. They're necessary to distinguish "step skipped" from "step answered with empty arrays / no overrides." Can these be added to the migration?

3. **Curated lists vs. freeform** for `cardiovascular_conditions`, `comorbidities`, `other_medications`, `dietary_restrictions`, `food_allergies`. Plan recommends hardcoded curated lists in `src/lib/onboarding/options.ts` + freeform "Add other..." input. Move to a Supabase reference table only if lists become large/clinically maintained.

4. **Email verification gating.** Plan recommends allow-with-banner. Confirm.

5. **`/login` route.** Plan creates `Login.tsx` since resume requires it. Confirm this is in scope (or if it's being built in parallel work).

6. **Welcome step on resume.** Plan says welcome only fires for null profile (fresh account). Confirm — or do you want it skipped only after first completion?

7. **`glp1_schedule` value space.** Plan uses 4-value enum (`daily | weekly | biweekly | monthly`). Real-world: semaglutide injectable = weekly, oral = daily, liraglutide = daily, tirzepatide = weekly. Confirm enum is sufficient, or do you want freeform / alongside a "Custom" option?

8. **`glp1_medication` default on Yes.** When user clicks Yes on the question step, the plan stores `'semaglutide'` provisionally (refined on next step). Alternative: a `'pending'` sentinel string. Which?

9. **Profile editing post-onboarding.** Out of scope for this plan — `/app/profile` (current `Profile.tsx`) is local-state-only and will need a real Supabase-backed editor as a follow-up. Flagging.

10. **Existing routes during migration.** Plan moves `/`→`/app/today`. External bookmarks to old routes (`/add-meal`, `/insights`) won't redirect. Should top-level fallback redirects (e.g., `<Route path="/add-meal" element={<Navigate to="/app/add-meal" />} />`) be added? Probably yes for v1.

11. **Dark mode in v1?** The `.dark` palette in `src/index.css` and `next-themes` are both already installed, but no theme toggle exists. Three options: (a) ship dark mode now (add a toggle in `/app/profile`, ~30 min), (b) keep the dark tokens as dormant infrastructure for v1.1, (c) strip the unused dark-mode CSS to reduce surface area. **Recommendation: (b)** — onboarding doesn't need dark mode, and removing it costs more than leaving it.

---

## 12. Verification (post-implementation)

After approval and execution:

1. `npm run dev` → http://localhost:8080/signup
2. Sign up with a fresh email → assert redirect to `/onboarding/welcome`.
3. Walk GLP-1 = **Yes** branch end-to-end → confirm `/app/today` loads, banner gone.
4. Open Supabase dashboard → confirm `profiles` row reflects every column listed in §8.2 with the right values.
5. Sign out mid-flow on `/onboarding/cardiac`, sign back in → confirm resume to `/onboarding/cardiac`, form prefilled.
6. Sign up second account → answer GLP-1 = **No** → step indicator hides medication pill, navigation never visits `/onboarding/medication`.
7. Inspect Network tab on `/app/today`: a different user's `useProfile()` returns only their row (RLS sanity).
8. `npm test` → all unit + component tests green.
9. `npx playwright test` → all three e2e specs green.
10. Manual: hit Back from `/onboarding/done` → confirm forward-bounce to `/app/today` with no loop.

---

## 13. File-path summary (quick reference)

**Modified:**
- [src/App.tsx](../src/App.tsx) — new route table, AuthProvider wrap

**Created (under `src/`):**
- `pages/auth/{Signup,Login,RootRedirect}.tsx`
- `pages/onboarding/{Welcome,ProfileStep,Glp1Question,MedicationStep,CardiacStep,GoalsStep,Done}.tsx`
- `components/onboarding/{OnboardingLayout,StepIndicator,StepFooter,RadioCardGroup,MultiSelectChips,FullScreenSpinner}.tsx`
- `components/auth/{AuthProvider,RequireAuth,RequireOnboarding,RequireOnboardingPending}.tsx`
- `lib/onboarding/{schemas,steps,resolveStep,profileMapping,options}.ts`
- `hooks/{useAuth,useProfile,useUpdateProfile}.ts`

**Tests:**
- `src/lib/onboarding/__tests__/{schemas,resolveStep,steps,profileMapping}.test.ts`
- `src/pages/onboarding/__tests__/{ProfileStep,Glp1Question,MedicationStep,CardiacStep,GoalsStep}.test.tsx`
- `src/components/auth/__tests__/RequireOnboarding.test.tsx`
- `e2e/{onboarding-glp1-yes,onboarding-glp1-no,onboarding-resume}.spec.ts`

**Reused (no edits needed):**
- [`design-system/MASTER.md`](../design-system/MASTER.md) + [`design-system/pages/onboarding.md`](../design-system/pages/onboarding.md) — all visual rules
- [src/lib/nutrition.ts](../src/lib/nutrition.ts) — `calculateTargets`, `UserProfile`, `DailyTargets`
- [src/components/MacroRing.tsx](../src/components/MacroRing.tsx), [MacroBar.tsx](../src/components/MacroBar.tsx) — for goals step
- [src/components/ui/](../src/components/ui/) — Form/FormField, Input, Label, RadioGroup, Calendar, Popover, Switch, Separator, Card, Button
- [src/integrations/supabase/client.ts](../src/integrations/supabase/client.ts) — already configured

**Schema additions (potential — see §11.2):**
- `glp1_question_answered boolean default false not null`
- `cardiac_step_completed_at timestamptz null`
- `goals_step_completed_at timestamptz null`
