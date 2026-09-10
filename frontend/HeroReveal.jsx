import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supportsAlphaWebm, prefersReducedMotion } from '../utils/mediaSupport'

/**
 * Full-bleed hero: plays the saree-flow reveal video once on load (WebM
 * with real alpha — see /docs on how that source was produced), then
 * fades it out while the headline/CTA content fades/slides up underneath,
 * timed so the content lands as the fabric dissolves away.
 *
 * Falls back straight to the static content (no video) when:
 *  - prefers-reduced-motion is set
 *  - the browser is Safari (no WebM alpha support there)
 *  - the video fails to load for any reason
 */
export function HeroReveal() {
  const videoRef = useRef(null)
  const [videoEnabled] = useState(() => !prefersReducedMotion() && supportsAlphaWebm())
  const [videoPhase, setVideoPhase] = useState(videoEnabled ? 'playing' : 'skipped')

  useEffect(() => {
    if (!videoEnabled) return
    const video = videoRef.current
    if (!video) return

    const handleEnded = () => setVideoPhase('done')
    const handleError = () => setVideoPhase('done') // fail open — show content, don't block on a broken video

    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)
    video.play().catch(() => setVideoPhase('done')) // autoplay blocked by browser policy

    return () => {
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
    }
  }, [videoEnabled])

  const contentVisible = videoPhase !== 'playing'

  return (
    <section className="relative bg-ink overflow-hidden min-h-[85vh] md:min-h-[92vh] flex items-center justify-center">
      {/* Reveal video — sits above the content, fades itself out on end */}
      <AnimatePresence>
        {videoEnabled && videoPhase === 'playing' && (
          <motion.video
            ref={videoRef}
            src="/videos/saree-reveal.webm"
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Ambient background texture behind the content — visible once video clears */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink to-oxblood/30" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.p
          className="label-eyebrow text-beige/70 mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={contentVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Handloom &amp; Designer Collection
        </motion.p>

        <SplitHeadline
          text="SAREES WOVEN WITH HERITAGE"
          visible={contentVisible}
          className="font-display text-paper text-5xl md:text-7xl leading-tight"
        />

        <motion.p
          className="mt-6 text-beige/80 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={contentVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Handpicked Kanjivaram, Banarasi, and designer weaves — heirloom
          craftsmanship for modern stories.
        </motion.p>

        <motion.div
          className="mt-10 flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={contentVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            to="/shop"
            className="bg-paper text-ink px-8 py-3 text-sm tracking-wide uppercase hover:bg-oxblood hover:text-paper transition-colors duration-300"
          >
            Shop Now
          </Link>
          <Link
            to="/shop?filter=new-arrivals"
            className="border border-beige/40 text-paper px-8 py-3 text-sm tracking-wide uppercase hover:border-paper transition-colors duration-300"
          >
            Explore Collection
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/**
 * Word-level stagger reveal for the headline — each word rises and fades
 * in with a slight delay cascade, rather than the whole line appearing
 * at once. Splits by word (not character) to keep it legible and avoid
 * the "typewriter" cliché.
 */
function SplitHeadline({ text, visible, className }) {
  const words = text.split(' ')

  return (
    <h1 className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.25em] last:mr-0">
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={visible ? { y: 0 } : {}}
            transition={{
              duration: 0.8,
              delay: 0.25 + i * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </h1>
  )
}
