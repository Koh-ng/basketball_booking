export default function Loading() {
  return (
    <div className="animate-pulse" aria-busy="true">
      <div className="mb-3.5 h-5 w-20 rounded-md bg-ink/8" />
      <div className="h-[120px] rounded-2xl bg-ink/6" />
      <div className="mt-3.5 h-[220px] rounded-2xl bg-ink/6" />
    </div>
  );
}
