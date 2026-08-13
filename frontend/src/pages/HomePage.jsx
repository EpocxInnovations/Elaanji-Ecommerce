import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Truck, ShieldCheck, Sparkles } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { ProductCard } from '../components/ProductCard'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { fadeUpLuxury, wordReveal, staggerContainer, clipPathWipe, EASE_EXPO_OUT, EASE_SILK, SPRING_LUXURY } from '../utils/motion'

const CATEGORIES = [
  {
    label: 'Kanjivaram',
    description: 'Temple-woven silk heritage',
    to: '/shop?saree_type=kanjivaram',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
  },
  {
    label: 'Banarasi',
    description: 'Mughal-inspired brocade',
    to: '/shop?saree_type=banarasi',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
  },
  {
    label: 'Designer',
    description: 'Contemporary couture weaves',
    to: '/shop?saree_type=designer',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop',
  },
]

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: '100% Authentic Handloom' },
  { icon: Truck, label: 'Pan-India Express Shipping' },
  { icon: Sparkles, label: 'Bespoke Blouse Finishing' },
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

export function HomePage() {
  const { data, isLoading } = useProducts({ filter: 'new-arrivals', page_size: 8 })

  useDocumentMeta({
    title: 'Elaanji | The House of Saree',
    description: 'Handpicked Kanjivaram, Banarasi, and designer sarees for every occasion, with premium finishing and pan-India delivery.',
  })

  return (
    <div className="overflow-hidden">
      {/* ─── Hero Section ─── */}
      <section className="relative bg-beige min-h-[520px] md:min-h-[620px] flex items-center justify-center border-b border-stone/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 w-full py-16 md:py-24">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            {/* Text Choreography */}
            <motion.div
              className="md:col-span-7 max-w-xl z-10"
              initial="hidden"
              animate="visible"
              variants={staggerContainer(0.12, 0.05)}
            >
              <motion.div variants={fadeUpLuxury} className="flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-oxblood/60 inline-block" />
                <p className="label-eyebrow tracking-widest2 text-oxblood">
                  Handloom &amp; Designer Couture
                </p>
              </motion.div>

              <h1 className="font-display text-4xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight text-ink mb-6">
                <span className="block overflow-hidden py-1">
                  <motion.span variants={wordReveal} custom={0} className="inline-block">
                    The House
                  </motion.span>
                </span>
                <span className="block overflow-hidden py-1 italic font-normal text-oxblood">
                  <motion.span variants={wordReveal} custom={1} className="inline-block">
                    of Saree
                  </motion.span>
                </span>
              </h1>

              <motion.p
                variants={fadeUpLuxury}
                className="text-stone text-base sm:text-lg leading-relaxed max-w-md mb-8 font-body font-light"
              >
                Handpicked Kanjivaram, Banarasi, and designer weaves curated for elegance, crafted with century-old tradition.
              </motion.p>

              <motion.div variants={fadeUpLuxury} className="flex flex-wrap items-center gap-4">
                <Link to="/shop" className="btn-primary group relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    Shop Collection
                    <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
                <Link to="/shop?filter=new-arrivals" className="btn-secondary">
                  Explore New Arrivals
                </Link>
              </motion.div>
            </motion.div>

            {/* Editorial Visual Composition */}
            <motion.div
              className="hidden md:flex md:col-span-5 items-center justify-center relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: EASE_EXPO_OUT, delay: 0.2 }}
            >
              <div className="relative w-full max-w-[380px] aspect-[3/4]">
                {/* Outer Decorative Gold Line Frame */}
                <motion.div
                  className="absolute inset-0 border border-oxblood/20 z-0"
                  initial={{ opacity: 0, rotate: 2 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ duration: 1.2, ease: EASE_SILK }}
                />

                {/* Inner Canvas Image Mask */}
                <motion.div
                  className="absolute inset-4 overflow-hidden bg-stone/10 shadow-luxury z-10"
                  variants={clipPathWipe}
                  initial="hidden"
                  animate="visible"
                >
                  <img
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop"
                    alt="Elaanji Luxury Saree Weave"
                    className="w-full h-full object-cover transform scale-105 hover:scale-110 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-paper text-center">
                    <p className="font-display text-2xl tracking-wide">एलांजी</p>
                    <p className="text-[10px] uppercase tracking-widest2 text-paper/80">Pure Silk &amp; Zari Heritage</p>
                  </div>
                </motion.div>

                {/* Floating Monogram Stamp Badge */}
                <motion.div
                  className="absolute -bottom-4 -left-4 z-20 bg-oxblood text-paper w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-luxury border border-paper/20"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8, ...SPRING_LUXURY }}
                >
                  <span className="font-display text-xl leading-none">ए</span>
                  <span className="text-[8px] uppercase tracking-widest2 text-paper/80 mt-0.5">EST 2024</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Trust Banner ─── */}
      <section className="border-b border-stone/15 bg-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer(0.1)}
          >
            {TRUST_ITEMS.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                variants={fadeUpLuxury}
                custom={i}
                className="flex items-center justify-center gap-3 text-stone py-2 group cursor-default"
              >
                <div className="p-2 rounded-full bg-beige/60 text-oxblood group-hover:scale-110 transition-transform duration-300">
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                <span className="text-xs tracking-widest2 uppercase font-medium text-ink/80 group-hover:text-oxblood transition-colors">
                  {label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Shop by Category ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28">
        <div className="text-center max-w-xl mx-auto mb-14">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="label-eyebrow text-oxblood mb-2.5"
          >
            Curated Masterpieces
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl text-ink"
          >
            Explore Weave Traditions
          </motion.h2>
          <div className="w-12 h-px bg-oxblood/40 mx-auto mt-4" />
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              custom={i}
              variants={fadeUpLuxury}
            >
              <Link
                to={cat.to}
                className="group block relative bg-beige aspect-[3/4] overflow-hidden shadow-card hover:shadow-luxury transition-shadow duration-500"
              >
                {/* Background Image */}
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 z-10 transform group-hover:-translate-y-1 transition-transform duration-300">
                  <span className="text-[10px] text-gold-light uppercase tracking-widest2 block mb-1">
                    Authentic Collection
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl text-paper mb-1.5">{cat.label}</h3>
                  <p className="text-paper/80 text-xs sm:text-sm mb-4 font-light leading-relaxed">{cat.description}</p>
                  <span className="inline-flex items-center gap-2 text-xs tracking-widest2 uppercase text-paper font-medium group-hover:text-gold-light transition-colors">
                    Explore Sarees
                    <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Editorial Craft Storytelling Section ─── */}
      <section className="bg-ink text-paper py-24 md:py-32 relative overflow-hidden my-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            {/* Story Image Grid */}
            <motion.div
              className="md:col-span-6 grid grid-cols-2 gap-4 relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="aspect-[3/4] overflow-hidden rounded-sm border border-paper/15 shadow-luxury">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop"
                  alt="Zari Detail"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="aspect-[3/4] overflow-hidden rounded-sm border border-paper/15 shadow-luxury mt-8">
                <img
                  src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop"
                  alt="Handloom Weave"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </motion.div>

            {/* Story Text Content */}
            <motion.div
              className="md:col-span-6 space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={staggerContainer(0.12)}
            >
              <motion.p variants={fadeUpLuxury} className="text-xs uppercase tracking-widest2 text-gold-light font-medium">
                The Heritage Atelier
              </motion.p>
              <motion.h2 variants={fadeUpLuxury} className="font-display text-3xl sm:text-5xl leading-tight text-paper">
                240 Hours of Pure Zari &amp; Silk Artistry
              </motion.h2>
              <motion.p variants={fadeUpLuxury} className="text-paper/70 text-sm sm:text-base leading-relaxed font-light">
                Every Elaanji saree is born on traditional handlooms in Kanchipuram and Varanasi. Master weavers spend over three weeks intertwining pure mulberry silk with real gold-tested zari, preserving temple motif heirlooms for generations.
              </motion.p>
              <motion.div variants={fadeUpLuxury} className="pt-4 flex items-center gap-8 text-xs tracking-widest2 uppercase text-paper/80">
                <div>
                  <span className="block font-display text-3xl text-gold-light mb-1">100%</span>
                  <span>Pure Mulberry Silk</span>
                </div>
                <div className="h-10 w-px bg-paper/20" />
                <div>
                  <span className="block font-display text-3xl text-gold-light mb-1">240+</span>
                  <span>Hours Per Saree</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Ambient Overlay Background Watermark */}
        <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 font-display text-[220px] text-paper/[0.03] select-none pointer-events-none leading-none">
          एलांजी
        </div>
      </section>

      {/* ─── New Arrivals ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-24 md:pb-32">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4 border-b border-stone/15 pb-6">
          <div>
            <p className="label-eyebrow text-oxblood mb-2">Just Unveiled</p>
            <h2 className="font-display text-3xl sm:text-4xl text-ink">New Arrivals</h2>
          </div>
          <Link
            to="/shop?filter=new-arrivals"
            className="inline-flex items-center gap-2 text-xs tracking-widest2 uppercase text-ink hover:text-oxblood font-medium transition-colors group"
          >
            View Full Catalogue
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!isLoading && data?.items?.length === 0 && (
          <div className="text-center py-16 bg-beige/30 border border-stone/15">
            <p className="text-stone text-sm font-body">New arrivals will appear here as soon as they're added.</p>
          </div>
        )}

        {!isLoading && data?.items?.length > 0 && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer(0.08)}
          >
            {data.items.map((product, i) => (
              <motion.div key={product.id} variants={fadeUpLuxury} custom={i}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  )
}

