import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { formatINR, SAREE_TYPE_LABELS } from '../utils/format'
import { useWishlist } from '../hooks/useWishlist'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export function ProductCard({ product }) {
  const { isAuthenticated } = useAuth()
  const { isWishlisted, addItem, removeItem, findItemId } = useWishlist()
  const { showToast } = useToast()
  const wishlisted = isAuthenticated && isWishlisted(product.id)

  const handleWishlistToggle = (e) => {
    e.preventDefault()
    if (!isAuthenticated) return
    if (wishlisted) {
      const itemId = findItemId(product.id)
      if (itemId) removeItem.mutate(itemId, { onSuccess: () => showToast('Removed from wishlist') })
    } else {
      addItem.mutate(product.id, { onSuccess: () => showToast('Added to wishlist') })
    }
  }

  const hasDiscount = product.discount_price && product.discount_price < product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] bg-beige overflow-hidden mb-3">
        {product.primary_image_url && (
          <img
            src={product.primary_image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-500 ease-out
                       group-hover:opacity-0 group-hover:scale-[1.02]"
            loading="lazy"
          />
        )}
        {product.hover_image_url && (
          <img
            src={product.hover_image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-0
                       transition-all duration-500 ease-out
                       group-hover:opacity-100 group-hover:scale-[1.02]"
            loading="lazy"
          />
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {!product.available && (
            <span className="bg-ink/90 text-paper text-[10px] px-2 py-1 tracking-widest2 uppercase backdrop-blur-sm">
              Sold Out
            </span>
          )}
          {hasDiscount && product.available && (
            <span className="bg-oxblood text-paper text-[10px] px-2 py-1 tracking-widest2 uppercase">
              {discountPercent}% Off
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlistToggle}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2.5 right-2.5 bg-paper/90 backdrop-blur-sm p-2
                     opacity-0 group-hover:opacity-100 transition-all duration-200
                     hover:bg-paper active:scale-95"
        >
          <Heart
            size={15}
            strokeWidth={1.5}
            className={wishlisted ? 'fill-oxblood text-oxblood' : 'text-ink'}
          />
        </button>

        {/* Subtle bottom gradient for depth */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-ink/[0.03] to-transparent pointer-events-none" />
      </div>

      {/* Info */}
      <div className="space-y-1">
        {product.saree_type && (
          <p className="text-[10px] text-stone uppercase tracking-widest2 leading-none">
            {SAREE_TYPE_LABELS[product.saree_type] || product.saree_type}
          </p>
        )}
        <h3 className="text-sm text-ink leading-snug line-clamp-2 group-hover:text-oxblood transition-colors duration-200">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-sm font-medium tracking-tight">
            {formatINR(hasDiscount ? product.discount_price : product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-stone line-through">
              {formatINR(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}