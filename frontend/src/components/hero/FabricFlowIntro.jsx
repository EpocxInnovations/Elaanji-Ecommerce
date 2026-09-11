import { useEffect, useRef, useState } from "react";

/**
 * FabricFlowIntro
 * -----------------
 * Full-bleed, one-time playback of the saree drape/unfurl clip on a black
 * field. The source clip already ends on a full black frame, so the cut
 * into the Hero is a plain opacity cross-fade — no manual color match needed.
 *
 * Behaviour:
 * - Plays once per browser session (sessionStorage flag). Repeat visits in
 *   the same session skip straight to the Hero — nobody wants to watch an
 *   8s intro every time they navigate home.
 * - Respects prefers-reduced-motion: shows the poster frame for a beat,
 *   then hands off, instead of autoplaying motion.
 * - "Skip" is always available (bottom-right), for anyone who's seen it.
 * - Calls onComplete() once, when the handoff to the Hero should happen.
 *
 * Usage:
 *   <FabricFlowIntro onComplete={() => setIntroDone(true)} />
 *   {introDone && <Hero />}
 */
export default function FabricFlowIntro({ onComplete }) {
  const videoRef = useRef(null);
  const [fading, setFading] = useState(false);
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem("elaanji:introSeen") === "1";
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (alreadySeen || reduceMotion) {
      setSkip(true);
      const t = setTimeout(finish, reduceMotion ? 600 : 0);
      return () => clearTimeout(t);
    }
  }, []);

  function finish() {
    sessionStorage.setItem("elaanji:introSeen", "1");
    setFading(true);
    // match the CSS transition duration below (700ms)
    window.setTimeout(() => onComplete?.(), 700);
  }

  if (skip && !fading) {
    // Reduced-motion / repeat-visit path: no video mounted at all.
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-black transition-opacity duration-700 ease-out ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={fading}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        preload="auto"
        poster="/assets/video/fabric-flow-poster.jpg"
        onEnded={finish}
        onError={finish}
      >
        <source src="/assets/video/fabric-flow.webm" type="video/webm" />
        <source src="/assets/video/fabric-flow.mp4" type="video/mp4" />
      </video>

      <button
        type="button"
        onClick={finish}
        className="absolute bottom-6 right-6 rounded-full border border-white/30 px-4 py-2 text-xs tracking-wide text-white/80 backdrop-blur-sm transition hover:border-white/60 hover:text-white"
      >
        Skip
      </button>
    </div>
  );
}
