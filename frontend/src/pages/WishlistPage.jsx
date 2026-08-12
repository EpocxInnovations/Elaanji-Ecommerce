import { Link } from 'react-router-dom'
import { X, Heart, ArrowRight } from 'lucide-react'
import { useWishlist } from '../hooks/useWishlist'
import { useCart } from '../hooks/useCart'
import { formatINR } from '../utils/format'

export function WishlistPage() {
  const { wishlist, isLoading, removeItem } = useWishlist()
  const { addItem } = useCart()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="h-8 skeleton w-40 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="aspect-[3/4] skeleton mb-3" />
              <div className="h-3 skeleton w-2/3 mb-2" />
              <div className="h-3 skeleton w-1/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const items = wishlist?.items || []

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6 py-24 text-center">
        <div className="w-16 h-16 mx-auto mb-5 border border-stone/20 flex items-center justify-center">
          <Heart size={24} className="text-stone" strokeWidth={1} />
        </div>
        <h1 className="font-display text-3xl mb-3">Your Wishlist is Empty</h1>
        <p className="text-stone text-sm mb-8 max-w-xs mx-auto">
          Save sarees you love to find them here later.
        </p>
        <Link to="/shop" className="btn-primary">
          Shop Now
          <ArrowRight size={16} strokeWidth={1.5} />
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 md:py-12">
      <div className="flex items-end justify-between mb-8">
        <h1 className="font-display text-3xl">Wishlist</h1>
        <p className="text-sm text-stone">{items.length} item{items.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8">
        {items.map((item) => {
          const product = item.product
          const hasDiscount = product.discount_price && product.discount_price < product.price
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => removeItem.mutate(item.id)}
                aria-label="Remove from wishlist"
                className="absolute top-2.5 right-2.5 z-10 bg-paper/90 backdrop-blur-sm p-2
                           opacity-0 group-hover:opacity-100 transition-opacity hover:bg-paper"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
              <Link to={`/products/${product.slug}`} className="block">
                <div className="aspect-[3/4] bg-beige mb-3 overflow-hidden">
                  {product.primary_image_url && (
                    <img
                      src={product.primary_image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  )}
                </div>
                <h3 className="text-sm mb-1 line-clamp-2 group-hover:text-oxblood transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-sm font-medium">
                    {formatINR(hasDiscount ? product.discount_price : product.price)}
                  </span>
                  {hasDiscount && <span className="text-xs text-stone line-through">{formatINR(product.price)}</span>}
                </div>
              </Link>
              {!product.available && (
                <p className="text-xs text-oxblood">Out of stock</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
