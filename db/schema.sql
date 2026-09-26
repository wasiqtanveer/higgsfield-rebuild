-- Graft — schema.
--
-- One table. A generation is a prompt, the image it produced, and the
-- generation it descends from. That last column is the whole product: without
-- `parent_id` this is a gallery, and the category already has those.
--
-- Paste into the Supabase SQL Editor and run. Safe to re-run.

create table if not exists generations (
  id          uuid primary key default gen_random_uuid(),

  -- The artifact. `prompt` is what the visitor wrote; it is the thing this
  -- product treats as authored work, so it is never truncated or normalised.
  prompt      text not null check (length(trim(prompt)) > 0),

  -- Where the image lives in Storage. Nullable because a row is written before
  -- the upload finishes: a generation that produced bytes we then failed to
  -- store is still a real event, and losing the prompt would be worse than
  -- holding a row with no picture yet.
  image_path  text,

  -- Reproducibility. Same prompt plus same seed and steps on the same model
  -- gives the same picture, which is what makes a fork comparable to its
  -- parent rather than to noise.
  seed        bigint not null,
  steps       int    not null default 4,
  model       text   not null,
  provider    text   not null,

  -- The lineage. Self-referential, nullable: a null parent is a root prompt,
  -- which is a real and common state, not a missing value.
  --
  -- `on delete set null` rather than cascade on purpose. Deleting a parent must
  -- orphan its children, never destroy them — someone else's fork is their
  -- work, and a cascade would let one deletion take a whole subtree of other
  -- people's prompts with it.
  parent_id   uuid references generations(id) on delete set null,

  author      text not null default 'anon',
  created_at  timestamptz not null default now()
);

-- Reading a chain means asking "what are this row's children" over and over,
-- so that lookup gets the index.
create index if not exists generations_parent_idx on generations(parent_id);
-- The feed is newest-first.
create index if not exists generations_created_idx on generations(created_at desc);

-- A row may not be its own parent. Cheap to state, and it makes the one cycle
-- a single insert can create unrepresentable.
alter table generations drop constraint if exists generations_not_self_parent;
alter table generations add constraint generations_not_self_parent
  check (parent_id is null or parent_id <> id);

-- RLS on, with no policy for the anon key. Every write goes through /api with
-- the service-role key, which bypasses RLS by design; the browser therefore
-- cannot reach this table directly even if the anon key leaks.
alter table generations enable row level security;

-- Public reading is a product decision, not an oversight: the whole claim is
-- that prompts are public and forkable. Writes stay server-side.
drop policy if exists "public read" on generations;
create policy "public read" on generations for select using (true);
