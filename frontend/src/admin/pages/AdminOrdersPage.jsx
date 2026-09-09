import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminOrders } from '../../hooks/admin/useAdminOrders'
import { formatINR } from '../../utils/format'

const STATUSES = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned', 'refunded']

export function AdminOrdersPage() {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const { data, isLoading } = useAdminOrders({ status: status || undefined, search: search || undefined })
  const orders = data?.items

  return (
    <div className="max-w-5xl pb-10">
      <h1 className="font-display text-2xl sm:text-3xl mb-4 sm:mb-6 text-ink">Orders</h1>

      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-6">
        <input
          placeholder="Search by order #, name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input flex-1 max-w-sm text-xs sm:text-sm"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input max-w-xs text-xs sm:text-sm capitalize">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {isLoading && <p className="text-stone text-xs sm:text-sm">Loading…</p>}

      {!isLoading && (
        <div className="border border-stone/20 divide-y divide-stone/10 rounded-lg overflow-hidden bg-paper shadow-sm">
          {orders?.length === 0 && <p className="p-6 text-stone text-xs sm:text-sm text-center">No orders found.</p>}
          {orders?.map((o) => (
            <Link key={o.id} to={`/admin/orders/${o.id}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 hover:bg-beige/40 gap-2 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{o.order_number}</p>
                <p className="text-xs text-stone mt-0.5 truncate">{o.customer_name} · {o.customer_email}</p>
              </div>
              <div className="flex items-center justify-between sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-stone/10">
                <p className="text-sm font-semibold text-ink">{formatINR(o.total_amount)}</p>
                <p className="text-xs text-stone sm:mt-0.5 capitalize">{o.status.replace(/_/g, ' ')} · {o.payment_method?.toUpperCase()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
