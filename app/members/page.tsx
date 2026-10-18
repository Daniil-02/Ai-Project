import Link from "next/link";
import { listMembers } from "@/lib/data/members";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const params = await searchParams;
  const currentRole = params.role || "Усі";
  const members = await listMembers(currentRole);
  const roles = ["Усі", "Танк", "Хілер", "ДПС"];

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10 text-zinc-100">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            Shadow Vanguard
          </p>
          <h1 className="text-2xl font-bold">Склад гільдії</h1>
        </div>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/" className="text-zinc-300 hover:text-white">
            Головна
          </Link>
          <Link href="/events" className="text-zinc-300 hover:text-white">
            Розклад подій
          </Link>
        </nav>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-400">Учасники та їхні ролі в бойовому загоні</p>
          <h2 className="text-xl font-bold">
            Наші герої <span className="text-sm font-normal text-zinc-400">({members.length})</span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => {
            const active = currentRole === r;
            return (
              <Link
                key={r}
                href={r === "Усі" ? "/members" : `/members?role=${encodeURIComponent(r)}`}
                className={
                  active
                    ? "rounded-full bg-amber-400 px-4 py-1.5 text-xs font-semibold text-zinc-950"
                    : "rounded-full border border-zinc-700 px-4 py-1.5 text-xs text-zinc-300 hover:border-zinc-500"
                }
              >
                {r}
              </Link>
            );
          })}
        </div>
      </div>

      {members.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10 text-center">
          <p className="text-lg font-semibold text-zinc-200">
            У складі гільдії за обраним фільтром учасників не знайдено
          </p>
          <div className="mt-5 flex justify-center gap-4">
            <Link
              href="/members"
              className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-300"
            >
              Показати всіх учасників
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
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-6 py-4">Нікнейм</th>
                <th className="px-6 py-4">Клас</th>
                <th className="px-6 py-4">Бойова роль</th>
                <th className="px-6 py-4">Ранг у гільдії</th>
                <th className="px-6 py-4">Статус активності</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-900/70">
                  <td className="px-6 py-4 font-semibold text-white">{m.nickname}</td>
                  <td className="px-6 py-4 text-zinc-300">{m.characterClass}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs">
                      {m.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-amber-400">{m.rank}</td>
                  <td className="px-6 py-4 text-zinc-300">{m.activeStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
