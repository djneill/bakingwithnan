export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full max-w-lg">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-muted opacity-70">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <input
        type="text"
        placeholder="Search recipes..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 rounded-full bg-surface-raised border border-border text-text-body placeholder:text-accent-muted focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface-raised transition-all shadow-sm font-light text-lg"
      />
    </div>
  );
}
