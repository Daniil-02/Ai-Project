# Shadow Vanguard — портал управління рейдами онлайн-гільдії

## 1. Що це
Вебзастосунок для планування ігрових подій (рейдів) гільдії, розподілу учасників за ролями (Танк, Хілер, ДПС) з обмеженням місць і резервом, координації в чаті події та генерації тактичного плану рейду за допомогою мовної моделі.
Публічне посилання (Production): https://shadow-vanguard.vercel.app

## 2. Стек і версії
- **Фреймворк:** Next.js 16.3.6 (App Router, Server Actions), React 19.2.8, TypeScript
- **База даних та автентифікація:** Supabase (PostgreSQL + Row Level Security + Realtime)
- **ШІ-провайдер:** OpenRouter API (OpenAI-сумісний протокол, модель `google/gemini-2.5-flash`)
- **Тестування та лінтинг:** Vitest 3, ESLint 9
- **Середовище виконання:** Node.js v24

## 3. Акаунти
Для розгортання та перевірки застосунку потрібні облікові записи (без платних підписок):
- **GitHub** (репозиторій, Codespaces, GitHub Actions)
- **Supabase** (хмарна база даних PostgreSQL та автентифікація)
- **Vercel** (хостинг Next.js)
- **OpenRouter** (або Google AI Studio — API-ключ для генерації тактики рейду)

## 4. Codespace
1. На сторінці репозиторію GitHub натисніть **Code → Codespaces → Create codespace on main**.
2. Після відкриття середовища залежності встановлюються автоматично (`npm install`). Усі подальші команди виконуються в терміналі Codespace у корені репозиторію без встановлення програм на локальний комп'ютер і без Docker.

## 5. Змінні середовища
Значення ключів і паролів у репозиторії не зберігаються. Усі змінні задаються без лапок і пробілів:

| Назва змінної | Де взяти значення | Де потрібна |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | `.env.local`, Vercel (Production, Preview), GitHub Secrets |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` key | `.env.local`, Vercel (Production, Preview), GitHub Secrets |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` key | Лише `.env.local` (для службових тестів) |
| `TEST_USER_A_EMAIL` | Електронна пошта тестового користувача А (ранг «Офіцер») | `.env.local`, GitHub Secrets |
| `TEST_USER_B_EMAIL` | Електронна пошта тестового користувача Б (ранг «Учасник») | `.env.local`, GitHub Secrets |
| `TEST_USER_PASSWORD` | Пароль обох тестових акаунтів | `.env.local`, GitHub Secrets |
| `AI_PROVIDER` | Значення `openrouter` | `.env.local`, Vercel (Production, Preview) |
| `OPENROUTER_API_KEY` | Кабінет OpenRouter → Keys → API Key | `.env.local`, Vercel (Production, Preview) |
| `OPENROUTER_MODEL` | Назва моделі, наприклад `google/gemini-2.5-flash` | `.env.local`, Vercel (Production, Preview) |

## 6. `.env.example`
У корені репозиторію міститься шаблон `.env.example` з усіма назвами змінних без значень. Скопіюйте його в `.env.local` перед заповненням:
```bash
cp .env.example .env.local
```

## 7. База даних
1. Створіть новий проєкт у панелі **Supabase** (безкоштовний тариф).
2. У панелі Supabase перейдіть у **Authentication → Sign In / Providers → Email** та вимкніть підтвердження пошти (**Confirm email** → вимкнено, натисніть **Save**).
3. У терміналі Codespace виконайте вхід і прив'язку до проєкту (ідентифікатор `project-ref` — 20 символів з URL панелі Supabase):
```bash
npx supabase login
npx supabase link --project-ref <ваш-project-ref>
npx supabase db push
```
4. Переконайтеся, що всі міграції застосовано (`npx supabase migration list` показує однакові версії в колонках `Local` та `Remote`).

## 8. Тестові акаунти й дані
Для проходження інтеграційних тестів у проєкті Supabase мають існувати два користувачі (створюються через реєстрацію у застосунку або в **Supabase → Authentication → Users**):
1. **Акаунт А (`TEST_USER_A_EMAIL`):** після реєстрації в таблиці `public.profiles` для його запису встановіть колонку `rank = 'Офіцер'` (щоб акаунт міг створювати події та керувати складом).
2. **Акаунт Б (`TEST_USER_B_EMAIL`):** залишається зі стандартним рангом `'Учасник'` (використовується у тестах контролю доступу RLS для перевірки заборони чужого запису).

## 9. Тести
Запуск усіх тестів виконується однією командою (звернення до зовнішнього ШІ-провайдера в тестах вимкнено):
```bash
npm test
```
Очікуваний підсумок: `Test Files 5 passed (5)` та `Tests 21 passed (21)` без жодного `failed`.

## 10. Запуск
1. Запустіть сервер розробки:
```bash
npm run dev
```
2. Відкрийте вкладку **Ports** у нижній панелі Codespace і натисніть значок глобуса навпроти порту **3000** (**Open in Browser**).
3. Увійдіть під тестовим акаунтом А (`TEST_USER_A_EMAIL`) на сторінці `/login`.

## 11. Розгортання
1. Імпортуйте репозиторій GitHub у **Vercel** (фреймворк Next.js визначається автоматично).
2. У **Vercel → Project Settings → Environment Variables** додайте змінні `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `AI_PROVIDER`, `OPENROUTER_API_KEY` та `OPENROUTER_MODEL` для середовищ **Production** і **Preview** (змінні `TEST_USER_…` та `SUPABASE_SERVICE_ROLE_KEY` у Vercel не додаються).
3. Натисніть **Deploy** — основний домен автоматично оновлюється при кожному злитті в гілку `main`.

## 12. Конвеєр і правила
- Конвеєр перевірок описано у файлі `.github/workflows/ci.yml` і містить три обов'язкові завдання: `lint`, `test` та `secrets`.
- У **GitHub → Settings → Secrets and variables → Actions** додано п'ять секретів репозиторію: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `TEST_USER_A_EMAIL`, `TEST_USER_B_EMAIL`, `TEST_USER_PASSWORD`.
- Гілка `main` захищена правилом `main-protection` (Rulesets): прямий `git push` у `main` заборонено, злиття відбувається лише через Pull Request після зеленого проходження `lint`, `test`, `secrets` та `CodeQL`.
