-- Міграція 1: схема даних від екранів (практична робота 4).
-- Тема 14: «Гільдія для онлайн-гри Shadow Vanguard».

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (length(trim(nickname)) > 0),
  character_class text not null check (length(trim(character_class)) > 0),
  role text not null check (length(trim(role)) > 0),
  rank text not null check (length(trim(rank)) > 0),
  active_status text not null check (length(trim(active_status)) > 0)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  date_time text not null check (length(trim(date_time)) > 0),
  description text not null default '',
  max_slots integer not null check (max_slots >= 1),
  status text not null default 'Набір відкрито' check (length(trim(status)) > 0),
  tier text not null default 'Рейд · Міфічний' check (length(trim(tier)) > 0)
);

create table public.event_registrations (
  event_id uuid not null references public.events (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  combat_role text not null check (length(trim(combat_role)) > 0),
  slot_status text not null check (length(trim(slot_status)) > 0),
  primary key (event_id, profile_id)
);

create table public.event_comments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  author_nickname text not null check (length(trim(author_nickname)) > 0),
  comment_time text not null default 'Щойно' check (length(trim(comment_time)) > 0),
  content text not null check (length(trim(content)) > 0),
  reports_count integer not null default 0,
  is_hidden boolean not null default false
);

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.event_comments enable row level security;

-- ТИМЧАСОВО, замінюється в ПР 5: доступ для всіх ролей із публічним ключем.
create policy "pr4_temp_all" on public.profiles
  for all to anon, authenticated using (true) with check (true);
create policy "pr4_temp_all" on public.events
  for all to anon, authenticated using (true) with check (true);
create policy "pr4_temp_all" on public.event_registrations
  for all to anon, authenticated using (true) with check (true);
create policy "pr4_temp_all" on public.event_comments
  for all to anon, authenticated using (true) with check (true);

-- ТИМЧАСОВО, замінюється в ПР 5: права ролей на таблиці до появи авторизації.
grant select, insert, update, delete on public.profiles to anon, authenticated, service_role;
grant select, insert, update, delete on public.events to anon, authenticated, service_role;
grant select, insert, update, delete on public.event_registrations to anon, authenticated, service_role;
grant select, insert, update, delete on public.event_comments to anon, authenticated, service_role;
