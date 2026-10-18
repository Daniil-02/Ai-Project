import Link from "next/link";
import { listEvents } from "@/lib/data/events";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const currentStatus = params.status || "Усі";
  const events = await listEvents(currentStatus);
  const statuses = ["Усі", "Набір відкрито", "Завершено"];

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10 text-zinc-100">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            Shadow Vanguard
          </p>
          <h1 className="text-2xl font-bold">Розклад подій</h1>
        </div>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/" className="text-zinc-300 hover:text-white">
            Головна
          </Link>
          <Link
            href="/events/new"
            className="rounded-xl bg-amber-400 px-4 py-2 font-semibold text-zinc-950 hover:bg-amber-300"
          >
            + Створити подію
          </Link>
        </nav>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Усі події</h2>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => {
            const active = currentStatus === s;
            return (
              <Link
                key={s}
                href={s === "Усі" ? "/events" : `/events?status=${encodeURIComponent(s)}`}
                className={
                  active
                    ? "rounded-full bg-amber-400 px-4 py-1.5 text-xs font-semibold text-zinc-950"
                    : "rounded-full border border-zinc-700 px-4 py-1.5 text-xs text-zinc-300 hover:border-zinc-500"
                }
              >
                {s}
              </Link>
            );
          })}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10 text-center">
          <p className="text-lg font-semibold text-zinc-200">
            Запланованих ігрових подій ще немає
          </p>
          <div className="mt-5 flex justify-center gap-4">
            <Link
              href="/events/new"
              className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-300"
            >
              Створити подію
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200"
            >
              Головна
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"
            >
              <div>
                <p className="text-xs uppercase text-zinc-400">{ev.tier}</p>
                <Link
                  href={`/events/${ev.id}`}
                  className="mt-1 block text-xl font-bold text-white hover:text-amber-400"
                >
                  {ev.title}
                </Link>
                <p className="mt-1 text-xs text-zinc-400">{ev.dateTime}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-zinc-400">Слоти</p>
                  <p className="text-sm font-bold">
                    {ev.mainCount} / {ev.maxSlots}
                  </p>
                </div>
                <span
                  className={
                    ev.status === "Набір відкрито"
                      ? "rounded-full bg-emerald-950 px-3 py-1 text-xs font-medium text-emerald-400"
                      : "rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-400"
                  }
                >
                  {ev.status}
                </span>
                <Link
                  href={`/events/${ev.id}`}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold hover:border-zinc-500"
                >
                  Детальніше →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
