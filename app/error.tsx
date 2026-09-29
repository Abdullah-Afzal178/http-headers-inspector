"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-xl rounded-xl border border-white/10 bg-white/[0.03] p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Unexpected error
        </p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-50">
          The page could not be rendered.
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Try again. If the problem continues, verify the API key and the response from
          ipgeolocation.io.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 inline-flex items-center rounded-lg bg-rose-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-400"
        >
          Retry
        </button>
      </section>
    </main>
  );
}
