import { Form, useNavigation } from "react-router";
import { redirect, data } from "react-router";
import { motion } from "motion/react";
import type { Route } from "./+types/admin.recipes.$slug.edit";
import { requireAdmin } from "~/lib/auth.server";
import { useInactivityLogout } from "~/hooks/useInactivityLogout";
import { slugify, replaceImage } from "~/lib/recipes.server";
import type { Recipe } from "~/types/recipe";
import { PageShell } from "~/components/ui/PageShell";
import { AdminHeader } from "~/components/admin/AdminHeader";
import { FormError } from "~/components/admin/FormError";
import { FileInput } from "~/components/admin/FileInput";
import { RecipeNameInput } from "~/components/admin/RecipeNameInput";
import { SubmitButton } from "~/components/admin/SubmitButton";
import { SectionDivider } from "~/components/ui/SectionDivider";

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const { env } = context.cloudflare;
  await requireAdmin(env.bakingwithnan_db, request);

  const recipe = await env.bakingwithnan_db
    .prepare(
      "SELECT id, slug, name, dish_image, card_image1, card_image2, card_image3, card_image4 FROM recipes WHERE slug = ? LIMIT 1",
    )
    .bind(params.slug)
    .first<Recipe>();

  if (!recipe) throw data("Recipe not found", { status: 404 });

  return { recipe };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const { env } = context.cloudflare;
  await requireAdmin(env.bakingwithnan_db, request);

  const recipe = await env.bakingwithnan_db
    .prepare(
      "SELECT id, slug, name, dish_image, card_image1, card_image2, card_image3, card_image4 FROM recipes WHERE slug = ? LIMIT 1",
    )
    .bind(params.slug)
    .first<Recipe>();

  if (!recipe) throw data("Recipe not found", { status: 404 });

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) return { error: "Recipe name is required." };

  const bucket = env.bakingwithnan_images;

  let dish_image = recipe.dish_image;
  const dishFile = formData.get("dish_image") as File | null;
  if (dishFile && dishFile.size > 0) {
    dish_image = await replaceImage(bucket, dishFile, recipe.dish_image, "dishes");
  }

  let card_image1 = recipe.card_image1;
  const card1File = formData.get("card_image1") as File | null;
  if (card1File && card1File.size > 0) {
    card_image1 = await replaceImage(bucket, card1File, recipe.card_image1, "cards");
  }

  let card_image2 = recipe.card_image2;
  const card2File = formData.get("card_image2") as File | null;
  if (card2File && card2File.size > 0) {
    card_image2 = await replaceImage(bucket, card2File, recipe.card_image2, "cards");
  }

  let card_image3 = recipe.card_image3;
  const card3File = formData.get("card_image3") as File | null;
  if (card3File && card3File.size > 0) {
    card_image3 = await replaceImage(bucket, card3File, recipe.card_image3, "cards");
  }

  let card_image4 = recipe.card_image4;
  const card4File = formData.get("card_image4") as File | null;
  if (card4File && card4File.size > 0) {
    card_image4 = await replaceImage(bucket, card4File, recipe.card_image4, "cards");
  }

  let newSlug = slugify(name);
  if (newSlug !== recipe.slug) {
    const conflict = await env.bakingwithnan_db
      .prepare("SELECT id FROM recipes WHERE slug = ? AND id != ?")
      .bind(newSlug, recipe.id)
      .first();
    if (conflict) newSlug = `${newSlug}-${Date.now()}`;
  }

  await env.bakingwithnan_db
    .prepare(
      `UPDATE recipes
       SET name = ?, slug = ?, dish_image = ?, card_image1 = ?, card_image2 = ?, card_image3 = ?, card_image4 = ?,
           updated_at = datetime('now')
       WHERE id = ?`,
    )
    .bind(name, newSlug, dish_image, card_image1, card_image2, card_image3, card_image4, recipe.id)
    .run();

  throw redirect("/admin");
}

export default function EditRecipe({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { recipe } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  useInactivityLogout();

  return (
    <PageShell>
      <AdminHeader title="Edit Recipe" />

      <main className="max-w-2xl mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FormError message={actionData?.error} />

          <Form
            method="post"
            encType="multipart/form-data"
            className="flex flex-col gap-8"
          >
            <RecipeNameInput defaultValue={recipe.name} />

            <div className="border-t border-border" />

            <FileInput
              name="dish_image"
              label="Dish Photo"
              hint="Leave blank to keep the current photo."
              currentKey={recipe.dish_image}
            />

            <SectionDivider label="Recipe Cards" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FileInput
                name="card_image1"
                label="Recipe Card 1"
                hint="Leave blank to keep current."
                currentKey={recipe.card_image1}
              />
              <FileInput
                name="card_image2"
                label="Recipe Card 2"
                hint="Leave blank to keep current."
                currentKey={recipe.card_image2}
              />
              <FileInput
                name="card_image3"
                label="Recipe Card 3"
                hint="Leave blank to keep current."
                currentKey={recipe.card_image3}
              />
              <FileInput
                name="card_image4"
                label="Recipe Card 4"
                hint="Leave blank to keep current."
                currentKey={recipe.card_image4}
              />
            </div>

            <SubmitButton
              isSubmitting={isSubmitting}
              label="Save Changes"
            />
          </Form>
        </motion.div>
      </main>
    </PageShell>
  );
}
