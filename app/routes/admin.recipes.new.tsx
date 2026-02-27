import { Form, useActionData, useNavigation, Link } from "react-router";
import { redirect } from "react-router";
import { motion } from "motion/react";
import type { Route } from "./+types/admin.recipes.new";
import { requireAdmin } from "~/lib/auth.server";

// --- Helpers ---

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
    prefix: string
): Promise<string> {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const key = `${prefix}/${crypto.randomUUID()}.${ext}`;
    await bucket.put(key, file.stream(), {
        httpMetadata: { contentType: file.type || "image/jpeg" },
    });
    return key;
}

// --- Loader (auth guard) ---
export async function loader({ request, context }: Route.LoaderArgs) {
    await requireAdmin(context.cloudflare.env.bakingwithnan_db, request);
    return {};
}

// --- Action ---
export async function action({ request, context }: Route.ActionArgs) {
    const { env } = context.cloudflare;
    await requireAdmin(env.bakingwithnan_db, request);

    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim();

    if (!name) {
        return { error: "Recipe name is required." };
    }

    // Check card_image1 is present
    const card1File = formData.get("card_image1") as File | null;
    if (!card1File || card1File.size === 0) {
        return { error: "At least one recipe card image is required." };
    }

    // Generate slug (ensure uniqueness by appending random suffix if needed)
    let slug = slugify(name);
    const existing = await env.bakingwithnan_db
        .prepare("SELECT id FROM recipes WHERE slug = ?")
        .bind(slug)
        .first();
    if (existing) {
        slug = `${slug}-${Date.now()}`;
    }

    // Upload images to R2
    const bucket = env.bakingwithnan_images;

    let dish_image: string | null = null;
    const dishFile = formData.get("dish_image") as File | null;
    if (dishFile && dishFile.size > 0) {
        dish_image = await uploadImage(bucket, dishFile, "dishes");
    }

    const card_image1 = await uploadImage(bucket, card1File, "cards");

    let card_image2: string | null = null;
    const card2File = formData.get("card_image2") as File | null;
    if (card2File && card2File.size > 0) {
        card_image2 = await uploadImage(bucket, card2File, "cards");
    }

    let card_image3: string | null = null;
    const card3File = formData.get("card_image3") as File | null;
    if (card3File && card3File.size > 0) {
        card_image3 = await uploadImage(bucket, card3File, "cards");
    }

    let card_image4: string | null = null;
    const card4File = formData.get("card_image4") as File | null;
    if (card4File && card4File.size > 0) {
        card_image4 = await uploadImage(bucket, card4File, "cards");
    }

    // Insert into D1
    await env.bakingwithnan_db
        .prepare(
            `INSERT INTO recipes (name, slug, dish_image, card_image1, card_image2, card_image3, card_image4)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(name, slug, dish_image, card_image1, card_image2, card_image3, card_image4)
        .run();

    throw redirect("/admin");
}

// --- Links ---
export function links() {
    return [
        {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@300;400;500;600&display=swap",
        },
    ];
}

// --- File Input Component ---
function FileInput({
    name,
    label,
    required = false,
    hint,
}: {
    name: string;
    label: string;
    required?: boolean;
    hint?: string;
}) {
    return (
        <div>
            <label
                htmlFor={name}
                className="block text-sm mb-2"
                style={{ color: "#dedede", fontFamily: "'Outfit', sans-serif" }}
            >
                {label}
                {required && <span className="ml-1" style={{ color: "#9f6b43" }}>*</span>}
            </label>
            {hint && (
                <p className="text-xs mb-2 font-light" style={{ color: "#8b684e" }}>
                    {hint}
                </p>
            )}
            <label
                htmlFor={name}
                className="flex flex-col items-center justify-center w-full h-32 rounded-xl cursor-pointer transition-all border-2 border-dashed hover:border-solid group"
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
                <span className="text-2xl mb-1">📷</span>
                <span className="text-xs font-light" style={{ color: "#8b684e" }}>
                    Click to choose image
                </span>
                <input
                    id={name}
                    name={name}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    required={required}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        const label = e.target.closest("label");
                        if (!label) return;
                        const span = label.querySelector("span:last-of-type");
                        if (span) {
                            span.textContent = file ? file.name : "Click to choose image";
                            span.setAttribute(
                                "style",
                                `color: ${file ? "#b58a66" : "#8b684e"}`
                            );
                        }
                    }}
                />
            </label>
        </div>
    );
}

// --- Page ---
export default function NewRecipe({ actionData }: Route.ComponentProps) {
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

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
                        Add a Recipe
                    </h1>
                </div>
                <Link
                    to="/admin"
                    className="text-sm transition-colors"
                    style={{ color: "#8b684e" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#dedede")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8b684e")}
                >
                    ← Dashboard
                </Link>
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
                            style={{ background: "#3d1a1a", color: "#f87171", border: "1px solid #7f1d1d" }}
                        >
                            {actionData.error}
                        </div>
                    )}

                    <Form
                        method="post"
                        encType="multipart/form-data"
                        className="flex flex-col gap-8"
                    >
                        {/* Recipe Name */}
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
                                placeholder="e.g. Chocolate Chip Cookies"
                                className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
                                style={{
                                    background: "#2a241b",
                                    border: "1px solid #3a2818",
                                    color: "#dedede",
                                    fontFamily: "'Outfit', sans-serif",
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = "#9f6b43";
                                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(159,107,67,0.2)";
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = "#3a2818";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            />
                        </div>

                        {/* Divider */}
                        <div className="border-t" style={{ borderColor: "#3a2818" }} />

                        {/* Dish Photo */}
                        <FileInput
                            name="dish_image"
                            label="Dish Photo"
                            hint="A photo of the finished dish. If skipped, a placeholder will be shown."
                        />

                        {/* Divider */}
                        <div className="border-t" style={{ borderColor: "#3a2818" }}>
                            <p
                                className="-mt-3 inline-block px-3 text-xs tracking-widest uppercase ml-4"
                                style={{ background: "#1c1b1a", color: "#9f6b43" }}
                            >
                                Recipe Cards
                            </p>
                        </div>

                        {/* Card Images */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FileInput
                                name="card_image1"
                                label="Recipe Card 1"
                                required
                            />
                            <FileInput
                                name="card_image2"
                                label="Recipe Card 2"
                            />
                            <FileInput
                                name="card_image3"
                                label="Recipe Card 3"
                            />
                            <FileInput
                                name="card_image4"
                                label="Recipe Card 4"
                            />
                        </div>

                        {/* Submit */}
                        <div className="pt-4 flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                                style={{
                                    background: isSubmitting ? "#5c4d3c" : "#9f6b43",
                                    color: "#f5f5f5",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSubmitting)
                                        (e.currentTarget as HTMLElement).style.background = "#b58a66";
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSubmitting)
                                        (e.currentTarget as HTMLElement).style.background = "#9f6b43";
                                }}
                            >
                                {isSubmitting ? "Saving…" : "Save Recipe"}
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