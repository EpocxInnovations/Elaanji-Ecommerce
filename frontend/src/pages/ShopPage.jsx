import { useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useProducts } from '../hooks/useProducts'
import { ProductCard } from '../components/ProductCard'
import { ShopFilters } from '../components/ShopFilters'

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
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    saree_type: searchParams.get('saree_type') || undefined,
    filter: searchParams.get('filter') || undefined,
  })
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const queryParams = useMemo(
    () => ({ ...filters, sort, page, page_size: 12 }),
    [filters, sort, page]
  )

  const { data, isLoading, isError } = useProducts(queryParams)

  const handleFilterChange = (next) => {
    setFilters(next)
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-xs text-stone">
          <li><Link to="/" className="hover:text-ink transition-colors">Home</Link></li>
          <li className="text-stone/40">/</li>
          <li className="text-ink">Shop</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl">All Sarees</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-10">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex items-center justify-between gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 border border-stone/30 px-4 py-2.5 text-sm hover:border-ink transition-colors"
          >
            <SlidersHorizontal size={16} strokeWidth={1.5} />
            Filters
            {Object.values(filters).filter(Boolean).length > 0 && (
              <span className="bg-ink text-paper text-[10px] w-4 h-4 flex items-center justify-center">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-stone/30 px-3 py-2.5 text-sm bg-transparent cursor-pointer"
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
                className="fixed inset-y-0 left-0 w-[280px] bg-paper z-50 flex flex-col shadow-overlay md:hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-stone/10">
                  <span className="text-xs tracking-widest2 uppercase">Filters</span>
                  <button onClick={() => setMobileFiltersOpen(false)} className="p-2 -mr-2 hover:text-oxblood transition-colors">
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-5">
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
          <div className="hidden md:flex items-center justify-between mb-6">
            <p className="text-sm text-stone">
              {isLoading ? 'Loading…' : `${data?.total ?? 0} sarees`}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-stone/30 px-3 py-2 text-sm bg-transparent cursor-pointer
                         hover:border-ink transition-colors"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8">
              {Array.from({ length: 6 }).map((_, i) => (
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
              <p className="font-display text-xl mb-2">No sarees found</p>
              <p className="text-stone text-sm mb-4">Try adjusting your filters or browse our full collection.</p>
              <button onClick={() => handleFilterChange({})} className="btn-secondary text-xs">
                Clear All Filters
              </button>
            </div>
          )}

          {/* Products */}
          {!isLoading && data?.items?.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8">
                {data.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {data.total_pages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-12">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                    className="w-9 h-9 flex items-center justify-center border border-stone/30
                               hover:border-ink transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft size={16} strokeWidth={1.5} />
                  </button>
                  {Array.from({ length: data.total_pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      aria-label={`Page ${i + 1}`}
                      aria-current={page === i + 1 ? 'page' : undefined}
                      className={`w-9 h-9 text-sm transition-colors ${
                        page === i + 1
                          ? 'bg-ink text-paper'
                          : 'border border-stone/30 hover:border-ink text-ink/70 hover:text-ink'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(Math.min(data.total_pages, page + 1))}
                    disabled={page === data.total_pages}
                    aria-label="Next page"
                    className="w-9 h-9 flex items-center justify-center border border-stone/30
                               hover:border-ink transition-colors disabled:opacity-30 disabled:pointer-events-none"
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
