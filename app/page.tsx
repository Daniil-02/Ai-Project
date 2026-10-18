import Link from "next/link";
import { listMembers } from "@/lib/data/members";
import { listEvents } from "@/lib/data/events";

export default async function HomePage() {
  const [members, events] = await Promise.all([listMembers(), listEvents()]);
  const openEvents = events.filter((e) => e.status === "Набір відкрито");

  if (members.length === 0 && events.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12 text-zinc-100">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center">
          <h1 className="text-2xl font-bold text-zinc-100">
            Активних подій та статистики гільдії ще немає
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Створіть перший рейд або перевірте список учасників гільдії Shadow Vanguard.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/events/new"
              className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-300"
            >
              Створити першу подію
            </Link>
            <Link
              href="/members"
              className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 hover:border-zinc-500"
            >
              Склад гільдії
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const nextRaid = openEvents[0] ?? events[0];

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-6 py-10 text-zinc-100">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            Гільдія
          </p>
          <h1 className="text-2xl font-bold">Shadow Vanguard</h1>
        </div>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/members" className="text-zinc-300 hover:text-white">
            Склад гільдії
          </Link>
          <Link href="/events" className="text-zinc-300 hover:text-white">
            Розклад подій
          </Link>
          <Link
            href="/events/new"
            className="rounded-xl bg-amber-400 px-4 py-2 font-semibold text-zinc-950 hover:bg-amber-300"
          >
            + Створити подію
          </Link>
        </nav>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            Оперативний штаб · Сезон V
          </p>
          <h2 className="mt-3 text-4xl font-extrabold leading-tight">
            Разом сильніші. <span className="text-amber-400">Разом — легенда.</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm text-zinc-400">
            Координуй склад, плануй наступні рейди та збирай команду Shadow Vanguard для нових перемог.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/members"
              className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-300"
            >
              Переглянути склад →
            </Link>
            <Link
              href="/events"
              className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 hover:border-zinc-500"
            >
              Розклад подій
            </Link>
          </div>
        </div>

        {nextRaid && (
          <div className="rounded-2xl border border-amber-500/30 bg-zinc-900/80 p-6">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Наступний рейд</p>
            <h3 className="mt-2 text-2xl font-bold text-white">{nextRaid.title}</h3>
            <p className="mt-1 text-sm text-amber-400">{nextRaid.dateTime}</p>
            <div className="mt-5 flex items-center justify-between text-xs text-zinc-300">
              <span>Заповненість загону</span>
              <span className="font-bold">
                {nextRaid.registrations.filter((r) => r.status === "Основний склад").length} /{" "}
                {nextRaid.maxSlots}
              </span>
            </div>
            <Link
              href={`/events/${nextRaid.id}`}
              className="mt-5 inline-block text-sm font-semibold text-amber-400 hover:underline"
            >
              Деталі події →
            </Link>
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <p className="text-xs text-zinc-400">Учасники гільдії</p>
          <p className="mt-2 text-3xl font-extrabold">{members.length}</p>
          <p className="mt-1 text-xs text-emerald-400">Активний бойовий реєстр</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <p className="text-xs text-zinc-400">Відкриті події</p>
          <p className="mt-2 text-3xl font-extrabold">{openEvents.length}</p>
          <p className="mt-1 text-xs text-emerald-400">Набір відкрито</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <p className="text-xs text-zinc-400">Усього подій у розкладі</p>
          <p className="mt-2 text-3xl font-extrabold">{events.length}</p>
          <p className="mt-1 text-xs text-zinc-400">За поточний сезон</p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Найближчі рейди</h2>
          <Link href="/events" className="text-sm font-semibold text-amber-400 hover:underline">
            Усі події →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {events.slice(0, 2).map((ev) => (
            <Link
              key={ev.id}
              href={`/events/${ev.id}`}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-zinc-700"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{ev.title}</h3>
                <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs font-medium text-emerald-400">
                  {ev.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">{ev.dateTime}</p>
              <p className="mt-3 text-xs text-zinc-300">
                Слоти основи:{" "}
                {ev.registrations.filter((r) => r.status === "Основний склад").length} /{" "}
                {ev.maxSlots}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
