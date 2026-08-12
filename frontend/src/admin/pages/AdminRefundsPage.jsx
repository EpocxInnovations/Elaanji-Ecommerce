import { useState } from 'react'
import { useAdminRefunds, useAdminRefundActions } from '../../hooks/admin/useAdminOrders'
import { formatINR } from '../../utils/format'

const STATUS_FILTERS = ['', 'requested', 'approved', 'item_received', 'processing', 'completed', 'rejected']

const NEXT_ACTION = {
  requested: [{ label: 'Approve', fn: 'approve' }, { label: 'Reject', fn: 'reject' }],
  approved: [{ label: 'Mark Item Received', fn: 'markReceived' }],
  item_received: [{ label: 'Complete Refund', fn: 'complete' }],
}

export function AdminRefundsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const { data: refunds, isLoading } = useAdminRefunds(statusFilter || undefined)
  const actions = useAdminRefundActions()
  const [error, setError] = useState('')

  const handleAction = (fn, id) => {
    setError('')
    actions[fn].mutate({ id }, { onError: (err) => setError(err.response?.data?.detail || 'Action failed.') })
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Returns &amp; Refunds</h1>

      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input max-w-xs mb-6">
        {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s ? s.replace(/_/g, ' ') : 'All Statuses'}</option>)}
      </select>

      {error && <p className="text-sm text-oxblood mb-4">{error}</p>}
      {isLoading && <p className="text-stone text-sm">Loading…</p>}

      {!isLoading && (
        <div className="border border-stone/20 divide-y divide-stone/10">
          {refunds?.length === 0 && <p className="p-6 text-stone text-sm">No refund requests.</p>}
          {refunds?.map((r) => (
            <div key={r.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">{r.order_number} — {r.customer_name}</p>
                  <p className="text-xs text-stone mt-1">{r.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{formatINR(r.refund_amount)}</p>
                  <p className="text-xs text-stone mt-1">{r.status.replace(/_/g, ' ')}</p>
                </div>
              </div>
              {(NEXT_ACTION[r.status] || []).length > 0 && (
                <div className="flex gap-2 mt-3">
                  {NEXT_ACTION[r.status].map((action) => (
                    <button
                      key={action.fn}
                      onClick={() => handleAction(action.fn, r.id)}
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
