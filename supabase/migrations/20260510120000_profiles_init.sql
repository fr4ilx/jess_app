-- profiles_init: 1:1 profiles table for CardioNutriSnap
-- Each auth.users row gets exactly one profiles row, auto-created by trigger on signup.
-- RLS: users may only read/update their own row.

set search_path = public;

-- ---------- table ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  -- Profile step
  date_of_birth date,
  sex_at_birth text check (sex_at_birth in ('male','female','intersex','prefer_not_to_say')),
  height_cm integer check (height_cm > 0 and height_cm < 300),
  weight_kg numeric(5,2) check (weight_kg > 0 and weight_kg < 500),
  activity_level text check (activity_level in ('sedentary','light','moderate','high')),
  goal text check (goal in ('lose','maintain','gain')),

  -- GLP-1 question + medication step
  -- glp1_medication semantics:
  --   null   = answered No (not on a GLP-1)
  --   string = answered Yes, with the medication name (e.g. 'semaglutide')
  -- glp1_question_answered distinguishes "haven't reached this step yet" (false)
  -- from "answered No" (true + null medication).
  glp1_question_answered boolean not null default false,
  glp1_medication text,
  glp1_brand text,
  glp1_dose_mg numeric(5,2),
  glp1_start_date date,
  glp1_schedule text check (glp1_schedule in ('daily','weekly','biweekly','monthly')),

  -- Cardiac step (arrays of free-text + curated values).
  -- cardiac_step_completed_at distinguishes "haven't reached this step" from
  -- "submitted with empty selections" (an empty array is a valid answer).
  cardiovascular_conditions text[] not null default '{}',
  comorbidities text[] not null default '{}',
  other_medications text[] not null default '{}',
  dietary_restrictions text[] not null default '{}',
  food_allergies text[] not null default '{}',
  cardiac_step_completed_at timestamptz,

  -- Goals step: optional overrides of computed targets.
  -- goals_step_completed_at distinguishes "not reached" from "no overrides chosen".
  custom_calories_target integer check (custom_calories_target is null or custom_calories_target > 0),
  custom_protein_target integer check (custom_protein_target is null or custom_protein_target > 0),
  custom_carbs_target integer check (custom_carbs_target is null or custom_carbs_target > 0),
  custom_fat_target integer check (custom_fat_target is null or custom_fat_target > 0),
  custom_saturated_fat_target integer check (custom_saturated_fat_target is null or custom_saturated_fat_target > 0),
  custom_sodium_target integer check (custom_sodium_target is null or custom_sodium_target > 0),
  custom_fiber_target integer check (custom_fiber_target is null or custom_fiber_target > 0),
  custom_added_sugars_target integer check (custom_added_sugars_target is null or custom_added_sugars_target > 0),
  goals_step_completed_at timestamptz,

  -- Lifecycle
  onboarding_completed_at timestamptz,
  allow_image_storage boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Per-user profile + onboarding state. 1:1 with auth.users.';

-- ---------- updated_at trigger ----------
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.tg_set_updated_at();

-- ---------- auto-create profile on signup ----------
create or replace function public.tg_create_profile_for_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists users_create_profile on auth.users;
create trigger users_create_profile
  after insert on auth.users
  for each row
  execute function public.tg_create_profile_for_user();

-- ---------- RLS ----------
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No INSERT policy: rows are inserted by tg_create_profile_for_user (security definer).
-- No DELETE policy: cascade from auth.users delete handles cleanup.
