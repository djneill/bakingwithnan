export function PageShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-screen bg-surface font-body text-text-body ${className}`}>
      {children}
    </div>
  );
}
