import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { useAddresses } from '../hooks/useAddresses'
import { useOrderActions } from '../hooks/useOrders'
import { couponsApi, paymentsApi } from '../api/orders'
import { formatINR } from '../utils/format'
import { loadRazorpayScript } from '../utils/loadRazorpay'
import { useAuth } from '../context/AuthContext'
import { Breadcrumbs } from '../components/Breadcrumbs'


const STEPS = ['address', 'delivery', 'payment', 'review']
const STEP_LABELS = { address: 'Address', delivery: 'Delivery', payment: 'Payment', review: 'Review' }

function StepIndicator({ steps, currentStep }) {
  const currentIdx = steps.indexOf(currentStep)
  return (
    <nav aria-label="Checkout steps" className="mb-8 sm:mb-10">
      <ol className="flex items-center">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIdx
          const isCurrent = idx === currentIdx
          return (
            <li key={step} className="flex items-center flex-1 last:flex-initial">
              <div className="flex items-center gap-2 sm:gap-3">
                <span
                  className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs font-semibold shrink-0 transition-all ${
                    isCompleted
                      ? 'bg-gold-gradient text-ink-deep shadow-gold-glow'
                      : isCurrent
                        ? 'border-2 border-gold text-gold'
                        : 'border border-stone/30 text-stone'
                  }`}
                >
                  {isCompleted ? <Check size={13} strokeWidth={2} /> : idx + 1}
                </span>
                <span
                  className={`text-xs tracking-widest2 uppercase hidden sm:inline ${
                    isCurrent ? 'text-ink font-medium' : isCompleted ? 'text-ink' : 'text-stone'
                  }`}
                >
                  {STEP_LABELS[step]}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-px mx-1.5 sm:mx-3 ${isCompleted ? 'bg-gold-gradient' : 'bg-stone/20'}`} />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

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
        theme: { color: '#A16207' },
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
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="h-8 skeleton w-40 mb-8" />
        <div className="h-10 skeleton w-full mb-10" />
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 skeleton" />)}
          </div>
          <div className="h-48 skeleton" />
        </div>
      </div>
    )
  }

  if (!cart?.items?.length) {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6 py-24 text-center">
        <h1 className="font-display text-4xl mb-3">Your Cart is Empty</h1>
        <p className="text-stone text-sm mb-8">Add items to proceed to checkout.</p>
        <Link to="/shop" className="btn-primary">Shop Now</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 md:py-14">
      <Breadcrumbs items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} className="mb-6" />

      <div className="mb-10">

        <p className="label-eyebrow mb-3 flex items-center gap-3">
          <span className="w-8 h-px bg-gold/60" />
          Secure Checkout
        </p>
        <h1 className="font-display text-4xl md:text-5xl">Checkout</h1>
      </div>

      <StepIndicator steps={STEPS} currentStep={step} />

      <div className="grid md:grid-cols-3 gap-8 md:gap-10">
        <div className="md:col-span-2">
          {step === 'address' && (
            <div>
              <h2 className="label-eyebrow mb-5">Delivery Address</h2>
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`block border p-5 cursor-pointer transition-all duration-150 ${
                      effectiveAddressId === addr.id
                        ? 'border-gold bg-gold/5 shadow-gold-glow'
                        : 'border-stone/20 hover:border-stone/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 w-5 h-5 border flex items-center justify-center shrink-0 transition-colors ${
                          effectiveAddressId === addr.id ? 'border-gold bg-gold-gradient' : 'border-stone/40'
                        }`}
                      >
                        {effectiveAddressId === addr.id && (
                          <Check size={11} className="text-ink-deep" strokeWidth={3} />
                        )}
                      </span>
                      <input
                        type="radio"
                        name="address"
                        className="sr-only"
                        checked={effectiveAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                      />
                      <div>
                        <span className="text-sm font-medium">{addr.full_name}</span>
                        <span className="text-sm text-stone ml-2">{addr.phone}</span>
                        <p className="text-sm text-stone mt-1">
                          {addr.address_line}{addr.apartment ? `, ${addr.apartment}` : ''}, {addr.city}, {addr.state} {addr.pin_code}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {!showNewAddressForm ? (
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-sm text-oxblood hover:text-gold transition-colors mt-5 underline underline-offset-4 cursor-pointer"
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
                className="btn-primary w-full sm:w-auto mt-7"
              >
                Continue
              </button>
            </div>
          )}

          {step === 'delivery' && (
            <div>
              <h2 className="label-eyebrow mb-5">Delivery Method</h2>
              <div className="space-y-3">
                {[
                  { value: 'standard', label: 'Standard Delivery', desc: '5–7 business days', price: null },
                  { value: 'express', label: 'Express Delivery', desc: '1–2 business days', price: 149 },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center justify-between border p-5 cursor-pointer transition-all duration-150 ${
                      deliveryMethod === opt.value
                        ? 'border-gold bg-gold/5 shadow-gold-glow'
                        : 'border-stone/20 hover:border-stone/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-5 h-5 border flex items-center justify-center shrink-0 transition-colors ${
                          deliveryMethod === opt.value ? 'border-gold bg-gold-gradient' : 'border-stone/40'
                        }`}
                      >
                        {deliveryMethod === opt.value && <Check size={11} className="text-ink-deep" strokeWidth={3} />}
                      </span>
                      <input type="radio" name="delivery" className="sr-only" checked={deliveryMethod === opt.value} onChange={() => setDeliveryMethod(opt.value)} />
                      <div>
                        <span className="text-sm font-medium">{opt.label}</span>
                        <p className="text-xs text-stone mt-0.5">{opt.desc}</p>
                      </div>
                    </div>
                    {opt.price && <span className="text-sm text-stone font-medium">+{formatINR(opt.price)}</span>}
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-7">
                <button onClick={() => setStep('address')} className="btn-secondary flex-1 sm:flex-initial">Back</button>
                <button onClick={() => setStep('payment')} className="btn-primary flex-1 sm:flex-initial">Continue</button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div>
              <h2 className="label-eyebrow mb-5">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: 'cod', label: 'Cash on Delivery' },
                  { value: 'upi', label: 'UPI' },
                  { value: 'card', label: 'Credit / Debit Card' },
                  { value: 'net_banking', label: 'Net Banking' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 border p-5 cursor-pointer transition-all duration-150 ${
                      paymentMethod === opt.value
                        ? 'border-gold bg-gold/5 shadow-gold-glow'
                        : 'border-stone/20 hover:border-stone/40'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 border flex items-center justify-center shrink-0 transition-colors ${
                        paymentMethod === opt.value ? 'border-gold bg-gold-gradient' : 'border-stone/40'
                      }`}
                    >
                      {paymentMethod === opt.value && <Check size={11} className="text-ink-deep" strokeWidth={3} />}
                    </span>
                    <input type="radio" name="payment" className="sr-only" checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-7">
                <button onClick={() => setStep('delivery')} className="btn-secondary flex-1 sm:flex-initial">Back</button>
                <button onClick={() => setStep('review')} className="btn-primary flex-1 sm:flex-initial">Continue</button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div>
              <h2 className="label-eyebrow mb-5">Review Order</h2>
              <div className="space-y-3 mb-6">
                {cart.items.filter((i) => !i.saved_for_later).map((item) => (
                  <div key={item.id} className="flex items-center gap-4 text-sm">
                    <div className="w-12 h-14 bg-beige shrink-0 overflow-hidden shadow-card">
                      {item.product_image_url && (
                        <img
                          src={item.product_image_url}
                          alt={item.product_name || 'Product'}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product_name}</p>
                      <p className="text-xs text-stone">{item.variant.color} × {item.quantity}</p>
                    </div>
                    <span className="font-semibold shrink-0">{formatINR(item.line_total)}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="input flex-1 min-w-0"
                />
                <button onClick={handleApplyCoupon} className="btn-secondary !px-4 sm:!px-6 text-xs shrink-0">
                  Apply
                </button>
              </div>
              {couponResult?.valid && (
                <p className="text-sm text-emerald-700 mb-4">Coupon applied: -{formatINR(couponResult.discount_amount)}</p>
              )}
              {couponError && <p className="text-sm text-oxblood mb-4">{couponError}</p>}
              {orderError && <p className="text-sm text-oxblood mb-4">{orderError}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep('payment')} className="btn-secondary flex-1 sm:flex-initial">Back</button>
                <button onClick={handlePlaceOrder} disabled={placingOrder} className="btn-primary flex-1 sm:flex-initial">
                  {placingOrder ? 'Placing Order…' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="border border-gold/20 p-5 sm:p-7 h-fit sticky top-24 bg-paper/60 backdrop-blur-xl shadow-card">
          <h2 className="text-xs tracking-widest2 uppercase text-ink font-medium mb-6">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-stone">Subtotal</span><span className="font-medium">{formatINR(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between"><span className="text-stone">Coupon</span><span className="text-emerald-700 font-medium">-{formatINR(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-stone">Shipping</span><span className="font-medium">{shippingFee === 0 ? 'Free' : formatINR(shippingFee)}</span></div>
            <div className="flex justify-between"><span className="text-stone">Tax (est.)</span><span className="font-medium">{formatINR(estimatedTax)}</span></div>
          </div>
          <div className="border-t border-gold/15 pt-5 mt-5 flex justify-between items-baseline">
            <span className="text-sm font-medium">Total</span>
            <span className="text-2xl font-semibold tracking-tight">{formatINR(estimatedTotal)}</span>
          </div>
          <p className="text-[11px] text-stone mt-3 leading-relaxed">
            Final total confirmed when you place the order.
          </p>
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
    <form onSubmit={handleSubmit} className="border border-gold/20 p-4 sm:p-5 mt-5 space-y-3 bg-paper/60 backdrop-blur-xl">
      <p className="label-eyebrow mb-1">New Address</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input name="full_name" required placeholder="Full Name" value={form.full_name} onChange={handleChange} className="input" />
        <input name="phone" required placeholder="Phone" value={form.phone} onChange={handleChange} className="input" />
      </div>
      <input name="address_line" required placeholder="Address" value={form.address_line} onChange={handleChange} className="input" />
      <input name="apartment" placeholder="Apartment / Landmark (optional)" value={form.apartment} onChange={handleChange} className="input" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input name="city" required placeholder="City" value={form.city} onChange={handleChange} className="input" />
        <input name="state" required placeholder="State" value={form.state} onChange={handleChange} className="input" />
        <input name="pin_code" required placeholder="PIN Code" value={form.pin_code} onChange={handleChange} className="input" />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={saving} className="btn-primary text-xs flex-1 sm:flex-initial">{saving ? 'Saving…' : 'Save Address'}</button>
        <button type="button" onClick={onCancel} className="btn-secondary text-xs flex-1 sm:flex-initial">Cancel</button>
      </div>
    </form>
  )
}
