import { ActionForm } from "@/components/action-form";
import { db } from "@/lib/data/db/client";
import { signInAction, signOutAction, signUpAction } from "./actions";

const inputClass =
  "w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 shadow-inner transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400";
const primaryBtnClass =
  "w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-md transition-all hover:bg-amber-400 active:scale-[0.99]";
const secondaryBtnClass =
  "w-full rounded-lg border border-amber-500/40 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-amber-400 transition-all hover:bg-amber-500/10 active:scale-[0.99]";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/" } = await searchParams;
  const { data } = await db().auth.getUser();

  return (
    <main className="mx-auto flex min-h-[85vh] w-full max-w-4xl flex-col justify-center px-4 py-12 text-zinc-100">
      {/* Заголовок гільдії */}
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-400">
          Shadow Vanguard
        </span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Портал автентифікації гільдії
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Увійдіть під своїм бойовим акаунтом або зареєструйтесь для участі в рейдах
        </p>
      </div>

      {/* Якщо користувач уже увійшов */}
      {data.user ? (
        <section className="mb-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            <p className="text-sm text-zinc-200">
              Ви увійшли як: <strong className="text-amber-400">{data.user.email}</strong>
            </p>
          </div>
          <form action={signOutAction}>
            <button className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white">
              Вийти з акаунта
            </button>
          </form>
        </section>
      ) : null}

      {/* Дві картки: Вхід та Реєстрація */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Картка входу */}
        <section className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur sm:p-8">
          <div>
            <div className="mb-5 flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <h2 className="text-xl font-bold text-zinc-100">Вхід у систему</h2>
              <span className="text-xs text-zinc-500">Авторизація</span>
            </div>

            <ActionForm action={signInAction} className="space-y-4">
              <input type="hidden" name="next" value={next} />
              <div>
                <label className={labelClass}>Електронна пошта</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="warrior@guild.local"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Пароль</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>

              <div className="pt-2">
                <button className={primaryBtnClass}>Увійти в гільдію</button>
              </div>
            </ActionForm>
          </div>
        </section>

        {/* Картка реєстрації */}
        <section className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur sm:p-8">
          <div>
            <div className="mb-5 flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <h2 className="text-xl font-bold text-zinc-100">Новий рекрут</h2>
              <span className="text-xs text-zinc-500">Реєстрація</span>
            </div>

            <ActionForm action={signUpAction} className="space-y-4">
              <input type="hidden" name="next" value={next} />
              <div>
                <label className={labelClass}>Ігровий нікнейм / ПІБ</label>
                <input
                  name="full_name"
                  required
                  placeholder="Nightstalker"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Електронна пошта</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="recruit@guild.local"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Пароль (від 6 символів)</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>

              <div className="pt-2">
                <button className={secondaryBtnClass}>Зареєструватися</button>
              </div>
            </ActionForm>
          </div>
        </section>
      </div>
    </main>
  );
}
