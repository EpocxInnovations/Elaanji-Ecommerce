import { Link } from 'react-router-dom'
import { Package, ChevronRight, ArrowRight } from 'lucide-react'
import { useOrders } from '../hooks/useOrders'
import { formatINR } from '../utils/format'

const STATUS_LABELS = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  return_requested: 'Return Requested',
  returned: 'Returned',
  refunded: 'Refunded',
}

const STATUS_COLORS = {
  pending: 'bg-stone/40',
  confirmed: 'bg-gold',
  processing: 'bg-gold',
  packed: 'bg-gold',
  shipped: 'bg-gold-light',
  out_for_delivery: 'bg-gold-light',
  delivered: 'bg-emerald-600',
  cancelled: 'bg-oxblood',
  return_requested: 'bg-oxblood',
  returned: 'bg-stone',
  refunded: 'bg-stone',
}

export function OrdersPage() {
  const { data: orders, isLoading } = useOrders()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <div className="h-8 skeleton w-40 mb-8" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 skeleton" />)}
        </div>
      </div>
    )
  }

  if (!orders?.length) {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6 py-24 text-center">
        <div className="w-20 h-20 mx-auto mb-6 frame-gold flex items-center justify-center">
          <Package size={28} className="text-gold" strokeWidth={1} />
        </div>
        <h1 className="font-display text-4xl mb-3">No Orders Yet</h1>
        <p className="text-stone text-sm mb-8">Your order history will appear here.</p>
        <Link to="/shop" className="btn-primary">
          Shop Now
          <ArrowRight size={16} strokeWidth={1.5} />
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 md:py-14">
      <div className="mb-10">
        <p className="label-eyebrow mb-3 flex items-center gap-3">
          <span className="w-8 h-px bg-gold/60" />
          Order History
        </p>
        <h1 className="font-display text-4xl md:text-5xl">My Orders</h1>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="flex items-center justify-between border border-stone/15 p-4 sm:p-6
                       hover:border-gold/40 hover:shadow-card-hover transition-all group bg-paper/60 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden sm:flex items-center justify-center w-11 h-11 bg-beige/60 shrink-0 group-hover:bg-gold-gradient transition-colors duration-300">
                <Package size={18} className="text-stone group-hover:text-ink-deep transition-colors" strokeWidth={1.5} />
              </div>
              <div>
                <div className="flex items-center flex-wrap gap-1.5 sm:gap-2.5">
                  <p className="text-sm font-medium">{order.order_number}</p>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_COLORS[order.status] || 'bg-stone'}`} />
                  <span className="text-xs text-stone">{STATUS_LABELS[order.status] || order.status}</span>
                </div>
                <p className="text-xs text-stone mt-1">
                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' · '}{order.item_count} item{order.item_count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold">{formatINR(order.total_amount)}</p>
              <ChevronRight size={16} className="text-stone group-hover:text-gold group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
