// frontend/src/components/CurtainIntro.jsx
//
// Ivory silk + magenta/gold saree-border curtain (design unchanged), animated to match the
// reference screen recording, measured frame by frame (seconds from the moment the curtain appears):
//
//   0.10 - 0.45  wordmark fades in, centred
//   0.73 - 1.03  gold glint sweeps diagonally across the wordmark (left -> right)
//   1.20 - 1.45  nav links fade in on top of the still-closed curtain
//   1.37 - 1.77  wordmark travels up + shrinks into the navbar logo (ease-in-out)
//   1.58 - 2.48  curtains part from the centre seam, LINEAR, pure slide to the edges (no squashing)
//   2.13 -       hero headline slides in from the left while the left curtain still covers its edge
//   2.5  - 3.0   eyebrow + subtext, then buttons (see HERO_DELAYS)
//   hero photo settles from scale 1.05 -> 1 over ~1.6s from the moment the curtains start parting
//
// Presentation only. Plays once per browser session; add ?intro=1 to the URL to replay.
// Skipped for prefers-reduced-motion.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

/* ---------- timing (seconds) ---------- */
const LOGO_DELAY = 0.1;
const LOGO_FADE = 0.35;
const SHIMMER_AT = 0.73;
const SHIMMER_DUR = 0.3;
const NAV_AT = 1.2;
const TRAVEL_AT = 1.37;
const TRAVEL = 0.4;
const PANEL_DELAY = 0.21; // after the travel starts
const PANEL_DUR = 0.9;
const HERO_CUE = 0.76; // after the travel starts (= 0.55s after the curtains start parting)
const TRAVEL_EASE = [0.65, 0, 0.35, 1];

/** Use these as `delay` values (seconds, counted from the cue) for the hero entrance. */
export const HERO_DELAYS = { headline: 0, eyebrow: 0.4, subtext: 0.45, buttons: 0.9 };
/** Spread onto the hero background image wrapper: the photo settles as the curtains part. */
export const HERO_BG_SETTLE = {
  initial: { scale: 1.05 },
  transition: { duration: 1.6, ease: [0.22, 1, 0.36, 1] },
};

const SEEN_KEY = "elaanji:curtainSeen";

// Decided once at module load so the hero reads the same answer on its first render.
const PLAY = (() => {
  if (typeof window === "undefined") return false;
  if (window.location.search.includes("intro=1")) return true;
  try {
    if (sessionStorage.getItem(SEEN_KEY)) return false;
  } catch {}
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
})();

/* ---------- design (unchanged): ivory silk + magenta/gold saree border ---------- */
// Copy curtain-assets/border-v.webp and border-h.webp to frontend/public/curtain/
const BORDER_V = "/curtain/border-v.webp";
const BORDER_H = "/curtain/border-h.webp";
const MAGENTA = "#cb3080";
const SIDE_W = "clamp(52px, 6.5vw, 108px)";
const BAND_H = "clamp(38px, 5vw, 80px)";

if (PLAY && typeof Image !== "undefined") {
  [BORDER_V, BORDER_H].forEach((src) => { new Image().src = src; });
}

const FOLDS = {
  backgroundImage: `
    linear-gradient(180deg, rgba(90,70,60,.16) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(90,70,60,.2) 100%),
    linear-gradient(90deg, #c9c0b3 0%, #e6e0d6 28%, #f6f3ee 50%, #e6e0d6 72%, #c9c0b3 100%)`,
  backgroundSize: "100% 100%, 5.2vw 100%",
  backgroundRepeat: "no-repeat, repeat-x",
};

const DRAPE = {
  backgroundImage:
    "linear-gradient(90deg, rgba(70,40,40,.22) 0%, rgba(70,40,40,0) 30%, rgba(255,255,255,.10) 50%, rgba(70,40,40,0) 70%, rgba(70,40,40,.22) 100%)",
  backgroundSize: "5.2vw 100%",
  backgroundRepeat: "repeat-x",
};

function Panel({ side, children, ...motionProps }) {
  const left = side === "left";
  const band = (edge, border) => ({
    [left ? "left" : "right"]: SIDE_W,
    [left ? "right" : "left"]: 0,
    height: BAND_H,
    backgroundImage: `url(${BORDER_H})`,
    backgroundSize: "auto 100%",
    backgroundRepeat: "repeat-x",
    [border]: `4px solid ${MAGENTA}`,
  });
  return (
    <motion.div
      className={`absolute inset-y-0 w-[calc(50%+1px)] pointer-events-auto ${left ? "left-0" : "right-0"}`}
      style={{
        ...FOLDS,
        boxShadow: left ? "inset -14px 0 22px rgba(90,60,60,.22)" : "inset 14px 0 22px rgba(90,60,60,.22)",
      }}
      {...motionProps}
    >
      <div className="absolute top-0" style={band("top", "borderBottom")} />
      <div className="absolute bottom-0" style={band("bottom", "borderTop")} />
      <div
        className={`absolute inset-y-0 ${left ? "left-0" : "right-0"}`}
        style={{
          width: SIDE_W,
          backgroundImage: `url(${BORDER_V})`,
          backgroundSize: "100% auto",
          backgroundRepeat: "repeat-y",
        }}
      />
      <div className="absolute inset-0 pointer-events-none" style={DRAPE} />
      {children}
    </motion.div>
  );
}

