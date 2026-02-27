import { useState, useRef } from "react";
import { useLoaderData, Link } from "react-router";
import { motion, useInView, AnimatePresence } from "motion/react";
import type { Route } from "./+types/home";
import { nanSayings } from "~/data/nanSayings";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Baking with Nan" },
    {
      name: "description",
      content: "A lifetime of love, baked into every recipe.",
    },
  ];
}

export function links(): Route.LinkDescriptors {
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
  created_at: string;
}

// --- Loader ---
export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.bakingwithnan_db;

  const recipes = await db
    .prepare(
      "SELECT id, slug, name, dish_image, created_at FROM recipes ORDER BY name ASC",
    )
    .all<Recipe>();

  return {
    recipes: recipes.results ?? [],
  };
}

// --- Alphabet filter ---
const ALPHABET = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// --- Recipe Card ---
function RecipeCard({ recipe, index }: { recipe: Recipe; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const imageUrl = recipe.dish_image
    ? `/api/images/${recipe.dish_image}`
    : "/coming-soon.jpg";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 6) * 0.08, ease: "easeOut" }}
      whileHover={{ y: -8 }}
      className="group cursor-pointer h-full"
    >
      <Link to={`/recipes/${recipe.slug}`} prefetch="intent" className="block h-full">
        <div className="bg-[#2a241b] rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.4)] hover:shadow-[0_12px_30px_rgb(20,15,10,0.6)] ring-1 ring-white/[0.05]">
          {/* Photo area */}
          <div className="w-full aspect-[4/3] overflow-hidden bg-[#1c1b1a] relative">
            <img
              src={imageUrl}
              alt={recipe.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/coming-soon.jpg";
              }}
            />
            {/* Soft inset shadow */}
            <div className="absolute inset-0 ring-1 ring-inset ring-black/40 rounded-t-2xl pointer-events-none" />
          </div>

          {/* Text Area */}
          <div className="p-5 flex-grow flex items-center justify-center">
            <h3
              className="text-center text-[#dedede] leading-snug transition-colors group-hover:text-[#b58a66]"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.25rem",
                fontWeight: 500,
              }}
            >
              {recipe.name}
            </h3>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// --- Floating Quote ---
function QuoteEl({ text, index }: { text: string; index: number }) {
  // Use Caveat for that handwritten elegant touch, but style it softly
  return (
    <div
      className="px-6 py-4 max-w-[220px] text-center"
      style={{
        fontFamily: "'Caveat', cursive",
        fontSize: "1.35rem",
        color: "#b58a66",
        opacity: 0.9,
        lineHeight: "1.4",
        transform: `rotate(${(index % 3) - 1}deg)`,
      }}
    >
      "{text}"
    </div>
  );
}

// --- Admin Link ---
function AdminQuote() {
  return (
    <Link to="/admin/login" className="hover:opacity-100 opacity-60 transition-opacity">
      <div
        className="px-4 py-2"
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "0.85rem",
          color: "#8b684e",
          letterSpacing: "0.05em",
          textTransform: "uppercase"
        }}
      >
        Admin Login
      </div>
    </Link>
  );
}

