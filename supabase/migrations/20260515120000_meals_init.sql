-- meals_init: per-user logged meals for CardioNutriSnap
-- Stores meals confirmed from the AddMeal flow so the dashboard can show
-- today's totals + recent meals. 1 row per logged meal.

set search_path = public;

-- ---------- table ----------
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  type text not null check (type in ('breakfast','lunch','dinner','snack')),

  calories integer not null default 0,
  protein integer not null default 0,
  carbs integer not null default 0,
  fat integer not null default 0,
  saturated_fat integer not null default 0,
  sodium integer not null default 0,
  fiber integer not null default 0,
  added_sugars integer not null default 0,

  -- foods: array of objects { name, portion, unit, calories, protein, ... }
  -- Stored as jsonb so the meal-detail view can rebuild the per-food breakdown.
  foods jsonb not null default '[]'::jsonb,

  image_url text,

  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

comment on table public.meals is
  'Per-user logged meals. One row per meal confirmed from the AddMeal flow.';

create index if not exists meals_user_logged_idx
  on public.meals (user_id, logged_at desc);

-- ---------- RLS ----------
alter table public.meals enable row level security;

drop policy if exists meals_select_own on public.meals;
create policy meals_select_own
  on public.meals for select
  using (auth.uid() = user_id);

drop policy if exists meals_insert_own on public.meals;
create policy meals_insert_own
  on public.meals for insert
  with check (auth.uid() = user_id);

drop policy if exists meals_update_own on public.meals;
create policy meals_update_own
  on public.meals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists meals_delete_own on public.meals;
create policy meals_delete_own
  on public.meals for delete
  using (auth.uid() = user_id);
