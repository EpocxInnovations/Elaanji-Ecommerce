import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { prefersReducedMotion } from '../utils/mediaSupport'

export function HeroReveal({ children }) {
  const videoRef = useRef(null)
  const [skipVideo] = useState(() => prefersReducedMotion())
  const [videoDone, setVideoDone] = useState(skipVideo)

  useEffect(() => {
    if (skipVideo) return
    const video = videoRef.current
    if (!video) return

    const handleEnded = () => setVideoDone(true)
    const handleError = () => setVideoDone(true) // fail open

    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)
    video.play().catch(() => setVideoDone(true)) 

    return () => {
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
    }
  }, [skipVideo])

  return (
    <section className="relative overflow-hidden min-h-[85vh] md:min-h-[92vh] flex items-center justify-center w-full">
      {/* The actual homepage content sits behind the video. Because the video has an alpha channel, 
          this content will naturally be revealed as the curtains part. */}
      <div className="absolute inset-0 z-10 w-full h-full flex items-start justify-center">
         {children(videoDone)}
      </div>

      {!skipVideo && (
        <AnimatePresence>
          {!videoDone && (
            <motion.video
              ref={videoRef}
              src="/videos/curtain_alpha.webm"
              muted
              playsInline
              autoPlay
              className="absolute inset-0 w-full h-full object-cover z-50 pointer-events-none"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>
      )}
    </section>
  )
}
