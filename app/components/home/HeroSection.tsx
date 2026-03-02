import { Link } from "react-router";
import { motion } from "motion/react";
import { nanSayings } from "~/data/nanSayings";

function QuoteEl({ text, index }: { text: string; index: number }) {
  return (
    <div
      className="px-6 py-4 max-w-[220px] text-center font-handwriting text-accent-light opacity-90"
      style={{
        fontSize: "1.35rem",
        lineHeight: "1.4",
        transform: `rotate(${(index % 3) - 1}deg)`,
      }}
    >
      &ldquo;{text}&rdquo;
    </div>
  );
}

const QUOTE_POSITIONS = [
  { className: "hidden lg:block absolute left-6 top-16", x: -20, y: 0 },
  { className: "hidden lg:block absolute right-8 top-24", x: 20, y: 0 },
  { className: "hidden lg:block absolute left-12 bottom-16", x: -20, y: 0 },
  { className: "hidden lg:block absolute right-6 bottom-24", x: 20, y: 0 },
  {
    className: "hidden xl:block absolute left-1/2 -translate-x-[28rem] top-1/2",
    x: 0,
    y: 20,
  },
];

export function HeroSection() {
  return (
    <header
      className="relative pt-16 pb-14 px-4 text-center overflow-hidden bg-surface"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='88' viewBox='0 0 80 88' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M22 21.91V26h-2c-9.94 0-18 8.06-18 18 0 9.943 8.058 18 18 18h2v4.09c8.012.722 14.785 5.738 18 12.73 3.212-6.99 9.983-12.008 18-12.73V62h2c9.94 0 18-8.06 18-18 0-9.943-8.058-18-18-18h-2v-4.09c-8.012-.722-14.785-5.738-18-12.73-3.212 6.99-9.983 12.008-18 12.73zM54 58v4.696c-5.574 1.316-10.455 4.428-14 8.69-3.545-4.262-8.426-7.374-14-8.69V58h-5.993C12.27 58 6 51.734 6 44c0-7.732 6.275-14 14.007-14H26v-4.696c5.574-1.316 10.455-4.428 14-8.69 3.545 4.262 8.426 7.374 14 8.69V30h5.993C67.73 30 74 36.266 74 44c0 7.732-6.275 14-14.007 14H54zM42 88c0-9.94 8.06-18 18-18h2v-4.09c8.016-.722 14.787-5.738 18-12.73v7.434c-3.545 4.262-8.426 7.374-14 8.69V74h-5.993C52.275 74 46 80.268 46 88h-4zm-4 0c0-9.943-8.058-18-18-18h-2v-4.09c-8.012-.722-14.785-5.738-18-12.73v7.434c3.545 4.262 8.426 7.374 14 8.69V74h5.993C27.73 74 34 80.266 34 88h4zm4-88c0 9.943 8.058 18 18 18h2v4.09c8.012.722 14.785 5.738 18 12.73v-7.434c-3.545-4.262-8.426-7.374-14-8.69V14h-5.993C52.27 14 46 7.734 46 0h-4zM0 34.82c3.213-6.992 9.984-12.008 18-12.73V18h2c9.94 0 18-8.06 18-18h-4c0 7.732-6.275 14-14.007 14H14v4.696c-5.574 1.316-10.455 4.428-14 8.69v7.433z' fill='%233a2818' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
      }}
    >
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-border to-[#1c140d] opacity-40 sm:left-[calc(50%-30rem)] sm:w-288.75" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-3xl mx-auto"
      >
        <p className="text-accent mb-4 tracking-[0.2em] text-sm uppercase font-medium cursor-default">
          A Lifetime of{" "}
          <Link
            to="/admin/login"
            className="text-inherit cursor-default"
            aria-label="Admin login"
          >
            Love
          </Link>
        </p>

        <h1
          className="text-text-primary mb-8 font-display font-medium"
          style={{
            fontSize: "clamp(3rem, 10vw, 5.5rem)",
            lineHeight: 1.1,
          }}
        >
          Baking with <span className="italic text-accent">Nan</span>
        </h1>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="inline-block relative rounded-full p-2 bg-white/50 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/2"
        >
          <div className="w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden">
            <img
              src="/nan.JPG"
              alt="Nan's Kitchen"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </motion.div>

        {/* First quote — visible on mobile below the photo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-8 lg:hidden"
        >
          <div
            className="px-6 py-4 text-center font-handwriting text-accent-light opacity-90"
            style={{
              fontSize: "1.35rem",
              lineHeight: "1.4",
            }}
          >
            &ldquo;{nanSayings[0]}&rdquo;
          </div>
        </motion.div>
      </motion.div>

      {QUOTE_POSITIONS.map((pos, i) => (
        <div key={i} className={pos.className}>
          <motion.div
            initial={{ opacity: 0, x: pos.x, y: pos.y }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.5 + i * 0.15, duration: 1 }}
          >
            <QuoteEl text={nanSayings[i]} index={i} />
          </motion.div>
        </div>
      ))}
    </header>
  );
}
