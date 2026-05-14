# CardioNutriSnap — Design Language (MASTER)

> **Source of truth.** Synthesized from the actual shipped code (`src/index.css`, `tailwind.config.ts`, existing pages and components), not from external recommendations. **Do not change the style. Extend it.**
>
> **How to use:** When building a page, first check `design-system/pages/<page-name>.md`. If it exists, its rules override this Master. Otherwise, this Master is authoritative.
>
> **Status:** This document describes the design language **as currently shipped**. Sections that suggest future improvements (e.g. §8.1 focus tokens, §11 accessibility rules, §13 backport TODO) are **recommendations, not yet applied** — they are not gates for new code. New code should match the existing patterns documented here. The recommendations are kept for visibility but require explicit approval before being landed.

---

## 1. Brand Spirit

- **Calm, mobile-first, health-focused.** A soft green primary (a TDEE / leaf / matcha green, not a Whole Foods loud green) on a near-white green-tinted background.
- **Glass surfaces, generous whitespace, single-column rhythm.** Visual hierarchy comes from spacing and weight, not shadows or color saturation.
- **Functional color, not decorative.** Nutrient colors (`macro-protein`, `macro-fat`, etc.) are tokens that map to meaning. Brand colors do brand work; macro colors do data work.
- **Motion is gentle.** 20px slide + opacity fade, 200–300ms. Never showy. Respect `prefers-reduced-motion`.
- **No emoji as UI icons.** Emojis are for content (user-typed messages, food names if the user types one). Structural icons are lucide-react.

## 2. Layout Shell

### 2.1 Page container
```tsx
<div className="min-h-screen bg-background bottom-nav-safe">
  ...
</div>
```

- `bottom-nav-safe` reserves space for the fixed BottomNav (`calc(env(safe-area-inset-bottom, 0px) + 5rem)`)
- On routes where BottomNav is hidden (e.g. `/meal/:id`, all `/onboarding/*`, all `/auth/*`), substitute `pb-8` and add a comment explaining the divergence

### 2.2 Mobile column
The app root in `src/App.tsx` wraps everything in `<div className="max-w-lg mx-auto relative">`. **All pages assume this width.** Don't fight it on desktop.

### 2.3 Standard header
```tsx
<div className="flex items-center gap-3 px-5 pt-12 pb-4">
  <button onClick={() => navigate(-1)} className="p-1 text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
    <ArrowLeft className="w-5 h-5" />
  </button>
  <h1 className="text-xl font-bold font-display text-foreground">{title}</h1>
  {/* optional trailing element: <span className="text-sm text-muted-foreground ml-auto">…</span> */}
</div>
```

The back button is **omitted** on root-level destinations (Dashboard, Today, Welcome).

### 2.4 Body padding
- Horizontal: `px-5` is the default. Cards (`glass-card`) can extend to `mx-5` instead.
- Section spacing: `space-y-4` between cards; `space-y-3` for tighter groups (list items).
- Section heading inside a card: `text-sm font-semibold font-display text-foreground mb-3`.

### 2.5 Bottom navigation
- 4 items (`Home / PlusCircle / BarChart3 / User` from lucide), max 5 per Material guidance.
- Fixed: `fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-t border-border/50`.
- Hidden on detail / modal-style routes via internal pathname check.
- Active state: `text-primary` + `stroke-[2.5]` on the icon; inactive `text-muted-foreground`.

## 3. Color Tokens

All colors are HSL variables defined in `src/index.css` and consumed via Tailwind `hsl(var(--name))`. **Never hardcode hex in components.**

### 3.1 Semantic palette (light mode)

| Token | HSL | Use |
|---|---|---|
| `--background` | `150 20% 98%` | Page background (very soft green-white) |
| `--foreground` | `160 30% 10%` | Primary text |
| `--card` | `0 0% 100%` | Surface fill |
| `--primary` | `160 60% 38%` | Brand green; CTAs, active states, links |
| `--primary-foreground` | `0 0% 100%` | Text on primary |
| `--secondary` | `150 25% 94%` | Pill toggles, input backgrounds, inactive states |
| `--secondary-foreground` | `160 30% 20%` | Text on secondary |
| `--muted` | `150 15% 93%` | Subtle backgrounds, progress-bar troughs |
| `--muted-foreground` | `160 10% 50%` | Helper / secondary text |
| `--accent` | `35 90% 55%` | Sparing highlights (e.g. neutral insights) |
| `--destructive` | `0 72% 55%` | Errors, delete actions |
| `--border` | `150 15% 90%` | Hairlines, card borders |
| `--ring` | `160 60% 38%` | Focus ring color |

