import { useLoaderData, Link, data } from "react-router";
import { motion } from "motion/react";
import type { Route } from "./+types/recipe.$slug";
import type { Recipe } from "~/types/recipe";
import { PageShell } from "~/components/ui/PageShell";
import { PolaroidPhoto } from "~/components/ui/PolaroidPhoto";
import { SectionDivider } from "~/components/ui/SectionDivider";
import { RecipeCardViewer } from "~/components/recipe/RecipeCardViewer";

type RootLoaderData = { origin: string };

export async function loader({ params, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.bakingwithnan_db;

  const recipe = await db
    .prepare(
      `SELECT id, slug, name, dish_image,
       card_image1, card_image2, card_image3, card_image4,
       created_at
       FROM recipes WHERE slug = ? LIMIT 1`,
    )
    .bind(params.slug)
    .first<Recipe>();

  if (!recipe) throw data("Recipe not found", { status: 404 });

  return { recipe };
}

export function meta({ data, params, matches }: Route.MetaArgs) {
  const rootMatch = matches?.find((m) => m?.id === "root");
  const rootData = rootMatch?.data as RootLoaderData | undefined;
  const origin = rootData?.origin ?? "";

  const recipeName = data?.recipe?.name ?? "Recipe";
  const description = `Nan's recipe for ${data?.recipe?.name ?? "a classic dish"}.`;
  const pagePath = `/recipes/${params.slug ?? ""}`.replace(/\/$/, "");
  const pageUrl = origin ? `${origin}${pagePath || "/"}` : pagePath || "/";

  const imagePath = data?.recipe?.dish_image
    ? `/api/images/${data.recipe.dish_image}`
    : "/openGraph.png";
  const imageUrl = origin ? `${origin}${imagePath}` : imagePath;

  return [
    { title: `${recipeName} — Baking with Nan` },
    {
      name: "description",
      content: description,
    },
    { name: "robots", content: "noindex" },
    { property: "og:type", content: "article" },
    { property: "og:title", content: `${recipeName} — Baking with Nan` },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { property: "og:url", content: pageUrl },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: imageUrl },
  ];
}

export default function RecipePage() {
  const { recipe } = useLoaderData<typeof loader>();

  const cardKeys = [
    recipe.card_image1,
    recipe.card_image2,
    recipe.card_image3,
    recipe.card_image4,
  ];

  const dishImageUrl = recipe.dish_image
    ? `/api/images/${recipe.dish_image}`
    : null;

  return (
    <PageShell>
      <header className="border-b border-border px-8 py-5">
        <Link
          to="/"
          className="text-sm text-accent-muted hover:text-text-body transition-colors flex items-center gap-2 w-fit"
        >
          ← Nan's Kitchen
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-[0.2em] uppercase mb-3 text-accent">
            Nan's Recipe
          </p>
          <h1
            className="text-text-primary font-display font-medium"
            style={{
              fontSize: "clamp(2.2rem, 7vw, 4rem)",
              lineHeight: 1.15,
            }}
          >
            {recipe.name}
          </h1>
        </motion.div>

        {dishImageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="flex justify-center mb-14"
          >
            <PolaroidPhoto
              src={dishImageUrl}
              alt={recipe.name}
              caption={recipe.name}
              rotation="rotate(-1.5deg)"
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mb-12"
        >
          <SectionDivider label="Recipe Cards" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <RecipeCardViewer keys={cardKeys} />

          {cardKeys.every((k) => !k) && (
            <div className="text-center py-16">
              <p className="text-2xl italic font-display text-accent-light">
                Recipe cards coming soon...
              </p>
            </div>
          )}
        </motion.div>
      </main>

      <footer className="mt-20 py-10 text-center border-t border-border bg-surface-dark">
        <p className="italic text-sm font-display text-accent-muted">
          Her recipes live on forever.
        </p>
      </footer>
    </PageShell>
  );
}
