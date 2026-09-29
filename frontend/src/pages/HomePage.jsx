import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Truck, ShieldCheck, Sparkles, Feather, Layers, Award, Sparkle } from 'lucide-react'
import { useProducts, useCategories } from '../hooks/useProducts'
import { useBanners } from '../hooks/useBanners'
import { ProductCard } from '../components/ProductCard'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { SplitText } from '../components/SplitText'
import { TextRevealCard } from '../components/TextRevealCard'
import { HeroBannerSlideshow, PromotionBannerSlideshow } from '../components/BannerSlideshow'
import { CircularGallery } from '../components/ui/CircularGallery'

import { luxuryEase, staggerGridContainer, staggerGridItem } from '../utils/motion'

const HOME_PRODUCTS_PARAMS = { filter: 'new-arrivals', page_size: 8 }

const ALL_STORE_CATEGORIES = [
  {
    key: 'kanjivaram',
    label: 'Kanjivaram Silk',
    description: 'Temple-woven silk heritage',
    to: '/shop?saree_type=kanjivaram',
    tag: 'Tamil Nadu · Heritage',
    image: '/images/categories/kanjivaram.jpg',
    index: '01',
  },
  {
    key: 'banarasi',
    label: 'Banarasi Brocade',
    description: 'Mughal-inspired zari weaves',
    to: '/shop?saree_type=banarasi',
    tag: 'Varanasi · Sacred Zari',
    image: '/images/categories/banarasi.jpg',
    index: '02',
  },
  {
    key: 'cotton',
    label: 'Handloom Cotton',
    description: 'Breathable comfort & effortless grace',
    to: '/shop?saree_type=cotton',
    tag: 'Artisan Handloom',
    image: '/images/categories/cotton.jpg',
    index: '03',
  },
  {
    key: 'designer',
    label: 'Designer Couture',
    description: 'Contemporary party & evening draping',
    to: '/shop?saree_type=designer',
    tag: 'Modern Atelier',
    image: '/images/categories/designer.jpg',
    index: '04',
  },
  {
    key: 'silk',
    label: 'Pure Silk',
    description: 'Lustrous mulberry heirlooms',
    to: '/shop?saree_type=silk',
    tag: 'Mulberry Weave',
    image: '/images/categories/puresilk.jpg',
    index: '05',
  },
  {
    key: 'chanderi',
    label: 'Chanderi & Organza',
    description: 'Sheer feather-light festive sarees',
    to: '/shop?saree_type=chanderi',
    tag: 'Sheer Festive',
    image: '/images/categories/organza.jpg',
    index: '06',
  },
]

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: '100% Authentic' },
  { icon: Truck, label: 'Pan-India Delivery' },
  { icon: Sparkles, label: 'Premium Finishing' },
]

const HERITAGE_STEPS = [
  {
    id: 'step-1',
    icon: Feather,
    number: '01',
    title: 'Pure Mulberry & Real Zari',
    desc: 'Each thread is hand-selected, combining pure mulberry silk with real gold and silver zari plating for radiant, enduring luster.',
    tagline: 'Craftsmanship Heritage',
  },
  {
    id: 'step-2',
    icon: Layers,
    number: '02',
    title: 'The Master Handloom',
    desc: 'Interlocking warp and weft created over weeks by master weavers using centuries-old jacquard and pit loom techniques.',
    tagline: 'Artisanal Integrity',
  },
  {
    id: 'step-3',
    icon: Award,
    number: '03',
    title: 'The Sacred 6-Yard Drape',
    desc: 'Unfolding timeless grace that moves with fluid beauty — engineered to hold structure while feeling feather-light.',
    tagline: 'Timeless Couture',
  },
]

function SkeletonCard() {
  return (
    <div>
      <div className="aspect-[3/4] skeleton mb-3" />
      <div className="h-3 skeleton w-1/2 mb-2" />
      <div className="h-3 skeleton w-2/3 mb-2" />
      <div className="h-3 skeleton w-1/3" />
    </div>
  )
}

