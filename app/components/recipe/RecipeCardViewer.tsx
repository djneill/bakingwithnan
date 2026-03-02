import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function RecipeCardViewer({ keys }: { keys: (string | null)[] }) {
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
              background: "radial-gradient(circle at 35% 35%, #ef4444, #7f1d1d)",
              boxShadow: "1px 2px 6px rgba(0,0,0,0.5)",
            }}
          />
          <img
            src={`/api/images/${validKeys[active]}`}
            alt={`Recipe card ${active + 1}`}
            className="w-full h-auto"
          />
          <p className="absolute bottom-3 right-4 text-xs font-handwriting text-gray-400">
            click to enlarge
          </p>
          {validKeys.length > 1 && (
            <p className="absolute bottom-3 left-4 text-xs font-handwriting text-gray-400">
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
              className={`transition-all overflow-hidden rounded ${
                i === active
                  ? "border-3 border-accent scale-108 shadow-[0_4px_12px_rgba(159,107,67,0.4)]"
                  : "border-3 border-border"
              }`}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/92"
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
                className="max-w-full max-h-[80vh] object-contain block"
              />
            </motion.div>
            <button
              className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full transition-colors text-white text-xl bg-white/10 hover:bg-white/20"
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
