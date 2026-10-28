import { ActionForm } from "@/components/action-form";
import Link from "next/link";
import { createEventAction } from "./actions";

const field = "w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none";
const button = "rounded bg-amber-500 px-4 py-2 font-medium text-zinc-950 hover:bg-amber-400 transition-colors";

export default function NewEventPage() {
  return (
    <main className="mx-auto max-w-xl space-y-6 p-6 text-zinc-100">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-amber-500">Створення нової події</h1>
        <Link href="/events" className="text-sm text-zinc-400 hover:text-zinc-200 underline">
          ← Назад до розкладу
        </Link>
      </div>

      <ActionForm action={createEventAction} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Назва рейду / події</label>
          <input name="title" required placeholder="Наприклад: Цитадель Попелу" className={field} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Дата та час</label>
          <input name="dateTime" required placeholder="Наприклад: Пт, 24 жовтня · 20:00" className={field} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Ліміт місць в основі</label>
          <input name="maxSlots" type="number" min="1" max="40" required defaultValue="10" className={field} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Опис цілі рейду</label>
          <textarea name="description" rows={3} placeholder="Короткий опис або тактичні нотатки" className={field} />
        </div>

        <div className="pt-2">
          <button className={button}>Створити подію</button>
        </div>
      </ActionForm>
    </main>
  );
}
