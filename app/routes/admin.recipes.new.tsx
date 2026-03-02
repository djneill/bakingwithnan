import { Form, useNavigation } from "react-router";
import { redirect } from "react-router";
import { motion } from "motion/react";
import type { Route } from "./+types/admin.recipes.new";
import { requireAdmin } from "~/lib/auth.server";
import { useInactivityLogout } from "~/hooks/useInactivityLogout";
import { slugify, uploadImage } from "~/lib/recipes.server";
import { PageShell } from "~/components/ui/PageShell";
import { AdminHeader } from "~/components/admin/AdminHeader";
import { FormError } from "~/components/admin/FormError";
import { FileInput } from "~/components/admin/FileInput";
import { RecipeNameInput } from "~/components/admin/RecipeNameInput";
import { SubmitButton } from "~/components/admin/SubmitButton";
import { SectionDivider } from "~/components/ui/SectionDivider";

export async function loader({ request, context }: Route.LoaderArgs) {
  await requireAdmin(context.cloudflare.env.bakingwithnan_db, request);
  return {};
}

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.cloudflare;
  await requireAdmin(env.bakingwithnan_db, request);

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) return { error: "Recipe name is required." };

  const card1File = formData.get("card_image1") as File | null;
  if (!card1File || card1File.size === 0) {
    return { error: "At least one recipe card image is required." };
  }

  let slug = slugify(name);
  const existing = await env.bakingwithnan_db
    .prepare("SELECT id FROM recipes WHERE slug = ?")
    .bind(slug)
    .first();
  if (existing) slug = `${slug}-${Date.now()}`;

  const bucket = env.bakingwithnan_images;

  let dish_image: string | null = null;
  const dishFile = formData.get("dish_image") as File | null;
  if (dishFile && dishFile.size > 0) {
    dish_image = await uploadImage(bucket, dishFile, "dishes");
  }

  const card_image1 = await uploadImage(bucket, card1File, "cards");

  let card_image2: string | null = null;
  const card2File = formData.get("card_image2") as File | null;
  if (card2File && card2File.size > 0)
    card_image2 = await uploadImage(bucket, card2File, "cards");

  let card_image3: string | null = null;
  const card3File = formData.get("card_image3") as File | null;
  if (card3File && card3File.size > 0)
    card_image3 = await uploadImage(bucket, card3File, "cards");

  let card_image4: string | null = null;
  const card4File = formData.get("card_image4") as File | null;
  if (card4File && card4File.size > 0)
    card_image4 = await uploadImage(bucket, card4File, "cards");

  await env.bakingwithnan_db
    .prepare(
      `INSERT INTO recipes (name, slug, dish_image, card_image1, card_image2, card_image3, card_image4)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(name, slug, dish_image, card_image1, card_image2, card_image3, card_image4)
    .run();

  throw redirect("/admin");
}

export default function NewRecipe({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  useInactivityLogout();

  return (
    <PageShell>
      <AdminHeader title="Add a Recipe" />

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
            <RecipeNameInput />

            <div className="border-t border-border" />

            <FileInput
              name="dish_image"
              label="Dish Photo"
              hint="A photo of the finished dish. If skipped, a placeholder will be shown."
            />

            <SectionDivider label="Recipe Cards" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FileInput name="card_image1" label="Recipe Card 1" required />
              <FileInput name="card_image2" label="Recipe Card 2" />
              <FileInput name="card_image3" label="Recipe Card 3" />
              <FileInput name="card_image4" label="Recipe Card 4" />
            </div>

            <SubmitButton isSubmitting={isSubmitting} />
          </Form>
        </motion.div>
      </main>
    </PageShell>
  );
}
