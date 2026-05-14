# Onboarding Flow — Design Overrides

> Page-specific overrides for `/onboarding/*` and `/signup` / `/login`. Read `design-system/MASTER.md` first — only the deltas below differ.

## Layout

- **No BottomNav.** Onboarding routes (`/onboarding/*`) sit outside the `/app/*` group; the bottom nav is not rendered.
- **Substitute `pb-8` for `bottom-nav-safe`** at the page container level. The shared `<OnboardingLayout />` already does this — step pages don't repeat it.
- **`<StepIndicator />` sits between the header and the step content** (px-5, mt-2, mb-4). Hidden on `/onboarding/welcome` and `/onboarding/done`.
- **Sticky CTA at the bottom** via `<StepFooter />`. Use `sticky bottom-0` with `bg-background/95 backdrop-blur-sm pt-3 pb-5 px-5 -mx-5` so primary action is always thumb-reachable.

## Header

Slightly different from the Master header — softer, since onboarding is a flow not a destination:

```tsx
<div className="flex items-center gap-3 px-5 pt-12 pb-2">
  {canGoBack && (
    <button onClick={onBack} className="p-1 text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
      <ArrowLeft className="w-5 h-5" />
    </button>
  )}
  <h1 className="text-xl font-bold font-display text-foreground">Set up your profile</h1>
</div>
```

The page-level h1 is "Set up your profile" (kept stable across all steps for orientation). Each step's own title is rendered as an `<h2 className="text-2xl font-bold font-display">` below the step indicator.

## Step transitions

Use the **AddMeal AnimatePresence pattern** exactly (Master §7.2). Keyed on `useLocation().pathname` so the `<Outlet />` cross-fades smoothly.

## Icons in onboarding

Match the existing app's convention: **emoji for content signifiers** (matching MealCard / AddMeal / WeeklyInsights), **lucide for chrome** (back arrows, search, chevrons). The original plan's 💉 / ❌ for `Glp1Question` is consistent with the rest of the app — keep them.

For `MedicationStep`, the medication *name* (semaglutide / tirzepatide / liraglutide / other) is the differentiator. No per-row icon is needed; let the radio-card selected state carry the visual.

## Forms

**All onboarding steps use shadcn `<Form>` + `<FormField>` + `<FormControl>` + `<FormLabel>` + `<FormMessage>` + `<zodResolver>`.** This is non-negotiable — it solves the label-input association, the `role="alert"` for errors, and keyboard focus management for free. Don't roll bespoke inputs.

## Step Indicator

```tsx
<div className="flex gap-1.5 px-5 mt-2 mb-4" role="progressbar" aria-valuenow={current} aria-valuemax={total}>
  {steps.map((step, i) => (
    <div
      key={step}
      className={cn(
        "h-1.5 flex-1 rounded-full transition-colors duration-300",
        i <= currentIdx ? "bg-primary" : "bg-secondary"
      )}
      aria-label={`Step ${i + 1} of ${total}`}
    />
  ))}
</div>
```

5 segments visible by default; 4 when the medication step is skipped (GLP-1 = No). The transition between 5 and 4 segments after the user answers the GLP-1 question should NOT animate the indicator itself — it just re-renders. The user's perception is "the bar updates as I progress," not "the bar morphs."

## RadioCardGroup

For sex at birth, activity level, goal, GLP-1 yes/no, medication name, schedule:

```tsx
<button
  type="button"
  onClick={() => onChange(option.value)}
  className={cn(
    "w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    selected && "ring-2 ring-primary border-primary/40"
  )}
  aria-pressed={selected}
>
  {option.icon && (
    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
      <option.icon className="w-5 h-5 text-primary" />
    </div>
  )}
  <div className="flex-1">
    <p className="text-sm font-semibold font-display text-foreground">{option.label}</p>
    {option.description && (
      <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
    )}
  </div>
  {selected && <Check className="w-5 h-5 text-primary flex-shrink-0" />}
</button>
```

Wrap inside a shadcn `<RadioGroup>` for keyboard navigation (arrow keys move selection).

## MultiSelectChips (Cardiac step)

Chip styles match Master §9.2 chip pattern. Five blocks, separated by `<Separator />`:

```tsx
<section aria-labelledby={`heading-${slug}`}>
  <h3 id={`heading-${slug}`} className="text-sm font-semibold font-display mb-2">
    {title}
  </h3>
  <div className="flex flex-wrap gap-2">
    {options.map((opt) => (
      <button
        type="button"
        onClick={() => toggle(opt)}
        aria-pressed={value.includes(opt)}
        className={cn(
          "rounded-full px-3 py-1.5 text-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          value.includes(opt)
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        )}
      >
        {opt}
      </button>
    ))}
  </div>
  {allowCustom && (
    <div className="mt-2">
      <Input ... placeholder="Add other..." />
    </div>
  )}
</section>
```

## Done step

Mirror AddMeal's `confirm` motion exactly (spring-scaled Check icon, success text, auto-navigate after 1.5s). Reuse the existing pattern verbatim — do not invent a new celebration.

## Auth pages (`/signup`, `/login`)

- Container: `min-h-screen bg-background flex items-center justify-center px-5`
- Single shadcn `<Card>` centered, `max-w-md w-full`
- App logo / wordmark at top of card (text-only for v1: "CardioNutriSnap" in `font-display`)
- Below the card: secondary link (`text-sm text-muted-foreground`) — "Already have an account? Sign in" / "Need an account? Sign up"
- `<FullScreenSpinner />` while auth state resolves

## What this page-override does NOT change

These remain inherited from Master:
- Color tokens (palette, macro variants, surface treatments)
- Typography (DM Sans + Inter, the scale in §4.2)
- Glass-card surfaces
- Motion vocabulary
- Touch target floors, focus tokens, reduced-motion rules
- Anti-patterns
