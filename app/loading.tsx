export default function HomeLoading() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 text-zinc-100">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
        <p className="text-lg font-medium text-amber-400">
          Завантаження оперативного штабу гільдії…
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          Отримуємо статистику складу та розклад найближчих рейдів. Кнопки дій тимчасово неактивні.
        </p>
      </div>
    </main>
  );
}
