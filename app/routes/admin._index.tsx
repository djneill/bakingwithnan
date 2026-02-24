import type { Route } from "./+types/admin._index";
import { requireAdmin } from "~/lib/auth.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.cloudflare;
  await requireAdmin(env.bakingwithnan_db, request);
  return {};
}

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">🧁</p>
        <h1
          className="text-2xl font-bold text-amber-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Welcome back!
        </h1>
        <p className="text-amber-700 mt-2">Admin dashboard coming soon.</p>
      </div>
    </main>
  );
}
