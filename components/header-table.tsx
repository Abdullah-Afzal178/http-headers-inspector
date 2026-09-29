import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  describeHeader,
  type HeaderCategory,
} from "@/lib/header-catalog";

const CATEGORY_TONE: Record<HeaderCategory, string> = {
  security: "text-rose-300 ring-rose-500/30 bg-rose-500/10",
  caching: "text-sky-300 ring-sky-500/30 bg-sky-500/10",
  content: "text-violet-300 ring-violet-500/30 bg-violet-500/10",
  cors: "text-amber-300 ring-amber-500/30 bg-amber-500/10",
  client: "text-emerald-300 ring-emerald-500/30 bg-emerald-500/10",
  server: "text-cyan-300 ring-cyan-500/30 bg-cyan-500/10",
  other: "text-zinc-400 ring-white/15 bg-white/5",
};

/** Headers grouped by purpose, each annotated with what it does. */
export function HeaderTable({ headers }: { headers: Record<string, string> }) {
  const entries = Object.entries(headers).map(([name, value]) => ({
    name,
    value,
    info: describeHeader(name),
  }));

  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    rows: entries
      .filter((entry) => entry.info.category === category)
      .sort((a, b) => a.info.label.localeCompare(b.info.label)),
  })).filter((group) => group.rows.length > 0);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.category}>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
            {CATEGORY_LABELS[group.category]}
            <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-500">
              {group.rows.length}
            </span>
          </h3>

          <div className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            {group.rows.map((row) => (
              <div key={row.name} className="grid gap-1 px-4 py-3 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-4">
                <div className="min-w-0">
                  <p className="wire truncate text-sm font-semibold text-zinc-100" title={row.info.label}>
                    {row.info.label}
                  </p>
                  <span
                    className={`mt-1 inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${CATEGORY_TONE[row.info.category]}`}
                  >
                    {CATEGORY_LABELS[row.info.category]}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="wire break-all text-sm text-zinc-300">{row.value || "—"}</p>
                  {row.info.description ? (
                    <p className="mt-1 text-xs leading-5 text-zinc-500">{row.info.description}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
