import { Link } from 'react-router-dom'
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { formatINR } from '../utils/format'

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
        <div className="w-16 h-16 mx-auto mb-5 border border-stone/20 flex items-center justify-center">
          <ShoppingBag size={24} className="text-stone" strokeWidth={1} />
        </div>
        <h1 className="font-display text-3xl mb-3">Your Cart is Empty</h1>
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
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 md:py-12">
      <h1 className="font-display text-3xl mb-8">Shopping Cart</h1>

      {/* Free Shipping Banner */}
      <div className="bg-beige/60 px-4 py-3 mb-8">
        {remaining > 0 ? (
          <>
            <p className="text-sm mb-2">
              Add {formatINR(remaining)} more for{' '}
              <span className="font-medium">FREE SHIPPING</span>
            </p>
            <div className="h-1 bg-stone/15 overflow-hidden">
              <div
                className="h-full bg-ink transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </>
        ) : (
          <p className="text-sm font-medium flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-ink text-paper text-xs">✓</span>
            You've unlocked FREE SHIPPING
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8 md:gap-10">
        <div className="md:col-span-2 space-y-0">
          {activeItems.map((item) => (
            <CartRow key={item.id} item={item} updateItem={updateItem} removeItem={removeItem} />
          ))}

          {savedItems.length > 0 && (
            <div className="pt-8 mt-2">
              <h3 className="text-xs tracking-widest2 uppercase text-stone mb-4">Saved for Later</h3>
              {savedItems.map((item) => (
                <CartRow key={item.id} item={item} updateItem={updateItem} removeItem={removeItem} saved />
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="border border-stone/15 p-5 sm:p-6 h-fit sticky top-24">
          <h2 className="text-xs tracking-widest2 uppercase mb-5">Order Summary</h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-stone">Subtotal</span>
              <span>{formatINR(cart.subtotal)}</span>
            </div>
            <div className="text-stone text-xs">
              Shipping &amp; tax calculated at checkout
            </div>
          </div>
          <div className="border-t border-stone/15 pt-4 mt-4 flex justify-between font-medium">
            <span>Total</span>
            <span>{formatINR(cart.subtotal)}</span>
          </div>
          <Link to="/checkout" className="btn-primary w-full mt-5 text-center">
            Checkout
            <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
          <Link to="/shop" className="block text-center text-xs text-stone mt-3 hover:text-ink transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

function CartRow({ item, updateItem, removeItem, saved }) {
  return (
    <div className="flex gap-4 border-b border-stone/10 py-5 first:pt-0">
      <Link to={`/products/${item.product_slug}`} className="w-20 sm:w-24 h-28 sm:h-32 bg-beige shrink-0 overflow-hidden">
        {item.product_image_url && (
          <img src={item.product_image_url} alt={item.product_name} className="w-full h-full object-cover" />
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/products/${item.product_slug}`} className="text-sm font-medium hover:text-oxblood transition-colors line-clamp-1">
          {item.product_name}
        </Link>
        <p className="text-xs text-stone mt-1">
          {item.variant.color}
          {item.variant.blouse_size ? ` · Blouse: ${item.variant.blouse_size}` : ''}
        </p>
        <p className="text-sm font-medium mt-2">{formatINR(item.unit_price)}</p>

        {!saved && (
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center border border-stone/30">
              <button
                onClick={() => updateItem.mutate({ itemId: item.id, payload: { quantity: Math.max(1, item.quantity - 1) } })}
                className="px-2 py-1.5 hover:bg-beige/50 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={12} strokeWidth={1.5} />
              </button>
              <span className="px-3 text-sm min-w-[28px] text-center">{item.quantity}</span>
              <button
                onClick={() => updateItem.mutate({ itemId: item.id, payload: { quantity: item.quantity + 1 } })}
                className="px-2 py-1.5 hover:bg-beige/50 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={12} strokeWidth={1.5} />
              </button>
            </div>
            <button
              onClick={() => updateItem.mutate({ itemId: item.id, payload: { saved_for_later: true } })}
              className="text-xs text-stone underline underline-offset-4 hover:text-ink transition-colors"
            >
              Save for later
            </button>
          </div>
        )}

        {saved && (
          <button
            onClick={() => updateItem.mutate({ itemId: item.id, payload: { saved_for_later: false } })}
            className="text-xs text-oxblood underline underline-offset-4 mt-3 hover:text-ink transition-colors"
          >
            Move to cart
          </button>
        )}
      </div>
      <button
        onClick={() => removeItem.mutate(item.id)}
        aria-label="Remove item"
        className="text-stone hover:text-oxblood h-fit p-1 transition-colors"
      >
        <X size={16} strokeWidth={1.5} />
      </button>
    </div>
  )
}
