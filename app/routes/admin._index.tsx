import { Link } from "react-router";
import { motion } from "motion/react";
import type { Route } from "./+types/admin._index";
import { requireAdmin } from "~/lib/auth.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.cloudflare;
  await requireAdmin(env.bakingwithnan_db, request);

  const result = await env.bakingwithnan_db
    .prepare("SELECT COUNT(*) as count FROM recipes")
    .first<{ count: number }>();

  return { recipeCount: result?.count ?? 0 };
}

export function links() {
  return [
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@300;400;500;600&display=swap",
    },
  ];
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { recipeCount } = loaderData;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#1c1b1a", fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Header */}
      <header
        className="border-b px-8 py-5 flex items-center justify-between"
        style={{ borderColor: "#3a2818" }}
      >
        <div>
          <p className="text-xs tracking-[0.2em] uppercase mb-0.5" style={{ color: "#9f6b43" }}>
            Admin
          </p>
          <h1
            className="text-xl"
            style={{ fontFamily: "'Playfair Display', serif", color: "#f5f5f5" }}
          >
            Baking with <span className="italic" style={{ color: "#9f6b43" }}>Nan</span>
          </h1>
        </div>
        <Link
          to="/"
          className="text-sm transition-colors"
          style={{ color: "#8b684e" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#dedede")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8b684e")}
        >
          ← View site
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-8 py-16">
        {/* Stat */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl p-8 mb-10 text-center"
          style={{ background: "#2a241b", border: "1px solid #3a2818" }}
        >
          <p
            className="text-6xl font-light mb-2"
            style={{ fontFamily: "'Playfair Display', serif", color: "#f5f5f5" }}
          >
            {recipeCount}
          </p>
          <p className="text-sm tracking-widest uppercase" style={{ color: "#9f6b43" }}>
            {recipeCount === 1 ? "Recipe" : "Recipes"} in Nan's Kitchen
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Link
            to="/admin/recipes/new"
            className="flex items-center justify-between w-full rounded-2xl px-8 py-6 transition-all group"
            style={{ background: "#2a241b", border: "1px solid #3a2818" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#9f6b43";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#3a2818";
            }}
          >
            <div>
              <p
                className="text-lg mb-1"
                style={{ fontFamily: "'Playfair Display', serif", color: "#f5f5f5" }}
              >
                Add a Recipe
              </p>
              <p className="text-sm font-light" style={{ color: "#8b684e" }}>
                Upload Nan's recipe cards and dish photo
              </p>
            </div>
            <span className="text-2xl transition-transform group-hover:translate-x-1" style={{ color: "#9f6b43" }}>
              →
            </span>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}