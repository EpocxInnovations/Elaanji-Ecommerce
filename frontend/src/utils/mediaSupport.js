/**
 * The curtain-reveal video is a plain opaque MP4 with no alpha channel,
 * so unlike an earlier approach, there's no browser-specific transparency
 * support to detect — this works identically everywhere. The only thing
 * that still needs checking is prefers-reduced-motion.
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
