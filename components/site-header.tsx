import Link from "next/link";
import { ArrowDownUp, Globe, Terminal } from "lucide-react";

import { PoweredByBadge } from "@/components/powered-by-badge";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

const TABS = [
  { href: "/", label: "My headers", icon: ArrowDownUp },
  { href: "/check", label: "Check a URL", icon: Globe },
];

export function SiteHeader({ active }: { active: "mine" | "check" }) {
  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500 text-white">
              <Terminal className="h-4.5 w-4.5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-zinc-50">{SITE_NAME}</span>
          </Link>
          <p className="mt-1 text-sm text-zinc-500">{SITE_TAGLINE}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex rounded-full border border-white/10 bg-white/5 p-1">
            {TABS.map((tab) => {
              const isActive =
                (active === "mine" && tab.href === "/") ||
                (active === "check" && tab.href === "/check");
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
                    isActive ? "bg-rose-500 text-white" : "text-zinc-400 hover:text-zinc-100",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          <PoweredByBadge />
        </div>
      </div>
    </header>
  );
}
