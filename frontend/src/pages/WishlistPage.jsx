import { Link } from 'react-router-dom'
import { X, Heart, ArrowRight } from 'lucide-react'
import { useWishlist } from '../hooks/useWishlist'
import { useCart } from '../hooks/useCart'
import { formatINR } from '../utils/format'
import { Breadcrumbs } from '../components/Breadcrumbs'

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
        <div className="w-20 h-20 mx-auto mb-6 frame-gold flex items-center justify-center">
          <Heart size={28} className="text-gold" strokeWidth={1} />
        </div>
        <h1 className="font-display text-4xl mb-3">Your Wishlist is Empty</h1>
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
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 md:py-14">
      <Breadcrumbs items={[{ label: 'Wishlist' }]} className="mb-6" />

      <div className="flex items-end justify-between mb-10">

        <div>
          <p className="label-eyebrow mb-3 flex items-center gap-3">
            <span className="w-8 h-px bg-gold/60" />
            Saved For Later
          </p>
          <h1 className="font-display text-4xl md:text-5xl">Wishlist</h1>
        </div>
        <p className="text-sm text-stone pb-2">{items.length} item{items.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-10">
        {items.map((item) => {
          const product = item.product
          const hasDiscount = product.discount_price && product.discount_price < product.price
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => removeItem.mutate(item.id)}
                aria-label="Remove from wishlist"
                className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 glass-light p-1.5 sm:p-2
                           opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:shadow-gold-glow cursor-pointer"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
              <Link to={`/products/${product.slug}`} className="block">
                <div className="aspect-[3/4] bg-beige mb-3 overflow-hidden shadow-card group-hover:shadow-luxury transition-shadow duration-500 relative">
                  {product.primary_image_url && (
                    <img
                      src={product.primary_image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/25 transition-colors duration-500 pointer-events-none" />
                </div>
                <h3 className="font-display text-base mb-1 line-clamp-2 group-hover:text-oxblood transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-sm font-semibold">
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
