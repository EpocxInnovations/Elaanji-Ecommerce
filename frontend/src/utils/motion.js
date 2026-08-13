// Ultra-Premium Motion Tokens & Framer Motion Variants
// Tailored for luxury fashion editorial aesthetic (Elaanji Saree Brand)

export const EASE_SILK = [0.25, 1, 0.5, 1]
export const EASE_EXPO_OUT = [0.16, 1, 0.3, 1]
export const EASE_ELEGANT = [0.4, 0, 0.2, 1]

export const SPRING_LUXURY = {
  type: 'spring',
  damping: 28,
  stiffness: 220,
  mass: 0.8,
}

export const SPRING_SNAPPY = {
  type: 'spring',
  damping: 20,
  stiffness: 300,
}

// Fade up with silky deceleration
export const fadeUpLuxury = {
  hidden: { opacity: 0, y: 24 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.06,
      duration: 0.7,
      ease: EASE_SILK,
    },
  }),
}

// Hero title split word stagger
export const wordReveal = {
  hidden: { opacity: 0, y: 32, rotateX: -15 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      delay: 0.15 + i * 0.08,
      duration: 0.8,
      ease: EASE_EXPO_OUT,
    },
  }),
}

// Container staggering children
export const staggerContainer = (staggerDelay = 0.06, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren,
      staggerChildren: staggerDelay,
    },
  },
})

// Image clip-path wipe reveal (unfolding fabric feel)
export const clipPathWipe = {
  hidden: { clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)', opacity: 0 },
  visible: {
    clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)',
    opacity: 1,
    transition: {
      duration: 0.9,
      ease: EASE_EXPO_OUT,
    },
  },
}

// Page transition variant
export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: EASE_SILK,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.25,
      ease: EASE_ELEGANT,
    },
  },
}
