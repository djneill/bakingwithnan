export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-px bg-border" />
      <p className="text-xs tracking-[0.2em] uppercase shrink-0 text-accent">
        {label}
      </p>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
