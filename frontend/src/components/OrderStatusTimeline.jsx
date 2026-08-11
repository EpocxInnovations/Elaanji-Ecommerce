const HAPPY_PATH = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered']

const LABELS = {
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

export function OrderStatusTimeline({ status, statusHistory = [] }) {
  const isTerminalException = ['cancelled', 'return_requested', 'returned', 'refunded'].includes(status)

  if (isTerminalException) {
    return (
      <div className="border border-stone/20 p-4">
        <p className="text-sm font-medium text-oxblood">{LABELS[status]}</p>
        {statusHistory.length > 0 && (
          <p className="text-xs text-stone mt-1">
            {new Date(statusHistory[statusHistory.length - 1].created_at).toLocaleString('en-IN')}
          </p>
        )}
      </div>
    )
  }

  const currentIndex = HAPPY_PATH.indexOf(status)

  return (
    <div className="flex flex-col gap-0">
      {HAPPY_PATH.map((step, idx) => {
        const isDone = idx <= currentIndex
        const historyEntry = statusHistory.find((h) => h.status === step)
        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${isDone ? 'bg-ink' : 'bg-stone/30'}`} />
              {idx < HAPPY_PATH.length - 1 && (
                <div className={`w-px flex-1 min-h-[24px] ${isDone ? 'bg-ink' : 'bg-stone/30'}`} />
              )}
            </div>
            <div className="pb-6">
              <p className={`text-sm ${isDone ? 'text-ink font-medium' : 'text-stone'}`}>{LABELS[step]}</p>
              {historyEntry && (
                <p className="text-xs text-stone">{new Date(historyEntry.created_at).toLocaleString('en-IN')}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
