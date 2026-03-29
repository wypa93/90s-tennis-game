-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  player text not null check (player in ('pascal', 'franciele')),
  score integer not null check (score >= 0 and score <= 1000000),
  created_at timestamptz not null default now()
);

create index if not exists scores_player_score_idx on public.scores (player, score desc);
create index if not exists scores_created_at_idx on public.scores (created_at desc);

alter table public.scores enable row level security;

create policy "scores_select_public"
  on public.scores for select
  using (true);

create policy "scores_insert_anon"
  on public.scores for insert
  with check (
    player in ('pascal', 'franciele')
    and score >= 0
    and score <= 1000000
  );
