import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Copy } from 'lucide-react'
import { useAdminProducts, useAdminProductActions } from '../../hooks/admin/useAdminProducts'
import { formatINR } from '../../utils/format'

const STATUS_OPTIONS = ['active', 'draft', 'archived', 'out_of_stock']

export function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { data, isLoading } = useAdminProducts({ search: search || undefined, status: statusFilter || undefined })
  const products = data?.items
  const { setStatus, duplicateProduct } = useAdminProductActions()

  return (
    <div className="max-w-6xl pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-ink">Products</h1>
        </div>
        <Link to="/admin/products/new" className="btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm !py-2.5 !px-4">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-6">
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-stone/30 px-3 py-2 text-xs sm:text-sm bg-paper flex-1 max-w-sm rounded"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-stone/30 px-3 py-2 text-xs sm:text-sm bg-paper rounded"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-stone text-xs sm:text-sm">Loading…</p>}

      {!isLoading && (
        <div className="border border-stone/20 divide-y divide-stone/10 rounded-lg overflow-hidden bg-paper shadow-sm">
          {products?.length === 0 && <p className="p-6 text-stone text-xs sm:text-sm text-center">No products found.</p>}
          {products?.map((p) => (
            <div key={p.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-12 h-16 sm:w-14 sm:h-18 bg-beige overflow-hidden shrink-0 rounded border border-stone/20">
                  {p.images?.[0] ? (
                    <img src={p.images[0].image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone text-[10px]">No img</div>
                  )}
                </div>
                <div className="min-w-0">
                  <Link to={`/admin/products/${p.id}/edit`} className="text-sm font-medium hover:text-oxblood line-clamp-1 text-ink">
                    {p.name}
                  </Link>
                  <p className="text-xs text-stone mt-0.5">{p.sku} · {p.variants?.length || 0} variants</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone/10 pl-15 sm:pl-0">
                <span className="text-sm font-semibold text-ink">{formatINR(p.discount_price || p.price)}</span>
                <div className="flex items-center gap-2">
                  <select
                    value={p.status}
                    onChange={(e) => setStatus.mutate({ id: p.id, status: e.target.value })}
                    className="border border-stone/30 px-2 py-1 text-xs bg-paper rounded capitalize"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => duplicateProduct.mutate(p.id)}
                    aria-label="Duplicate"
                    className="p-1.5 text-stone hover:text-ink rounded hover:bg-stone/10"
                    title="Duplicate product"
                  >
                    <Copy size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
