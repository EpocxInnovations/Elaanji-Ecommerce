import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Feather, ArrowRight } from 'lucide-react'
import { supportsAlphaWebm, prefersReducedMotion } from '../utils/mediaSupport'
import { TextRevealCard } from './TextRevealCard'
import { luxuryEase } from '../utils/motion'

/**
 * Full-bleed hero: plays the saree-flow reveal video once on load, then
 * fades it out while the headline/CTA content fades and slides up underneath,
 * timed so the content lands as the fabric dissolves away.
 *
 * Falls back straight to the static content (no video) when:
 *  - prefers-reduced-motion is set
 *  - the browser is Safari without WebM alpha support
 *  - the video fails to load or autoplay is blocked
 */
export function HeroReveal() {
  const videoRef = useRef(null)
  const [videoEnabled] = useState(() => !prefersReducedMotion() && supportsAlphaWebm())
  const [videoPhase, setVideoPhase] = useState(videoEnabled ? 'playing' : 'done')

  useEffect(() => {
    if (!videoEnabled) return
    const video = videoRef.current
    if (!video) return

    const handleEnded = () => setVideoPhase('done')
    const handleError = () => setVideoPhase('done') // Fail open — show content

    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)
    
    video.play().catch(() => setVideoPhase('done')) // Autoplay blocked

    return () => {
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
    }
  }, [videoEnabled])

  const contentVisible = videoPhase !== 'playing'

  return (
    <section className="relative bg-paper overflow-hidden min-h-[520px] md:min-h-[640px] flex items-center justify-center py-12 md:py-16">
      {/* Ambient gold & oxblood glow */}
      <div className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full bg-gold/15 blur-[140px] pointer-events-none animate-glow-pulse" />
      <div className="absolute bottom-0 -left-24 w-[420px] h-[420px] rounded-full bg-oxblood/10 blur-[140px] pointer-events-none" />

      {/* Reveal video — sits above the content, fades itself out on end */}
      <AnimatePresence>
        {videoEnabled && videoPhase === 'playing' && (
          <motion.video
            ref={videoRef}
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-30 pointer-events-none"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <source src="/assets/video/fabric-flow.webm" type="video/webm" />
            <source src="/assets/video/fabric-flow.mp4" type="video/mp4" />
          </motion.video>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full mx-auto max-w-5xl px-4 sm:px-6 text-center">
        {/* Eyebrow badge */}
        <motion.p
          className="label-eyebrow mb-4 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={contentVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: luxuryEase }}
        >
          <span className="w-8 h-px bg-gold/60" />
          <Feather size={14} className="text-oxblood" />
          Handloom &amp; Designer Atelier
          <span className="w-8 h-px bg-gold/60" />
        </motion.p>

        {/* Split Animated Headline */}
        <SplitHeadline
          text="SAREES WOVEN WITH HERITAGE"
          visible={contentVisible}
          className="font-display text-ink text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4"
        />

        {/* Interactive Text Reveal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={contentVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.35, ease: luxuryEase }}
          className="my-6"
        >
          <TextRevealCard text="The House of Saree" revealText="ELAANJI" />
        </motion.div>

        {/* Subtitle / Narrative */}
        <motion.p
          className="mt-4 text-stone text-[15px] sm:text-base leading-relaxed max-w-xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={contentVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5, ease: luxuryEase }}
        >
          Handpicked Kanjivaram, Banarasi, and designer weaves — heirloom craftsmanship for modern stories.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={contentVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.65, ease: luxuryEase }}
        >
          <Link to="/shop" className="btn-primary">
            Shop Now
            <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
          <Link to="/shop?filter=new-arrivals" className="btn-secondary">
            Explore Collection
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/**
 * Word-level stagger reveal for the headline — each word rises and fades
 * in with a slight delay cascade. Splits by word (not character) for optimal legibility.
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
              ease: luxuryEase,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </h1>
  )
}