### 3.2 Macro nutrient palette

Two variants per nutrient: the **fill** (current saturated value) and the **on-surface** text variant (darkened to meet WCAG AA 4.5:1 on white backgrounds).

| Macro | Fill (`bg-macro-*`) | On-surface (`text-macro-*-on-surface`) | Used for |
|---|---|---|---|
| Protein | `210 80% 55%` | `210 80% 40%` | Bars, rings, labels |
| Carbs | `35 90% 55%` | `25 90% 38%` | Bars, rings, labels |
| Fat | `340 70% 55%` | `340 70% 42%` | Bars, rings, labels |
| Calories | `160 60% 38%` | `160 60% 30%` | Bars, rings, labels |
| Saturated fat | `280 60% 55%` | `280 60% 42%` | Bars |
| Sodium | `200 50% 50%` | `200 50% 38%` | Bars |
| Fiber | `90 60% 42%` | `90 60% 32%` | Bars |
| Added sugars | `15 80% 55%` | `15 80% 40%` | Bars |

**Rule:** use `bg-macro-X` for fills (progress bars, ring strokes, 10%-opacity tiles like `bg-macro-protein/10`). Use `text-macro-X-on-surface` for text labels (MealCard quick stats, etc.). Never use the fill variant as a text color on white — they fail 4.5:1.

### 3.3 Dark mode
Tokens are defined in `index.css` (`.dark { ... }`) but **dark mode is not yet shipped.** `next-themes` is installed but no toggle exists. Treat dark mode as a v1.1 concern — design with light mode tokens for now, but always use semantic tokens (never raw hex) so the eventual switch is free.

## 4. Typography

### 4.1 Fonts
- **Display:** `DM Sans` — used for headings, labels, numeric badges. Set via `font-display` Tailwind class or the base CSS rule for `h1–h6`.
- **Body:** `Inter` — used for body copy. Default for `<body>`.
- Both loaded from Google Fonts in `src/index.css:1`.

### 4.2 Scale
| Use | Class |
|---|---|
| Page title | `text-xl font-bold font-display` (in headers) |
| Section heading inside card | `text-sm font-semibold font-display` |
| Body | inherits `text-foreground` at default size |
| Helper / secondary | `text-xs text-muted-foreground` |
| Numeric callouts | `text-3xl font-bold font-display` (e.g. calories-remaining) or `text-xl font-bold font-display` (target tiles) |
| Tiny labels (e.g. unit suffix) | `text-[10px] text-muted-foreground` |

### 4.3 Always semantic
Use `<h1>`/`<h2>` for actual headings. Don't render headings as `<div>` — screen readers depend on the hierarchy. `font-display` is a *style* override, not a substitute for the element.

## 5. Spacing & Radius

- **Tailwind spacing:** stay on the 4pt scale. The codebase uses `gap-1`, `gap-2`, `gap-3`, `space-y-3`, `space-y-4`, `p-3`, `p-4`, `p-5` consistently. No arbitrary `gap-[7px]` values.
- **Page edge:** `px-5` (20px) is canonical mobile horizontal inset.
- **Radius:** root `--radius: 1rem`. Tailwind config maps: `rounded-sm = 12px`, `rounded-md = 14px`, `rounded-lg = 16px`, `rounded-xl = 20px`, `rounded-2xl = 24px`. Cards use `rounded-2xl`. Buttons use `rounded-xl`. Pills / chips use `rounded-full`. Icon containers use `rounded-lg` or `rounded-xl` depending on size.

## 6. Surfaces & Elevation

There is exactly **one** elevated surface treatment. Don't introduce variants.

```css
/* @layer components in index.css */
.glass-card {
  @apply bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm;
}
```

- Use for any grouped content: stat cards, list cards, summary cards
- The brand-colored hero card (Dashboard's calories-remaining tile) is the exception: solid `bg-primary` + no border, full opacity
- No multi-level shadow scale — shadows are *all* `shadow-sm` or via `glass-card`

## 7. Motion Vocabulary

### 7.1 Page-entry / section-entry
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}  // optional cascade
  className="..."
>
```

- Delays for cascade: 0, 0.1, 0.2, 0.25, 0.3 (Dashboard uses this exact ladder)
- Use sparingly: 2–3 motion blocks per page max

### 7.2 Step transitions (multi-step flows)
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={step}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    ...
  </motion.div>
</AnimatePresence>
```

This is the **AddMeal pattern** and is the canonical pattern for the onboarding flow.

