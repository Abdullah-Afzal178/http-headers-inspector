import { Fingerprint, MapPin } from "lucide-react";
import { Suspense } from "react";

import { HeaderTable } from "@/components/header-table";
import { PageSkeleton } from "@/components/page-skeleton";
import { RawBlock } from "@/components/raw-block";
import { SiteHeader } from "@/components/site-header";
import { getMyRequest } from "@/lib/my-request";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MyHeaders />
    </Suspense>
  );
}

async function MyHeaders() {
  const data = await getMyRequest();
  const ua = data.parsedUserAgent;
  const client = data.client;
  const count = Object.keys(data.headers).length;

  return (
    <>
      <SiteHeader active="mine" />
      <main className="mx-auto max-w-5xl space-y-5 px-4 py-8 sm:px-6">
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose-400">
            Your request
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
            Your browser sent {count} header{count === 1 ? "" : "s"}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            This is exactly what every site you visit receives, before you click anything.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-black/30 p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <Fingerprint className="h-3.5 w-3.5" />
                Identified as
              </p>
              {ua ? (
                <>
                  <p className="mt-2 text-lg font-bold text-zinc-100">
                    {[ua.name, ua.version].filter(Boolean).join(" ") || "Unknown client"}
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-400">
                    {[ua.osName, ua.osVersion].filter(Boolean).join(" ")}
                    {ua.deviceName ? ` · ${ua.deviceName}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {[ua.type, ua.engineName && `${ua.engineName} engine`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-zinc-500">
                  The User-Agent could not be parsed.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-white/10 bg-black/30 p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <MapPin className="h-3.5 w-3.5" />
                Coming from
              </p>
              {client ? (
                <>
                  <p className="wire mt-2 break-all text-lg font-bold text-zinc-100">
                    {client.ip}
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-400">
                    {client.countryEmoji ? `${client.countryEmoji} ` : ""}
                    {[client.city, client.countryName].filter(Boolean).join(", ") || "Unknown"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {[client.organization, client.asNumber].filter(Boolean).join(" · ")}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-zinc-500">
                  No public client IP was detected.
                </p>
              )}
            </div>
          </div>

          {data.note ? (
            <p className="mt-4 text-xs text-zinc-500">{data.note}</p>
          ) : null}
        </section>

        <RawBlock headers={data.headers} />
        <HeaderTable headers={data.headers} />

        <p className="text-xs leading-6 text-zinc-600">
          Cookie and authorization headers are redacted before rendering and are never
          sent anywhere. Nothing from your request is stored.
        </p>
      </main>
    </>
  );
}
