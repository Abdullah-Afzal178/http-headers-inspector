import { TriangleAlert } from "lucide-react";

export function LookupNotice({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4">
      <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
      <div>
        <p className="font-bold text-zinc-100">{title}</p>
        <p className="mt-1 text-sm leading-6 text-zinc-400">{message}</p>
      </div>
    </div>
  );
}
