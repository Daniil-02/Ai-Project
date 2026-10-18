export default function EventDetailLoading() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 text-zinc-100">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
        <p className="text-lg font-medium text-amber-400">
          Завантаження деталей рейду та складу загону…
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          Кнопки запису й коментарів тимчасово неактивні.
        </p>
      </div>
    </main>
  );
}
