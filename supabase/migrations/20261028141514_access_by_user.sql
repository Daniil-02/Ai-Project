-- Міграція 3: користувачі, власники записів і доступ за роллю (практична робота 5).
-- Тема 14: «Гільдія для онлайн-гри Shadow Vanguard». Ролі (ранги): Офіцер і Учасник.

-- 1. Профіль прив'язується до облікового запису входу.
alter table public.profiles
  add column user_id uuid unique references auth.users (id) on delete cascade;

-- 2. Профіль створюється автоматично під час реєстрації; нікнейм береться з форми реєстрації.
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, nickname, character_class, role, rank, active_status)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    'Вартовий',
    'Танк',
    case when new.email like '%+a@%' then 'Офіцер' else 'Учасник' end,
    'Онлайн'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Акаунти, створені до цієї міграції (тестові А і Б), отримують профіль.
insert into public.profiles (user_id, nickname, character_class, role, rank, active_status)
select
  u.id,
  coalesce(nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''), split_part(u.email, '@', 1)),
  'Вартовий',
  'Танк',
  case when u.email like '%+a@%' then 'Офіцер' else 'Учасник' end,
  'Онлайн'
from auth.users u
where not exists (select 1 from public.profiles p where p.user_id = u.id);

-- 3. Допоміжні функції для визначення поточного профілю та рангу користувача.
create or replace function public.my_profile_id() returns uuid
  language sql stable security definer set search_path = '' as $$
  select id from public.profiles where user_id = auth.uid()
$$;

create or replace function public.my_rank() returns text
  language sql stable security definer set search_path = '' as $$
  select rank from public.profiles where user_id = auth.uid()
$$;

-- 4. Власник події заповнюється базою за замовчуванням.
alter table public.events
  add column owner_id uuid default public.my_profile_id() references public.profiles (id) on delete cascade;

create or replace function public.owns_event(p_event_id uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.events where id = p_event_id and owner_id = public.my_profile_id())
$$;

create or replace function public.is_event_participant(p_event_id uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.event_registrations where event_id = p_event_id and profile_id = public.my_profile_id())
$$;

-- 5. Тимчасові політики ПР 4 прибираються.
drop policy "pr4_temp_all" on public.profiles;
drop policy "pr4_temp_all" on public.events;
drop policy "pr4_temp_all" on public.event_registrations;
drop policy "pr4_temp_all" on public.event_comments;

-- 6. Відкликання прав запису у неавторизованої ролі.
revoke insert, update, delete on public.profiles, public.events, public.event_registrations, public.event_comments from anon;

-- 7. Обмеження оновлення профілю: власний ранг змінити не можна.
revoke update on public.profiles from authenticated;
grant update (nickname, character_class, role, active_status) on public.profiles to authenticated;

-- 8. Політики доступу за користувачем і роллю.
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
create policy "profiles_insert" on public.profiles
  for insert to authenticated with check (user_id is null or user_id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "events_select" on public.events
  for select to authenticated using (
    owner_id = public.my_profile_id()
    or public.is_event_participant(id)
  );
create policy "events_insert_officer" on public.events
  for insert to authenticated with check (
    public.my_rank() = 'Офіцер'
    and owner_id = public.my_profile_id()
  );
create policy "events_update_owner" on public.events
  for update to authenticated using (owner_id = public.my_profile_id()) with check (owner_id = public.my_profile_id());
create policy "events_delete_owner" on public.events
  for delete to authenticated using (owner_id = public.my_profile_id());

create policy "event_registrations_select" on public.event_registrations
  for select to authenticated using (
    public.owns_event(event_id)
    or profile_id = public.my_profile_id()
  );
create policy "event_registrations_insert" on public.event_registrations
  for insert to authenticated with check (
    public.owns_event(event_id)
    or profile_id = public.my_profile_id()
  );
create policy "event_registrations_update_owner" on public.event_registrations
  for update to authenticated using (public.owns_event(event_id)) with check (public.owns_event(event_id));
create policy "event_registrations_delete" on public.event_registrations
  for delete to authenticated using (
    public.owns_event(event_id)
    or profile_id = public.my_profile_id()
  );

create policy "event_comments_select" on public.event_comments
  for select to authenticated using (
    public.owns_event(event_id)
    or public.is_event_participant(event_id)
  );
create policy "event_comments_insert" on public.event_comments
  for insert to authenticated with check (
    public.owns_event(event_id)
    or public.is_event_participant(event_id)
  );
create policy "event_comments_update" on public.event_comments
  for update to authenticated using (
    public.owns_event(event_id)
    or public.is_event_participant(event_id)
  ) with check (
    public.owns_event(event_id)
    or public.is_event_participant(event_id)
  );
create policy "event_comments_delete_owner" on public.event_comments
  for delete to authenticated using (public.owns_event(event_id));
