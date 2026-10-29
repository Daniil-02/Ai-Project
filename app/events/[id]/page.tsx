import { LiveRefresh } from "@/components/live-refresh";
import { ActionForm } from "@/components/action-form";
import Link from "next/link";
import { getEventWithSquads } from "@/lib/data/events";
import { listCommentsByEvent } from "@/lib/data/comments";
import {
  addCommentAction,
  cancelRegistrationAction,
  closeRecruitmentAction,
  hideCommentAction,
  registerAction,
  reportCommentAction,
  toggleSlotAction,
} from "./actions";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [details, comments] = await Promise.all([
    getEventWithSquads(id),
    listCommentsByEvent(id),
  ]);

  if (!details) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12 text-zinc-100">
      <LiveRefresh table="event_registrations" />
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10 text-center">
          <h1 className="text-xl font-bold">
            Подію не знайдено або до неї ще немає жодної заявки й коментаря
          </h1>
          <Link
            href="/events"
            className="mt-5 inline-block rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950"
          >
            Повернутися до розкладу подій
          </Link>
        </div>
      </main>
    );
  }

  const { event, mainSquad, reserveSquad } = details;
  const isClosed = event.status === "Завершено";

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10 text-zinc-100">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            Shadow Vanguard · Подія #{event.id}
          </p>
          <h1 className="text-2xl font-bold">{event.title}</h1>
        </div>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/events" className="text-zinc-300 hover:text-white">
            Розклад подій
          </Link>
          <Link href="/members" className="text-zinc-300 hover:text-white">
            Склад гільдії
          </Link>
        </nav>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs font-semibold text-emerald-400">
                {event.status}
              </span>
              <span className="rounded-full border border-emerald-700/50 px-3 py-1 text-xs text-emerald-300">
                ● REALTIME
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-bold">{event.title}</h2>
            <p className="mt-1 text-xs text-zinc-400">
              {event.tier} · {event.dateTime}
            </p>
            <p className="mt-4 text-sm text-zinc-300">{event.description}</p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div>
                <p className="text-xs text-zinc-400">Заповненість основного складу</p>
                <p className="text-lg font-bold">
                  {event.mainCount} з {event.maxSlots} учасників
                </p>
              </div>

              {!isClosed && (
                <ActionForm action={registerAction} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="eventId" value={event.id} />
                  <input
                    name="nickname"
                    placeholder="Ваш нікнейм"
                    required
                    className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white"
                  />
                  <select
                    name="role"
                    className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white"
                  >
                    <option value="Танк">Танк</option>
                    <option value="Хілер">Хілер</option>
                    <option value="ДПС">ДПС</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-amber-300"
                  >
                    Записатися на рейд
                  </button>
                </ActionForm>
              )}
            </div>

            {!isClosed && (
              <ActionForm action={closeRecruitmentAction} className="mt-4 flex justify-end">
                <input type="hidden" name="eventId" value={event.id} />
                <button
                  type="submit"
                  className="rounded-xl border border-zinc-700 px-4 py-1.5 text-xs text-zinc-300 hover:border-zinc-500"
                >
                  Завершити набір (Офіцер)
                </button>
              </ActionForm>
            )}
          </section>

          <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h3 className="text-lg font-bold">Основний склад ({mainSquad.length})</h3>
            {mainSquad.length === 0 ? (
              <p className="text-sm text-zinc-400">В основному складі ще немає гравців.</p>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {mainSquad.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-semibold">{r.nickname}</p>
                      <p className="text-xs text-zinc-400">
                        {r.role} · {r.rank}
                      </p>
                    </div>
                    {!isClosed && (
                      <div className="flex gap-2">
                        <ActionForm action={toggleSlotAction}>
                          <input type="hidden" name="eventId" value={event.id} />
                          <input type="hidden" name="nickname" value={r.nickname} />
                          <button
                            type="submit"
                            className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300 hover:border-zinc-500"
                          >
                            У резерв
                          </button>
                        </ActionForm>
                        <ActionForm action={cancelRegistrationAction}>
                          <input type="hidden" name="eventId" value={event.id} />
                          <input type="hidden" name="nickname" value={r.nickname} />
                          <button
                            type="submit"
                            className="rounded-lg border border-red-900/60 px-2.5 py-1 text-xs text-red-400"
                          >
                            Скасувати заявку
                          </button>
                        </ActionForm>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <h3 className="pt-4 text-lg font-bold">Резерв ({reserveSquad.length})</h3>
            {reserveSquad.length === 0 ? (
              <p className="text-sm text-zinc-400">Список резерву порожній.</p>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {reserveSquad.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-semibold">
                        {r.nickname}{" "}
                        <span className="text-xs text-amber-400">[Резерв]</span>
                      </p>
                      <p className="text-xs text-zinc-400">{r.role}</p>
                    </div>
                    {!isClosed && (
                      <div className="flex gap-2">
                        <ActionForm action={toggleSlotAction}>
                          <input type="hidden" name="eventId" value={event.id} />
                          <input type="hidden" name="nickname" value={r.nickname} />
                          <button
                            type="submit"
                            className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-amber-400"
                          >
                            В основу
                          </button>
                        </ActionForm>
                        <ActionForm action={cancelRegistrationAction}>
                          <input type="hidden" name="eventId" value={event.id} />
                          <input type="hidden" name="nickname" value={r.nickname} />
                          <button
                            type="submit"
                            className="rounded-lg border border-red-900/60 px-2.5 py-1 text-xs text-red-400"
                          >
                            Скасувати заявку
                          </button>
                        </ActionForm>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Комунікація</p>
          <h3 className="text-lg font-bold">Коментарі</h3>

          <div className="space-y-3">
            {comments.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm"
              >
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-200">{c.author}</span>
                  <span>{c.time}</span>
                </div>
                <p className={c.isHidden ? "mt-2 italic text-zinc-500" : "mt-2 text-zinc-200"}>
                  {c.text}
                </p>
                {c.reportsCount > 0 && !c.isHidden && (
                  <p className="mt-1 text-xs text-amber-400">
                    На розгляді модератора (скарг: {c.reportsCount})
                  </p>
                )}
                {!c.isHidden && (
                  <div className="mt-3 flex gap-3 text-xs text-zinc-400">
                    <ActionForm action={reportCommentAction}>
                      <input type="hidden" name="eventId" value={event.id} />
                      <input type="hidden" name="commentId" value={c.id} />
                      <button type="submit" className="hover:text-amber-400">
                        Поскаржитися
                      </button>
                    </ActionForm>
                    <ActionForm action={hideCommentAction}>
                      <input type="hidden" name="eventId" value={event.id} />
                      <input type="hidden" name="commentId" value={c.id} />
                      <button type="submit" className="hover:text-red-400">
                        Приховати
                      </button>
                    </ActionForm>
                  </div>
                )}
              </div>
            ))}
          </div>

          <ActionForm action={addCommentAction} className="space-y-3 pt-2">
            <input type="hidden" name="eventId" value={event.id} />
            <input
              name="author"
              placeholder="Ваш нікнейм"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
            />
            <textarea
              name="text"
              required
              rows={2}
              placeholder="Напишіть коментар щодо спорядження чи тактики..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
            />
            <button
              type="submit"
              className="w-full rounded-xl border border-zinc-700 py-2 text-xs font-semibold hover:border-zinc-500"
            >
              Надіслати
            </button>
          </ActionForm>
        </section>
      </div>
    </main>
  );
}
