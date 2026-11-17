# Копія діалогу з моделлю — Практична робота № 7

## [№ 01] AI Studio — Крок 3 (Пояснення знахідки Security Advisor, заготовка 1)

**Запит:**
[№ 01] Ось знахідка статичного аналізу: Supabase Security Advisor (WARN) — Public Can Execute SECURITY DEFINER Function для функцій public.handle_new_user(), public.is_event_participant(uuid), public.my_profile_id(), public.my_rank(), public.owns_event(uuid). Стек: Next.js 16 (App Router), серверні дії, Supabase з політиками RLS, розгортання на Vercel. Користувач застосунку — авторизований учасник або офіцер гільдії (роль authenticated), незалогінений відвідувач (anon) не має виконувати внутрішні допоміжні функції перевірки прав. Обмеження: без нових пакетів, без змін тестів і застосованих міграцій, зміни бази лише новою міграцією. Формат: 1) що небезпечно; 2) як використати; 3) виправлення SQL.

**Відповідь моделі (стисло):**
1. **Що небезпечно:** за замовчуванням у PostgreSQL право `EXECUTE` на новостворені функції надається ролі `PUBLIC` (включно з `anon`), тому незалогінений відвідувач через PostgREST RPC (`/rest/v1/rpc/...`) може напряму викликати функції `SECURITY DEFINER`, які виконуються з правами власника схеми в обхід RLS.
2. **Як використати:** зловмисник із публічним `anon`-ключем надсилає POST-запит на `/rest/v1/rpc/is_event_participant` або `/rest/v1/rpc/owns_event`, перебираючи UUID подій для перевірки їх існування чи участі користувачів.
3. **Виправлення SQL:** відкликати право виконання у `public` та `anon` (`revoke execute on function ... from public, anon;`) і надати `execute` ролі `authenticated` лише для прикладних допоміжних функцій.

---

## [№ 02] GitHub Copilot — Крок 9 (Міграція policy_fixes)

**Запит:**
[№ 02] Контекст: Next.js 16, Supabase з політиками RLS; новий SQL — лише у міграції supabase/migrations/20261116181321_policy_fixes.sql. Вхідні дані: знахідка З1 із таблиці 5.1 та пояснення [№ 01] (5 функцій SECURITY DEFINER мають anon_викликає = true). Завдання: скласти SQL для відкликання EXECUTE у public і anon на handle_new_user, is_event_participant, my_profile_id, my_rank, owns_event і надання EXECUTE ролі authenticated. Обмеження: без drop table, delete from, disable row level security та службового ключа.

**Відповідь моделі (стисло):**
Запропоновано SQL-блок із командами `revoke execute ... from public, anon` та `grant execute ... to authenticated` для всіх п'яти функцій.

---

## [№ 03] GitHub Copilot — Крок 9 (Уточнення щодо тригерної функції)

**Запит:**
[№ 03] Уточнення: не видавати EXECUTE на тригерну функцію handle_new_user() ролі authenticated, бо її викликає лише системний тригер на auth.users.

**Відповідь моделі (стисло):**
Прибрано `grant execute on function public.handle_new_user() to authenticated;`, залишено відкликання прав у `public` та `anon` і надання `execute` ролі `authenticated` лише для чотирьох допоміжних функцій RLS (`is_event_participant`, `my_profile_id`, `my_rank`, `owns_event`). Фінальний SQL застосовано у міграції `20261116181321_policy_fixes.sql` (коміт `daf25e9`).

---

## [№ 04] AI Studio — Крок 16 (Генерація README.md)

**Запит:**
[№ 04] Контекст: портал управління рейдами онлайн-гільдії Shadow Vanguard (тема-14); стек Next.js 16.3.6, React 19.2.8, Supabase (PostgreSQL + RLS + Realtime), OpenRouter API, Vitest 3, ESLint 9, Node.js v24; середовище Codespaces, хмарний Supabase, Vercel, GitHub Actions без Docker і локальної бази. Вхідні дані: 12 пунктів контрольного списку README (розділ 5.8), 9 назв змінних середовища, перелік міграцій і скрипти package.json. Завдання: написати README.md українською за 12 пунктами з таблицею змінних «назва → де взяти → де потрібна». Обмеження: без Docker, supabase start і реальних значень ключів чи паролів.

**Відповідь моделі (стисло):**
Згенеровано повний текст `README.md` за всіма 12 пунктами контрольного списку (опис застосунку, стек, акаунти, запуск у Codespaces, таблиця 9 змінних середовища без значень, `.env.example`, міграції Supabase, тестові акаунти А і Б, `npm test`, `npm run dev`, розгортання на Vercel, конвеєр CI та правило `main-protection`). Збережено та злито в `main` через PR #3 (коміт `b843b0d`).
