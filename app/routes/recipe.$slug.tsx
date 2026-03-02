import { useLoaderData, Link, data } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import type { Route } from "./+types/recipes.$slug";

export function links() {
  return [
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@300;400;500;600&family=Caveat:wght@400;600&display=swap",
    },
  ];
}

// --- Types ---
interface Recipe {
  id: number;
  slug: string;
  name: string;
  dish_image: string | null;
  card_image1: string | null;
  card_image2: string | null;
  card_image3: string | null;
  card_image4: string | null;
  created_at: string;
}

// --- Loader ---
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

// --- Meta ---
export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `${data?.recipe?.name ?? "Recipe"} — Baking with Nan` },
    {
      name: "description",
      content: `Nan's recipe for ${data?.recipe?.name ?? "a classic dish"}.`,
    },
  ];
}

// --- Card Viewer ---
function RecipeCardViewer({ keys }: { keys: (string | null)[] }) {
  const validKeys = keys.filter(Boolean) as string[];
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (validKeys.length === 0) return null;

  return (
    <div>
      {/* Main card — polaroid style */}
      <motion.div
        key={active}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative cursor-zoom-in mx-auto"
        style={{ maxWidth: "560px" }}
        onClick={() => setLightbox(true)}
      >
        <div
          className="bg-white p-3 pb-12 relative"
          style={{
            boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {/* Thumbtack */}
          <div
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 w-6 h-6 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, #ef4444, #7f1d1d)",
              boxShadow: "1px 2px 6px rgba(0,0,0,0.5)",
            }}
          />
          <img
            src={`/api/images/${validKeys[active]}`}
            alt={`Recipe card ${active + 1}`}
            className="w-full h-auto"
          />
          {/* Hint */}
          <p
            className="absolute bottom-3 right-4 text-xs"
            style={{ fontFamily: "'Caveat', cursive", color: "#aaa" }}
          >
            click to enlarge
          </p>
          {/* Card number */}
          {validKeys.length > 1 && (
            <p
              className="absolute bottom-3 left-4 text-xs"
              style={{ fontFamily: "'Caveat', cursive", color: "#aaa" }}
            >
              Card {active + 1} of {validKeys.length}
            </p>
          )}
        </div>
      </motion.div>

      {/* Thumbnails */}
      {validKeys.length > 1 && (
        <div className="flex gap-3 justify-center mt-6">
          {validKeys.map((key, i) => (
            <button
              key={key}
              onClick={() => setActive(i)}
              className="transition-all overflow-hidden"
              style={{
                border:
                  i === active ? "3px solid #9f6b43" : "3px solid #3a2818",
                transform: i === active ? "scale(1.08)" : "scale(1)",
                boxShadow:
                  i === active ? "0 4px 12px rgba(159,107,67,0.4)" : "none",
                borderRadius: "4px",
              }}
            >
              <img
                src={`/api/images/${key}`}
                alt={`Card ${i + 1}`}
                className="w-16 h-16 object-cover block"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.92)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
          >
            <motion.div
              className="bg-white p-2 pb-8"
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
              }}
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={`/api/images/${validKeys[active]}`}
                alt="Recipe card enlarged"
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </motion.div>
            <button
              className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full transition-colors text-white text-xl"
              style={{ background: "rgba(255,255,255,0.1)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.2)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.1)")
              }
              onClick={() => setLightbox(false)}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Page ---
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
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#1c1b1a", fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Nav */}
      <header className="border-b px-8 py-5" style={{ borderColor: "#3a2818" }}>
        <Link
          to="/"
          className="text-sm transition-colors flex items-center gap-2 w-fit"
          style={{ color: "#8b684e" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#dedede")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8b684e")}
        >
          ← Nan's Kitchen
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p
            className="text-xs tracking-[0.2em] uppercase mb-3"
            style={{ color: "#9f6b43" }}
          >
            Nan's Recipe
          </p>
          <h1
            className="text-[#f5f5f5]"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.2rem, 7vw, 4rem)",
              lineHeight: 1.15,
              fontWeight: 500,
            }}
          >
            {recipe.name}
          </h1>
        </motion.div>

        {/* Dish photo */}
        {dishImageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="flex justify-center mb-14"
          >
            <div
              className="bg-white p-3 pb-10 relative"
              style={{
                maxWidth: "280px",
                transform: "rotate(-1.5deg)",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              {/* Thumbtack */}
              <div
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 w-6 h-6 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 35% 35%, #ef4444, #7f1d1d)",
                  boxShadow: "1px 2px 6px rgba(0,0,0,0.5)",
                }}
              />
              <img
                src={dishImageUrl}
                alt={recipe.name}
                className="w-full aspect-square object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement)
                    .closest("div.bg-white")!
                    .remove();
                }}
              />
              <p
                className="absolute bottom-2.5 left-0 right-0 text-center"
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: "1rem",
                  color: "#888",
                }}
              >
                {recipe.name}
              </p>
            </div>
          </motion.div>
        )}

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="flex items-center gap-4 mb-12"
        >
          <div className="flex-1 h-px" style={{ background: "#3a2818" }} />
          <p
            className="text-xs tracking-[0.2em] uppercase flex-shrink-0"
            style={{ color: "#9f6b43" }}
          >
            Recipe Cards
          </p>
          <div className="flex-1 h-px" style={{ background: "#3a2818" }} />
        </motion.div>

        {/* Recipe cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <RecipeCardViewer keys={cardKeys} />

          {cardKeys.every((k) => !k) && (
            <div className="text-center py-16">
              <p
                className="text-2xl italic"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#b58a66",
                }}
              >
                Recipe cards coming soon...
              </p>
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer
        className="mt-20 py-10 text-center border-t"
        style={{ borderColor: "#3a2818", background: "#161514" }}
      >
        <p
          className="italic text-sm"
          style={{ fontFamily: "'Playfair Display', serif", color: "#8b684e" }}
        >
          Her recipes live on forever.
        </p>
      </footer>
    </div>
  );
}
