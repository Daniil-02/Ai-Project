"use client";

import Link from "next/link";

export default function MembersError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 text-zinc-100">
      <div className="rounded-2xl border border-red-900/60 bg-red-950/30 p-8 text-center">
        <h2 className="text-xl font-bold text-red-400">
          Не вдалося завантажити склад гільдії
        </h2>
        <p className="mt-2 text-sm text-zinc-300">
          Спробуйте повторити запит або поверніться на головну сторінку.
        </p>
        <div className="mt-5 flex justify-center gap-4">
          <button
            onClick={() => reset()}
            className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-300"
          >
            Спробувати ще раз
          </button>
          <Link
            href="/"
            className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 hover:border-zinc-500"
          >
            На головну
          </Link>
        </div>
      </div>
    </main>
  );
}
