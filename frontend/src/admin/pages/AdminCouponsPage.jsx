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
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl mb-8">Coupons</h1>

      <form onSubmit={handleSubmit} className="border border-stone/20 p-4 mb-8 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <input required placeholder="CODE" value={form.code} onChange={(e) => handleChange('code', e.target.value)} className="input" />
          <select value={form.discount_type} onChange={(e) => handleChange('discount_type', e.target.value)} className="input">
            <option value="percentage">Percentage</option>
            <option value="flat">Flat</option>
          </select>
          <input required type="number" placeholder="Discount value" value={form.discount_value} onChange={(e) => handleChange('discount_value', e.target.value)} className="input" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <input type="number" placeholder="Min order (₹)" value={form.minimum_order_amount} onChange={(e) => handleChange('minimum_order_amount', e.target.value)} className="input" />
          <input type="number" placeholder="Max discount (₹, optional)" value={form.maximum_discount_amount} onChange={(e) => handleChange('maximum_discount_amount', e.target.value)} className="input" />
          <input type="number" placeholder="Uses per user" value={form.user_usage_limit} onChange={(e) => handleChange('user_usage_limit', e.target.value)} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input required type="datetime-local" value={form.start_date} onChange={(e) => handleChange('start_date', e.target.value)} className="input" />
          <input required type="datetime-local" value={form.expiry_date} onChange={(e) => handleChange('expiry_date', e.target.value)} className="input" />
        </div>
        {error && <p className="text-sm text-oxblood">{error}</p>}
        <button type="submit" disabled={createCoupon.isPending} className="btn-primary disabled:opacity-50">
          {createCoupon.isPending ? 'Creating…' : 'Create Coupon'}
        </button>
      </form>

      {isLoading && <p className="text-stone text-sm">Loading…</p>}

      {!isLoading && (
        <div className="border border-stone/20 divide-y divide-stone/10">
          {coupons.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{c.code}</p>
                <p className="text-xs text-stone mt-1">
                  {c.discount_type === 'percentage' ? `${c.discount_value}% off` : `${formatINR(c.discount_value)} off`}
                  {c.minimum_order_amount > 0 ? ` · min ${formatINR(c.minimum_order_amount)}` : ''} · used {c.times_used}x
                </p>
              </div>
              <button onClick={() => removeCoupon.mutate(c.id)} className="text-stone hover:text-oxblood" aria-label="Delete coupon">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {coupons.length === 0 && <p className="p-6 text-stone text-sm">No coupons yet.</p>}
        </div>
      )}
    </div>
  )
}
