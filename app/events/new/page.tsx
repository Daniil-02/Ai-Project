import Link from "next/link";
import { createEventAction } from "./actions";

export default function NewEventPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10 text-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            Shadow Vanguard · Офіцер гільдії
          </p>
          <h1 className="text-2xl font-bold">Нова подія</h1>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/events" className="text-zinc-300 hover:text-white">
            Розклад подій
          </Link>
          <Link href="/" className="text-zinc-300 hover:text-white">
            Головна
          </Link>
        </nav>
      </header>

      <form
        action={createEventAction}
        className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8"
      >
        <div>
          <label className="block text-sm font-medium text-zinc-200">Назва події</label>
          <input
            name="title"
            required
            placeholder="Наприклад, Цитадель Попелу"
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-200">Дата та час</label>
          <input
            name="dateTime"
            required
            placeholder="Наприклад, Пт, 24 травня · 20:00"
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-200">Ліміт місць в основі</label>
          <input
            name="maxSlots"
            type="number"
            min={1}
            defaultValue={10}
            required
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-200">Опис цілі рейду</label>
          <textarea
            name="description"
            rows={4}
            placeholder="Вимоги до спорядження та тактика проходження..."
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <Link
            href="/events"
            className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-300"
          >
            Скасувати
          </Link>
          <button
            type="submit"
            className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-300"
          >
            Створити подію
          </button>
        </div>
      </form>
    </main>
  );
}
