import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe, Search, Server } from "lucide-react";
import { Suspense } from "react";

import { HeaderTable } from "@/components/header-table";
import { LookupNotice } from "@/components/lookup-notice";
import { PageSkeleton } from "@/components/page-skeleton";
import { RawBlock } from "@/components/raw-block";
import { SecurityCard } from "@/components/security-card";
import { SiteHeader } from "@/components/site-header";
import { EXAMPLES } from "@/lib/constants";
import { inspectUrl } from "@/lib/inspect";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HTTP Response Header Checker — Security Headers & Redirects",
  description:
    "Check any URL's HTTP response headers, with a security header grade, the full redirect chain, and details of the server that answered.",
  alternates: { canonical: "/check" },
};

type PageProps = {
  searchParams: Promise<{ url?: string | string[] }>;
};

export default function CheckPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CheckContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CheckContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const raw = Array.isArray(params.url) ? params.url[0] : params.url;
  const target = raw?.trim() ?? "";
  const result = target ? await inspectUrl(target) : null;

  return (
    <>
      <SiteHeader active="check" />
      <main className="mx-auto max-w-5xl space-y-5 px-4 py-8 sm:px-6">
        <form action="/check" method="get">
          <label htmlFor="url" className="sr-only">
            URL to inspect
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="url"
              name="url"
              type="text"
              defaultValue={target}
              placeholder="https://example.com"
              className="wire w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-base text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-rose-500"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-rose-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-400"
            >
              <Search className="h-4 w-4" />
              Inspect
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">Try</span>
          {EXAMPLES.map((example) => (
            <Link
              key={example}
              href={`/check?url=${encodeURIComponent(example)}`}
              className="wire rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-rose-500/40 hover:text-rose-300"
            >
              {example}
            </Link>
          ))}
        </div>

        {!target ? (
          <section className="flex flex-col items-center rounded-xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-rose-500 text-white">
              <Globe className="h-7 w-7" />
            </span>
            <h2 className="mt-5 text-2xl font-bold text-zinc-50">Inspect a URL</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Every response header is fetched and grouped, security headers are graded,
              the redirect chain is followed, and the server that answered is identified.
            </p>
          </section>
        ) : result && !result.ok ? (
          <LookupNotice title={result.error.title} message={result.error.message} />
        ) : result?.ok ? (
          <>
            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`wire rounded-lg px-3 py-1.5 text-sm font-bold ${
                    result.data.status < 300
                      ? "bg-emerald-500/15 text-emerald-300"
                      : result.data.status < 400
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-rose-500/15 text-rose-300"
                  }`}
                >
                  {result.data.status} {result.data.statusText}
                </span>
                <span className="text-xs text-zinc-500">{result.data.elapsedMs} ms</span>
                <span className="text-xs text-zinc-500">
                  {Object.keys(result.data.headers).length} headers
                </span>
              </div>
              <p className="wire mt-3 break-all text-sm text-zinc-300">{result.data.url}</p>

              {result.data.redirects.length > 0 ? (
                <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Redirect chain
                  </p>
                  {result.data.redirects.map((hop) => (
                    <p key={hop.from} className="wire flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-amber-300">{hop.status}</span>
                      <span className="break-all">{hop.from}</span>
                      <ArrowRight className="h-3 w-3 shrink-0 text-zinc-600" />
                      <span className="break-all text-zinc-300">{hop.to}</span>
                    </p>
                  ))}
                </div>
              ) : null}

              {result.data.server ? (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    <Server className="h-3.5 w-3.5" />
                    Answered by
                  </p>
                  <p className="wire mt-2 break-all text-sm text-zinc-200">
                    {result.data.server.ip}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {[
                      result.data.server.organization,
                      result.data.server.asNumber,
                      [result.data.server.countryEmoji, result.data.server.countryName]
                        .filter(Boolean)
                        .join(" "),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {result.data.server.isCdn ? (
                      <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-bold text-rose-300">
                        {result.data.server.cdnProviderName || "CDN"}
                      </span>
                    ) : null}
                    {result.data.server.isAnycast ? (
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                        Anycast
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </section>

            <SecurityCard report={result.data.security} />
            <RawBlock
              headers={result.data.headers}
              statusLine={`HTTP ${result.data.status} ${result.data.statusText}`}
            />
            <HeaderTable headers={result.data.headers} />

            <p className="text-xs leading-6 text-zinc-600">
              Only public http and https targets are fetched. Private, loopback,
              link-local, and cloud metadata addresses are rejected, and every redirect
              hop is re-checked before it is followed.
            </p>
          </>
        ) : null}
      </main>
    </>
  );
}
