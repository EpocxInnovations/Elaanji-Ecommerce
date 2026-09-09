import { Link } from 'react-router-dom'
import { Minus, Plus, X, ShoppingBag, ArrowRight, Truck } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from '../hooks/useCart'
import { formatINR } from '../utils/format'
import { luxuryEase } from '../utils/motion'
import { Breadcrumbs } from '../components/Breadcrumbs'

export function CartPage() {
  const { cart, isLoading, updateItem, removeItem } = useCart()



  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="h-8 skeleton w-48 mb-8" />
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 pb-6">
                <div className="w-24 h-32 skeleton shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton w-3/4" />
                  <div className="h-3 skeleton w-1/2" />
                  <div className="h-4 skeleton w-1/4 mt-3" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-48 skeleton" />
        </div>
      </div>
    )
  }

  const activeItems = cart?.items?.filter((i) => !i.saved_for_later) || []
  const savedItems = cart?.items?.filter((i) => i.saved_for_later) || []

  if (activeItems.length === 0 && savedItems.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6 py-24 text-center">
        <div className="w-20 h-20 mx-auto mb-6 frame-gold flex items-center justify-center">
          <ShoppingBag size={28} className="text-gold" strokeWidth={1} />
        </div>
        <h1 className="font-display text-4xl mb-3">Your Cart is Empty</h1>
        <p className="text-stone text-sm mb-8 max-w-xs mx-auto">
          Browse our collection to find your perfect saree.
        </p>
        <Link to="/shop" className="btn-primary">
          Shop Now
          <ArrowRight size={16} strokeWidth={1.5} />
        </Link>
      </div>
    )
  }

  // Free shipping progress
  const threshold = cart?.free_shipping_threshold ?? 999
  const remaining = cart?.amount_remaining_for_free_shipping ?? 0
  const progressPercent = remaining > 0 ? Math.min(((threshold - remaining) / threshold) * 100, 100) : 100

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 md:py-14">
      <Breadcrumbs items={[{ label: 'Cart' }]} className="mb-6" />

      <div className="mb-10">

        <p className="label-eyebrow mb-3 flex items-center gap-3">
          <span className="w-8 h-px bg-gold/60" />
          Your Selection
        </p>
        <h1 className="font-display text-4xl md:text-5xl">Shopping Cart</h1>
      </div>

      {/* Free Shipping Banner */}
      <div className="glass-light px-5 py-4 mb-10">
        {remaining > 0 ? (
          <>
            <p className="text-sm mb-3 flex items-center gap-2">
              <Truck size={16} strokeWidth={1.5} className="text-gold" />
              Add <span className="font-semibold text-oxblood">{formatINR(remaining)}</span> more for{' '}
              <span className="font-semibold uppercase tracking-wide">Free Shipping</span>
            </p>
            <div className="h-1.5 bg-stone/15 overflow-hidden rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: luxuryEase }}
                className="h-full bg-gold-gradient rounded-full"
              />
            </div>
          </>
        ) : (
          <p className="text-sm font-medium flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-gold-gradient text-ink-deep text-xs font-bold">✓</span>
            You've unlocked <span className="uppercase tracking-wide font-semibold">Free Shipping</span>
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8 md:gap-10">
        <div className="md:col-span-2 space-y-0">
          <AnimatePresence initial={false}>
            {activeItems.map((item) => (
              <CartRow key={item.id} item={item} updateItem={updateItem} removeItem={removeItem} />
            ))}
          </AnimatePresence>

          {savedItems.length > 0 && (
            <div className="pt-8 mt-2">
              <h3 className="label-eyebrow mb-4">Saved for Later</h3>
              <AnimatePresence initial={false}>
                {savedItems.map((item) => (
                  <CartRow key={item.id} item={item} updateItem={updateItem} removeItem={removeItem} saved />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="border border-gold/20 p-6 sm:p-7 h-fit sticky top-24 bg-paper/60 backdrop-blur-xl shadow-card">
          <h2 className="text-xs tracking-widest2 uppercase text-ink font-medium mb-6">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-stone">Subtotal</span>
              <span className="font-medium">{formatINR(cart.subtotal)}</span>
            </div>
            <div className="text-stone text-xs">
              Shipping &amp; tax calculated at checkout
            </div>
          </div>
          <div className="border-t border-gold/15 pt-5 mt-5 flex justify-between items-baseline">
            <span className="text-sm font-medium">Total</span>
            <span className="text-2xl font-semibold tracking-tight">{formatINR(cart.subtotal)}</span>
          </div>
          <Link to="/checkout" className="btn-primary w-full mt-6 text-center">
            Checkout
            <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
          <Link to="/shop" className="block text-center text-xs text-stone mt-4 hover:text-gold transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

function CartRow({ item, updateItem, removeItem, saved }) {
  return (
    <motion.div
      initial={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden', paddingBottom: 0, paddingTop: 0 }}
      transition={{ duration: 0.3, ease: luxuryEase }}
      className="flex gap-3 sm:gap-5 border-b border-stone/10 py-5 sm:py-6 first:pt-0"
    >
      <Link to={`/products/${item.product_slug}`} className="w-16 sm:w-24 h-24 sm:h-32 bg-beige shrink-0 overflow-hidden shadow-card">
        {item.product_image_url && (
          <img
            src={item.product_image_url}
            alt={item.product_name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/products/${item.product_slug}`} className="font-display text-sm sm:text-base hover:text-oxblood transition-colors line-clamp-1">
          {item.product_name}
        </Link>
        <p className="text-xs text-stone mt-0.5 sm:mt-1">
          {item.variant.color}
          {item.variant.blouse_size ? ` · Blouse: ${item.variant.blouse_size}` : ''}
        </p>
        <p className="text-sm font-semibold mt-1.5 sm:mt-2">{formatINR(item.unit_price)}</p>

        {!saved && (
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-4 mt-2.5 sm:mt-3">
            <div className="flex items-center border border-stone/30">
              <button
                onClick={() => updateItem.mutate({ itemId: item.id, payload: { quantity: Math.max(1, item.quantity - 1) } })}
                className="px-2 py-1.5 sm:px-2.5 sm:py-2 hover:bg-beige/50 transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus size={12} strokeWidth={1.5} />
              </button>
              <span className="px-2.5 sm:px-3 text-xs sm:text-sm min-w-[24px] sm:min-w-[28px] text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => updateItem.mutate({ itemId: item.id, payload: { quantity: item.quantity + 1 } })}
                className="px-2 py-1.5 sm:px-2.5 sm:py-2 hover:bg-beige/50 transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus size={12} strokeWidth={1.5} />
              </button>
            </div>
            <button
              onClick={() => updateItem.mutate({ itemId: item.id, payload: { saved_for_later: true } })}
              className="text-xs text-stone underline underline-offset-4 hover:text-gold transition-colors cursor-pointer"
            >
              Save for later
            </button>
          </div>
        )}

        {saved && (
          <button
            onClick={() => updateItem.mutate({ itemId: item.id, payload: { saved_for_later: false } })}
            className="text-xs text-oxblood underline underline-offset-4 mt-3 hover:text-gold transition-colors cursor-pointer"
          >
            Move to cart
          </button>
        )}
      </div>
      <button
        onClick={() => removeItem.mutate(item.id)}
        aria-label="Remove item"
        className="text-stone hover:text-oxblood h-fit p-1 transition-colors cursor-pointer"
      >
        <X size={16} strokeWidth={1.5} />
      </button>
    </motion.div>
  )
}