### 7.3 Progress fills
- MacroBar fill: `transition-all duration-700 ease-out`
- MacroRing stroke: `transition-all duration-700 ease-out`
- Both must respect `prefers-reduced-motion` (see §11)

### 7.4 Press feedback
- Pressable cards: `active:scale-[0.98] transition-transform`
- Buttons in lists: hover shadow lift `hover:shadow-md transition-shadow`

### 7.5 Spring confirmations (one-shot success)
```tsx
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", stiffness: 200 }}
>
```
Used for the "Meal Logged!" checkmark in AddMeal. Reuse for the onboarding "Done" step.

## 8. Interaction & State

### 8.1 Focus (REQUIRED on every interactive element)
```tsx
className="... focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
```

Or rely on the global rule in `index.css`:
```css
@layer base {
  *:focus-visible {
    @apply outline-none ring-2 ring-primary ring-offset-2 ring-offset-background;
  }
}
```

### 8.2 Pressed state
- Buttons / cards: `active:scale-[0.98]`
- Pill toggles: visual state from `bg-primary` vs `bg-secondary` (no scale)

### 8.3 Disabled
- `disabled:opacity-50` or `disabled:opacity-40` (codebase mixes; standardize on `0.5`)
- `disabled:cursor-not-allowed`
- Plus the underlying `disabled` attribute for semantics

### 8.4 Loading
- Button loading: replace icon with `<Loader2 className="w-4 h-4 animate-spin" />`, set `disabled`
- Page / route loading: `<FullScreenSpinner />` — `min-h-screen flex items-center justify-center` + spinning Loader2

### 8.5 Touch targets
Minimum 44×44pt. Where icons are smaller, expand padding or `hitSlop`. Existing offenders (`w-7 h-7` portion buttons in AddMeal) are tracked in §13.

## 9. Component Patterns

### 9.1 Primary CTA
```tsx
<button className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
  <Icon className="w-4 h-4" />
  Action
</button>
```

### 9.2 Pill toggle group
Active: `bg-primary text-primary-foreground`. Inactive: `bg-secondary text-secondary-foreground`. Shape: `px-3 py-2.5 rounded-xl` (square pill) or `rounded-full px-4 py-2 text-sm font-medium` (chip).

### 9.3 Glass card with section heading
```tsx
<div className="glass-card rounded-2xl p-4 space-y-4">
  <h2 className="text-sm font-semibold font-display text-foreground">Heading</h2>
  {/* content */}
</div>
```

### 9.4 Form input (current Profile pattern — short-term)
```tsx
<label htmlFor="field" className="text-xs text-muted-foreground mb-1 block">Label</label>
<input
  id="field"
  type="text|number"
  className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none"
/>
```
**New forms** (onboarding, future Profile rewrite) **must use shadcn `<Form>` / `<FormField>` / `<FormControl>` / `<FormLabel>` / `<FormMessage>`** — these wire labels to inputs automatically and ship with `role="alert"` for error announcements.

### 9.5 Macro visuals
- `<MacroRing>` for circular progress (calories, primary macros). Defaults: `size=80, strokeWidth=6`.
- `<MacroBar>` for linear progress (sat-fat, sodium, fiber, sugars; also for weekly averages and meal-detail breakdowns).
- Both take the `color` prop matching a macro key. Don't recolor outside these tokens.

### 9.6 Meal type signifiers (UPGRADE — replaces emoji)
Map each meal type to a lucide icon in a tonal container:

| Type | Icon | Background tint |
|---|---|---|
| breakfast | `Sunrise` | `bg-accent/15` |
| lunch | `Sun` | `bg-macro-carbs/15` |
| dinner | `Moon` | `bg-macro-saturated-fat/15` |
| snack | `Cookie` | `bg-macro-added-sugars/15` |

Icon size in a 28×28 container: `w-4 h-4`.

## 10. Icons

- Library: **lucide-react** only. The codebase already imports from it throughout.
- Standard sizes: `w-5 h-5` (nav, header), `w-4 h-4` (in-button, inline), `w-3 h-3` (compact action buttons)
- Stroke: lucide default (1.5). For active bottom-nav items, bump to `stroke-[2.5]`.
- **Never use emoji as a structural icon.** Emoji is allowed only inside user-generated content (meal names, notes the user types) and the lightbulb-style content callouts where the emoji is the *content* of a "tip" string and the surrounding card has its own lucide icon. When in doubt, use lucide.

## 11. Accessibility Rules (REQUIRED for new code)

