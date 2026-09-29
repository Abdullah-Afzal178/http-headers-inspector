import { toTitleCase } from "@/lib/header-catalog";

/** The headers as they'd look on the wire, like `curl -I`. */
export function RawBlock({
  headers,
  statusLine,
}: {
  headers: Record<string, string>;
  statusLine?: string;
}) {
  const lines = Object.keys(headers)
    .sort()
    .map((name) => `${toTitleCase(name)}: ${headers[name]}`);

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
        <span className="ml-2 text-xs font-semibold text-zinc-500">raw</span>
      </div>
      <pre className="wire overflow-x-auto px-4 py-3 text-xs leading-6 text-zinc-300">
        {statusLine ? (
          <span className="block font-bold text-rose-300">{statusLine}</span>
        ) : null}
        {lines.join("\n")}
      </pre>
    </section>
  );
}
