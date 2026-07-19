export default function Loading() {
  return (
    <div className="animate-pulse" aria-busy="true">
      <div className="mb-3.5 h-7 w-40 rounded-lg bg-ink/8" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="mb-2.5 h-[72px] rounded-2xl bg-ink/6" />
      ))}
    </div>
  );
}
