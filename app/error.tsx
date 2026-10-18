"use client";

export default function HomeError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 text-zinc-100">
      <div className="rounded-2xl border border-red-900/60 bg-red-950/30 p-8 text-center">
        <h2 className="text-xl font-bold text-red-400">
          Не вдалося завантажити дані дашборду гільдії
        </h2>
        <p className="mt-2 text-sm text-zinc-300">
          Стався збій під час звернення до модуля даних. Ви можете повторити спробу.
        </p>
        <button
          onClick={() => reset()}
          className="mt-5 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-300"
        >
          Спробувати ще раз
        </button>
      </div>
    </main>
  );
}
