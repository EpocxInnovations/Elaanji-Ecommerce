import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

/**
 * High-performance, zero-buffering banner slideshow with smooth cross-fade effect.
 *
 * Key Architectural Highlights:
 * 1. Zero Buffering: Preloads all slide images in browser cache immediately on mount.
 * 2. Absolute Stack Cross-Fade: All slides are mounted in an absolute layer stack.
 *    Active slide transitions opacity to 1 while previous slide transitions to 0 over 1000ms.
 *    Hardware accelerated with GPU compositing (no layout reflows, no white flash).
 * 3. Auto-Play & Pause: Cycles every 5 seconds, automatically pauses on hover.
 * 4. Full Navigation: Next/prev arrow triggers, clickable bottom indicator pills, touch swipe.
 */
export function HeroBannerSlideshow({ banners = [], autoPlayInterval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  // Preload all banner images immediately so there is never any buffering pause
  useEffect(() => {
    if (!banners || banners.length === 0) return
    banners.forEach((b) => {
      if (b?.image_url) {
        const img = new Image()
        img.src = b.image_url
      }
      if (b?.mobile_image_url) {
        const mImg = new Image()
        mImg.src = b.mobile_image_url
      }
    })
  }, [banners])

  // Reset index if banners array changes
  useEffect(() => {
    if (currentIndex >= banners.length) {
      setCurrentIndex(0)
    }
  }, [banners.length, currentIndex])

  // Auto-play timer
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, autoPlayInterval)
    return () => clearInterval(interval)
  }, [banners.length, isPaused, autoPlayInterval])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }, [banners.length])

  // Touch swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 40) {
      if (diff > 0) goToNext()
      else goToPrev()
    }
  }

  if (!banners || banners.length === 0) return null

  const isMulti = banners.length > 1
  const hasDedicatedMobile = banners.some((b) => Boolean(b?.mobile_image_url))

  return (
    <div
      className={`group relative w-full overflow-hidden bg-paper select-none ${
        hasDedicatedMobile
          ? 'aspect-[4/5] min-h-[360px] max-h-[580px] sm:aspect-[24/6] md:aspect-[24/5] sm:min-h-[260px] sm:max-h-[440px]'
          : 'aspect-[16/9] sm:aspect-[24/6] md:aspect-[24/5] min-h-[200px] sm:min-h-[260px] max-h-[440px]'
      }`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container - Stacked Absolute for Zero-Buffer Fade */}
      {banners.map((banner, index) => {
        const isActive = index === currentIndex
        return (
          <div
            key={banner.id || index}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Link
              to={banner.cta_url || '/shop'}
              className="block w-full h-full relative"
              tabIndex={isActive ? 0 : -1}
            >
              <picture className="w-full h-full block">
                {banner.mobile_image_url && (
                  <source media="(max-width: 639px)" srcSet={banner.mobile_image_url} />
                )}
                <img
                  src={banner.image_url}
                  alt={banner.heading || `Featured Collection Slide ${index + 1}`}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.008]"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </picture>
              <div className="absolute inset-0 border-b border-gold/30 pointer-events-none" />
            </Link>
          </div>
        )
      })}

      {/* Multi-slide Navigation Controls */}
      {isMulti && (
        <>
          {/* Previous Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              goToPrev()
            }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-ink/50 hover:bg-ink/80 text-paper/90 hover:text-gold-light border border-gold/30 backdrop-blur-md flex items-center justify-center transition-all duration-300 opacity-70 sm:opacity-0 group-hover:opacity-100 shadow-luxury hover:scale-105"
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>

          {/* Next Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-ink/50 hover:bg-ink/80 text-paper/90 hover:text-gold-light border border-gold/30 backdrop-blur-md flex items-center justify-center transition-all duration-300 opacity-70 sm:opacity-0 group-hover:opacity-100 shadow-luxury hover:scale-105"
            aria-label="Next slide"
          >
            <ChevronRight size={18} strokeWidth={2} />
          </button>

          {/* Bottom Indicators (Pills + Slide Counter) */}
          <div className="absolute bottom-2.5 sm:bottom-4 inset-x-0 z-20 flex items-center justify-center gap-2 pointer-events-none">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink/40 backdrop-blur-md border border-gold/25 pointer-events-auto shadow-md">
              {banners.map((_, idx) => {
                const isActive = idx === currentIndex
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setCurrentIndex(idx)
                    }}
                    className={`h-1.5 rounded-full transition-all duration-400 cursor-pointer ${
                      isActive
                        ? 'w-6 sm:w-7 bg-gold-light shadow-gold-glow'
                        : 'w-1.5 sm:w-2 bg-paper/40 hover:bg-paper/80'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Promotional & Sale Banner Slideshow with Content Fade
 */
export function PromotionBannerSlideshow({ banners = [], autoPlayInterval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  // Preload all banner images immediately
  useEffect(() => {
    if (!banners || banners.length === 0) return
    banners.forEach((b) => {
      if (b?.image_url) {
        const img = new Image()
        img.src = b.image_url
      }
      if (b?.mobile_image_url) {
        const mImg = new Image()
        mImg.src = b.mobile_image_url
      }
    })
  }, [banners])

  // Reset index if banners array changes
  useEffect(() => {
    if (currentIndex >= banners.length) {
      setCurrentIndex(0)
    }
  }, [banners.length, currentIndex])

  // Auto-play timer
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, autoPlayInterval)
    return () => clearInterval(interval)
  }, [banners.length, isPaused, autoPlayInterval])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }, [banners.length])

  // Touch swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 40) {
      if (diff > 0) goToNext()
      else goToPrev()
    }
  }

  if (!banners || banners.length === 0) return null

  const isMulti = banners.length > 1

  return (
    <section className="mx-auto max-w-[1600px] px-3 sm:px-6 md:px-10 lg:px-12 py-3 sm:py-6 md:py-8">
      <div
        className="group relative block overflow-hidden shadow-luxury border border-gold/30 aspect-[16/9] sm:aspect-[21/9] md:aspect-[28/9] min-h-[190px] sm:min-h-[230px] max-h-[420px] bg-ink select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides Container - Stacked Absolute for Zero-Buffer Fade */}
        {banners.map((banner, index) => {
          const isActive = index === currentIndex
          // Only show overlay if explicit description AND cta_text are provided (photo banner)
          const hasTextOverlay = Boolean(banner.show_overlay || (banner.description && banner.cta_text && banner.cta_text.trim() !== ''))

          return (
            <div
              key={banner.id || index}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Link
                to={banner.cta_url || '/shop'}
                className="block w-full h-full relative"
                tabIndex={isActive ? 0 : -1}
              >
                <picture className="w-full h-full block">
                  {banner.mobile_image_url && (
                    <source media="(max-width: 639px)" srcSet={banner.mobile_image_url} />
                  )}
                  <img
                    src={banner.image_url}
                    alt={banner.heading || 'Promotional Offer'}
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </picture>

                {/* Subtle border effect */}
                <div className="absolute inset-0 border border-gold/25 pointer-events-none" />

                {/* Optional HTML Text Overlay (Only rendered if banner explicitly has overlay content) */}
                {hasTextOverlay && (
                  <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/40 to-transparent flex items-center p-4 sm:p-8 md:p-14">
                    <div className="max-w-xl text-paper">
                      {banner.heading && (
                        <h3 className="font-display text-lg sm:text-3xl md:text-4xl text-paper mb-1 sm:mb-2 line-clamp-2">
                          {banner.heading}
                        </h3>
                      )}
                      {banner.description && (
                        <p className="text-paper/80 text-xs sm:text-sm md:text-base mb-3 sm:mb-5 line-clamp-2">
                          {banner.description}
                        </p>
                      )}
                      {banner.cta_text && (
                        <span className="btn-primary inline-flex items-center gap-1.5 text-[11px] sm:text-xs !py-1.5 sm:!py-2 !px-3 sm:!px-4">
                          {banner.cta_text}
                          <ArrowRight size={13} />
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            </div>
          )
        })}

        {/* Multi-slide Navigation Controls */}
        {isMulti && (
          <>
            {/* Previous Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                goToPrev()
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-ink/60 hover:bg-ink/90 text-paper hover:text-gold-light border border-gold/30 backdrop-blur-md flex items-center justify-center transition-all duration-300 opacity-80 sm:opacity-0 group-hover:opacity-100 shadow-luxury hover:scale-105"
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} strokeWidth={2} />
            </button>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                goToNext()
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-ink/60 hover:bg-ink/90 text-paper hover:text-gold-light border border-gold/30 backdrop-blur-md flex items-center justify-center transition-all duration-300 opacity-80 sm:opacity-0 group-hover:opacity-100 shadow-luxury hover:scale-105"
              aria-label="Next slide"
            >
              <ChevronRight size={18} strokeWidth={2} />
            </button>

            {/* Bottom Indicators (Pills + Slide Counter) */}
            <div className="absolute bottom-3 sm:bottom-4 right-4 sm:right-8 z-20 flex items-center gap-2 pointer-events-none">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-ink/50 backdrop-blur-md border border-gold/25 pointer-events-auto shadow-md">
                {banners.map((_, idx) => {
                  const isActive = idx === currentIndex
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setCurrentIndex(idx)
                      }}
                      className={`h-1.5 rounded-full transition-all duration-400 cursor-pointer ${
                        isActive
                          ? 'w-6 bg-gold-light shadow-gold-glow'
                          : 'w-2 bg-paper/40 hover:bg-paper/80'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
