import { motion } from 'framer-motion'
import { luxuryEase } from '../utils/motion'

export function SplitText({
  children,
  className = '',
  as = 'h1',
  stagger = 0.03,
  delay = 0,
  animateOn = 'mount', // 'mount' | 'scroll'
}) {
  if (typeof children !== 'string') {
    const Component = as
    return <Component className={className}>{children}</Component>
  }

  const Component = motion[as] || motion.div
  const words = children.split(' ')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  }

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 10,
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

  const animationProps =
    animateOn === 'mount'
      ? { animate: 'visible' }
      : { whileInView: 'visible', viewport: { once: true, margin: '-20px' } }

  return (
    <Component
      className={`flex flex-wrap ${className}`}
      initial="hidden"
      {...animationProps}
      variants={containerVariants}
    >
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="inline-block py-0.5 pr-[0.25em] last:pr-0">
          <motion.span variants={wordVariants} className="inline-block transform-gpu">
            {word}
          </motion.span>
        </span>
      ))}
    </Component>
  )
}
