import { POWERED_BY_URL } from "@/lib/constants";

export function PoweredByBadge({ className }: { className?: string }) {
  return (
    <a
      href={POWERED_BY_URL}
      target="_blank"
      rel="noreferrer"
      className={[
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-zinc-400 transition hover:border-white/20 hover:text-zinc-100 sm:text-sm",
        className ?? "",
      ].join(" ")}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400" aria-hidden="true" />
      Powered by ipgeolocation.io
    </a>
  );
}
