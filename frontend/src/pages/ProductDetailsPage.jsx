import { useMemo, useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Heart, ShieldCheck, Truck, RotateCcw, ChevronDown, Minus, Plus, Check } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useProduct, useRelatedProducts } from '../hooks/useProducts'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import { useAuth } from '../context/AuthContext'
import { useDocumentMeta, useProductStructuredData } from '../hooks/useDocumentMeta'
import { useToast } from '../context/ToastContext'
import { ProductCard } from '../components/ProductCard'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { formatINR, SAREE_TYPE_LABELS, OCCASION_LABELS } from '../utils/format'


function AccordionSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-stone/15">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left group cursor-pointer"
        aria-expanded={open}
      >
        <span className="text-xs tracking-widest2 uppercase text-ink font-medium group-hover:text-gold transition-colors">{title}</span>
        <ChevronDown size={16} className={`text-stone transition-transform duration-200 ${open ? 'rotate-180 text-gold' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-stone">{label}</span>
      <span className="text-ink text-right font-medium">{value}</span>
    </div>
  )
}

export function ProductDetailsPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const variantParam = searchParams.get('variant') || searchParams.get('color')
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
  const [quantity, setQuantity] = useState(1)

  // Color variants grouped by unique color name
  const colorVariants = useMemo(() => {
    if (!product?.variants) return []
    const map = new Map()
    for (const v of product.variants) {
      if (!map.has(v.color)) {
        map.set(v.color, {
          color: v.color,
          color_hex: v.color_hex || v.color_code || '#C5A059',
          sku: v.sku,
          price_override: v.price_override,
          hasStock: v.available_quantity > 0 && v.is_active,
          variant: v,
        })
      } else {
        if (v.available_quantity > 0 && v.is_active) {
          map.get(v.color).hasStock = true
        }
      }
    }
    return Array.from(map.values())
  }, [product])

  // Derive initial/active color respecting URL query param first, then in-stock
  const activeColor = useMemo(() => {
    if (selectedColor) return selectedColor
    if (!colorVariants.length) return null
    if (variantParam) {
      const bySku = product?.variants?.find(
        (v) => v.sku.toLowerCase() === variantParam.toLowerCase() || v.id === variantParam
      )
      if (bySku) return bySku.color
      const byName = colorVariants.find(
        (c) => c.color.toLowerCase() === variantParam.toLowerCase()
      )
      if (byName) return byName.color
    }
    const inStockOption = colorVariants.find((c) => c.hasStock)
    return inStockOption ? inStockOption.color : colorVariants[0].color
  }, [selectedColor, colorVariants, variantParam, product])

  const blouseSizes = useMemo(() => {
    if (!product) return []
    return product.variants
      .filter((v) => v.color === activeColor && v.blouse_size)
      .map((v) => v.blouse_size)
  }, [product, activeColor])

  const matchingVariant = useMemo(() => {
    if (!product?.variants || !activeColor) return null
    const matchingColor = product.variants.filter((v) => v.color === activeColor)
    if (blouseSizes.length > 0 && selectedBlouseSize) {
      const withSize = matchingColor.find((v) => v.blouse_size === selectedBlouseSize)
      if (withSize) return withSize
    }
    return matchingColor.find((v) => v.available_quantity > 0) || matchingColor[0] || null
  }, [product, activeColor, selectedBlouseSize, blouseSizes])

  const colorImages = useMemo(() => {
    if (!product) return []
    if (matchingVariant?.images?.length > 0) {
      return matchingVariant.images
    }
    const forColor = product.images.filter(
      (i) => (matchingVariant && i.variant_id === matchingVariant.id) ||
             (i.color && activeColor && i.color.trim().toLowerCase() === activeColor.trim().toLowerCase())
    )
    return forColor.length > 0 ? forColor : product.images
  }, [product, matchingVariant, activeColor])

  const displayImage = activeImage || colorImages[0]?.image_url

  const handleColorSelect = (cv) => {
    setSelectedColor(cv.color)
    setSelectedBlouseSize(null)
    setActiveImage(null)
    setFeedback('')
    setSearchParams({ variant: cv.sku }, { replace: true })
  }

  useDocumentMeta({
    title: product ? `${product.name} | Elaanji` : 'Elaanji: The House of Saree',
    description: product?.description || 'Handpicked sarees for every occasion.',
    image: displayImage,
  })
  useProductStructuredData(product)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <div className="aspect-[3/4] skeleton mb-3" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => <div key={i} className="w-16 h-20 skeleton" />)}
            </div>
          </div>
          <div className="space-y-4 py-4">
            <div className="h-3 skeleton w-1/4" />
            <div className="h-6 skeleton w-3/4" />
            <div className="h-5 skeleton w-1/3" />
            <div className="h-12 skeleton w-full mt-6" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-24 text-center">
        <h1 className="font-display text-4xl mb-3">Saree Not Found</h1>
        <p className="text-stone text-sm mb-8">This product may no longer be available.</p>
        <Link to="/shop" className="btn-primary">Browse Collection</Link>
      </div>
    )
  }

  const basePrice = matchingVariant?.price_override != null ? Number(matchingVariant.price_override) : product.price
  const hasDiscount = matchingVariant?.price_override != null ? false : (product.discount_price && product.discount_price < product.price)
  const price = hasDiscount ? product.discount_price : basePrice
  const currentSku = matchingVariant?.sku || product.sku
  const wishlisted = isAuthenticated && isWishlisted(product.id)
  const needsBlouseSize = blouseSizes.length > 0 && !selectedBlouseSize
  const inStock = Boolean(matchingVariant && matchingVariant.available_quantity > 0 && matchingVariant.is_active)

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!matchingVariant || needsBlouseSize) {
      setFeedback('Please select a color' + (blouseSizes.length > 0 ? ' and blouse size.' : '.'))
      return
    }
    if (!inStock) {
      setFeedback('This color is currently out of stock.')
      return
    }
    addItem.mutate(
      { variantId: matchingVariant.id, quantity },
      {
        onSuccess: () => showToast(`${product.name} (${activeColor}) added to cart`),
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 md:py-12">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Shop', href: '/shop' }, { label: product.name }]} className="mb-8" />


      <div className="grid md:grid-cols-2 gap-10 md:gap-14">
        {/* ─── Gallery ─── */}
        <div>
          <div className="aspect-[3/4] bg-beige mb-4 overflow-hidden group cursor-crosshair relative shadow-card">
            {displayImage && (
              <motion.img
                key={displayImage}
                layoutId={displayImage === colorImages[0]?.image_url ? `product-image-${product.id}` : undefined}
                src={displayImage}
                alt={product.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            )}
            {/* Gold hairline */}
            <div className="absolute inset-0 border border-gold/15 pointer-events-none" />
          </div>
          {colorImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {colorImages.map((img) => (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  key={img.id}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`w-16 h-20 shrink-0 overflow-hidden transition-all duration-200 cursor-pointer ${
                    displayImage === img.image_url
                      ? 'ring-2 ring-gold ring-offset-2 opacity-100'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Product Info ─── */}
        <div className="md:py-2">
          {product.saree_type && (
            <p className="label-eyebrow-gold mb-2">
              {SAREE_TYPE_LABELS[product.saree_type] || product.saree_type}
            </p>
          )}
          <h1 className="font-display text-3xl sm:text-4xl mb-2 leading-snug">{product.name}</h1>
          <p className="text-[11px] font-mono tracking-widest text-stone uppercase mb-5">SKU: {currentSku}</p>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-7 flex-wrap">
            <span className="text-3xl font-semibold tracking-tight">{formatINR(price)}</span>
            {hasDiscount && (
              <>
                <span className="text-sm text-stone line-through">{formatINR(product.price)}</span>
                <span className="text-xs bg-oxblood/10 text-oxblood px-2.5 py-0.5 tracking-wide uppercase font-semibold">
                  {Math.round(((product.price - product.discount_price) / product.price) * 100)}% off
                </span>
              </>
            )}
            {matchingVariant?.price_override != null && (
              <span className="text-[11px] bg-gold/15 text-ink-deep px-2 py-0.5 tracking-wider uppercase font-medium">
                Color Pricing
              </span>
            )}
          </div>

          {/* Color Selector */}
          {colorVariants.length > 0 && (
            <div className="mb-7">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs tracking-widest2 uppercase text-stone">
                  Color:{' '}
                  <span className="text-ink normal-case tracking-normal font-medium">{activeColor}</span>
                  {!inStock && (
                    <span className="ml-2 text-oxblood font-semibold tracking-normal text-[11px]">
                      (Out of Stock)
                    </span>
                  )}
                </p>
                <span className="text-[11px] text-stone">
                  {colorVariants.length} {colorVariants.length === 1 ? 'Color' : 'Colors'}
                </span>
              </div>

              <div className="flex flex-wrap gap-3.5" role="radiogroup" aria-label="Color Variants">
                {colorVariants.map((cv) => {
                  const isSelected = activeColor === cv.color
                  const isOut = !cv.hasStock
                  return (
                    <motion.button
                      key={cv.color}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${cv.color}${isOut ? ' - Out of Stock' : ''}`}
                      title={`${cv.color}${isOut ? ' (Out of Stock)' : ' (In Stock)'}`}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleColorSelect(cv)}
                      className={`relative w-10 h-10 rounded-full border transition-all duration-200 cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? 'border-gold ring-2 ring-gold ring-offset-2 ring-offset-paper scale-105 shadow-gold-glow'
                          : 'border-stone/30 hover:border-gold/60'
                      } ${isOut ? 'opacity-70' : ''}`}
                      style={{ backgroundColor: cv.color_hex }}
                    >
                      {/* Active check */}
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-paper/90 flex items-center justify-center shadow-sm">
                          <Check size={11} className="text-ink" strokeWidth={3} />
                        </span>
                      )}

                      {/* Out of Stock Diagonal Slash */}
                      {isOut && !isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="w-full h-0.5 bg-oxblood/80 -rotate-45" />
                        </span>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Blouse Size */}
          {blouseSizes.length > 0 && (
            <div className="mb-7">
              <p className="text-xs tracking-widest2 uppercase text-stone mb-3">Blouse Size</p>
              <div className="flex flex-wrap gap-2.5">
                {blouseSizes.map((size) => (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    key={size}
                    onClick={() => setSelectedBlouseSize(size)}
                    className={`px-5 py-2.5 text-sm border transition-all duration-150 cursor-pointer ${
                      selectedBlouseSize === size
                        ? 'bg-gold-gradient text-ink-deep border-transparent font-semibold shadow-gold-glow'
                        : 'border-stone/30 hover:border-gold'
                    }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Availability */}
          {matchingVariant && (
            <div className="mb-6 flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full shrink-0 ${inStock ? (matchingVariant.available_quantity <= 5 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-600') : 'bg-oxblood'}`} />
              <span className={inStock ? (matchingVariant.available_quantity <= 5 ? 'text-amber-800 font-medium' : 'text-stone') : 'text-oxblood font-semibold'}>
                {inStock
                  ? matchingVariant.available_quantity <= 5
                    ? `Only ${matchingVariant.available_quantity} left in stock — order soon`
                    : 'In stock · Ready to dispatch'
                  : 'Currently out of stock in this color'}
              </span>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex gap-2 sm:gap-3 mb-5">
            <div className="flex items-center border border-stone/30 shrink-0">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-2.5 py-2.5 sm:px-3.5 sm:py-3.5 hover:bg-beige/50 transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus size={13} strokeWidth={1.5} />
              </motion.button>
              <span className="px-2.5 sm:px-4 text-xs sm:text-sm min-w-[24px] sm:min-w-[32px] text-center font-medium">{quantity}</span>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setQuantity(quantity + 1)}
                className="px-2.5 py-2.5 sm:px-3.5 sm:py-3.5 hover:bg-beige/50 transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus size={13} strokeWidth={1.5} />
              </motion.button>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={addItem.isPending || !inStock}
              className={`btn-primary flex-1 !px-4 sm:!px-8 text-center ${
                !inStock ? '!bg-stone/20 !text-stone !border-stone/20 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {addItem.isPending ? 'Adding…' : !inStock ? 'Out of Stock' : 'Add to Bag'}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlistToggle}
              aria-label="Toggle wishlist"
              className="btn-secondary !px-3 sm:!px-4 cursor-pointer shrink-0"
            >
              <Heart size={18} strokeWidth={1.5} className={wishlisted ? 'fill-oxblood text-oxblood' : ''} />
            </motion.button>
          </div>

          {feedback && <p className="text-sm text-oxblood mb-4">{feedback}</p>}

          {/* Trust Signals */}
          <div className="flex flex-wrap gap-x-8 gap-y-2 py-5 border-t border-stone/10 mb-2">
            <div className="flex items-center gap-2 text-xs text-stone">
              <ShieldCheck size={15} strokeWidth={1.5} className="text-gold" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone">
              <Truck size={15} strokeWidth={1.5} className="text-gold" />
              <span>Free Shipping ₹999+</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone">
              <RotateCcw size={15} strokeWidth={1.5} className="text-gold" />
              <span>Easy Returns</span>
            </div>
          </div>

          {/* Accordion Details */}
          <div className="border-t border-stone/15">
            <AccordionSection title="Product Details" defaultOpen={true}>
              <div className="divide-y divide-stone/10">
                <DetailRow label="Fabric" value={product.fabric} />
                <DetailRow label="Border" value={product.border_type} />
                <DetailRow label="Pallu" value={product.pallu_style} />
                <DetailRow label="Work" value={product.work_type} />
                <DetailRow label="Occasion" value={product.occasion ? (OCCASION_LABELS[product.occasion] || product.occasion) : null} />
                <DetailRow
                  label="Blouse Piece"
                  value={
                    product.blouse_piece_included
                      ? product.blouse_stitched
                        ? 'Included, stitched'
                        : 'Included, unstitched'
                      : 'Not included'
                  }
                />
              </div>
            </AccordionSection>

            {product.description && (
              <AccordionSection title="Description">
                <p className="text-sm text-ink/80 leading-relaxed">{product.description}</p>
              </AccordionSection>
            )}

            {product.care_instructions && (
              <AccordionSection title="Care Instructions">
                <p className="text-sm text-ink/80 leading-relaxed">{product.care_instructions}</p>
              </AccordionSection>
            )}
          </div>
        </div>
      </div>

      {/* ─── Mobile Sticky CTA ─── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-xl border-t border-stone/15 px-4 py-3 z-30 shadow-luxury">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{product.name}</p>
            <p className="text-sm tracking-tight font-semibold">{formatINR(price)}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={addItem.isPending || (matchingVariant && !inStock)}
            className="btn-primary text-xs !py-2.5 !px-5 whitespace-nowrap shrink-0"
          >
            {addItem.isPending ? 'Adding…' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* ─── Related Products ─── */}
      {related?.length > 0 && (
        <section className="mt-16 md:mt-28 pb-28 md:pb-0">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="label-eyebrow mb-3 flex items-center gap-3">
                <span className="w-8 h-px bg-gold/60" />
                Complete The Look
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-ink">You May Also Like</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
