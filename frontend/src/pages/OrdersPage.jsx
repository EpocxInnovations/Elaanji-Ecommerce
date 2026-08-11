import { Link } from 'react-router-dom'
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

export function OrdersPage() {
  const { data: orders, isLoading } = useOrders()

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-6 py-20 text-stone text-sm">Loading your orders…</div>
  }

  if (!orders?.length) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">No Orders Yet</h1>
        <p className="text-stone text-sm mb-8">Your order history will appear here.</p>
        <Link to="/shop" className="btn-primary">Shop Now</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-3xl mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="flex items-center justify-between border border-stone/20 p-5 hover:border-ink transition-colors"
          >
            <div>
              <p className="text-sm font-medium">{order.order_number}</p>
              <p className="text-xs text-stone mt-1">
                {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' · '}{order.item_count} item{order.item_count !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{formatINR(order.total_amount)}</p>
              <p className="text-xs text-stone mt-1">{STATUS_LABELS[order.status] || order.status}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
