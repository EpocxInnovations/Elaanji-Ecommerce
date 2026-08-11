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
            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
            loading="lazy"
          />
        )}
        {product.hover_image_url && (
          <img
            src={product.hover_image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            loading="lazy"
          />
        )}

        {!product.available && (
          <span className="absolute top-3 left-3 bg-ink text-paper text-xs px-2 py-1 tracking-wide uppercase">
            Out of Stock
          </span>
        )}
        {hasDiscount && product.available && (
          <span className="absolute top-3 left-3 bg-oxblood text-paper text-xs px-2 py-1 tracking-wide uppercase">
            {discountPercent}% OFF
          </span>
        )}

        <button
          onClick={handleWishlistToggle}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 bg-paper/90 p-2 rounded-full hover:bg-paper transition-colors"
        >
          <Heart size={16} className={wishlisted ? 'fill-oxblood text-oxblood' : 'text-ink'} />
        </button>
      </div>

      <div>
        {product.saree_type && (
          <p className="text-xs text-stone uppercase tracking-wide mb-1">
            {SAREE_TYPE_LABELS[product.saree_type] || product.saree_type}
          </p>
        )}
        <h3 className="text-sm text-ink mb-1 line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {formatINR(hasDiscount ? product.discount_price : product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-stone line-through">{formatINR(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}