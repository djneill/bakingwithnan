import { Link } from "react-router";
import { redirect } from "react-router";
import { motion } from "motion/react";
import type { Route } from "./+types/admin._index";
import { requireAdmin } from "~/lib/auth.server";
import { useInactivityLogout } from "~/hooks/useInactivityLogout";
import type { Recipe } from "~/types/recipe";
import { PageShell } from "~/components/ui/PageShell";
import { AdminHeader } from "~/components/admin/AdminHeader";
import { DeleteButton } from "~/components/admin/DeleteButton";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.cloudflare;
  await requireAdmin(env.bakingwithnan_db, request);

  const result = await env.bakingwithnan_db
    .prepare(
      "SELECT id, slug, name, dish_image, card_image1, card_image2, card_image3, card_image4, created_at FROM recipes ORDER BY name ASC",
    )
    .all<Recipe>();

  return { recipes: result.results ?? [] };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.cloudflare;
  await requireAdmin(env.bakingwithnan_db, request);

  const formData = await request.formData();
  const intent = String(formData.get("intent"));
  const slug = String(formData.get("slug"));

  if (intent === "delete") {
    const recipe = await env.bakingwithnan_db
      .prepare(
        "SELECT dish_image, card_image1, card_image2, card_image3, card_image4 FROM recipes WHERE slug = ?",
      )
      .bind(slug)
      .first<
        Pick<
          Recipe,
          | "dish_image"
          | "card_image1"
          | "card_image2"
          | "card_image3"
          | "card_image4"
        >
      >();

    if (recipe) {
      const keys = [
        recipe.dish_image,
        recipe.card_image1,
        recipe.card_image2,
        recipe.card_image3,
        recipe.card_image4,
      ].filter(Boolean) as string[];

      await Promise.all(
        keys.map((key) => env.bakingwithnan_images.delete(key)),
      );
    }

    await env.bakingwithnan_db
      .prepare("DELETE FROM recipes WHERE slug = ?")
      .bind(slug)
      .run();
  }

  throw redirect("/admin");
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { recipes } = loaderData;
  useInactivityLogout();

  return (
    <PageShell>
      <AdminHeader
        title={<>Baking with <span className="italic text-accent">Nan</span></>}
        backTo="/"
        backLabel="← View site"
      />

      <main className="max-w-3xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <p className="italic text-lg font-display text-accent-light">
            {recipes.length === 0
              ? "No recipes yet"
              : `${recipes.length} ${recipes.length === 1 ? "recipe" : "recipes"} in Nan's kitchen`}
          </p>
          <Link
            to="/admin/recipes/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all bg-accent text-text-primary hover:bg-accent-light"
          >
            <span>+</span> Add Recipe
          </Link>
        </div>

        {recipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 rounded-2xl border-2 border-dashed border-border"
          >
            <p className="text-4xl mb-4">🧁</p>
            <p className="text-accent-muted">
              Add Nan's first recipe to get started.
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            {recipes.map((recipe, i) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-surface-raised border border-border"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface">
                  {recipe.dish_image ? (
                    <img
                      src={`/api/images/${recipe.dish_image}`}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">
                      🍽
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="truncate text-text-primary font-display">
                    {recipe.name}
                  </p>
                  <p className="text-xs mt-0.5 text-accent-muted">
                    {new Date(recipe.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/admin/recipes/${recipe.slug}/edit`}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all bg-surface-raised text-accent-light border border-border hover:border-accent hover:text-text-primary"
                  >
                    Edit
                  </Link>
                  <DeleteButton slug={recipe.slug} name={recipe.name} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </PageShell>
  );
}
