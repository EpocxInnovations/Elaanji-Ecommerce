import { useState } from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export function AnnouncementBar({ message = 'Free shipping on orders above ₹999' }) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-ink text-paper overflow-hidden"
      >
        <div className="relative text-center text-xs tracking-widest2 uppercase py-2.5 px-10">
          {message}
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss announcement"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-paper/50 hover:text-paper transition-colors"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
