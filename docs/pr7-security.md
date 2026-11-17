# Аудит безпеки ПР 7

## Таблиця знахідок (кроки 2–9)

| № | Джерело | Назва знахідки | Критичність | Файл / об'єкт бази | Що зроблено | Доказ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| З1 | Advisor / Аудит політик | `Public Can Execute SECURITY DEFINER Function` (5 допоміжних функцій ПР 5) | середня | `public.handle_new_user()`, `public.is_event_participant(uuid)`, `public.my_profile_id()`, `public.my_rank()`, `public.owns_event(uuid)` | Виправлено: міграцією `policy_fixes` відкликано `EXECUTE` у `public` і `anon` та надано `authenticated` (крім тригерної `handle_new_user`) | `daf25e9`; міграція `20261116181321_policy_fixes.sql`; запит 3 → `anon_викликає = false` |
| З2 | Advisor | `Leaked Password Protection Disabled` | середня | Supabase Auth (налаштування автентифікації) | Обґрунтовано в 5.2: перевірка паролів за базою витоків доступна лише на платному тарифі Supabase Pro | Скриншот С2; обґрунтування у таблиці 5.2 звіту |
| З3 | npm audit | Вразливості у транзитивних продакшн-залежностях `sharp` (<0.35.5) та `source-map-js` (1.0.0–1.2.1) | висока | `package-lock.json` (`sharp`, `source-map-js`) | Виправлено: оновлено залежності командою `npm audit fix` без зміни мажорних версій | `4a0929f`; `npm test` (21 passed); `npm run build` без помилок |
| З4 | npm audit | Вразливості у `next` (16.0.0–16.4.0) та dev-пакетах (`vitest`, `vite`, `zod`), що вимагають `--force` | середня | `package.json` (`next`, `vitest`) | Обґрунтовано в 5.2: оновлення потребує `npm audit fix --force` зі зміною мажорної версії (заборонено умовами); `vitest`/`vite` є лише `devDependencies` | Вивід `npm audit`; обґрунтування у таблиці 5.2 звіту |

## Аудит політик доступу (кроки 8–9)

| Таблиця | Політика | Дія | Кому | Умова своїми словами | Позначка | Зміни з ПР 5 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `profiles` | `profiles_select` | SELECT | `authenticated` | Кожен авторизований учасник гільдії бачить список профілів складу гільдії | — | без змін |
| `profiles` | `profiles_insert` | INSERT | `authenticated` | Створення власного профілю (`user_id = auth.uid()`) або запису учасника | — | без змін |
| `profiles` | `profiles_update_own` | UPDATE | `authenticated` | Користувач змінює лише власний профіль (зміна колонки `rank` заборонена) | — | без змін |
| `events` | `events_select` | SELECT | `authenticated` | Власник події (`owner_id = my_profile_id()`) або записаний учасник події | — | без змін |
| `events` | `events_insert_officer` | INSERT | `authenticated` | Лише користувач із рангом «Офіцер»; власником стає він сам | — | без змін |
| `events` | `events_update_owner` | UPDATE | `authenticated` | Лише офіцер — власник цієї події | — | без змін |
| `events` | `events_delete_owner` | DELETE | `authenticated` | Лише офіцер — власник цієї події | — | без змін |
| `event_registrations` | `event_registrations_select` | SELECT | `authenticated` | Власник події або учасник, якому належить заявка | — | без змін |
| `event_registrations` | `event_registrations_insert` | INSERT | `authenticated` | Власник події або сам учасник при записі на подію | — | без змін |
| `event_registrations` | `event_registrations_update_owner` | UPDATE | `authenticated` | Лише офіцер — власник події (переведення між основою і резервом) | — | без змін |
| `event_registrations` | `event_registrations_delete` | DELETE | `authenticated` | Власник події або учасник, який скасовує власну заявку | — | без змін |
| `event_comments` | `event_comments_select` | SELECT | `authenticated` | Власник події або учасник, записаний на подію | — | без змін |
| `event_comments` | `event_comments_insert` | INSERT | `authenticated` | Власник події або учасник, записаний на подію | — | без змін |
| `event_comments` | `event_comments_update` | UPDATE | `authenticated` | Власник події або учасник події (скарга / модерація коментаря власником) | — | без змін |
| `event_comments` | `event_comments_delete_owner` | DELETE | `authenticated` | Лише офіцер — власник події | — | без змін |
| `ai_calls` | `ai_calls_insert_own` | INSERT | `authenticated` | Користувач додає лише записи власних викликів моделі (`user_id = auth.uid()`) | — | додано в ПР 6 |
| `ai_calls` | `ai_calls_select_own` | SELECT | `authenticated` | Користувач читає лише власну історію викликів (`update`/`delete` відкликано) | — | додано в ПР 6 |
| `ai_cache` | `ai_cache_select_own` | SELECT | `authenticated` | Користувач читає лише власні кешовані відповіді (`user_id = auth.uid()`) | — | додано в ПР 6 |
| `ai_cache` | `ai_cache_insert_own` | INSERT | `authenticated` | Користувач створює записи кешу лише для свого `user_id` | — | додано в ПР 6 |
| `ai_cache` | `ai_cache_update_own` | UPDATE | `authenticated` | Користувач оновлює лише власні записи кешу (`delete` відкликано) | — | додано в ПР 6 |
