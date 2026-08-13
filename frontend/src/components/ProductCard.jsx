import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { formatINR, SAREE_TYPE_LABELS } from '../utils/format'
import { useWishlist } from '../hooks/useWishlist'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { SPRING_LUXURY, EASE_EXPO_OUT } from '../utils/motion'

export function ProductCard({ product }) {
  const { isAuthenticated } = useAuth()
  const { isWishlisted, addItem, removeItem, findItemId } = useWishlist()
  const { showToast } = useToast()
  const wishlisted = isAuthenticated && isWishlisted(product.id)

  const handleWishlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
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
    <Link to={`/products/${product.slug}`} className="group block relative">
      <motion.div
        className="relative aspect-[3/4] bg-beige overflow-hidden mb-3.5"
        whileHover="hover"
        initial="rest"
      >
        {/* Primary Image with Silk Zoom & Shared Element layoutId */}
        {product.primary_image_url && (
          <motion.img
            layoutId={`product-image-${product.id}`}
            src={product.primary_image_url}
            alt={product.name}
            variants={{
              rest: { scale: 1 },
              hover: { scale: 1.06, transition: { duration: 0.8, ease: EASE_EXPO_OUT } },
            }}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}

        {/* Hover Secondary Image (Unfolding Curtain Clip-Path Wipe) */}
        {product.hover_image_url && (
          <motion.img
            src={product.hover_image_url}
            alt=""
            variants={{
              rest: { opacity: 0, scale: 1.04 },
              hover: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE_EXPO_OUT } },
            }}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {!product.available && (
            <span className="bg-ink/90 text-paper text-[9px] px-2 py-1 tracking-widest2 uppercase backdrop-blur-sm font-medium">
              Sold Out
            </span>
          )}
          {hasDiscount && product.available && (
            <span className="bg-oxblood text-paper text-[9px] px-2 py-1 tracking-widest2 uppercase font-medium shadow-sm">
              {discountPercent}% Off
            </span>
          )}
        </div>

        {/* Wishlist Button with Spring Physics */}
        <motion.button
          onClick={handleWishlistToggle}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={SPRING_LUXURY}
          className="absolute top-3 right-3 z-10 bg-paper/90 backdrop-blur-md p-2.5
                     shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300
                     hover:bg-paper cursor-pointer"
        >
          <Heart
            size={14}
            strokeWidth={1.5}
            className={wishlisted ? 'fill-oxblood text-oxblood' : 'text-ink'}
          />
        </motion.button>

        {/* Quick View Bar */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-ink/90 text-paper text-[10px] uppercase tracking-widest2 py-2.5 text-center backdrop-blur-md transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out font-medium">
          Explore Drape Details →
        </div>

        {/* Subtle Bottom Vignette Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </motion.div>

      {/* Info Section */}
      <div className="space-y-1 transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
        {product.saree_type && (
          <p className="text-[10px] text-stone uppercase tracking-widest2 leading-none font-medium">
            {SAREE_TYPE_LABELS[product.saree_type] || product.saree_type}
          </p>
        )}
        <h3 className="text-sm font-body text-ink leading-snug line-clamp-2 group-hover:text-oxblood transition-colors duration-300">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-sm font-medium tracking-tight text-ink">
            {formatINR(hasDiscount ? product.discount_price : product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-stone line-through font-normal">
              {formatINR(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}