import { useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { Check, AlertCircle, ArrowLeft } from 'lucide-react'
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
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <div className="h-3 skeleton w-24 mb-6" />
        <div className="h-7 skeleton w-48 mb-2" />
        <div className="h-3 skeleton w-32 mb-8" />
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-6">
            <div className="h-40 skeleton" />
            <div className="h-24 skeleton" />
          </div>
          <div className="h-48 skeleton" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6 py-24 text-center">
        <h1 className="font-display text-4xl mb-3">Order Not Found</h1>
        <p className="text-stone text-sm mb-8">This order may not exist or you may not have access to it.</p>
        <Link to="/orders" className="btn-primary">View My Orders</Link>
      </div>
    )
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
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 md:py-14">
      {/* Success Banner */}
      {location.state?.justPlaced && (
        <div className="flex items-center gap-3 bg-gold/10 border border-gold/20 px-4 py-3 mb-6">
          <span className="w-6 h-6 bg-gold-gradient text-ink-deep flex items-center justify-center shrink-0 font-bold">
            <Check size={13} strokeWidth={3} />
          </span>
          <p className="text-sm">
            Thank you! Your order <span className="font-medium">{order.order_number}</span> has been placed.
          </p>
        </div>
      )}

      {/* Payment Pending Banner */}
      {location.state?.paymentPending && (
        <div className="flex items-center gap-3 border border-oxblood/30 px-4 py-3 mb-6">
          <AlertCircle size={18} className="text-oxblood shrink-0" strokeWidth={1.5} />
          <p className="text-sm text-oxblood">
            Payment wasn't completed. You can retry from here, or contact support if you were charged.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <p className="label-eyebrow mb-2">Order</p>
          <h1 className="font-display text-3xl">{order.order_number}</h1>
          <p className="text-xs text-stone mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {CANCELLABLE.includes(order.status) && (
            <button onClick={handleCancel} disabled={cancelOrder.isPending} className="btn-secondary text-xs !px-4 sm:!px-5 !py-2.5 flex-1 sm:flex-initial">
              {cancelOrder.isPending ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
          {RETURNABLE.includes(order.status) && (
            <button onClick={() => setShowReturnForm(true)} className="btn-secondary text-xs !px-4 sm:!px-5 !py-2.5 flex-1 sm:flex-initial">
              Request Return
            </button>
          )}
        </div>
      </div>

      {actionError && <p className="text-sm text-oxblood mb-6">{actionError}</p>}

      {/* Return Form */}
      {showReturnForm && (
        <form onSubmit={handleReturn} className="border border-gold/20 p-5 mb-8 space-y-3 bg-paper/60 backdrop-blur-xl">
          <label className="label-eyebrow">Reason for return</label>
          <textarea
            required
            minLength={3}
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            className="input"
            rows={3}
          />
          <div className="flex gap-3">
            <button type="submit" disabled={requestReturn.isPending} className="btn-primary text-xs">
              {requestReturn.isPending ? 'Submitting…' : 'Submit Return Request'}
            </button>
            <button type="button" onClick={() => setShowReturnForm(false)} className="btn-secondary text-xs">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-3 gap-8 md:gap-10">
        <div className="md:col-span-2 space-y-8">
          {/* Tracking */}
          <div>
            <h2 className="label-eyebrow mb-5">Tracking</h2>
            <OrderStatusTimeline status={order.status} statusHistory={order.status_history} />
          </div>

          {/* Items */}
          <div>
            <h2 className="label-eyebrow mb-5">Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-stone/10 pb-4 last:border-0">
                  <div className="w-14 h-[72px] bg-beige shrink-0 overflow-hidden shadow-card">
                    {item.product_image_url && (
                      <img src={item.product_image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product_name}</p>
                    <p className="text-xs text-stone mt-0.5">
                      {item.color}{item.size ? ` · Blouse: ${item.size}` : ''} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold shrink-0">{formatINR(item.line_total)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h2 className="label-eyebrow mb-3">Shipping Address</h2>
            <div className="text-sm">
              <p className="font-medium">{order.shipping_name}</p>
              <p className="text-stone mt-0.5">{order.shipping_phone}</p>
              <p className="text-stone mt-0.5">
                {order.shipping_address_line}{order.shipping_apartment ? `, ${order.shipping_apartment}` : ''},{' '}
                {order.shipping_city}, {order.shipping_state} {order.shipping_pin_code}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="border border-gold/20 p-6 sm:p-7 h-fit bg-paper/60 backdrop-blur-xl shadow-card">
          <h2 className="text-xs tracking-widest2 uppercase text-ink font-medium mb-6">Payment Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-stone">Subtotal</span><span className="font-medium">{formatINR(order.subtotal)}</span></div>
            {order.coupon_discount_amount > 0 && (
              <div className="flex justify-between"><span className="text-stone">Coupon ({order.coupon_code})</span><span className="text-emerald-700 font-medium">-{formatINR(order.coupon_discount_amount)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-stone">Shipping</span><span className="font-medium">{order.shipping_fee === 0 ? 'Free' : formatINR(order.shipping_fee)}</span></div>
            <div className="flex justify-between"><span className="text-stone">Tax</span><span className="font-medium">{formatINR(order.tax_amount)}</span></div>
          </div>
          <div className="border-t border-gold/15 pt-5 mt-5 flex justify-between items-baseline">
            <span className="text-sm font-medium">Total</span>
            <span className="text-2xl font-semibold tracking-tight">{formatINR(order.total_amount)}</span>
          </div>
          {order.payment && (
            <p className="text-xs text-stone mt-3 uppercase tracking-wide">
              {order.payment.method} · {order.payment.status}
            </p>
          )}
        </div>
      </div>

      <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm text-stone hover:text-gold transition-colors mt-10">
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to Orders
      </Link>
    </div>
  )
}
