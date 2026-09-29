import { Check, Minus, X } from "lucide-react";

import type { SecurityReport } from "@/lib/security-grade";

const GRADE_TONE: Record<SecurityReport["grade"], string> = {
  A: "bg-emerald-500 text-emerald-950",
  B: "bg-lime-500 text-lime-950",
  C: "bg-amber-500 text-amber-950",
  D: "bg-orange-500 text-orange-950",
  F: "bg-rose-500 text-rose-950",
};

const STATUS_ICON = { pass: Check, warn: Minus, fail: X };
const STATUS_TONE = {
  pass: "text-emerald-400",
  warn: "text-amber-400",
  fail: "text-rose-400",
};

export function SecurityCard({ report }: { report: SecurityReport }) {
  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="flex flex-wrap items-center gap-4 border-b border-white/10 px-5 py-4">
        <span
          className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl font-black ${GRADE_TONE[report.grade]}`}
        >
          {report.grade}
        </span>
        <div>
          <h2 className="text-lg font-bold text-zinc-100">Security headers</h2>
          <p className="text-sm text-zinc-400">
            {report.passed} of {report.total} checks passed · score {report.score}/100
          </p>
        </div>
      </div>

      <ul className="divide-y divide-white/5">
        {report.checks.map((check) => {
          const Icon = STATUS_ICON[check.status];

          return (
            <li key={check.header} className="flex gap-3 px-5 py-3">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${STATUS_TONE[check.status]}`} />
              <div className="min-w-0">
                <p className="wire text-sm font-semibold text-zinc-200">{check.header}</p>
                <p className="mt-0.5 text-xs leading-5 text-zinc-500">{check.note}</p>
                {check.value ? (
                  <p className="wire mt-1 break-all text-xs text-zinc-600">{check.value}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
