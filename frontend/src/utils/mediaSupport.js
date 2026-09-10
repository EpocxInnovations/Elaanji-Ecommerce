/**
 * Chrome/Edge/Firefox support real per-pixel transparency in VP9 WebM.
 * Safari does not, at all, on any platform (desktop or iOS) as of this
 * writing. There's no reliable feature-detection API for alpha-in-video
 * specifically, so this checks for Safari by engine rather than by
 * trying to test alpha support directly (canPlayType doesn't expose it).
 */
export function supportsAlphaWebm() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
  return !isSafari
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