// --- Main Page ---
export default function Home() {
  const { recipes } = useLoaderData<typeof loader>();
  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const filtered = recipes.filter((r) => {
    const name = r.name.toLowerCase();
    if (search) return name.includes(search.toLowerCase());
    if (activeLetter) {
      if (activeLetter === "#") return /^[^a-z]/i.test(r.name);
      return r.name.toUpperCase().startsWith(activeLetter);
    }
    return true;
  });

  const handleLetterClick = (letter: string) => {
    setSearch("");
    setActiveLetter((prev) => (prev === letter ? null : letter));
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setActiveLetter(null);
  };

  return (
    <div
      className="min-h-screen text-[#dedede]"
      style={{
        backgroundColor: "#1c1b1a", // Deep subtle dark background
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* === HEADER / HERO === */}
      <header className="relative pt-16 pb-14 px-4 text-center overflow-hidden">
        {/* Soft radial glow background */}
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3a2818] to-[#1c140d] opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <p
            className="text-[#9f6b43] mb-4 tracking-[0.2em] text-sm uppercase font-medium"
          >
            A Lifetime of Love
          </p>

          <h1
            className="text-[#f5f5f5] mb-8"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(3rem, 10vw, 5.5rem)",
              lineHeight: 1.1,
              fontWeight: 500,
            }}
          >
            Baking with <span className="italic text-[#9f6b43]">Nan</span>
          </h1>

          {/* Hero Image - Softly rounded and elegant */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="inline-block relative rounded-full p-2 bg-white/50 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/[0.02]"
          >
            <div className="w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden">
              <img
                src="/public/nan.jpg"
                alt="Nan's Kitchen"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Floating Quotes in Hero */}
        <div className="hidden lg:block absolute left-10 top-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            <QuoteEl text={nanSayings[0]} index={0} />
          </motion.div>
        </div>
        <div className="hidden lg:block absolute right-10 top-32">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            <QuoteEl text={nanSayings[1]} index={1} />
          </motion.div>
        </div>
      </header>

      {/* === SEARCH + FILTER BAR === */}
      <div
        className="sticky top-0 z-30 py-4 px-4 flex flex-col items-center gap-4 bg-[#1c1b1a]/90 backdrop-blur-md border-b border-[#3a2818]"
      >
        {/* Search */}
        <div className="relative w-full max-w-lg">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b684e] opacity-70">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          </span>
          <input
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full bg-[#2a241b] border border-[#3a2818] text-[#dedede] placeholder:text-[#8b684e] focus:outline-none focus:ring-2 focus:ring-[#9f6b43] focus:bg-[#2a241b] transition-all shadow-sm font-light text-lg"
          />
        </div>

        {/* Alphabet filter */}
        <div className="flex flex-wrap justify-center gap-1.5 max-w-3xl">
          {ALPHABET.map((letter) => {
            const hasRecipes =
              letter === "#"
                ? recipes.some((r) => /^[^a-z]/i.test(r.name))
                : recipes.some((r) => r.name.toUpperCase().startsWith(letter));
            return (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                disabled={!hasRecipes}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all flex items-center justify-center ${activeLetter === letter
                  ? "bg-[#9f6b43] text-white shadow-md transform scale-110"
                  : hasRecipes
                    ? "bg-transparent text-[#a3978c] hover:bg-[#3a2818] hover:text-[#dedede]"
                    : "bg-transparent text-[#5c4d3c] cursor-default opacity-40"
                  }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Recipe count & Quotes layout */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={filtered.length + search + activeLetter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-[#b58a66] text-lg italic"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {filtered.length === 0
                ? "No recipes found matching your search."
                : filtered.length === recipes.length
                  ? `Discover ${recipes.length} beloved recipes`
                  : `Showing ${filtered.length} of ${recipes.length} recipes`}
            </motion.p>
          </AnimatePresence>

          <div className="hidden md:flex gap-8 items-center">
            {nanSayings.slice(2, 4).map((saying, i) => (
              <QuoteEl key={i} text={saying} index={i + 2} />
            ))}
          </div>
        </div>

        {/* Recipe Grid */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <p
              className="text-3xl mb-4 italic text-[#b58a66]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              We couldn't find that one...
            </p>
            <p
              className="text-[#a3978c] font-light text-lg"
            >
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

      {/* === FOOTER === */}
      <footer
        className="mt-20 py-16 text-center text-sm border-t border-[#3a2818]/80 bg-[#161514]"
      >
        <div className="max-w-2xl mx-auto px-6 flex flex-col items-center gap-6">
          <p className="font-light text-[#9f6b43] text-lg tracking-wide uppercase">
            Baking with
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="ml-2 italic normal-case text-2xl text-[#f5f5f5]">Nan</span>
          </p>
          <div className="w-12 h-px bg-[#3a2818]"></div>
          <p className="text-[#a3978c] tracking-widest uppercase text-xs">Made with love for Nan's family</p>
          <p className="text-[#8b684e] italic leading-relaxed text-sm">Her recipes live on forever.</p>
          <div className="mt-8 pt-8 border-t border-[#3a2818]/50 w-full flex justify-center">
            <AdminQuote />
          </div>
        </div>
      </footer>
    </div>
  );
}
