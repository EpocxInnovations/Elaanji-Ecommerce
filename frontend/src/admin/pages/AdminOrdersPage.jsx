import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminOrders } from '../../hooks/admin/useAdminOrders'
import { formatINR } from '../../utils/format'

const STATUSES = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned', 'refunded']

export function AdminOrdersPage() {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const { data: orders, isLoading } = useAdminOrders({ status: status || undefined, search: search || undefined })

  return (
    <div>
      <p className="label-eyebrow mb-2">Phase 5</p>
      <h1 className="font-display text-3xl mb-6">Orders</h1>

      <div className="flex gap-3 mb-6">
        <input
          placeholder="Search by order #, name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input flex-1 max-w-sm"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input max-w-xs">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {isLoading && <p className="text-stone text-sm">Loading…</p>}

      {!isLoading && (
        <div className="border border-stone/20 divide-y divide-stone/10">
          {orders?.length === 0 && <p className="p-6 text-stone text-sm">No orders found.</p>}
          {orders?.map((o) => (
            <Link key={o.id} to={`/admin/orders/${o.id}`} className="flex items-center justify-between p-4 hover:bg-beige/40">
              <div>
                <p className="text-sm font-medium">{o.order_number}</p>
                <p className="text-xs text-stone mt-1">{o.customer_name} · {o.customer_email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">{formatINR(o.total_amount)}</p>
                <p className="text-xs text-stone mt-1">{o.status.replace(/_/g, ' ')} · {o.payment_method.toUpperCase()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
