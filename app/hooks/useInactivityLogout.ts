import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Redirects to /admin/logout after 30 minutes of inactivity.
 * Resets on any mouse movement, click, keypress, or scroll.
 */
export function useInactivityLogout() {
  const navigate = useNavigate();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function reset() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        navigate("/admin/logout");
      }, INACTIVITY_MS);
    }

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));

    // Start the timer immediately
    reset();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [navigate]);
}
