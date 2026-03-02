import { Form, useNavigation, Link } from "react-router";
import { redirect, data } from "react-router";
import { motion } from "motion/react";
import type { Route } from "./+types/admin.recipes.$slug.edit";
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
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uploadImage(
  bucket: R2Bucket,
  file: File,
  prefix: string,
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const key = `${prefix}/${crypto.randomUUID()}.${ext}`;
  await bucket.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || "image/jpeg" },
  });
  return key;
}

async function replaceImage(
  bucket: R2Bucket,
  newFile: File,
  oldKey: string | null,
  prefix: string,
): Promise<string> {
  if (oldKey) await bucket.delete(oldKey);
  return uploadImage(bucket, newFile, prefix);
}

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

  // Handle dish image — replace if a new file was provided
  let dish_image = recipe.dish_image;
  const dishFile = formData.get("dish_image") as File | null;
  if (dishFile && dishFile.size > 0) {
    dish_image = await replaceImage(
      bucket,
      dishFile,
      recipe.dish_image,
      "dishes",
    );
  }

  // card_image1 — required to exist but only replaced if new file uploaded
  let card_image1 = recipe.card_image1;
  const card1File = formData.get("card_image1") as File | null;
  if (card1File && card1File.size > 0) {
    card_image1 = await replaceImage(
      bucket,
      card1File,
      recipe.card_image1,
      "cards",
    );
  }

  let card_image2 = recipe.card_image2;
  const card2File = formData.get("card_image2") as File | null;
  if (card2File && card2File.size > 0) {
    card_image2 = await replaceImage(
      bucket,
      card2File,
      recipe.card_image2,
      "cards",
    );
  }

  let card_image3 = recipe.card_image3;
  const card3File = formData.get("card_image3") as File | null;
  if (card3File && card3File.size > 0) {
    card_image3 = await replaceImage(
      bucket,
      card3File,
      recipe.card_image3,
      "cards",
    );
  }

  let card_image4 = recipe.card_image4;
  const card4File = formData.get("card_image4") as File | null;
  if (card4File && card4File.size > 0) {
    card_image4 = await replaceImage(
      bucket,
      card4File,
      recipe.card_image4,
      "cards",
    );
  }

  // Re-slug if name changed (check uniqueness)
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
    .bind(
      name,
      newSlug,
      dish_image,
      card_image1,
      card_image2,
      card_image3,
      card_image4,
      recipe.id,
    )
    .run();

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

function FileInput({
  name,
  label,
  required = false,
  hint,
  currentKey,
}: {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  currentKey?: string | null;
}) {
  const hasExisting = Boolean(currentKey);

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm mb-2"
        style={{ color: "#dedede" }}
      >
        {label}
        {required && (
          <span className="ml-1" style={{ color: "#9f6b43" }}>
            *
          </span>
        )}
      </label>
      {hint && (
        <p className="text-xs mb-2 font-light" style={{ color: "#8b684e" }}>
          {hint}
        </p>
      )}

      {/* Current image preview */}
      {hasExisting && (
        <div
          className="mb-2 rounded-lg overflow-hidden w-24 h-24"
          style={{ background: "#1c1b1a" }}
        >
          <img
            src={`/api/images/${currentKey}`}
            alt="Current"
            className="w-full h-full object-cover opacity-70"
          />
        </div>
      )}

      <label
        htmlFor={name}
        className="flex flex-col items-center justify-center w-full h-28 rounded-xl cursor-pointer transition-all border-2 border-dashed"
        style={{ borderColor: "#3a2818", background: "#1c1b1a" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "#9f6b43";
          (e.currentTarget as HTMLElement).style.background = "#201e1c";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "#3a2818";
          (e.currentTarget as HTMLElement).style.background = "#1c1b1a";
        }}
      >
        <span className="text-xl mb-1">{hasExisting ? "🔄" : "📷"}</span>
        <span className="text-xs font-light" style={{ color: "#8b684e" }}>
          {hasExisting ? "Click to replace" : "Click to choose image"}
        </span>
        <input
          id={name}
          name={name}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            const span = e.target
              .closest("label")
              ?.querySelector("span:last-of-type");
            if (span) {
              span.textContent = file
                ? file.name
                : hasExisting
                  ? "Click to replace"
                  : "Click to choose image";
              (span as HTMLElement).style.color = file ? "#b58a66" : "#8b684e";
            }
          }}
        />
      </label>
    </div>
  );
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
            Edit Recipe
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <Link
            to="/admin"
            className="text-sm transition-colors"
            style={{ color: "#8b684e" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#dedede")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8b684e")}
          >
            ← Dashboard
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

      <main className="max-w-2xl mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {actionData?.error && (
            <div
              className="mb-6 px-5 py-4 rounded-xl text-sm"
              style={{
                background: "#3d1a1a",
                color: "#f87171",
                border: "1px solid #7f1d1d",
              }}
            >
              {actionData.error}
            </div>
          )}

          <Form
            method="post"
            encType="multipart/form-data"
            className="flex flex-col gap-8"
          >
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm mb-2"
                style={{ color: "#dedede" }}
              >
                Recipe Name <span style={{ color: "#9f6b43" }}>*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={recipe.name}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                style={{
                  background: "#2a241b",
                  border: "1px solid #3a2818",
                  color: "#dedede",
                  fontFamily: "'Outfit', sans-serif",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#9f6b43";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 2px rgba(159,107,67,0.2)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#3a2818";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="border-t" style={{ borderColor: "#3a2818" }} />

            {/* Dish image */}
            <FileInput
              name="dish_image"
              label="Dish Photo"
              hint="Leave blank to keep the current photo."
              currentKey={recipe.dish_image}
            />

            <div
              style={{ borderColor: "#3a2818" }}
              className="border-t relative"
            >
              <p
                className="absolute -top-3 left-4 px-3 text-xs tracking-widest uppercase"
                style={{ background: "#1c1b1a", color: "#9f6b43" }}
              >
                Recipe Cards
              </p>
            </div>

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

            <div className="pt-4 flex items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                style={{ background: "#9f6b43", color: "#f5f5f5" }}
                onMouseEnter={(e) => {
                  if (!isSubmitting)
                    (e.currentTarget as HTMLElement).style.background =
                      "#b58a66";
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting)
                    (e.currentTarget as HTMLElement).style.background =
                      "#9f6b43";
                }}
              >
                {isSubmitting ? "Saving…" : "Save Changes"}
              </button>
              {isSubmitting && (
                <p className="text-sm font-light" style={{ color: "#8b684e" }}>
                  Uploading images, this may take a moment…
                </p>
              )}
            </div>
          </Form>
        </motion.div>
      </main>
    </div>
  );
}
