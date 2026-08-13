import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Truck, ShieldCheck, Sparkles } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { ProductCard } from '../components/ProductCard'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const CATEGORIES = [
  {
    label: 'Kanjivaram',
    description: 'Temple-woven silk heritage',
    to: '/shop?saree_type=kanjivaram',
  },
  {
    label: 'Banarasi',
    description: 'Mughal-inspired brocade',
    to: '/shop?saree_type=banarasi',
  },
  {
    label: 'Designer',
    description: 'Contemporary couture weaves',
    to: '/shop?saree_type=designer',
  },
]

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: '100% Authentic' },
  { icon: Truck, label: 'Pan-India Delivery' },
  { icon: Sparkles, label: 'Premium Finishing' },
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export function HomePage() {
  const { data, isLoading } = useProducts({ filter: 'new-arrivals', page_size: 8 })

  useDocumentMeta({
    title: 'Elaanji | The House of Saree',
    description: 'Handpicked Kanjivaram, Banarasi, and designer sarees for every occasion, with premium finishing and pan-India delivery.',
  })

  return (
    <div>
      {/* ─── Hero Section ─── */}
      <section className="relative bg-beige overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center min-h-[480px] md:min-h-[560px]">
            {/* Text */}
            <motion.div
              className="py-16 md:py-24 max-w-lg"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1 } },
              }}
            >
              <motion.p variants={fadeUp} className="label-eyebrow mb-4">
                Handloom &amp; Designer Collection
              </motion.p>
              <motion.h1 variants={fadeUp} className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.1] tracking-tight">
                The House<br />of Saree
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-5 text-stone text-[15px] leading-relaxed max-w-md">
                Handpicked Kanjivaram, Banarasi, and designer weaves curated for elegance, crafted with tradition.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/shop" className="btn-primary">
                  Shop Now
                  <ArrowRight size={16} strokeWidth={1.5} />
                </Link>
                <Link to="/shop?filter=new-arrivals" className="btn-secondary">
                  Explore Collection
                </Link>
              </motion.div>
            </motion.div>

            {/* Hero Visual — Decorative geometric pattern */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-full max-w-[400px] aspect-[3/4]">
                {/* Layered decorative rectangles evoking a saree fold/drape */}
                <div className="absolute inset-0 border border-stone/20" />
                <div className="absolute inset-4 bg-gradient-to-br from-oxblood/5 to-transparent border border-oxblood/10" />
                <div className="absolute inset-8 border border-stone/15" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-display text-7xl text-ink/[0.06] leading-none">ए</p>
                    <div className="w-16 h-px bg-oxblood/30 mx-auto mt-4" />
                    <p className="text-xs tracking-widest2 uppercase text-stone/50 mt-3">Est. 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust Strip ─── */}
      <section className="border-b border-stone/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-stone">
                <Icon size={18} strokeWidth={1.5} />
                <span className="text-xs tracking-widest2 uppercase">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Shop by Category ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-20">
        <div className="text-center mb-10">
          <p className="label-eyebrow mb-2">Curated Collections</p>
          <h2 className="font-display text-3xl">Shop by Category</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              custom={i}
              variants={fadeUp}
            >
              <Link
                to={cat.to}
                className="group block relative bg-beige aspect-[4/5] overflow-hidden"
              >
                {/* Pattern overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent z-10" />
                <div className="absolute inset-0 border border-stone/10" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                  <h3 className="font-display text-2xl text-paper mb-1">{cat.label}</h3>
                  <p className="text-paper/70 text-sm mb-3">{cat.description}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs tracking-widest2 uppercase text-paper/80 group-hover:text-paper transition-colors">
                    Explore
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── New Arrivals ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="label-eyebrow mb-2">Just In</p>
            <h2 className="font-display text-3xl">New Arrivals</h2>
          </div>
          <Link
            to="/shop?filter=new-arrivals"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-ink/70 hover:text-ink transition-colors"
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!isLoading && data?.items?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-stone text-sm">New arrivals will appear here as soon as they're added.</p>
          </div>
        )}

        {!isLoading && data?.items?.length > 0 && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          >
            {data.items.map((product, i) => (
              <motion.div key={product.id} variants={fadeUp} custom={i}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="sm:hidden text-center mt-8">
          <Link to="/shop?filter=new-arrivals" className="btn-secondary text-xs">
            View All Arrivals
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  )
}
