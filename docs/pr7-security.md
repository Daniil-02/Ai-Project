# Аудит безпеки ПР 7

## Таблиця знахідок (кроки 2–9)

| № | Джерело | Назва знахідки | Критичність | Файл / об'єкт бази | Що зроблено | Доказ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| З1 | Advisor / Аудит політик | Функції `SECURITY DEFINER` (`handle_new_user`, `is_event_participant`, `my_profile_id`, `my_rank`, `owns_event`) доступні ролі `anon` (`anon_викликає = true`) | середня | `public.handle_new_user()`, `public.is_event_participant()`, `public.my_profile_id()`, `public.my_rank()`, `public.owns_event()` | Виправлено: створено міграцію `policy_fixes` із `revoke execute ... from public, anon` та `grant execute ... to authenticated` | Міграція `policy_fixes`; `npx supabase db push` |
| З2 | Advisor | `Leaked Password Protection Disabled` | середня | Supabase Auth | Обґрунтовано: функція перевірки паролів за базою витоків доступна лише на платному тарифі Supabase Pro; у застосунку діє мінімальна довжина пароля та політики RLS | Скриншот С2; розділ 5.2 звіту |
| З3 | npm audit | Вразливості у транзитивних пакетах `sharp` (<0.35.5) та `source-map-js` (1.0.0–1.2.1) | висока | `package-lock.json` (`sharp`, `source-map-js`) | Виправлено: оновлено пакети командою `npm audit fix` без зміни мажорних версій | Коміт `fix: оновлення залежностей із відомими вразливостями` |
| З4 | npm audit | Вразливості у `next` (16.0.0–16.4.0) та пакетах розробки (`vitest`, `vite`, `zod`) | висока / середня | `package.json` (`next`, `vitest`) | Обґрунтовано: автоматичне оновлення потребує `npm audit fix --force` із переходом на несумісну мажорну версію (заборонено умовами роботи); `vitest`/`vite` не потрапляють у продакшн-збірку Vercel | Вивід `npm audit`; розділ 5.2 звіту |

## Аудит політик доступу (кроки 8–9)

| Таблиця | Політика | Дія | Кому | Умова своїми словами | Позначка | Зміни з ПР 5 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `profiles` | `profiles_select` | SELECT | `authenticated` | Будь-який авторизований учасник гільдії бачить список складу гільдії | — | без змін |
| `profiles` | `profiles_insert` | INSERT | `authenticated` | Створення власного профілю (`user_id = auth.uid()`) або запису учасника рейду | — | без змін |
| `profiles` | `profiles_update_own` | UPDATE | `authenticated` | Користувач змінює лише власний профіль (оновлювати колонку `rank` заборонено) | — | без змін |
| `events` | `events_select` | SELECT | `authenticated` | Власник події (`owner_id = my_profile_id()`) або записаний у склад події учасник | — | без змін |
| `events` | `events_insert_officer` | INSERT | `authenticated` | Лише користувач із рангом «Офіцер»; власником стає він сам | — | без змін |
| `events` | `events_update_owner` | UPDATE | `authenticated` | Лише офіцер — власник цієї події | — | без змін |
| `events` | `events_delete_owner` | DELETE | `authenticated` | Лише офіцер — власник цієї події | — | без змін |
| `event_registrations` | `event_registrations_select` | SELECT | `authenticated` | Власник події або учасник, якому належить заявка | — | без змін |
| `event_registrations` | `event_registrations_insert` | INSERT | `authenticated` | Власник події або сам учасник при записі на подію | — | без змін |
| `event_registrations` | `event_registrations_update_owner` | UPDATE | `authenticated` | Лише офіцер — власник події (переведення між основою і резервом) | — | без змін |
| `event_registrations` | `event_registrations_delete` | DELETE | `authenticated` | Власник події або учасник, який скасовує власну заявку | — | без змін |
| `event_comments` | `event_comments_select` | SELECT | `authenticated` | Власник події або учасник, записаний на подію | — | без змін |
| `event_comments` | `event_comments_insert` | INSERT | `authenticated` | Власник події або учасник, записаний на подію | — | без змін |
| `event_comments` | `event_comments_update` | UPDATE | `authenticated` | Власник події або учасник події (скарга / модерація власником) | — | без змін |
| `event_comments` | `event_comments_delete_owner` | DELETE | `authenticated` | Лише офіцер — власник події | — | без змін |
| `ai_calls` | `ai_calls_insert_own` | INSERT | `authenticated` | Користувач додає лише записи власних викликів моделі (`user_id = auth.uid()`) | — | додано в ПР 6 |
| `ai_calls` | `ai_calls_select_own` | SELECT | `authenticated` | Користувач читає лише власну історію викликів (`update`/`delete` відкликано) | — | додано в ПР 6 |
| `ai_cache` | `ai_cache_select_own` | SELECT | `authenticated` | Користувач читає лише власні кешовані відповіді (`user_id = auth.uid()`) | — | додано в ПР 6 |
| `ai_cache` | `ai_cache_insert_own` | INSERT | `authenticated` | Користувач створює записи кешу лише для свого `user_id` | — | додано в ПР 6 |
| `ai_cache` | `ai_cache_update_own` | UPDATE | `authenticated` | Користувач оновлює лише власні записи кешу (`delete` відкликано) | — | додано в ПР 6 |
