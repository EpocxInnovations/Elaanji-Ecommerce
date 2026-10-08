import { useState } from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const MESSAGES = [
  'Free shipping on orders above ₹999',
  'Handloom & designer sarees · Est. 2024',
  'Authentic Kanjivaram, Banarasi & more',
  'Premium finishing with pan-India delivery',
]

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const row = MESSAGES.map((msg, i) => (
    <span key={i} className="inline-flex items-center mx-8">
      <span className="text-gold-soft/90 mx-4">✦</span>
      <span>{msg}</span>
    </span>
  ))

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-ink-deep text-paper overflow-hidden relative announcement-bar"
      >
        <div className="flex overflow-hidden py-2.5 relative">
          <div className="flex whitespace-nowrap animate-marquee min-w-full">
            <div className="flex shrink-0">{row}</div>
            <div className="flex shrink-0" aria-hidden="true">{row}</div>
          </div>
          {/* Fade edges */}
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-ink-deep to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-ink-deep to-transparent pointer-events-none" />
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss announcement"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-paper/50 hover:text-paper transition-colors z-10"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
