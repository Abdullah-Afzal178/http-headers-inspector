export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-8 sm:px-6">
      <div className="h-32 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />
      <div className="h-56 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />
      <div className="h-72 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />
    </div>
  );
}
