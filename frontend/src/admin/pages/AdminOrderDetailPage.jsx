import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAdminOrder, useAdminOrderActions } from '../../hooks/admin/useAdminOrders'
import { formatINR } from '../../utils/format'

const LEGAL_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
  return_requested: [],
  returned: [],
  refunded: [],
}

export function AdminOrderDetailPage() {
  const { id } = useParams()
  const { data: order, isLoading } = useAdminOrder(id)
  const { updateStatus } = useAdminOrderActions()
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  if (isLoading) return <p className="text-stone text-sm">Loading…</p>
  if (!order) return <p className="text-stone text-sm">Order not found.</p>

  const nextOptions = LEGAL_TRANSITIONS[order.status] || []

  const handleUpdate = (newStatus) => {
    setError('')
    updateStatus.mutate(
      { id: order.id, status: newStatus, note: note || undefined },
      { onError: (err) => setError(err.response?.data?.detail || 'Could not update status.'), onSuccess: () => setNote('') }
    )
  }

  return (
    <div className="max-w-4xl pb-16">
      <Link to="/admin/orders" className="text-xs sm:text-sm text-stone hover:text-ink underline underline-offset-4">← Back to Orders</Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 mb-6 sm:mb-8 gap-2">
        <div>
          <p className="label-eyebrow mb-1">Order</p>
          <h1 className="font-display text-2xl sm:text-3xl text-ink">{order.order_number}</h1>
        </div>
        <span className="text-xs uppercase tracking-widest2 border border-stone/30 px-3 py-1 rounded bg-stone/5 font-mono self-start sm:self-auto">{order.status.replace(/_/g, ' ')}</span>
      </div>

      {nextOptions.length > 0 && (
        <div className="border border-stone/20 p-3 sm:p-4 mb-6 sm:mb-8 bg-paper rounded-lg shadow-sm">
          <p className="text-xs tracking-widest2 uppercase text-stone mb-2 font-semibold">Update Status</p>
          <input
            placeholder="Optional note (shown to customer)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input mb-3 text-xs sm:text-sm"
          />
          <div className="flex gap-2 flex-wrap">
            {nextOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => handleUpdate(opt)}
                disabled={updateStatus.isPending}
                className="btn-secondary text-xs !py-2 !px-3 disabled:opacity-50"
              >
                Mark as {opt.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          {error && <p className="text-sm text-oxblood mt-3 bg-oxblood/10 p-2 rounded">{error}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-paper border border-stone/20 rounded-lg p-3 sm:p-4 shadow-sm">
          <h2 className="text-xs sm:text-sm tracking-widest2 uppercase mb-3 font-semibold text-ink">Items</h2>
          <div className="space-y-2.5">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-xs sm:text-sm p-2 rounded bg-stone/[0.03]">
                <span className="text-ink">{item.product_name} ({item.color}) × {item.quantity}</span>
                <span className="font-semibold text-ink shrink-0 ml-2">{formatINR(item.line_total)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-paper border border-stone/20 rounded-lg p-3 sm:p-4 shadow-sm">
          <h2 className="text-xs sm:text-sm tracking-widest2 uppercase mb-3 font-semibold text-ink">Shipping</h2>
          <p className="text-xs sm:text-sm font-medium text-ink">{order.shipping_name} | {order.shipping_phone}</p>
          <p className="text-xs sm:text-sm text-stone mt-1">
            {order.shipping_address_line}, {order.shipping_city}, {order.shipping_state} {order.shipping_pin_code}
          </p>

          {order.payment && (
            <div className="pt-4 mt-4 border-t border-stone/10">
              <h2 className="text-xs sm:text-sm tracking-widest2 uppercase mb-2 font-semibold text-ink">Payment</h2>
              <p className="text-xs sm:text-sm text-stone">{order.payment.method?.toUpperCase()} · <span className="capitalize">{order.payment.status}</span></p>
              <p className="text-sm sm:text-base font-semibold text-ink mt-1">{formatINR(order.total_amount)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm tracking-widest2 uppercase mb-3">Status History</h2>
        <div className="space-y-2">
          {order.status_history.map((h, idx) => (
            <p key={idx} className="text-sm text-stone">
              {new Date(h.created_at).toLocaleString('en-IN')} | <span className="text-ink">{h.status.replace(/_/g, ' ')}</span>
              {h.note ? ` (${h.note})` : ''}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
