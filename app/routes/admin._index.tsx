import { Link, Form, useNavigation } from "react-router";
import { redirect } from "react-router";
import { motion } from "motion/react";
import type { Route } from "./+types/admin._index";
import { requireAdmin } from "~/lib/auth.server";
import { useInactivityLogout } from "~/hooks/useInactivityLogout";

interface Recipe {
  id: number;
  slug: string;
  name: string;
  dish_image: string | null;
  card_image1: string;
  card_image2: string | null;
  card_image3: string | null;
  card_image4: string | null;
  created_at: string;
}

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

export function links() {
  return [
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@300;400;500;600&display=swap",
    },
  ];
}

function DeleteButton({ slug, name }: { slug: string; name: string }) {
  const navigation = useNavigation();
  const isDeleting =
    navigation.state === "submitting" &&
    navigation.formData?.get("slug") === slug &&
    navigation.formData?.get("intent") === "delete";

  return (
    <Form
      method="post"
      onSubmit={(e) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="intent" value="delete" />
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        disabled={isDeleting}
        className="text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
        style={{
          background: "#3d1a1a",
          color: "#f87171",
          border: "1px solid #7f1d1d",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.background = "#7f1d1d")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background = "#3d1a1a")
        }
      >
        {isDeleting ? "Deleting…" : "Delete"}
      </button>
    </Form>
  );
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { recipes } = loaderData;
  useInactivityLogout();

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#1c1b1a", fontFamily: "'Outfit', sans-serif" }}
    >
      <header
        className="border-b px-8 py-5 flex items-center justify-between"
        style={{ borderColor: "#3a2818" }}
      >
        <div>
          <p
            className="text-xs tracking-[0.2em] uppercase mb-0.5"
            style={{ color: "#9f6b43" }}
          >
            Admin
          </p>
          <h1
            className="text-xl"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#f5f5f5",
            }}
          >
            Baking with{" "}
            <span className="italic" style={{ color: "#9f6b43" }}>
              Nan
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <Link
            to="/"
            className="text-sm transition-colors"
            style={{ color: "#8b684e" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#dedede")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8b684e")}
          >
            ← View site
          </Link>
          <Link
            to="/admin/logout"
            className="text-sm transition-colors"
            style={{ color: "#8b684e" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8b684e")}
          >
            Log out
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <p
            className="italic text-lg"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#b58a66",
            }}
          >
            {recipes.length === 0
              ? "No recipes yet"
              : `${recipes.length} ${recipes.length === 1 ? "recipe" : "recipes"} in Nan's kitchen`}
          </p>
          <Link
            to="/admin/recipes/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: "#9f6b43", color: "#f5f5f5" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#b58a66")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#9f6b43")}
          >
            <span>+</span> Add Recipe
          </Link>
        </div>

        {recipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 rounded-2xl"
            style={{ border: "2px dashed #3a2818" }}
          >
            <p className="text-4xl mb-4">🧁</p>
            <p style={{ color: "#8b684e" }}>
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
                className="flex items-center gap-4 px-6 py-4 rounded-2xl"
                style={{ background: "#2a241b", border: "1px solid #3a2818" }}
              >
                {/* Thumbnail */}
                <div
                  className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                  style={{ background: "#1c1b1a" }}
                >
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

                {/* Name + date */}
                <div className="flex-1 min-w-0">
                  <p
                    className="truncate"
                    style={{
                      color: "#f5f5f5",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {recipe.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#8b684e" }}>
                    {new Date(recipe.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/admin/recipes/${recipe.slug}/edit`}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      background: "#2a241b",
                      color: "#b58a66",
                      border: "1px solid #3a2818",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "#9f6b43";
                      (e.currentTarget as HTMLElement).style.color = "#f5f5f5";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "#3a2818";
                      (e.currentTarget as HTMLElement).style.color = "#b58a66";
                    }}
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
    </div>
  );
}