function SectionHeader({ eyebrow, title, subtitle, dark = false }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
      {eyebrow && (
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <span className="w-8 sm:w-10 h-px bg-gradient-to-r from-transparent to-gold/60" />
          <p className={`label-eyebrow text-[10px] sm:text-[11px] ${dark ? 'text-gold-soft/80' : ''}`}>{eyebrow}</p>
          <span className="w-8 sm:w-10 h-px bg-gradient-to-l from-transparent to-gold/60" />
        </div>
      )}
      <h2 className={`font-display text-2xl sm:text-4xl md:text-5xl leading-tight ${dark ? 'text-paper' : 'text-ink'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 sm:mt-4 text-xs sm:text-[15px] leading-relaxed ${dark ? 'text-paper/60' : 'text-stone'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useProducts(HOME_PRODUCTS_PARAMS, {
    staleTime: 60 * 1000,
    refetchOnMount: true,
  })
  const { data: storeProducts } = useProducts({ page_size: 100 }, { staleTime: 60 * 1000 })
  const { data: dbCategories } = useCategories()
  const { data: banners } = useBanners()
  const heroBanners = banners?.filter((b) => b.placement === 'hero' && b.is_active) || []
  const promoBanners = banners?.filter((b) => b.placement === 'promo' && b.is_active) || []
  const saleBanners = banners?.filter((b) => b.placement === 'sale' && b.is_active) || []
  const [activeTab, setActiveTab] = useState(0)

  // Show ONLY categories that have active products available in the store
  const availableCategories = useMemo(() => {
    if (storeProducts?.items && storeProducts.items.length > 0) {
      const activeKeys = new Set(
        storeProducts.items
          .map((p) => p.saree_type?.toLowerCase() || p.category?.slug?.toLowerCase())
          .filter(Boolean)
      )
      const filtered = ALL_STORE_CATEGORIES.filter(
        (c) => activeKeys.has(c.key) || activeKeys.has(`${c.key}-sarees`)
      )
      if (filtered.length > 0) return filtered
    }
    // Default fallback to categories currently active in database
    return ALL_STORE_CATEGORIES.filter((c) =>
      ['kanjivaram', 'banarasi', 'cotton', 'designer'].includes(c.key)
    )
  }, [storeProducts])

  const categoryGalleryItems = useMemo(() => {
    return availableCategories.map((c) => {
      // Find matching category from DB to respect admin custom replaced image
      const dbMatch = dbCategories?.find((cat) => {
        const catSlug = cat.slug?.toLowerCase()
        const key = c.key.toLowerCase()
        return (
          catSlug === key ||
          catSlug === `${key}-sarees` ||
          catSlug?.replace(/-sarees$/, '') === key ||
          key.includes(catSlug) ||
          cat.name?.toLowerCase().includes(key)
        )
      })

      return {
        image: dbMatch?.image_url || c.image,
        text: dbMatch?.name || c.label,
        subtext: dbMatch?.description || c.tag,
        to: c.to,
      }
    })
  }, [availableCategories, dbCategories])

  const handleCategoryClick = (item) => {
    if (item?.to) {
      navigate(item.to)
    }
  }


  useEffect(() => {
    if (isError && error) {
      console.error('Failed to load new arrivals:', error)
    }
  }, [isError, error])

  useDocumentMeta({
    title: 'Elaanji | The House of Saree',
    description: 'Handpicked Kanjivaram, Banarasi, and designer sarees for every occasion, with premium finishing and pan-India delivery.',
  })

  return (
    <div>
      {/* ─── Hero Section ─── */}
      {heroBanners.length > 0 ? (
        <section className="relative w-full bg-paper overflow-hidden">
          {/* Ambient gold glow */}
          <div className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full bg-gold/15 blur-[140px] pointer-events-none animate-glow-pulse" />
          <div className="absolute bottom-0 -left-24 w-[420px] h-[420px] rounded-full bg-oxblood/10 blur-[140px] pointer-events-none" />

          {/* Full-Width Edge-to-Edge Banner Slideshow (Fade Out Effect, Zero Buffers) */}
          <motion.div 
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <HeroBannerSlideshow banners={heroBanners} />
          </motion.div>

          {/* Brand Statement with Interactive Text Reveal Transition */}
          <div className="w-full mx-auto max-w-5xl px-4 sm:px-6 py-10 md:py-14 text-center">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="label-eyebrow mb-4 flex items-center justify-center gap-3"
            >
              <span className="w-8 h-px bg-gold/60" />
              <Feather size={14} className="text-oxblood" />
              Handloom &amp; Designer Atelier
              <span className="w-8 h-px bg-gold/60" />
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: luxuryEase }}
              className="my-4"
            >
              <TextRevealCard text="The House of Saree" revealText="ELAANJI" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: luxuryEase }}
              className="mt-4 text-stone text-[15px] sm:text-base leading-relaxed max-w-xl mx-auto"
            >
              Handpicked Kanjivaram, Banarasi, and designer weaves curated for timeless elegance, woven with sacred heritage.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: luxuryEase }}
              className="mt-8 flex flex-wrap items-center justify-center gap-4"
            >
              <Link to="/shop" className="btn-primary">
                Shop Now
                <ArrowRight size={16} strokeWidth={1.5} />
              </Link>
              <Link to="/shop?filter=new-arrivals" className="btn-secondary">
                Explore Collection
              </Link>
            </motion.div>
          </div>
        </section>
      ) : (
        <section className="relative bg-paper-gradient overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center">
          {/* Ambient gold glow */}
          <div className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full bg-gold/15 blur-[140px] pointer-events-none animate-glow-pulse" />
          <div className="absolute bottom-0 -left-24 w-[420px] h-[420px] rounded-full bg-oxblood/10 blur-[140px] pointer-events-none" />

          {/* Vertical ornament lines */}
          <div className="absolute inset-y-0 left-8 hidden lg:block w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
          <div className="absolute inset-y-0 right-8 hidden lg:block w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent" />

          <div className="w-full mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-12 xl:px-16 py-12 md:py-16 relative">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
              {/* Text Column — Undisturbed, elegant width */}
              <div className="lg:col-span-5 max-w-lg">
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="label-eyebrow mb-4 flex items-center gap-3 text-ink"
                >
                  <span className="w-8 h-px bg-gold/60" />
                  <Feather size={14} className="text-oxblood" />
                  Handloom &amp; Designer Atelier
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: luxuryEase }}
                  className="my-3"
                >
                  <TextRevealCard text="The House of Saree" revealText="ELAANJI" />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: luxuryEase }}
                  className="mt-6 text-stone text-[15px] sm:text-base leading-relaxed max-w-md"
                >
                  Handpicked Kanjivaram, Banarasi, and designer weaves curated for timeless elegance, woven with sacred heritage.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35, ease: luxuryEase }}
                  className="mt-9 flex flex-wrap items-center gap-4"
                >
                  <Link to="/shop" className="btn-primary">
                    Shop Now
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </Link>
                  <Link to="/shop?filter=new-arrivals" className="btn-secondary">
                    Explore Collection
                  </Link>
                </motion.div>
              </div>

              {/* Hero Visual Column */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.45, ease: luxuryEase }}
                className="hidden md:flex items-center justify-center lg:justify-end lg:col-span-7 w-full"
              >
                <div className="relative w-full max-w-[400px] aspect-[3/4] p-6">
                  {/* Layered gold frames */}
                  <div className="absolute inset-0 frame-gold" />
                  <div className="absolute inset-4 bg-gradient-to-br from-oxblood/10 via-transparent to-gold/10 border border-gold/20" />
                  <div className="absolute inset-8 border border-gold/15" />

                  {/* Rotating ornament */}
                  <div className="absolute inset-6 border border-dashed border-gold/20 rounded-full animate-spin-slow pointer-events-none" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="glass-dark p-8 max-w-[260px] shadow-luxury">
                      <span className="text-[10px] tracking-widest2 uppercase text-gold font-medium block mb-2">
                        Heritage Atelier
                      </span>
                      <p className="font-display text-7xl text-gold-gradient leading-none my-3">ए</p>
                      <div className="w-12 h-px bg-gold/50 mx-auto my-4" />
                      <p className="text-[11px] tracking-widest2 uppercase text-paper/80">
                        Est. 2024 · India
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Trust Strip ─── */}
      <section className="border-y border-stone/10 bg-ink-gradient text-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-20">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-paper/80 group">
                <Icon size={18} strokeWidth={1.5} className="text-gold-soft group-hover:text-gold-light transition-colors" />
                <span className="text-xs tracking-widest2 uppercase">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Shop by Category (3D Circular Gallery Showcase) ─── */}
      <section className="section-pad relative overflow-hidden bg-paper-gradient border-b border-stone/15">
        {/* Ambient decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-gold/10 blur-[160px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <SectionHeader
            title="Shop by Category"
            subtitle="Swipe or drag to explore our iconic saree traditions · Click any card to enter collection"
          />
        </div>

        {/* 3D WebGL Circular Gallery */}
        <div className="w-full h-[520px] sm:h-[580px] md:h-[640px] relative z-10">
          <CircularGallery
            items={categoryGalleryItems}
            bend={2.6}
            borderRadius={0.05}
            scrollSpeed={2}
            scrollEase={0.06}
            onItemClick={handleCategoryClick}
            className="w-full h-full"
          />
        </div>
      </section>

      {/* ─── Promotional Offer Banner Slideshow (Admin-Controlled) ─── */}
      <PromotionBannerSlideshow banners={promoBanners} />

      {/* ─── Heritage Craftsmanship Interactive Showcase ─── */}
      <section className="bg-ink-gradient text-paper section-pad relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-gold/10 blur-[160px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative">
          <SectionHeader
            eyebrow="Legacy of Craftsmanship"
            title="The Art of the Saree"
            dark
          />

          {/* Interactive Chapter Nav Tabs */}
          <div className="flex justify-start sm:justify-center gap-2 sm:gap-3 mb-8 sm:mb-12 overflow-x-auto pb-1 px-1 sm:px-0 no-scrollbar">
            {HERITAGE_STEPS.map((step, idx) => {
              const Icon = step.icon
              const isActive = activeTab === idx
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3.5 text-[10px] sm:text-xs tracking-wider sm:tracking-widest2 uppercase transition-all duration-300 cursor-pointer border shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-gold-gradient text-ink-deep border-transparent shadow-gold-glow font-semibold'
                      : 'border-paper/15 text-paper/60 hover:text-paper hover:border-gold/40'
                  }`}
                >
                  <Icon size={13} className={isActive ? '' : 'text-gold-soft'} />
                  <span>{step.number} / {step.tagline}</span>
                </button>
              )
            })}
          </div>

          {/* Tab Content Display */}
          <div className="max-w-3xl mx-auto min-h-[200px] sm:min-h-[220px] flex items-center justify-center text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: luxuryEase }}
                className="space-y-4 sm:space-y-5 px-3 sm:px-4"
              >
                <span className="font-display text-5xl sm:text-7xl md:text-8xl text-gold-gradient leading-none block">
                  {HERITAGE_STEPS[activeTab].number}
                </span>
                <h3 className="font-display text-xl sm:text-3xl md:text-4xl text-paper">
                  {HERITAGE_STEPS[activeTab].title}
                </h3>
                <p className="text-paper/70 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                  {HERITAGE_STEPS[activeTab].desc}
                </p>
                <div className="pt-3 sm:pt-5">
                  <Link to="/shop" className="btn-primary">
                    Explore The Collection
                    <ArrowRight size={15} strokeWidth={1.5} />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ─── Seasonal / Sale Offer Banner Slideshow (Admin-Controlled) ─── */}
      <PromotionBannerSlideshow banners={saleBanners} />

      {/* ─── New Arrivals ─── */}
      <section className="section-container section-pad">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="label-eyebrow mb-3 flex items-center gap-3">
              <span className="w-8 h-px bg-gold/60" />
              Fresh From Looms
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-ink">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/shop?filter=new-arrivals"
            className="hidden sm:inline-flex items-center gap-2 text-xs tracking-widest2 uppercase text-gold hover:text-oxblood transition-colors group"
          >
            View All Arrivals
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-12">
            <p className="font-display text-xl mb-2">Unable to load new arrivals</p>
            <p className="text-stone text-sm">Please check your connection and try refreshing.</p>
          </div>
        )}

        {!isLoading && !isError && data?.items?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-stone text-sm">New arrivals will appear here as soon as they're added.</p>
          </div>
        )}

        {!isLoading && !isError && data?.items?.length > 0 && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerGridContainer}
          >
            {data.items.map((product, i) => (
              <motion.div key={product.id} variants={staggerGridItem}>
                <ProductCard product={product} priority={i < 4} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="sm:hidden text-center mt-10">
          <Link to="/shop?filter=new-arrivals" className="btn-secondary text-xs">
            View All Arrivals
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  )
}
