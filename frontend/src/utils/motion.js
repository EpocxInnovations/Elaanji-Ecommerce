// Ultra-Premium Motion Tokens & Framer Motion Variants
// Tailored for luxury fashion editorial aesthetic (Elaanji Saree Brand)

export const EASE_SILK = [0.25, 1, 0.5, 1]
export const EASE_EXPO_OUT = [0.16, 1, 0.3, 1]
export const EASE_ELEGANT = [0.4, 0, 0.2, 1]
export const EASE_BOUNCE_SETTLE = [0.34, 1.56, 0.64, 1]

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

export const SPRING_FLOAT = {
  type: 'spring',
  damping: 18,
  stiffness: 140,
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
      duration: 0.85,
      ease: EASE_EXPO_OUT,
    },
  }),
}

// Character level split reveal
export const letterReveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.03,
      duration: 0.5,
      ease: EASE_SILK,
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

// Magazine Menu Curtain Slide Down
export const menuCurtainVariants = {
  closed: {
    clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: EASE_ELEGANT,
    },
  },
  open: {
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: EASE_EXPO_OUT,
    },
  },
}

// Quick View Modal Backdrop
export const modalOverlayVariants = {
  closed: { opacity: 0, backdropFilter: 'blur(0px)' },
  open: { opacity: 1, backdropFilter: 'blur(8px)', transition: { duration: 0.4, ease: EASE_SILK } },
}

// Quick View Modal Content
export const modalContentVariants = {
  closed: { opacity: 0, scale: 0.94, y: 20 },
  open: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: EASE_EXPO_OUT } },
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
