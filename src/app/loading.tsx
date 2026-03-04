export default function Loading() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="h-6 w-40 rounded-full bg-white/10" />
        <div className="h-10 w-80 rounded-2xl bg-white/10" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="card h-56 animate-pulse bg-white/5"
          />
        ))}
      </div>
      <div className="card h-72 animate-pulse bg-white/5" />
    </main>
  );
}
