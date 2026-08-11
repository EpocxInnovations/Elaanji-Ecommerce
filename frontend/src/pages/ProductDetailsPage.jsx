import { useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useProduct, useRelatedProducts } from '../hooks/useProducts'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import { useAuth } from '../context/AuthContext'
import { useDocumentMeta, useProductStructuredData } from '../hooks/useDocumentMeta'
import { useToast } from '../context/ToastContext'
import { ProductCard } from '../components/ProductCard'
import { formatINR, SAREE_TYPE_LABELS, OCCASION_LABELS } from '../utils/format'

export function ProductDetailsPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { data: product, isLoading } = useProduct(slug)
  const { data: related } = useRelatedProducts(slug)
  const { addItem } = useCart()
  const { showToast } = useToast()
  const { isWishlisted, addItem: addWish, removeItem: removeWish, findItemId } = useWishlist()

  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedBlouseSize, setSelectedBlouseSize] = useState(null)
  const [activeImage, setActiveImage] = useState(null)
  const [feedback, setFeedback] = useState('')

  const colors = useMemo(() => {
    if (!product) return []
    const seen = new Map()
    for (const v of product.variants) {
      if (!seen.has(v.color)) seen.set(v.color, v.color_hex)
    }
    return Array.from(seen.entries())
  }, [product])

  const activeColor = selectedColor || colors[0]?.[0]

  const blouseSizes = useMemo(() => {
    if (!product) return []
    return product.variants
      .filter((v) => v.color === activeColor && v.blouse_size)
      .map((v) => v.blouse_size)
  }, [product, activeColor])

  const matchingVariant = useMemo(() => {
    if (!product) return null
    return product.variants.find(
      (v) => v.color === activeColor && (blouseSizes.length === 0 || v.blouse_size === selectedBlouseSize)
    )
  }, [product, activeColor, selectedBlouseSize, blouseSizes])

  const colorImages = useMemo(() => {
    if (!product) return []
    const forColor = product.images.filter((i) => i.color === activeColor)
    return forColor.length > 0 ? forColor : product.images
  }, [product, activeColor])

  const displayImage = activeImage || colorImages[0]?.image_url

  useDocumentMeta({
    title: product ? `${product.name} | Elaanji` : 'Elaanji — The House of Saree',
    description: product?.description || 'Handpicked sarees for every occasion.',
    image: displayImage,
  })
  useProductStructuredData(product)

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-6 py-20 text-stone text-sm">Loading…</div>
  }

  if (!product) {
    return <div className="mx-auto max-w-7xl px-6 py-20 text-stone text-sm">Saree not found.</div>
  }

  const hasDiscount = product.discount_price && product.discount_price < product.price
  const price = hasDiscount ? product.discount_price : product.price
  const wishlisted = isAuthenticated && isWishlisted(product.id)
  const needsBlouseSize = blouseSizes.length > 0 && !selectedBlouseSize

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!matchingVariant || needsBlouseSize) {
      setFeedback('Please select a color' + (blouseSizes.length > 0 ? ' and blouse size.' : '.'))
      return
    }
    addItem.mutate(
      { variantId: matchingVariant.id, quantity: 1 },
      {
        onSuccess: () => showToast(`${product.name} added to cart`),
        onError: (err) => showToast(err.response?.data?.detail || 'Could not add to cart.', 'error'),
      }
    )
  }

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (wishlisted) {
      const itemId = findItemId(product.id)
      if (itemId) {
        removeWish.mutate(itemId, { onSuccess: () => showToast('Removed from wishlist') })
      }
    } else {
      addWish.mutate(product.id, { onSuccess: () => showToast('Added to wishlist') })
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Gallery */}
        <div>
          <div className="aspect-[3/4] bg-beige mb-3 overflow-hidden">
            {displayImage && <img src={displayImage} alt={product.name} className="w-full h-full object-cover" />}
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {colorImages.map((img) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(img.image_url)}
                className={`w-16 h-20 shrink-0 border ${displayImage === img.image_url ? 'border-ink' : 'border-transparent'}`}
              >
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          {product.saree_type && (
            <p className="label-eyebrow mb-2">{SAREE_TYPE_LABELS[product.saree_type] || product.saree_type}</p>
          )}
          <h1 className="font-display text-3xl mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl font-medium">{formatINR(price)}</span>
            {hasDiscount && <span className="text-sm text-stone line-through">{formatINR(product.price)}</span>}
          </div>

          {colors.length > 0 && (
            <div className="mb-6">
              <p className="text-xs tracking-widest2 uppercase text-stone mb-2">
                Color: <span className="text-ink normal-case">{activeColor}</span>
              </p>
              <div className="flex gap-2">
                {colors.map(([color, hex]) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color)
                      setSelectedBlouseSize(null)
                      setActiveImage(null)
                    }}
                    aria-label={color}
                    className={`w-9 h-9 rounded-full border-2 ${activeColor === color ? 'border-ink' : 'border-transparent'
                      }`}
                    style={{ backgroundColor: hex || '#ccc' }}
                  />
                ))}
              </div>
            </div>
          )}

          {blouseSizes.length > 0 && (
            <div className="mb-6">
              <p className="text-xs tracking-widest2 uppercase text-stone mb-2">Blouse Size</p>
              <div className="flex gap-2">
                {blouseSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedBlouseSize(size)}
                    className={`px-4 py-2 text-sm border ${selectedBlouseSize === size ? 'bg-ink text-paper border-ink' : 'border-stone/30'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingVariant && (
            <p className="text-xs text-stone mb-4">
              {matchingVariant.available_quantity > 0
                ? `${matchingVariant.available_quantity} in stock`
                : 'Out of stock for this option'}
            </p>
          )}

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={addItem.isPending || (matchingVariant && matchingVariant.available_quantity === 0)}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {addItem.isPending ? 'Adding…' : 'Add to Cart'}
            </button>
            <button
              onClick={handleWishlistToggle}
              aria-label="Toggle wishlist"
              className="btn-secondary px-4"
            >
              <Heart size={18} className={wishlisted ? 'fill-oxblood text-oxblood' : ''} />
            </button>
          </div>

          {feedback && <p className="text-sm text-stone mb-6">{feedback}</p>}

          <div className="border-t border-stone/20 pt-6 space-y-3 text-sm">
            {product.fabric && <p><span className="text-stone">Fabric:</span> {product.fabric}</p>}
            {product.border_type && <p><span className="text-stone">Border:</span> {product.border_type}</p>}
            {product.pallu_style && <p><span className="text-stone">Pallu:</span> {product.pallu_style}</p>}
            {product.work_type && <p><span className="text-stone">Work:</span> {product.work_type}</p>}
            {product.occasion && (
              <p><span className="text-stone">Occasion:</span> {OCCASION_LABELS[product.occasion] || product.occasion}</p>
            )}
            <p>
              <span className="text-stone">Blouse Piece:</span>{' '}
              {product.blouse_piece_included ? (product.blouse_stitched ? 'Included, stitched' : 'Included, unstitched') : 'Not included'}
            </p>
            {product.care_instructions && (
              <p><span className="text-stone">Care:</span> {product.care_instructions}</p>
            )}
          </div>

          {product.description && (
            <div className="border-t border-stone/20 pt-6 mt-6">
              <p className="text-sm text-ink/80 leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {related?.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}