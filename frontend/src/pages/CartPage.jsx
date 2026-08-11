import { Link } from 'react-router-dom'
import { Minus, Plus, X } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { formatINR } from '../utils/format'

export function CartPage() {
  const { cart, isLoading, updateItem, removeItem } = useCart()

  if (isLoading) {
    return <div className="mx-auto max-w-5xl px-6 py-20 text-stone text-sm">Loading your cart…</div>
  }

  const activeItems = cart?.items?.filter((i) => !i.saved_for_later) || []
  const savedItems = cart?.items?.filter((i) => i.saved_for_later) || []

  if (activeItems.length === 0 && savedItems.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Your Cart is Empty</h1>
        <p className="text-stone text-sm mb-8">Browse our collection to find your perfect saree.</p>
        <Link to="/shop" className="btn-primary">Shop Now</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-3xl mb-8">Shopping Cart</h1>

      {cart.amount_remaining_for_free_shipping > 0 ? (
        <div className="bg-beige px-4 py-3 text-sm mb-8">
          Add {formatINR(cart.amount_remaining_for_free_shipping)} more to get{' '}
          <span className="font-medium">FREE SHIPPING</span>
        </div>
      ) : (
        <div className="bg-beige px-4 py-3 text-sm mb-8 font-medium">
          You've unlocked FREE SHIPPING 🎉
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-6">
          {activeItems.map((item) => (
            <CartRow key={item.id} item={item} updateItem={updateItem} removeItem={removeItem} />
          ))}

          {savedItems.length > 0 && (
            <div className="pt-6 border-t border-stone/20">
              <h3 className="text-sm tracking-widest2 uppercase text-stone mb-4">Saved for Later</h3>
              {savedItems.map((item) => (
                <CartRow key={item.id} item={item} updateItem={updateItem} removeItem={removeItem} saved />
              ))}
            </div>
          )}
        </div>

        <div className="border border-stone/20 p-6 h-fit">
          <h2 className="text-sm tracking-widest2 uppercase mb-4">Order Summary</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-stone">Subtotal</span>
            <span>{formatINR(cart.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4 text-stone">
            <span>Shipping &amp; tax calculated at checkout</span>
          </div>
          <div className="border-t border-stone/20 pt-4 flex justify-between font-medium mb-6">
            <span>Total</span>
            <span>{formatINR(cart.subtotal)}</span>
          </div>
          <Link to="/checkout" className="btn-primary w-full block text-center">
            Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}

function CartRow({ item, updateItem, removeItem, saved }) {
  return (
    <div className="flex gap-4 border-b border-stone/10 pb-6">
      <div className="w-24 h-32 bg-beige shrink-0 overflow-hidden">
        {item.product_image_url && (
          <img src={item.product_image_url} alt={item.product_name} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1">
        <Link to={`/products/${item.product_slug}`} className="text-sm font-medium hover:text-oxblood">
          {item.product_name}
        </Link>
        <p className="text-xs text-stone mt-1">
          {item.variant.color}
          {item.variant.blouse_size ? ` · Blouse: ${item.variant.blouse_size}` : ''}
        </p>
        <p className="text-sm font-medium mt-2">{formatINR(item.unit_price)}</p>

        {!saved && (
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center border border-stone/30">
              <button
                onClick={() => updateItem.mutate({ itemId: item.id, payload: { quantity: Math.max(1, item.quantity - 1) } })}
                className="px-2 py-1"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="px-3 text-sm">{item.quantity}</span>
              <button
                onClick={() => updateItem.mutate({ itemId: item.id, payload: { quantity: item.quantity + 1 } })}
                className="px-2 py-1"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={() => updateItem.mutate({ itemId: item.id, payload: { saved_for_later: true } })}
              className="text-xs text-stone underline underline-offset-4"
            >
              Save for later
            </button>
          </div>
        )}

        {saved && (
          <button
            onClick={() => updateItem.mutate({ itemId: item.id, payload: { saved_for_later: false } })}
            className="text-xs text-oxblood underline underline-offset-4 mt-3"
          >
            Move to cart
          </button>
        )}
      </div>
      <button onClick={() => removeItem.mutate(item.id)} aria-label="Remove item" className="text-stone hover:text-oxblood h-fit">
        <X size={18} />
      </button>
    </div>
  )
}
