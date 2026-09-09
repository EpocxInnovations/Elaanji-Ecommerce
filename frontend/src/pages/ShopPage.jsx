import { useMemo, useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useProducts } from '../hooks/useProducts'
import { ProductCard } from '../components/ProductCard'
import { ShopFilters } from '../components/ShopFilters'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { useDocumentMeta } from '../hooks/useDocumentMeta'


const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_low_high', label: 'Price: Low to High' },
  { value: 'price_high_low', label: 'Price: High to Low' },
  { value: 'best_selling', label: 'Best Selling' },
  { value: 'highest_rated', label: 'Highest Rated' },
]

function SkeletonCard() {
  return (
    <div>
      <div className="aspect-[3/4] skeleton mb-3" />
      <div className="h-2.5 skeleton w-1/3 mb-2" />
      <div className="h-3 skeleton w-2/3 mb-2" />
      <div className="h-3 skeleton w-1/4" />
    </div>
  )
}

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || undefined,
    saree_type: searchParams.get('saree_type') || undefined,
    filter: searchParams.get('filter') || undefined,
  }))
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Sync state when URL search parameters change (e.g. searching from header)
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || undefined,
      saree_type: searchParams.get('saree_type') || undefined,
      filter: searchParams.get('filter') || undefined,
    })
    setPage(1)
  }, [searchParams])

  const queryParams = useMemo(
    () => ({ ...filters, sort, page, page_size: 9 }),
    [filters, sort, page]
  )


  const { data, isLoading, isError, error } = useProducts(queryParams)

  useEffect(() => {
    if (isError && error) {
      console.error('Failed to load shop products:', error)
    }
  }, [isError, error])

  useDocumentMeta({
    title: filters.search
      ? `Search Results for "${filters.search}" | Elaanji`
      : 'Shop All Sarees | Elaanji',
    description: 'Browse handpicked Kanjivaram, Banarasi, and designer sarees curated for every occasion.',
  })

  const handleFilterChange = (next) => {
    setFilters(next)
    setPage(1)
  }

  const clearSearch = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('search')
    setSearchParams(nextParams)
  }

  const activeFilterLabel = filters.search
    ? `Search Results: "${filters.search}"`
    : filters.saree_type
    ? `${filters.saree_type.charAt(0).toUpperCase() + filters.saree_type.slice(1)} Sarees`
    : 'All Sarees'

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: 'Shop' }]} className="mb-8" />

      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="label-eyebrow mb-3 flex items-center gap-3">
            <span className="w-8 h-px bg-gold/60" />
            {filters.search ? 'Search Atelier' : 'The Collection'}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink flex items-center gap-3 flex-wrap">
            <span>{activeFilterLabel}</span>
            {filters.search && (
              <button
                onClick={clearSearch}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-paper border border-oxblood/30 text-oxblood hover:bg-oxblood hover:text-paper transition-all rounded-full text-xs font-sans font-medium"
              >
                <span>Clear Search</span>
                <X size={14} />
              </button>
            )}
          </h1>
        </div>
        <p className="text-sm text-stone pb-1">
          {isLoading ? 'Loading…' : `${data?.total ?? 0} sarees found`}
        </p>
      </div>


      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex items-center justify-between gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 border border-stone/30 px-4 py-2.5 text-sm hover:border-gold transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={16} strokeWidth={1.5} />
            Filters
            {Object.values(filters).filter(Boolean).length > 0 && (
              <span className="bg-gold-gradient text-ink-deep text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-stone/30 px-3 py-2.5 text-sm bg-transparent cursor-pointer focus:border-gold focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Mobile Filters Drawer */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overlay-backdrop md:hidden"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className="fixed inset-y-0 left-0 w-[85vw] max-w-[320px] bg-paper z-50 flex flex-col shadow-overlay md:hidden"
              >
                <div className="flex items-center justify-between px-5 py-5 border-b border-stone/10">
                  <span className="text-xs tracking-widest2 uppercase text-ink font-medium">Filters</span>
                  <button onClick={() => setMobileFiltersOpen(false)} className="p-2 -mr-2 hover:text-gold transition-colors cursor-pointer">
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-6">
                  <ShopFilters filters={filters} onChange={handleFilterChange} />
                </div>
                <div className="border-t border-stone/10 px-5 py-4">
                  <button onClick={() => setMobileFiltersOpen(false)} className="btn-primary w-full text-xs">
                    Show Results
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Filters */}
        <div className="hidden md:block">
          <ShopFilters filters={filters} onChange={handleFilterChange} />
        </div>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <p className="text-sm text-stone">{data?.total ?? 0} sarees</p>
            <div className="flex items-center gap-3">
              <span className="text-[11px] tracking-widest2 uppercase text-stone">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-stone/30 px-3 py-2 text-sm bg-transparent cursor-pointer
                           hover:border-gold focus:border-gold focus:outline-none transition-colors"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}


          {/* Error */}
          {isError && (
            <div className="text-center py-16">
              <p className="font-display text-xl mb-2">Something went wrong</p>
              <p className="text-stone text-sm">We couldn't load the catalog. Please try refreshing.</p>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && data?.items?.length === 0 && (
            <div className="text-center py-16">
              <p className="font-display text-2xl mb-3">No sarees found</p>
              <p className="text-stone text-sm mb-6">Try adjusting your filters or browse our full collection.</p>
              <button onClick={() => handleFilterChange({})} className="btn-secondary text-xs">
                Clear All Filters
              </button>
            </div>
          )}

          {/* Products */}
          {!isLoading && data?.items?.length > 0 && (
            <>
              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-10"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.06 },
                  },
                }}
              >
                {data.items.map((product, i) => (
                  <motion.div
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                    }}
                  >
                    <ProductCard product={product} priority={i < 6} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {data.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-14">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                    className="w-10 h-10 flex items-center justify-center border border-stone/30
                               hover:border-gold hover:text-gold transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronLeft size={16} strokeWidth={1.5} />
                  </button>
                  {Array.from({ length: data.total_pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      aria-label={`Page ${i + 1}`}
                      aria-current={page === i + 1 ? 'page' : undefined}
                      className={`w-10 h-10 text-sm transition-all cursor-pointer ${
                        page === i + 1
                          ? 'bg-gold-gradient text-ink-deep font-bold shadow-gold-glow'
                          : 'border border-stone/30 hover:border-gold text-ink/70 hover:text-ink'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(Math.min(data.total_pages, page + 1))}
                    disabled={page === data.total_pages}
                    aria-label="Next page"
                    className="w-10 h-10 flex items-center justify-center border border-stone/30
                               hover:border-gold hover:text-gold transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronRight size={16} strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
