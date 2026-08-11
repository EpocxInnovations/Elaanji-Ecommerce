import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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

export function ShopPage() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    saree_type: searchParams.get('saree_type') || undefined,
    filter: searchParams.get('filter') || undefined,
  })
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(1)

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
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <p className="label-eyebrow mb-2">Shop</p>
        <h1 className="font-display text-3xl">All Sarees</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        <ShopFilters filters={filters} onChange={handleFilterChange} />

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-stone">
              {isLoading ? 'Loading…' : `${data?.total ?? 0} sarees`}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-stone/30 px-3 py-2 text-sm bg-transparent"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-beige mb-3" />
                  <div className="h-3 bg-beige w-2/3 mb-2" />
                  <div className="h-3 bg-beige w-1/3" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <p className="text-oxblood text-sm">Something went wrong loading the catalog. Please try again.</p>
          )}

          {!isLoading && !isError && data?.items?.length === 0 && (
            <p className="text-stone text-sm">No sarees match your filters. Try clearing them.</p>
          )}

          {!isLoading && data?.items?.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
                {data.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {data.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {Array.from({ length: data.total_pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-9 h-9 text-sm ${
                        page === i + 1 ? 'bg-ink text-paper' : 'border border-stone/30 hover:border-ink'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
