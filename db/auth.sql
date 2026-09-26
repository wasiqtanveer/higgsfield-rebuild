-- Graft — accounts and the credit ledger.
--
-- Run after `schema.sql`, in the Supabase SQL Editor. Safe to re-run.
--
-- Identity itself is not modelled here. Supabase Auth owns `auth.users`, and
-- duplicating email and password into a table of our own would create two
-- records of who someone is that can disagree. What this file adds is the
-- product's own state hanging off that identity: a profile, and a ledger.

-- ---------------------------------------------------------------------------
-- profiles
--
-- One row per account, keyed by the auth user's id. Holds only what the product
-- displays and Supabase does not already store: the handle a fork is credited
-- to, and the display name.
--
-- `on delete cascade` here, unlike generations. A profile is not someone else's
-- work — it is a facet of the account, so deleting the account should take it.
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  name         text not null default 'Creator',
  handle       text unique not null,
  created_at   timestamptz not null default now()
);

create index if not exists profiles_handle_idx on profiles(handle);

-- ---------------------------------------------------------------------------
-- credit_ledger
--
-- Append-only. A balance is the sum of a user's entries, never a column that
-- gets read, decremented and written back: that pattern loses an entry whenever
-- two requests interleave, and it throws away the reason a balance changed.
-- Here every movement keeps its cause, so the balance can always be explained
-- and never silently drifts.
--
-- `delta` is signed — a grant is positive, a spend negative. The constraint
-- forbids a zero entry, which would be a row that records nothing.
-- ---------------------------------------------------------------------------
create table if not exists credit_ledger (
  id           bigserial primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  delta        int not null check (delta <> 0),

  -- Why the balance moved. Constrained rather than free text so the ledger can
  -- be grouped and audited; a typo'd reason is an entry nobody can account for.
  reason       text not null check (reason in ('signup_grant', 'generation', 'fork', 'refund', 'adjustment')),

  -- What it was spent on, when that applies. Nullable: a signup grant has no
  -- generation behind it. `set null` rather than cascade — deleting a
  -- generation must not erase the record that it cost someone credits.
  generation_id uuid references generations(id) on delete set null,

  created_at   timestamptz not null default now()
);

-- Every balance read is "sum the entries for this user", so that is the index.
create index if not exists credit_ledger_user_idx on credit_ledger(user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- balance
--
-- A function rather than a materialised column, for the reason above: the sum
-- is the truth, and anything cached alongside it is a second truth that can be
-- wrong. `coalesce` because a user with no entries has a balance of zero, not
-- null — null would propagate into arithmetic and produce a blank in the UI.
-- ---------------------------------------------------------------------------
create or replace function credit_balance(uid uuid)
returns int
language sql
stable
as $$
  select coalesce(sum(delta), 0)::int from credit_ledger where user_id = uid;
$$;

-- ---------------------------------------------------------------------------
-- The signup grant.
--
-- Fired by a trigger on auth.users rather than by the API, so the grant is tied
-- to the account existing. If the API owned it, a signup that succeeded and
-- then failed before its follow-up write would leave an account with no credits
-- and no record of why.
--
-- The handle is derived from the email's local part and de-duplicated with the
-- id's first characters, because two people at different domains can share one.
-- ---------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base text;
  candidate text;
begin
  base := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9._-]', '', 'g'));
  if base = '' then base := 'creator'; end if;

  candidate := base;
  if exists (select 1 from profiles where handle = candidate) then
    candidate := base || '-' || substr(new.id::text, 1, 4);
  end if;

  insert into profiles (id, email, name, handle)
  values (
    new.id,
    new.email,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), initcap(replace(base, '.', ' '))),
    candidate
  )
  on conflict (id) do nothing;

  -- 250 credits, matching what the product has always claimed on signup.
  insert into credit_ledger (user_id, delta, reason)
  values (new.id, 250, 'signup_grant');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Attribution on generations.
--
-- `author` already exists as free text defaulting to 'anon'. This adds the real
-- link, left nullable so anonymous generation keeps working — the try-it path
-- is a product decision, not an accident, and requiring an account to run a
-- prompt would close the front door.
-- ---------------------------------------------------------------------------
alter table generations add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists generations_user_idx on generations(user_id);

-- ---------------------------------------------------------------------------
-- RLS, same posture as generations: on, and effectively closed to the browser.
-- Every read and write goes through /api with the secret key, which bypasses
-- RLS. These policies exist so that a leaked anon key still cannot read one
-- person's ledger or rewrite another's profile.
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table credit_ledger enable row level security;

-- Profiles are public: a fork is credited to a handle, and a credit nobody can
-- resolve to a person is not attribution.
drop policy if exists "public read profiles" on profiles;
create policy "public read profiles" on profiles for select using (true);

-- A ledger is not. It is the one part of this schema that is nobody's business
-- but its owner's, so there is no anon-readable policy at all.
drop policy if exists "own ledger" on credit_ledger;
create policy "own ledger" on credit_ledger for select using (auth.uid() = user_id);
