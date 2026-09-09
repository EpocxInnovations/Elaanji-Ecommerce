import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useAdminCoupons } from '../../hooks/admin/useAdminOperations'
import { formatINR } from '../../utils/format'

const EMPTY = {
  code: '', discount_type: 'percentage', discount_value: '', minimum_order_amount: 0,
  maximum_discount_amount: '', start_date: '', expiry_date: '', usage_limit: '', user_usage_limit: 1, is_active: true,
}

export function AdminCouponsPage() {
  const { coupons, isLoading, createCoupon, removeCoupon } = useAdminCoupons()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  const handleChange = (field, value) => setForm({ ...form, [field]: value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createCoupon.mutateAsync({
        ...form,
        discount_value: Number(form.discount_value),
        minimum_order_amount: Number(form.minimum_order_amount) || 0,
        maximum_discount_amount: form.maximum_discount_amount ? Number(form.maximum_discount_amount) : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        user_usage_limit: Number(form.user_usage_limit),
        start_date: new Date(form.start_date).toISOString(),
        expiry_date: new Date(form.expiry_date).toISOString(),
      })
      setForm(EMPTY)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create coupon.')
    }
  }

  return (
    <div className="max-w-3xl pb-10">
      <h1 className="font-display text-2xl sm:text-3xl mb-4 sm:mb-8 text-ink">Coupons</h1>

      <form onSubmit={handleSubmit} className="border border-stone/20 p-4 sm:p-6 mb-6 sm:mb-8 space-y-3 bg-paper rounded-lg shadow-sm">
        <h2 className="text-xs sm:text-sm tracking-widest2 uppercase text-stone font-semibold mb-2">Create New Coupon</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <input required placeholder="COUPON CODE" value={form.code} onChange={(e) => handleChange('code', e.target.value)} className="input text-xs sm:text-sm font-mono uppercase" />
          <select value={form.discount_type} onChange={(e) => handleChange('discount_type', e.target.value)} className="input text-xs sm:text-sm">
            <option value="percentage">Percentage (%)</option>
            <option value="flat">Flat Amount (₹)</option>
          </select>
          <input required type="number" placeholder="Discount value" value={form.discount_value} onChange={(e) => handleChange('discount_value', e.target.value)} className="input text-xs sm:text-sm" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <input type="number" placeholder="Min order (₹)" value={form.minimum_order_amount} onChange={(e) => handleChange('minimum_order_amount', e.target.value)} className="input text-xs sm:text-sm" />
          <input type="number" placeholder="Max discount (₹, optional)" value={form.maximum_discount_amount} onChange={(e) => handleChange('maximum_discount_amount', e.target.value)} className="input text-xs sm:text-sm" />
          <input type="number" placeholder="Uses per user" value={form.user_usage_limit} onChange={(e) => handleChange('user_usage_limit', e.target.value)} className="input text-xs sm:text-sm" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <div>
            <label className="text-[10px] uppercase font-semibold text-stone mb-1 block">Start Date</label>
            <input required type="datetime-local" value={form.start_date} onChange={(e) => handleChange('start_date', e.target.value)} className="input text-xs sm:text-sm" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-semibold text-stone mb-1 block">Expiry Date</label>
            <input required type="datetime-local" value={form.expiry_date} onChange={(e) => handleChange('expiry_date', e.target.value)} className="input text-xs sm:text-sm" />
          </div>
        </div>
        {error && <p className="text-sm text-oxblood bg-oxblood/10 p-2 rounded">{error}</p>}
        <div className="pt-2">
          <button type="submit" disabled={createCoupon.isPending} className="btn-primary !py-2.5 !px-5 text-xs sm:text-sm disabled:opacity-50">
            {createCoupon.isPending ? 'Creating…' : 'Create Coupon'}
          </button>
        </div>
      </form>

      {isLoading && <p className="text-stone text-xs sm:text-sm">Loading…</p>}

      {!isLoading && (
        <div className="border border-stone/20 divide-y divide-stone/10 rounded-lg overflow-hidden bg-paper shadow-sm">
          {coupons.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3 sm:p-4">
              <div>
                <p className="text-sm font-semibold font-mono text-ink">{c.code}</p>
                <p className="text-xs text-stone mt-0.5">
                  {c.discount_type === 'percentage' ? `${c.discount_value}% off` : `${formatINR(c.discount_value)} off`}
                  {c.minimum_order_amount > 0 ? ` · min ${formatINR(c.minimum_order_amount)}` : ''} · used {c.times_used}x
                </p>
              </div>
              <button
                onClick={() => removeCoupon.mutate(c.id)}
                className="p-1.5 text-stone hover:text-oxblood rounded hover:bg-oxblood/10 transition-colors"
                aria-label="Delete coupon"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {coupons.length === 0 && <p className="p-6 text-stone text-xs sm:text-sm text-center">No coupons yet.</p>}
        </div>
      )}
    </div>
  )
}
