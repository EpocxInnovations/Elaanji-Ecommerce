import { useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { useOrder, useOrderActions } from '../hooks/useOrders'
import { OrderStatusTimeline } from '../components/OrderStatusTimeline'
import { formatINR } from '../utils/format'

const CANCELLABLE = ['pending', 'confirmed', 'processing', 'packed']
const RETURNABLE = ['delivered']

export function OrderDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const { data: order, isLoading } = useOrder(id)
  const { cancelOrder, requestReturn } = useOrderActions()
  const [returnReason, setReturnReason] = useState('')
  const [showReturnForm, setShowReturnForm] = useState(false)
  const [actionError, setActionError] = useState('')

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-6 py-20 text-stone text-sm">Loading order…</div>
  }

  if (!order) {
    return <div className="mx-auto max-w-4xl px-6 py-20 text-stone text-sm">Order not found.</div>
  }

  const handleCancel = () => {
    setActionError('')
    cancelOrder.mutate(order.id, {
      onError: (err) => setActionError(err.response?.data?.detail || 'Could not cancel this order.'),
    })
  }

  const handleReturn = (e) => {
    e.preventDefault()
    setActionError('')
    requestReturn.mutate(
      { orderId: order.id, reason: returnReason },
      {
        onSuccess: () => setShowReturnForm(false),
        onError: (err) => setActionError(err.response?.data?.detail || 'Could not submit return request.'),
      }
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {location.state?.justPlaced && (
        <div className="bg-beige px-4 py-3 text-sm mb-8">
          Thank you! Your order <span className="font-medium">{order.order_number}</span> has been placed.
        </div>
      )}
      {location.state?.paymentPending && (
        <div className="border border-oxblood text-oxblood px-4 py-3 text-sm mb-8">
          Payment wasn't completed. You can retry from here, or contact support if you were charged.
        </div>
      )}

      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="label-eyebrow mb-1">Order</p>
          <h1 className="font-display text-2xl">{order.order_number}</h1>
          <p className="text-xs text-stone mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          {CANCELLABLE.includes(order.status) && (
            <button onClick={handleCancel} disabled={cancelOrder.isPending} className="btn-secondary text-xs px-4 py-2">
              {cancelOrder.isPending ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
          {RETURNABLE.includes(order.status) && (
            <button onClick={() => setShowReturnForm(true)} className="btn-secondary text-xs px-4 py-2">
              Request Return
            </button>
          )}
        </div>
      </div>

      {actionError && <p className="text-sm text-oxblood mb-6">{actionError}</p>}

      {showReturnForm && (
        <form onSubmit={handleReturn} className="border border-stone/20 p-4 mb-8 space-y-3">
          <label className="block text-xs tracking-widest2 uppercase text-stone">Reason for return</label>
          <textarea
            required
            minLength={3}
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            className="w-full border border-stone/30 px-3 py-2 text-sm bg-transparent"
            rows={3}
          />
          <div className="flex gap-3">
            <button type="submit" disabled={requestReturn.isPending} className="btn-primary disabled:opacity-50">
              {requestReturn.isPending ? 'Submitting…' : 'Submit Return Request'}
            </button>
            <button type="button" onClick={() => setShowReturnForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-8">
          <div>
            <h2 className="text-sm tracking-widest2 uppercase mb-4">Tracking</h2>
            <OrderStatusTimeline status={order.status} statusHistory={order.status_history} />
          </div>

          <div>
            <h2 className="text-sm tracking-widest2 uppercase mb-4">Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-stone/10 pb-4">
                  <div className="w-16 h-20 bg-beige shrink-0 overflow-hidden">
                    {item.product_image_url && (
                      <img src={item.product_image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.product_name}</p>
                    <p className="text-xs text-stone mt-1">
                      {item.color}{item.size ? ` · Blouse: ${item.size}` : ''} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm">{formatINR(item.line_total)}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm tracking-widest2 uppercase mb-4">Shipping Address</h2>
            <p className="text-sm">{order.shipping_name} — {order.shipping_phone}</p>
            <p className="text-sm text-stone mt-1">
              {order.shipping_address_line}{order.shipping_apartment ? `, ${order.shipping_apartment}` : ''},{' '}
              {order.shipping_city}, {order.shipping_state} {order.shipping_pin_code}
            </p>
          </div>
        </div>

        <div className="border border-stone/20 p-6 h-fit">
          <h2 className="text-sm tracking-widest2 uppercase mb-4">Payment Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-stone">Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
            {order.coupon_discount_amount > 0 && (
              <div className="flex justify-between"><span className="text-stone">Coupon ({order.coupon_code})</span><span>-{formatINR(order.coupon_discount_amount)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-stone">Shipping</span><span>{order.shipping_fee === 0 ? 'Free' : formatINR(order.shipping_fee)}</span></div>
            <div className="flex justify-between"><span className="text-stone">Tax</span><span>{formatINR(order.tax_amount)}</span></div>
          </div>
          <div className="border-t border-stone/20 pt-4 mt-4 flex justify-between font-medium">
            <span>Total</span>
            <span>{formatINR(order.total_amount)}</span>
          </div>
          {order.payment && (
            <p className="text-xs text-stone mt-3">
              {order.payment.method.toUpperCase()} · {order.payment.status}
            </p>
          )}
        </div>
      </div>

      <Link to="/orders" className="inline-block text-sm text-stone underline underline-offset-4 mt-10">
        ← Back to Orders
      </Link>
    </div>
  )
}
