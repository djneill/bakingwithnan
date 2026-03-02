export function SiteFooter() {
  return (
    <footer className="mt-20 py-16 text-center text-sm border-t border-border/80 bg-surface-dark">
      <div className="max-w-2xl mx-auto px-6 flex flex-col items-center gap-6">
        <p className="font-light text-accent text-lg tracking-wide uppercase">
          Baking with
          <span className="ml-2 italic normal-case text-2xl text-text-primary font-display">
            Nan
          </span>
        </p>
        <div className="w-12 h-px bg-border" />
        <p className="text-text-muted tracking-widest uppercase text-xs">
          Made with love for Nan's family
        </p>
        <p className="text-accent-muted italic leading-relaxed text-sm">
          Her recipes live on forever.
        </p>
      </div>
    </footer>
  );
}
