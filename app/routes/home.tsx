import { useState } from "react";
import { useLoaderData } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import type { Route } from "./+types/home";
import type { RecipeSummary } from "~/types/recipe";
import { PageShell } from "~/components/ui/PageShell";
import { HeroSection } from "~/components/home/HeroSection";
import { SearchBar } from "~/components/home/SearchBar";
import { RecipeCard } from "~/components/home/RecipeCard";
import { SiteFooter } from "~/components/home/SiteFooter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Baking with Nan" },
    {
      name: "description",
      content: "A lifetime of love, baked into every recipe.",
    },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.bakingwithnan_db;

  const recipes = await db
    .prepare(
      "SELECT id, slug, name, dish_image, created_at FROM recipes ORDER BY name ASC",
    )
    .all<RecipeSummary>();

  return {
    recipes: recipes.results ?? [],
  };
}

export default function Home() {
  const { recipes } = useLoaderData<typeof loader>();
  const [search, setSearch] = useState("");

  const filtered = recipes.filter((r) => {
    if (search) return r.name.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  return (
    <PageShell>
      <HeroSection />

      <div className="sticky top-0 z-30 py-4 px-4 flex items-center justify-center bg-surface/90 backdrop-blur-md border-b border-border">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={filtered.length + search}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-accent-light text-lg italic font-display"
            >
              {filtered.length === 0
                ? "No recipes found matching your search."
                : filtered.length === recipes.length
                  ? `Discover ${recipes.length} beloved recipes`
                  : `Showing ${filtered.length} of ${recipes.length} recipes`}
            </motion.p>
          </AnimatePresence>
        </div>

        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <p className="text-3xl mb-4 italic text-accent-light font-display">
              We couldn't find that one...
            </p>
            <p className="text-text-muted font-light text-lg">
              {search
                ? `Nan didn't make "${search}"... that we know of! Maybe try another name?`
                : "Check back soon, the kitchen is always busy."}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 xl:gap-10 auto-rows-fr">
            {filtered.map((recipe, i) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={i} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </PageShell>
  );
}
