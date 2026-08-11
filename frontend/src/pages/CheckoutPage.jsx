import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useAddresses } from '../hooks/useAddresses'
import { useOrderActions } from '../hooks/useOrders'
import { couponsApi, paymentsApi } from '../api/orders'
import { formatINR } from '../utils/format'
import { loadRazorpayScript } from '../utils/loadRazorpay'
import { useAuth } from '../context/AuthContext'

const STEPS = ['address', 'delivery', 'payment', 'review']

export function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, isLoading: cartLoading } = useCart()
  const { addresses, isLoading: addressesLoading, createAddress } = useAddresses()
  const { createOrder } = useOrderActions()

  const [step, setStep] = useState('address')
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [couponCode, setCouponCode] = useState('')
  const [couponResult, setCouponResult] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderError, setOrderError] = useState('')

  const effectiveAddressId = selectedAddressId || addresses.find((a) => a.is_default)?.id || addresses[0]?.id

  const subtotal = cart?.subtotal || 0
  const discount = couponResult?.valid ? couponResult.discount_amount : 0
  const discountedSubtotal = Math.max(subtotal - discount, 0)
  const shippingFee = deliveryMethod === 'express' ? 149 : discountedSubtotal >= (cart?.free_shipping_threshold ?? 999) ? 0 : 79
  const estimatedTax = discountedSubtotal * 0.05
  const estimatedTotal = discountedSubtotal + shippingFee + estimatedTax

  const handleApplyCoupon = async () => {
    setCouponError('')
    if (!couponCode.trim()) return
    try {
      const result = await couponsApi.validate(couponCode.trim(), subtotal)
      if (result.valid) {
        setCouponResult(result)
      } else {
        setCouponResult(null)
        setCouponError(result.message || 'Invalid coupon')
      }
    } catch (err) {
      setCouponError(err.response?.data?.detail || 'Could not validate coupon')
    }
  }

  const handlePlaceOrder = async () => {
    setOrderError('')
    if (!effectiveAddressId) {
      setOrderError('Please select a delivery address.')
      return
    }
    setPlacingOrder(true)
    try {
      const order = await createOrder.mutateAsync({
        address_id: effectiveAddressId,
        delivery_method: deliveryMethod,
        payment_method: paymentMethod,
        coupon_code: couponResult?.valid ? couponResult.code : undefined,
      })

      if (paymentMethod === 'cod') {
        navigate(`/orders/${order.id}`, { state: { justPlaced: true } })
        return
      }

      // Online payment: create Razorpay order, open checkout, verify on success
      await loadRazorpayScript()
      const rzpOrder = await paymentsApi.createRazorpayOrder(order.id)

      const rzp = new window.Razorpay({
        key: rzpOrder.razorpay_key_id,
        amount: rzpOrder.amount_in_paise,
        currency: rzpOrder.currency,
        name: 'Elaanji',
        description: `Order ${order.order_number}`,
        order_id: rzpOrder.razorpay_order_id,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: '#6E2430' },
        handler: async (response) => {
          try {
            await paymentsApi.verifyRazorpayPayment({
              order_id: order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
          } finally {
            navigate(`/orders/${order.id}`, { state: { justPlaced: true } })
          }
        },
        modal: {
          ondismiss: () => navigate(`/orders/${order.id}`, { state: { paymentPending: true } }),
        },
      })
      rzp.open()
    } catch (err) {
      setOrderError(err.response?.data?.detail || 'Could not place your order. Please try again.')
    } finally {
      setPlacingOrder(false)
    }
  }

  if (cartLoading || addressesLoading) {
    return <div className="mx-auto max-w-3xl px-6 py-20 text-stone text-sm">Loading checkout…</div>
  }

  if (!cart?.items?.length) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Your Cart is Empty</h1>
        <Link to="/shop" className="btn-primary">Shop Now</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-3xl mb-8">Checkout</h1>

      <div className="flex gap-2 mb-10 text-xs tracking-widest2 uppercase">
        {STEPS.map((s) => (
          <span key={s} className={`px-3 py-1 ${step === s ? 'bg-ink text-paper' : 'text-stone'}`}>
            {s}
          </span>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-8">
          {step === 'address' && (
            <div>
              <h2 className="text-sm tracking-widest2 uppercase mb-4">Delivery Address</h2>
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`block border p-4 cursor-pointer ${
                      effectiveAddressId === addr.id ? 'border-ink' : 'border-stone/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      className="mr-2 accent-oxblood"
                      checked={effectiveAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                    />
                    <span className="text-sm font-medium">{addr.full_name}</span> — {addr.phone}
                    <p className="text-sm text-stone mt-1">
                      {addr.address_line}{addr.apartment ? `, ${addr.apartment}` : ''}, {addr.city}, {addr.state} {addr.pin_code}
                    </p>
                  </label>
                ))}
              </div>

              {!showNewAddressForm ? (
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-sm text-oxblood underline underline-offset-4 mt-4"
                >
                  + Add new address
                </button>
              ) : (
                <NewAddressForm
                  onCancel={() => setShowNewAddressForm(false)}
                  onSave={async (payload) => {
                    const created = await createAddress.mutateAsync(payload)
                    setSelectedAddressId(created.id)
                    setShowNewAddressForm(false)
                  }}
                />
              )}

              <button
                onClick={() => setStep('delivery')}
                disabled={!effectiveAddressId}
                className="btn-primary mt-6 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {step === 'delivery' && (
            <div>
              <h2 className="text-sm tracking-widest2 uppercase mb-4">Delivery Method</h2>
              <div className="space-y-3">
                <label className={`block border p-4 cursor-pointer ${deliveryMethod === 'standard' ? 'border-ink' : 'border-stone/30'}`}>
                  <input type="radio" name="delivery" className="mr-2 accent-oxblood" checked={deliveryMethod === 'standard'} onChange={() => setDeliveryMethod('standard')} />
                  Standard Delivery — 5-7 business days
                </label>
                <label className={`block border p-4 cursor-pointer ${deliveryMethod === 'express' ? 'border-ink' : 'border-stone/30'}`}>
                  <input type="radio" name="delivery" className="mr-2 accent-oxblood" checked={deliveryMethod === 'express'} onChange={() => setDeliveryMethod('express')} />
                  Express Delivery — 1-2 business days (+{formatINR(149)})
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep('address')} className="btn-secondary">Back</button>
                <button onClick={() => setStep('payment')} className="btn-primary">Continue</button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div>
              <h2 className="text-sm tracking-widest2 uppercase mb-4">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: 'cod', label: 'Cash on Delivery' },
                  { value: 'upi', label: 'UPI' },
                  { value: 'card', label: 'Credit / Debit Card' },
                  { value: 'net_banking', label: 'Net Banking' },
                ].map((opt) => (
                  <label key={opt.value} className={`block border p-4 cursor-pointer ${paymentMethod === opt.value ? 'border-ink' : 'border-stone/30'}`}>
                    <input type="radio" name="payment" className="mr-2 accent-oxblood" checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} />
                    {opt.label}
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep('delivery')} className="btn-secondary">Back</button>
                <button onClick={() => setStep('review')} className="btn-primary">Continue</button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div>
              <h2 className="text-sm tracking-widest2 uppercase mb-4">Review Order</h2>
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product_name} ({item.variant.color}) × {item.quantity}</span>
                    <span>{formatINR(item.line_total)}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 border border-stone/30 px-3 py-2 text-sm bg-transparent"
                />
                <button onClick={handleApplyCoupon} className="btn-secondary px-4">Apply</button>
              </div>
              {couponResult?.valid && (
                <p className="text-sm text-emerald-700 mb-4">Coupon applied: -{formatINR(couponResult.discount_amount)}</p>
              )}
              {couponError && <p className="text-sm text-oxblood mb-4">{couponError}</p>}

              {orderError && <p className="text-sm text-oxblood mb-4">{orderError}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep('payment')} className="btn-secondary">Back</button>
                <button onClick={handlePlaceOrder} disabled={placingOrder} className="btn-primary disabled:opacity-50">
                  {placingOrder ? 'Placing Order…' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border border-stone/20 p-6 h-fit">
          <h2 className="text-sm tracking-widest2 uppercase mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-stone">Subtotal</span><span>{formatINR(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between"><span className="text-stone">Coupon Discount</span><span>-{formatINR(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-stone">Shipping</span><span>{shippingFee === 0 ? 'Free' : formatINR(shippingFee)}</span></div>
            <div className="flex justify-between"><span className="text-stone">Tax (est.)</span><span>{formatINR(estimatedTax)}</span></div>
          </div>
          <div className="border-t border-stone/20 pt-4 mt-4 flex justify-between font-medium">
            <span>Total</span>
            <span>{formatINR(estimatedTotal)}</span>
          </div>
          <p className="text-xs text-stone mt-2">Final total is confirmed by the server when you place the order.</p>
        </div>
      </div>
    </div>
  )
}

function NewAddressForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    full_name: '', phone: '', address_line: '', apartment: '', city: '', state: '', pin_code: '', country: 'India', is_default: false,
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(form)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-stone/20 p-4 mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input name="full_name" required placeholder="Full Name" value={form.full_name} onChange={handleChange} className="border border-stone/30 px-3 py-2 text-sm bg-transparent" />
        <input name="phone" required placeholder="Phone" value={form.phone} onChange={handleChange} className="border border-stone/30 px-3 py-2 text-sm bg-transparent" />
      </div>
      <input name="address_line" required placeholder="Address" value={form.address_line} onChange={handleChange} className="w-full border border-stone/30 px-3 py-2 text-sm bg-transparent" />
      <input name="apartment" placeholder="Apartment / Landmark (optional)" value={form.apartment} onChange={handleChange} className="w-full border border-stone/30 px-3 py-2 text-sm bg-transparent" />
      <div className="grid grid-cols-3 gap-3">
        <input name="city" required placeholder="City" value={form.city} onChange={handleChange} className="border border-stone/30 px-3 py-2 text-sm bg-transparent" />
        <input name="state" required placeholder="State" value={form.state} onChange={handleChange} className="border border-stone/30 px-3 py-2 text-sm bg-transparent" />
        <input name="pin_code" required placeholder="PIN Code" value={form.pin_code} onChange={handleChange} className="border border-stone/30 px-3 py-2 text-sm bg-transparent" />
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Saving…' : 'Save Address'}</button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  )
}