/* ---------- hero gate ---------- */
/** Hero components call this and start their entrance when it flips to true. */
export function useIntroReady() {
  const [ready, setReady] = useState(!PLAY);
  useEffect(() => {
    if (ready) return;
    const on = () => setReady(true);
    window.addEventListener("intro:cue", on);
    return () => window.removeEventListener("intro:cue", on);
  }, [ready]);
  return ready;
}

/* ---------- component ---------- */
// gold glint over the ink wordmark: a diagonal band that slides left -> right
const SHIMMER_BG =
  "linear-gradient(105deg, #14120F 0%, #14120F 43%, #c9993f 47%, #fff1cf 50%, #c9993f 53%, #14120F 57%, #14120F 100%)";

export default function CurtainIntro() {
  const [phase, setPhase] = useState(PLAY ? "in" : "done"); // in -> open -> done
  const [travel, setTravel] = useState(null);
  const [landed, setLanded] = useState(false);
  const logoRef = useRef(null);
  const cued = useRef(false);
  const root = typeof document !== "undefined" ? document.documentElement : null;

  const cue = () => {
    if (cued.current) return;
    cued.current = true;
    window.dispatchEvent(new Event("intro:cue"));
  };

  const finish = () => {
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch {}
    cue();
    if (root) delete root.dataset.intro;
    if (typeof document !== "undefined") document.body.style.overflow = "";
    setPhase("done");
  };

  useLayoutEffect(() => {
    if (!PLAY) return;
    if (root) root.dataset.intro = "playing";
    if (typeof document !== "undefined") document.body.style.overflow = "hidden";
    return () => {
      if (root) delete root.dataset.intro;
      if (typeof document !== "undefined") document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (phase !== "in") return;
    const navT = setTimeout(() => { if (root) root.dataset.intro = "nav"; }, NAV_AT * 1000);
    const openT = setTimeout(() => {
      const target = document.querySelector("[data-brand-logo]");
      const el = logoRef.current;
      if (target && el) {
        const a = el.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        setTravel({
          x: b.left + b.width / 2 - (a.left + a.width / 2),
          y: b.top + b.height / 2 - (a.top + a.height / 2),
          scale: b.width / a.width,
        });
      } else {
        setLanded(true);
      }
      if (root) root.dataset.intro = "open";
      setPhase("open");
      setTimeout(cue, HERO_CUE * 1000);
      // Safety timer ensures curtain finish even if tab is unfocused or onAnimationComplete drops
      setTimeout(finish, (PANEL_DELAY + PANEL_DUR + 0.1) * 1000);
    }, TRAVEL_AT * 1000);
    return () => { clearTimeout(navT); clearTimeout(openT); };
  }, [phase]);

  // Keyboard shortcut to skip intro if needed (ESC)
  useEffect(() => {
    if (phase === "done") return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase]);

  if (phase === "done" || typeof document === "undefined") return null;
  const open = phase === "open";
  const slide = { duration: PANEL_DUR, ease: "linear", delay: PANEL_DELAY };

  const content = (
    <>
      {/* curtains: z-[100] in front of navbar (z-50) and announcement bar, keeping both behind the curtain */}
      <div className="fixed inset-0 z-[100] pointer-events-none" aria-hidden="true">
        <Panel
          side="left"
          initial={{ x: "0%" }}
          animate={{ x: open ? "-100%" : "0%" }}
          transition={slide}
        />
        <Panel
          side="right"
          initial={{ x: "0%" }}
          animate={{ x: open ? "100%" : "0%" }}
          transition={slide}
          onAnimationComplete={() => open && finish()}
        />
      </div>

      {/* wordmark: above the curtains at z-[110], glints, then travels into [data-brand-logo] */}
      <div className="pointer-events-none fixed inset-0 z-[110] grid place-items-center">
        <motion.div
          ref={logoRef}
          className="font-display text-[clamp(2.2rem,6vw,4.5rem)] leading-none tracking-[0.32em] text-transparent"
          style={{
            visibility: landed ? "hidden" : "visible",
            backgroundImage: SHIMMER_BG,
            backgroundSize: "300% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          initial={{ opacity: 0, backgroundPosition: "100% 0%" }}
          animate={{
            opacity: 1,
            backgroundPosition: "0% 0%",
            ...(open && travel ? travel : {}),
          }}
          transition={{
            opacity: { duration: LOGO_FADE, delay: LOGO_DELAY },
            backgroundPosition: { duration: SHIMMER_DUR, delay: SHIMMER_AT, ease: "easeInOut" },
            x: { duration: TRAVEL, ease: TRAVEL_EASE },
            y: { duration: TRAVEL, ease: TRAVEL_EASE },
            scale: { duration: TRAVEL, ease: TRAVEL_EASE },
          }}
          onAnimationComplete={() => {
            if (open && travel && !landed) {
              if (root) root.dataset.intro = "landed"; // reveals the real navbar logo
              setLanded(true);
            }
          }}
        >
          ELAANJI
        </motion.div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
