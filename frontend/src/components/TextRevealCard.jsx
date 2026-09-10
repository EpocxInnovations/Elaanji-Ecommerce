import React, { useEffect, useRef, useState, memo } from 'react'
import { motion } from 'framer-motion'

const Stars = () => {
  const randomMove = () => Math.random() * 4 - 2
  const randomOpacity = () => Math.random() * 0.7 + 0.3
  const random = () => Math.random()

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(60)].map((_, i) => (
        <motion.span
          key={`star-${i}`}
          animate={{
            top: `calc(${random() * 100}% + ${randomMove()}px)`,
            left: `calc(${random() * 100}% + ${randomMove()}px)`,
            opacity: randomOpacity(),
            scale: [0.8, 1.4, 0],
          }}
          transition={{
            duration: random() * 8 + 12,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            top: `${random() * 100}%`,
            left: `${random() * 100}%`,
            width: `${random() * 2 + 1}px`,
            height: `${random() * 2 + 1}px`,
            backgroundColor: i % 2 === 0 ? '#D4A853' : '#FAF9F6',
            borderRadius: '50%',
            boxShadow: '0 0 6px rgba(212, 168, 83, 0.6)',
            zIndex: 1,
          }}
          className="inline-block"
        />
      ))}
    </div>
  )
}

export const MemoizedStars = memo(Stars)

export function TextRevealCard({
  text = 'The House of Saree',
  revealText = 'ELAANJI',
  children,
  className = '',
  dark = false,
}) {
  const [widthPercentage, setWidthPercentage] = useState(0)
  const cardRef = useRef(null)
  const [left, setLeft] = useState(0)
  const [localWidth, setLocalWidth] = useState(0)
  const [isMouseOver, setIsMouseOver] = useState(false)
  const pauseTimerRef = useRef(null)

  const updateCardBounds = () => {
    if (cardRef.current) {
      const { left, width: localWidth } = cardRef.current.getBoundingClientRect()
      setLeft(left)
      setLocalWidth(localWidth)
    }
  }

  useEffect(() => {
    updateCardBounds()
    window.addEventListener('resize', updateCardBounds)
    return () => {
      window.removeEventListener('resize', updateCardBounds)
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    }
  }, [])

  function clearPauseTimer() {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current)
      pauseTimerRef.current = null
    }
  }

  function mouseMoveHandler(event) {
    const { clientX } = event
    if (cardRef.current) {
      const bounds = cardRef.current.getBoundingClientRect()
      const currentWidth = bounds.width || localWidth
      const currentLeft = bounds.left || left
      if (currentWidth > 0) {
        const relativeX = clientX - currentLeft
        const percentage = Math.max(0, Math.min(100, (relativeX / currentWidth) * 100))
        
        setIsMouseOver(true)
        setWidthPercentage(percentage)
        clearPauseTimer()

        // If cursor stops/pauses in the middle (< 80%), auto-glide back to starting stage (0%)
        if (percentage < 80) {
          pauseTimerRef.current = setTimeout(() => {
            setWidthPercentage(0)
          }, 600)
        } else {
          // Full reveal completion if moved to the end
          setWidthPercentage(100)
        }
      }
    }
  }

  function mouseLeaveHandler() {
    setIsMouseOver(false)
    clearPauseTimer()
    setWidthPercentage(0)
  }

  function mouseEnterHandler(event) {
    updateCardBounds()
    setIsMouseOver(true)
    clearPauseTimer()
    if (event && cardRef.current) {
      const bounds = cardRef.current.getBoundingClientRect()
      const clientX = event.clientX || (event.touches && event.touches[0]?.clientX)
      if (clientX && bounds.width > 0) {
        const relativeX = clientX - bounds.left
        const percentage = Math.max(0, Math.min(100, (relativeX / bounds.width) * 100))
        setWidthPercentage(percentage)
      }
    }
  }

  function touchMoveHandler(event) {
    if (event.touches && event.touches[0] && cardRef.current) {
      const bounds = cardRef.current.getBoundingClientRect()
      const clientX = event.touches[0].clientX
      if (bounds.width > 0) {
        const relativeX = clientX - bounds.left
        const percentage = Math.max(0, Math.min(100, (relativeX / bounds.width) * 100))
        setIsMouseOver(true)
        setWidthPercentage(percentage)
        clearPauseTimer()

        if (percentage < 80) {
          pauseTimerRef.current = setTimeout(() => {
            setWidthPercentage(0)
          }, 600)
        } else {
          setWidthPercentage(100)
        }
      }
    }
  }

  const rotateDeg = (widthPercentage - 50) * 0.08

  return (
    <div
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
      onMouseMove={mouseMoveHandler}
      onTouchStart={mouseEnterHandler}
      onTouchEnd={mouseLeaveHandler}
      onTouchMove={touchMoveHandler}
      ref={cardRef}
      className={`relative w-full max-w-3xl mx-auto rounded-2xl p-6 sm:p-10 border overflow-hidden select-none cursor-ew-resize transition-all duration-300 ${dark
          ? 'bg-ink/80 border-gold/25 shadow-luxury text-paper'
          : 'bg-paper-warm/80 backdrop-blur-xl border-gold/20 shadow-card-hover text-ink'
        } ${className}`}
    >
      {children}

      <div className="h-28 sm:h-36 relative flex items-center justify-center overflow-hidden">
        {/* Revealed Text Layer ("ELAANJI") */}
        <motion.div
          style={{ width: '100%' }}
          animate={{
            opacity: isMouseOver && widthPercentage > 0 ? 1 : 0,
            clipPath: `inset(0 ${100 - widthPercentage}% 0 0)`,
          }}
          transition={isMouseOver && widthPercentage > 0 && widthPercentage < 100 ? { duration: 0.1 } : { duration: 0.5, ease: 'easeOut' }}
          className={`absolute inset-0 z-20 flex items-center justify-center will-change-transform ${dark ? 'bg-ink' : 'bg-paper-warm'}`}
        >
          <p
            style={{ textShadow: '0 4px 20px rgba(161, 98, 7, 0.3)' }}
            className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-widest2 uppercase bg-gold-gradient bg-clip-text text-transparent py-4 text-center"
          >
            {revealText}
          </p>
        </motion.div>

        {/* Divider Light Beam */}
        <motion.div
          animate={{
            left: `${widthPercentage}%`,
            rotate: `${rotateDeg}deg`,
            opacity: isMouseOver && widthPercentage > 0 && widthPercentage < 100 ? 1 : 0,
          }}
          transition={isMouseOver && widthPercentage > 0 && widthPercentage < 100 ? { duration: 0.1 } : { duration: 0.5, ease: 'easeOut' }}
          className="h-full w-[3px] bg-gradient-to-b from-transparent via-gold-soft to-transparent absolute z-50 pointer-events-none shadow-gold-glow-lg will-change-transform"
        />

        {/* Base Layer ("The House of Saree") */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <p className="font-display text-3xl sm:text-5xl md:text-6xl font-bold leading-tight py-4 text-center text-ink">
            {text}
          </p>
          <MemoizedStars />
        </div>
      </div>
    </div>
  )
}
