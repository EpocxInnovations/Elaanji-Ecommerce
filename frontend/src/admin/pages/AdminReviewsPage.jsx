import { useState } from 'react'
import { useAdminReviews, useAdminReviewActions } from '../../hooks/admin/useAdminOperations'

const STATUS_FILTERS = ['', 'pending', 'approved', 'hidden']

export function AdminReviewsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const { data: reviews, isLoading } = useAdminReviews(statusFilter || undefined)
  const { setStatus, respond, remove } = useAdminReviewActions()
  const [responseDrafts, setResponseDrafts] = useState({})

  return (
    <div>
      <p className="label-eyebrow mb-2">Phase 5</p>
      <h1 className="font-display text-3xl mb-6">Reviews</h1>

      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input max-w-xs mb-6">
        {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
      </select>

      {isLoading && <p className="text-stone text-sm">Loading…</p>}

      {!isLoading && (
        <div className="space-y-4">
          {reviews?.length === 0 && <p className="text-stone text-sm">No reviews to show.</p>}
          {reviews?.map((r) => (
            <div key={r.id} className="border border-stone/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">{r.product_name}</p>
                  <p className="text-xs text-stone mt-1">
                    {r.user_name} · {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    {r.is_verified_purchase && ' · Verified Purchase'}
                  </p>
                </div>
                <span className="text-xs text-stone uppercase">{r.status}</span>
              </div>
              {r.title && <p className="text-sm font-medium mt-2">{r.title}</p>}
              {r.comment && <p className="text-sm text-ink/80 mt-1">{r.comment}</p>}
              {r.admin_response && (
                <p className="text-xs text-stone mt-2 border-l-2 border-stone/30 pl-3">Response: {r.admin_response}</p>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {r.status !== 'approved' && (
                  <button onClick={() => setStatus.mutate({ id: r.id, status: 'approved' })} className="btn-secondary text-xs px-3 py-1.5">Approve</button>
                )}
                {r.status !== 'hidden' && (
                  <button onClick={() => setStatus.mutate({ id: r.id, status: 'hidden' })} className="btn-secondary text-xs px-3 py-1.5">Hide</button>
                )}
                <button onClick={() => remove.mutate(r.id)} className="text-xs text-oxblood underline underline-offset-4">Delete</button>
              </div>

              <div className="flex gap-2 mt-3">
                <input
                  placeholder="Respond to this review…"
                  value={responseDrafts[r.id] || ''}
                  onChange={(e) => setResponseDrafts({ ...responseDrafts, [r.id]: e.target.value })}
                  className="input flex-1 text-xs"
                />
                <button
                  onClick={() => {
                    respond.mutate({ id: r.id, adminResponse: responseDrafts[r.id] })
                    setResponseDrafts({ ...responseDrafts, [r.id]: '' })
                  }}
                  disabled={!responseDrafts[r.id]}
                  className="btn-secondary text-xs px-3 disabled:opacity-50"
                >
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
