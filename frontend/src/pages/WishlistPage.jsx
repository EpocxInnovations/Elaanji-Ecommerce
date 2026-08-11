import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useWishlist } from '../hooks/useWishlist'
import { useCart } from '../hooks/useCart'
import { formatINR } from '../utils/format'

export function WishlistPage() {
  const { wishlist, isLoading, removeItem } = useWishlist()
  const { addItem } = useCart()

  if (isLoading) {
    return <div className="mx-auto max-w-5xl px-6 py-20 text-stone text-sm">Loading your wishlist…</div>
  }

  const items = wishlist?.items || []

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Your Wishlist is Empty</h1>
        <p className="text-stone text-sm mb-8">Save sarees you love to find them here later.</p>
        <Link to="/shop" className="btn-primary">Shop Now</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-3xl mb-8">Wishlist</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
        {items.map((item) => {
          const product = item.product
          const hasDiscount = product.discount_price && product.discount_price < product.price
          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => removeItem.mutate(item.id)}
                aria-label="Remove from wishlist"
                className="absolute top-2 right-2 z-10 bg-paper/90 p-1.5 rounded-full"
              >
                <X size={14} />
              </button>
              <Link to={`/products/${product.slug}`} className="block">
                <div className="aspect-[3/4] bg-beige mb-3 overflow-hidden">
                  {product.primary_image_url && (
                    <img src={product.primary_image_url} alt={product.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <h3 className="text-sm mb-1 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium">
                    {formatINR(hasDiscount ? product.discount_price : product.price)}
                  </span>
                  {hasDiscount && <span className="text-xs text-stone line-through">{formatINR(product.price)}</span>}
                </div>
              </Link>
              {!product.available && <p className="text-xs text-oxblood">Out of stock</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
