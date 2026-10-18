"use client";

import Link from "next/link";

export default function EventDetailError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 text-zinc-100">
      <div className="rounded-2xl border border-red-900/60 bg-red-950/30 p-8 text-center">
        <h2 className="text-xl font-bold text-red-400">
          Не вдалося завантажити дані події
        </h2>
        <div className="mt-5 flex justify-center gap-4">
          <button
            onClick={() => reset()}
            className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-300"
          >
            Спробувати ще раз
          </button>
          <Link
            href="/events"
            className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200"
          >
            До розкладу подій
          </Link>
        </div>
      </div>
    </main>
  );
}
