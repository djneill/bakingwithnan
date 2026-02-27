import { useLoaderData, Link, data } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import type { Route } from "./+types/recipe";

export function links(): Route.LinkDescriptors {
  return [
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Pacifico&family=Caveat:wght@400;600&family=Special+Elite&display=swap",
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

  if (!recipe) {
    throw data("Recipe not found", { status: 404 });
  }

  return { recipe };
}

// --- Meta ---
export function meta({ data }: Route.MetaArgs) {
  return [{ title: `${data?.recipe?.name ?? "Recipe"} — Baking with Nan` }];
}

// --- Recipe Card Image Viewer ---
function RecipeCardViewer({ keys }: { keys: (string | null)[] }) {
  const validKeys = keys.filter(Boolean) as string[];
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (validKeys.length === 0) return null;

  return (
    <div>
      {/* Main card */}
      <motion.div
        key={active}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative cursor-zoom-in"
        onClick={() => setLightbox(true)}
      >
        <div
          className="bg-[#2a241b] shadow-xl p-3 pb-10 mx-auto"
          style={{
            maxWidth: "520px",
            boxShadow: "4px 6px 16px rgba(0,0,0,0.6)",
            position: "relative",
          }}
        >
          {/* Thumbtack */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 w-5 h-5 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, #9f6b43, #3a2818)",
              boxShadow: "1px 2px 4px rgba(0,0,0,0.8)",
            }}
          />
          <img
            src={`/api/images/${validKeys[active]}`}
            alt={`Recipe card ${active + 1}`}
            className="w-full h-auto"
          />
          <p
            className="absolute bottom-2 right-3 text-[#a3978c] text-xs"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            click to enlarge
          </p>
        </div>
      </motion.div>

      {/* Thumbnails */}
      {validKeys.length > 1 && (
        <div className="flex gap-3 justify-center mt-4">
          {validKeys.map((key, i) => (
            <button
              key={key}
              onClick={() => setActive(i)}
              className={`border-4 transition-all ${i === active
                  ? "border-[#b58a66] scale-105"
                  : "border-[#3a2818] opacity-70 hover:opacity-100"
                }`}
              style={{ boxShadow: "2px 2px 6px rgba(0,0,0,0.3)" }}
            >
              <img
                src={`/api/images/${key}`}
                alt={`Card ${i + 1}`}
                className="w-16 h-16 object-cover"
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
            style={{ background: "rgba(0,0,0,0.88)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
          >
            <motion.img
              src={`/api/images/${validKeys[active]}`}
              alt="Recipe card enlarged"
              className="max-w-full max-h-full rounded shadow-2xl"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 text-white text-3xl font-bold opacity-70 hover:opacity-100"
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
    : "/coming-soon.jpg";

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#1c1b1a",
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 31px,
            rgba(222, 222, 222, 0.03) 31px,
            rgba(222, 222, 222, 0.03) 32px
          )
        `,
      }}
    >
      {/* Nav */}
      <div
        className="py-3 px-6"
        style={{ background: "#2a241b", borderBottom: "3px solid #9f6b43" }}
      >
        <Link
          to="/"
          className="text-[#b58a66] hover:text-[#dedede] transition-colors flex items-center gap-2"
          style={{ fontFamily: "'Special Elite', cursive" }}
        >
          ← Back to Nan's Kitchen
        </Link>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
          style={{
            fontFamily: "'Pacifico', cursive",
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            color: "#f5f5f5",
            textShadow: "1px 2px 0 rgba(0,0,0,0.5)",
          }}
        >
          {recipe.name}
        </motion.h1>

        {/* Dish photo polaroid */}
        <motion.div
          initial={{ opacity: 0, rotate: -2 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-10"
        >
          <div
            className="bg-[#2a241b] p-3 pb-10 shadow-xl relative"
            style={{
              maxWidth: "300px",
              transform: "rotate(-1.5deg)",
              boxShadow: "4px 5px 16px rgba(0,0,0,0.6)",
            }}
          >
            {/* Thumbtack */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 w-5 h-5 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 35% 35%, #9f6b43, #3a2818)",
                boxShadow: "1px 2px 4px rgba(0,0,0,0.8)",
              }}
            />
            <img
              src={dishImageUrl}
              alt={recipe.name}
              className="w-full aspect-square object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/coming-soon.jpg";
              }}
            />
            <p
              className="absolute bottom-2 left-0 right-0 text-center text-[#dedede]"
              style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem" }}
            >
              {recipe.name}
            </p>
          </div>
        </motion.div>

        {/* Recipe cards section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2
            className="text-center mb-6 text-[#dedede]"
            style={{
              fontFamily: "'Special Elite', cursive",
              fontSize: "1.3rem",
            }}
          >
            Nan's Recipe Cards
          </h2>
          <RecipeCardViewer keys={cardKeys} />
        </motion.div>

        {/* No cards fallback */}
        {cardKeys.every((k) => !k) && (
          <div className="text-center py-10">
            <p
              className="text-2xl text-[#a3978c]"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              Recipe cards coming soon! 🍰
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="mt-16 py-6 text-center text-sm"
        style={{
          background: "#161514",
          borderTop: "4px solid #3a2818",
          color: "#8b684e",
          fontFamily: "'Special Elite', cursive",
        }}
      >
        <p>Made with love for Nan's family 🍰</p>
      </footer>
    </div>
  );
}
