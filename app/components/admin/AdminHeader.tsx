import { Link } from "react-router";

interface AdminHeaderProps {
  title: React.ReactNode;
  backTo?: string;
  backLabel?: string;
}

export function AdminHeader({
  title,
  backTo = "/admin",
  backLabel = "← Dashboard",
}: AdminHeaderProps) {
  return (
    <header className="border-b border-border px-8 py-5 flex items-center justify-between">
      <div>
        <p className="text-xs tracking-[0.2em] uppercase mb-0.5 text-accent">
          Admin
        </p>
        <h1 className="text-xl font-display text-text-primary">{title}</h1>
      </div>
      <div className="flex items-center gap-5">
        <Link
          to={backTo}
          className="text-sm text-accent-muted hover:text-text-body transition-colors"
        >
          {backLabel}
        </Link>
        <Link
          to="/admin/logout"
          className="text-sm text-accent-muted hover:text-danger transition-colors"
        >
          Log out
        </Link>
      </div>
    </header>
  );
}
