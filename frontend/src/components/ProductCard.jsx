import { Link, useNavigate } from 'react-router-dom'
import { Heart, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatINR, SAREE_TYPE_LABELS } from '../utils/format'
import { useWishlist } from '../hooks/useWishlist'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { bounceSpring, luxuryEase } from '../utils/motion'

export function ProductCard({ product, priority = false }) {
  const navigate = useNavigate()
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

  const colorVariants = product.color_variants || []

  return (
    <Link to={`/products/${product.slug}`} className="group block transform-gpu">
      <div className="relative aspect-[3/4] bg-beige overflow-hidden mb-4 shadow-card group-hover:shadow-luxury transition-shadow duration-500">
        {product.primary_image_url && (
          <motion.img
            layoutId={`product-image-${product.id}`}
            src={product.primary_image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-opacity duration-500 ease-out group-hover:opacity-0"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.6, ease: luxuryEase }}
            loading={priority ? 'eager' : 'lazy'}
            fetchpriority={priority ? 'high' : 'auto'}
            referrerPolicy="no-referrer"
          />
        )}
        {product.hover_image_url && (
          <motion.img
            src={product.hover_image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.6, ease: luxuryEase }}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Gold hairline frame */}
        <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/25 transition-colors duration-500 pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {!product.available && (
            <span className="bg-ink/90 text-paper text-[10px] px-2.5 py-1 tracking-widest2 uppercase backdrop-blur-sm">
              Sold Out
            </span>
          )}
          {hasDiscount && product.available && (
            <span className="bg-oxblood-gradient text-paper text-[10px] px-2.5 py-1 tracking-widest2 uppercase shadow-md">
              {discountPercent}% Off
            </span>
          )}
        </div>

        {/* Wishlist */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={handleWishlistToggle}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 glass-light p-1.5 sm:p-2 z-10
                     opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300
                     hover:shadow-gold-glow cursor-pointer"
        >
          <motion.div
            animate={{ scale: wishlisted ? [1, 1.35, 1] : 1 }}
            transition={bounceSpring}
          >
            <Heart
              size={15}
              strokeWidth={1.5}
              className={wishlisted ? 'fill-oxblood text-oxblood' : 'text-ink'}
            />
          </motion.div>
        </motion.button>

        {/* Quick view hint */}
        <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <div className="flex items-center justify-center gap-2 bg-ink/90 backdrop-blur-sm text-paper text-[10px] tracking-widest2 uppercase py-2.5">
            <Eye size={13} strokeWidth={1.5} className="text-gold-soft" />
            View Product
          </div>
        </div>

        {/* Subtle bottom gradient for depth */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-ink/[0.05] to-transparent pointer-events-none" />
      </div>

      {/* Info */}
      <div className="space-y-1.5 px-0.5">
        {product.saree_type && (
          <p className="text-[10px] text-gold uppercase tracking-widest2 leading-none font-medium">
            {SAREE_TYPE_LABELS[product.saree_type] || product.saree_type}
          </p>
        )}
        <h3 className="font-display text-base text-ink leading-snug line-clamp-2 group-hover:text-oxblood transition-colors duration-200">
          {product.name}
        </h3>

        {/* Color Swatches if product has multiple colors */}
        {colorVariants.length > 1 && (
          <div className="flex items-center gap-1.5 pt-0.5 pb-1">
            <div className="flex items-center gap-1">
              {colorVariants.slice(0, 4).map((cv) => (
                <button
                  key={cv.id}
                  type="button"
                  title={`${cv.color}${cv.available ? '' : ' (Out of stock)'}`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    navigate(`/products/${product.slug}?variant=${cv.sku}`)
                  }}
                  className={`w-3.5 h-3.5 rounded-full border border-stone/30 shrink-0 transition-transform hover:scale-125 cursor-pointer relative ${
                    !cv.available ? 'opacity-40' : ''
                  }`}
                  style={{ backgroundColor: cv.color_hex || '#c5a059' }}
                />
              ))}
            </div>
            {colorVariants.length > 4 && (
              <span className="text-[10px] text-stone">+{colorVariants.length - 4}</span>
            )}
            <span className="text-[10px] text-stone tracking-wide">
              {colorVariants.length} colors
            </span>
          </div>
        )}

        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-sm font-semibold tracking-tight">
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
