// Lightweight, high-performance motion system presets for Elaanji

export const luxuryEase = [0.16, 1, 0.3, 1]
export const editorialEase = [0.22, 1, 0.36, 1]
export const goldEase = [0.34, 1.3, 0.64, 1]

export const luxurySpring = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
  mass: 0.6,
}

export const gentleSpring = {
  type: 'spring',
  stiffness: 240,
  damping: 24,
}

export const bounceSpring = {
  type: 'spring',
  stiffness: 450,
  damping: 18,
}

export const goldSpring = {
  type: 'spring',
  stiffness: 300,
  damping: 22,
  mass: 0.7,
}

// Ultra-fast, zero-lag page transition variants
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 4,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
}

// Stagger container for grid elements
export const staggerGridContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
}

// Individual card item stagger variant
export const staggerGridItem = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: luxuryEase,
    },
  },
}
