export default function Loading() {
  return (
    <div className="animate-pulse" aria-busy="true">
      <div className="mb-3.5 h-7 w-44 rounded-lg bg-ink/8" />
      <div className="mb-4 flex gap-2.5">
        <div className="h-11 flex-1 rounded-xl bg-ink/6" />
        <div className="h-11 flex-1 rounded-xl bg-ink/6" />
      </div>
      <div className="h-[220px] rounded-2xl bg-ink/6" />
      <div className="mt-3.5 h-[160px] rounded-2xl bg-ink/6" />
    </div>
  );
}
