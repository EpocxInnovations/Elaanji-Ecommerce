import React, { useState, useRef, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Sparkles } from 'lucide-react'

export function GooeyInput({
  placeholder = 'Search Kanjivaram, Banarasi, Silk...',
  value: externalValue,
  onChange: externalOnChange,
  onSubmit,
  className = '',
  inputRef,
  ...props
}) {
  const [internalValue, setInternalValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const filterId = useId().replace(/:/g, '')

  const isControlled = externalValue !== undefined
  const value = isControlled ? externalValue : internalValue

  const handleChange = (e) => {
    if (!isControlled) {
      setInternalValue(e.target.value)
    }
    if (externalOnChange) {
      externalOnChange(e)
    }
  }

  const handleClear = () => {
    if (isControlled && externalOnChange) {
      const syntheticEvent = { target: { value: '' } }
      externalOnChange(syntheticEvent)
    } else {
      setInternalValue('')
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(value)
    }
  }

  return (
    <div className={`relative w-full max-w-xl mx-auto ${className}`}>
      {/* SVG Gooey Filter Definition */}
      <svg className="hidden">
        <defs>
          <filter id={`gooey-${filterId}`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <form onSubmit={handleFormSubmit} className="relative flex items-center w-full">
        {/* Gooey Liquid Background Blobs */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ filter: `url(#gooey-${filterId})` }}
        >
          <motion.div
            animate={{
              scale: isFocused ? [1, 1.04, 1] : 1,
              borderRadius: isFocused ? '24px' : '16px',
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full bg-gradient-to-r from-gold/20 via-oxblood/15 to-gold/20 border border-gold/40 shadow-card"
          />

          {/* Morphing Gooey Orbs */}
          <motion.div
            animate={
              isFocused
                ? {
                    x: [0, 40, -30, 0],
                    y: [0, -8, 6, 0],
                    scale: [1, 1.3, 0.9, 1],
                  }
                : { x: 0, y: 0, scale: 1 }
            }
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-1 -left-2 w-8 h-8 rounded-full bg-gold/50 blur-xs"
          />
          <motion.div
            animate={
              isFocused
                ? {
                    x: [0, -50, 35, 0],
                    y: [0, 10, -8, 0],
                    scale: [1, 1.2, 0.85, 1],
                  }
                : { x: 0, y: 0, scale: 1 }
            }
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-1 -right-2 w-10 h-10 rounded-full bg-oxblood/40 blur-xs"
          />
        </div>

        {/* Input Container */}
        <div className="relative z-10 flex items-center w-full px-4 py-2.5 bg-paper/90 backdrop-blur-md rounded-2xl border border-gold/30 shadow-luxury transition-all duration-300 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/30">
          <motion.div
            animate={{ rotate: isFocused ? 90 : 0, scale: isFocused ? 1.15 : 1 }}
            transition={{ duration: 0.3 }}
            className="text-oxblood mr-3 shrink-0"
          >
            <Search size={20} strokeWidth={1.8} />
          </motion.div>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full bg-transparent text-ink font-display text-base sm:text-lg placeholder:text-stone/50 outline-none border-none py-1"
            {...props}
          />

          <AnimatePresence>
            {value && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                onClick={handleClear}
                type="button"
                className="p-1 text-stone hover:text-oxblood transition-colors rounded-full hover:bg-gold/10 ml-1 shrink-0"
              >
                <X size={18} strokeWidth={2} />
              </motion.button>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="ml-2 px-4 py-1.5 bg-gold-gradient text-ink-deep text-xs font-bold uppercase tracking-widest2 rounded-xl shadow-gold-glow hover:shadow-luxury transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>Search</span>
            <Sparkles size={13} className="text-oxblood" />
          </motion.button>
        </div>
      </form>
    </div>
  )
}

export function GooeyInputDemo() {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-paper-warm rounded-2xl border border-gold/20 shadow-card my-6">
      <p className="label-eyebrow mb-4 text-center">Interactive Search Atelier</p>
      <GooeyInput placeholder="Search..." />
    </div>
  )
}
