"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex max-w-4xl flex-col items-start gap-4 py-16">
      <h1 className="text-3xl font-semibold">Dashboard failed to load</h1>
      <p className="text-sm text-white/70">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
      >
        Retry
      </button>
    </main>
  );
}