1. **Focus visible** on every interactive element (§8.1).
2. **`prefers-reduced-motion`** respected globally via this CSS:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```
   And wrap `<App>` in `<MotionConfig reducedMotion="user">` from framer-motion.
3. **Labels linked to inputs** via `htmlFor` + `id`, or via shadcn `<FormField>` which handles this for you.
4. **Text contrast ≥ 4.5:1** for body, ≥ 3:1 for large text and graphical elements. Use the `*-on-surface` text variants for macro colors on white.
5. **`role="alert"` / `aria-live`** for inline errors — shadcn `<FormMessage>` provides this; sonner toasts emit `role="status"`.
6. **Touch targets ≥ 44×44pt** for any tappable control.
7. **Semantic headings** — `<h1>`, `<h2>`, etc. Don't restart the hierarchy.
8. **Lucide for icons**, never emojis (§10).

## 12. Anti-patterns (do not do)

- ❌ Hardcoded hex colors in components (use `hsl(var(--name))` tokens)
- ❌ Emojis as structural / functional icons
- ❌ Inline shadows that aren't `shadow-sm` or `glass-card` (no custom elevation values)
- ❌ Custom `<select>` / `<input type="checkbox">` styled to look like a switch — use shadcn `<Select>` / `<Switch>`
- ❌ Removing focus rings without a replacement
- ❌ Bright neon, AI purple/pink gradients, brutalism — wrong vibe for healthcare
- ❌ Page transitions other than the `y:20 / opacity:0 → y:0 / opacity:1` idiom in §7
- ❌ Headings rendered as `<div>` with `font-display` class
- ❌ Native `<select>` styled to look custom — it always falls back to OS rendering on iOS / Android web views

## 13. Backport TODO (existing code that doesn't yet meet §11)

These are tracked separately from the canonical rules above. Fix in a dedicated PR before App Store submission:

- [ ] **Focus tokens** — add the global `*:focus-visible` rule in `index.css`. Audit BottomNav, MealCard, Profile pill toggles, AddMeal chips for any local `focus-visible:` overrides.
- [ ] **Reduced-motion** — add the `@media (prefers-reduced-motion: reduce)` block in `index.css` + wrap `<App>` in `<MotionConfig reducedMotion="user">`.
- [ ] **Macro on-surface text variants** — add 8 new CSS vars + Tailwind extensions; replace `text-macro-protein` etc. in `MealCard.tsx:61-64` with the `-on-surface` variants.
- [ ] **Emoji → lucide** in:
  - `MealCard.tsx:26-31` (typeEmojis) → use the §9.6 mapping
  - `AddMeal.tsx:42-47` (mealTypes) → same mapping
  - `WeeklyInsights.tsx:107` (tip header) → `<Lightbulb className="w-4 h-4 text-accent" />`
  - `MealDetail.tsx:41` (photo placeholder) → `<Camera className="w-6 h-6 text-muted-foreground" />`
- [ ] **Profile form labels** — wire `htmlFor` / `id` on every label/input pair, or migrate to shadcn `<Form>` as part of the post-onboarding profile-editor rewrite.
- [ ] **Profile custom switch** (`Profile.tsx:227-238`) → swap for shadcn `<Switch>`.
- [ ] **Profile native `<select>`** (`Profile.tsx:58-65`) → shadcn `<Select>`.
- [ ] **Touch target floors** — bump AddMeal `w-7 h-7` portion buttons to `min-h-[44px] min-w-[44px]` (or expand hit area).
- [ ] **MealDetail layout** — switch `pb-8` → `bottom-nav-safe` + comment, or vice versa with a comment, so the divergence isn't silent.
- [ ] **Sidebar tokens dead code** — `index.css:55-62, 85-92`. Remove the 14 unused `--sidebar-*` vars or comment them out.
- [ ] **Mock data in WeeklyInsights** — `Mar 18 – Mar 24` hardcode + `insights` array + `recommendation` string. Replace with real data once the data layer is wired.
- [ ] **App.css cleanup** — the file is leftover Vite scaffold (logo spin animation, etc.). Delete or strip to empty.

## 14. References

- `src/index.css` — token definitions, custom utility classes
- `tailwind.config.ts` — theme extensions
- `src/components/MacroRing.tsx`, `MacroBar.tsx`, `MealCard.tsx`, `BottomNav.tsx` — canonical component implementations
- `src/pages/Dashboard.tsx`, `AddMeal.tsx` — canonical page implementations (motion patterns, step machines)
- `docs/onboarding-plan.md` — upcoming onboarding flow (inherits from this Master + `design-system/pages/onboarding.md`)
