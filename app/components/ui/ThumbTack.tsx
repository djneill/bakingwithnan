import { motion } from "motion/react";

type ThumbTackProps = {
  className?: string;
  alt?: string;
  src?: string;
};

export function ThumbTack({
  className = "",
  alt = "Thumbtack",
  src = "/blueThumbTack.png",
}: ThumbTackProps) {
  return (
    <motion.img
      src={src}
      alt={alt}
      className={[
        "pointer-events-none select-none absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-10 h-10 drop-shadow-[1px_2px_6px_rgba(0,0,0,0.5)]",
        className,
      ].join(" ")}
      initial={{ opacity: 0, x: 28, y: -26, rotate: 180, scale: 1.08 }}
      animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      draggable={false}
    />
  );
}
