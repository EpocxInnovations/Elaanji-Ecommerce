import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Copy } from 'lucide-react'
import { useAdminProducts, useAdminProductActions } from '../../hooks/admin/useAdminProducts'
import { formatINR } from '../../utils/format'

const STATUS_OPTIONS = ['active', 'draft', 'archived', 'out_of_stock']

export function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { data: products, isLoading } = useAdminProducts({ search: search || undefined, status: statusFilter || undefined })
  const { setStatus, duplicateProduct } = useAdminProductActions()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
        </div>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-stone/30 px-3 py-2 text-sm bg-transparent flex-1 max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-stone/30 px-3 py-2 text-sm bg-transparent"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-stone text-sm">Loading…</p>}

      {!isLoading && (
        <div className="border border-stone/20 divide-y divide-stone/10">
          {products?.length === 0 && <p className="p-6 text-stone text-sm">No products found.</p>}
          {products?.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-18 bg-beige overflow-hidden shrink-0">
                  {p.images?.[0] && <img src={p.images[0].image_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div>
                  <Link to={`/admin/products/${p.id}/edit`} className="text-sm font-medium hover:text-oxblood">
                    {p.name}
                  </Link>
                  <p className="text-xs text-stone mt-1">{p.sku} · {p.variants?.length || 0} variants</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm">{formatINR(p.discount_price || p.price)}</span>
                <select
                  value={p.status}
                  onChange={(e) => setStatus.mutate({ id: p.id, status: e.target.value })}
                  className="border border-stone/30 px-2 py-1 text-xs bg-transparent"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
                <button
                  onClick={() => duplicateProduct.mutate(p.id)}
                  aria-label="Duplicate"
                  className="text-stone hover:text-ink"
                  title="Duplicate product"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
