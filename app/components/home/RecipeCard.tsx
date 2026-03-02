import { useRef } from "react";
import { Link } from "react-router";
import { motion, useInView } from "motion/react";
import type { RecipeSummary } from "~/types/recipe";

export function RecipeCard({
  recipe,
  index,
}: {
  recipe: RecipeSummary;
  index: number;
}) {
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
      <Link
        to={`/recipes/${recipe.slug}`}
        prefetch="intent"
        className="block h-full"
      >
        <div className="bg-surface-raised rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.4)] hover:shadow-[0_12px_30px_rgb(20,15,10,0.6)] ring-1 ring-white/5">
          <div className="w-full aspect-4/3 overflow-hidden bg-surface relative">
            <img
              src={imageUrl}
              alt={recipe.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/coming-soon.jpg";
              }}
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/40 rounded-t-2xl pointer-events-none" />
          </div>

          <div className="p-5 grow flex items-center justify-center">
            <h3 className="text-center text-text-body leading-snug transition-colors group-hover:text-accent-light font-display text-xl font-medium">
              {recipe.name}
            </h3>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
