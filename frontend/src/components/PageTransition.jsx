import { motion } from 'framer-motion'
import { pageTransitionVariants } from '../utils/motion'

export function PageTransition({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransitionVariants}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}
