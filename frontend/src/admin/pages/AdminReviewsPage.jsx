import { useState } from 'react'
import { useAdminReviews, useAdminReviewActions } from '../../hooks/admin/useAdminOperations'

const STATUS_FILTERS = ['', 'pending', 'approved', 'hidden']

export function AdminReviewsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const { data, isLoading } = useAdminReviews(statusFilter || undefined)
  const reviews = data?.items
  const { setStatus, respond, remove } = useAdminReviewActions()
  const [responseDrafts, setResponseDrafts] = useState({})

  return (
    <div className="max-w-4xl pb-10">
      <h1 className="font-display text-2xl sm:text-3xl mb-4 sm:mb-6 text-ink">Reviews</h1>

      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input max-w-xs mb-6 text-xs sm:text-sm capitalize">
        {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
      </select>

      {isLoading && <p className="text-stone text-xs sm:text-sm">Loading…</p>}

      {!isLoading && (
        <div className="space-y-4">
          {reviews?.length === 0 && <p className="text-stone text-xs sm:text-sm">No reviews to show.</p>}
          {reviews?.map((r) => (
            <div key={r.id} className="border border-stone/20 p-3.5 sm:p-4 bg-paper rounded-lg shadow-sm">
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{r.product_name}</p>
                  <p className="text-xs text-stone mt-0.5">
                    {r.user_name} · <span className="text-gold">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    {r.is_verified_purchase && ' · Verified Purchase'}
                  </p>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-stone/10 text-stone border border-stone/20 shrink-0">{r.status}</span>
              </div>
              {r.title && <p className="text-sm font-medium mt-2 text-ink">{r.title}</p>}
              {r.comment && <p className="text-xs sm:text-sm text-ink/80 mt-1 leading-relaxed">{r.comment}</p>}
              {r.admin_response && (
                <p className="text-xs text-stone mt-2 border-l-2 border-gold/50 pl-3 italic">Response: {r.admin_response}</p>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-stone/10">
                {r.status !== 'approved' && (
                  <button onClick={() => setStatus.mutate({ id: r.id, status: 'approved' })} className="btn-secondary text-xs !py-1.5 !px-3">Approve</button>
                )}
                {r.status !== 'hidden' && (
                  <button onClick={() => setStatus.mutate({ id: r.id, status: 'hidden' })} className="btn-secondary text-xs !py-1.5 !px-3">Hide</button>
                )}
                <button onClick={() => remove.mutate(r.id)} className="text-xs text-oxblood hover:underline underline-offset-4 ml-auto">Delete</button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <input
                  placeholder="Respond to this review…"
                  value={responseDrafts[r.id] || ''}
                  onChange={(e) => setResponseDrafts({ ...responseDrafts, [r.id]: e.target.value })}
                  className="input flex-1 text-xs"
                />
                <button
                  onClick={() => {
                    if (!responseDrafts[r.id]) return
                    respond.mutate({ id: r.id, adminResponse: responseDrafts[r.id] })
                    setResponseDrafts({ ...responseDrafts, [r.id]: '' })
                  }}
                  disabled={!responseDrafts[r.id]}
                  className="btn-primary !py-2 !px-4 text-xs disabled:opacity-50"
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
