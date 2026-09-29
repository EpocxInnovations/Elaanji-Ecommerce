import { useRef } from 'react'
import { Trash2, Plus, Sparkles, Upload, X, AlertCircle } from 'lucide-react'

export function VariantBuilder({
  variants,
  onChange,
  blouseStitched,
  productId,
  baseSku = '',
  basePrice = '',
  isEditing = false,
  allImages = [],
  onUploadImage,
  onDeleteImage,
  isUploading = false,
}) {
  const fileInputRefs = useRef({})

  const updateVariant = (index, field, value) => {
    const next = [...variants]
    next[index] = { ...next[index], [field]: value }
    onChange(next)
  }

  const addVariant = () => {
    const nextIndex = variants.length + 1
    const defaultColor = ''
    const generatedSku = baseSku
      ? `${baseSku.trim()}-V${nextIndex}`
      : `VAR-${nextIndex}`

    onChange([
      ...variants,
      {
        sku: generatedSku,
        color: defaultColor,
        color_hex: '#800020', // luxury deep maroon default
        blouse_size: '',
        price_override: '',
        stock_quantity: 10,
        low_stock_threshold: 5,
        is_active: true,
      },
    ])
  }

  const removeVariant = (index) => {
    onChange(variants.filter((_, i) => i !== index))
  }

  const autoGenerateSku = (index) => {
    const v = variants[index]
    const colorPart = (v.color || 'VAR')
      .trim()
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 3) || 'VAR'
    const prefix = baseSku ? baseSku.trim().toUpperCase() : 'ELN'
    const sizePart = blouseStitched && v.blouse_size ? `-${v.blouse_size.toUpperCase()}` : ''
    const generated = `${prefix}-${colorPart}${sizePart}-${String(index + 1).padStart(2, '0')}`
    updateVariant(index, 'sku', generated)
  }

  // Duplicate checks
  const colorCounts = variants.reduce((acc, v) => {
    const key = `${(v.color || '').trim().toLowerCase()}_${(v.blouse_size || '').trim().toLowerCase()}`
    if (v.color) acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const skuCounts = variants.reduce((acc, v) => {
    const key = (v.sku || '').trim().toUpperCase()
    if (v.sku) acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const handleVariantFileChange = (index, variant, e) => {
    const file = e.target.files?.[0]
    if (file && onUploadImage) {
      onUploadImage({
        file,
        color: variant.color,
        variantId: variant.id || null,
      })
    }
    e.target.value = ''
  }

  return (
    <div className="space-y-6">
      {variants.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-stone/20 rounded-xl bg-stone/[0.02]">
          <p className="text-sm text-stone mb-3">No color variants added yet.</p>
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-2 btn-secondary !py-2 !px-4 text-xs font-medium"
          >
            <Plus size={15} /> Add First Color Variant
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {variants.map((v, idx) => {
            const colorKey = `${(v.color || '').trim().toLowerCase()}_${(v.blouse_size || '').trim().toLowerCase()}`
            const isDuplicateColor = v.color && colorCounts[colorKey] > 1
            const isDuplicateSku = v.sku && skuCounts[(v.sku || '').trim().toUpperCase()] > 1

            // Variant images: directly matched by variant_id or color fallback
            const variantImages = isEditing
              ? allImages.filter(
                  (img) =>
                    img.variant_id === v.id ||
                    (!img.variant_id &&
                      img.color &&
                      v.color &&
                      img.color.trim().toLowerCase() === v.color.trim().toLowerCase())
                )
              : []

            return (
              <div
                key={v.id || idx}
                className={`border rounded-xl p-4 sm:p-5 transition-all ${
                  v.is_active !== false
                    ? 'border-stone/25 bg-paper shadow-sm'
                    : 'border-stone/20 bg-stone/[0.04] opacity-75'
                }`}
              >
                {/* Variant Header */}
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-stone/15">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full border border-stone/30 shadow-inner shrink-0"
                      style={{ backgroundColor: v.color_hex || '#000000' }}
                      title={`Hex: ${v.color_hex || '#000000'}`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-ink">
                          {v.color || `Variant #${idx + 1}`}
                        </span>
                        {v.blouse_size && (
                          <span className="text-xs px-2 py-0.5 bg-beige rounded text-stone font-mono">
                            Size: {v.blouse_size}
                          </span>
                        )}
                        {v.sku && (
                          <span className="text-xs font-mono text-stone bg-stone/10 px-2 py-0.5 rounded">
                            {v.sku}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-stone cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={v.is_active !== false}
                        onChange={(e) => updateVariant(idx, 'is_active', e.target.checked)}
                        className="accent-oxblood rounded cursor-pointer"
                      />
                      <span>Active</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="p-1.5 text-stone hover:text-oxblood hover:bg-oxblood/10 rounded transition-colors"
                      title={v.id ? 'Remove variant (deactivates if orders exist)' : 'Remove variant'}
                      aria-label="Remove variant"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Warnings */}
                {isDuplicateColor && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg mb-4">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>Duplicate color name detected. Ensure each variant represents a unique color option.</span>
                  </div>
                )}
                {isDuplicateSku && (
                  <div className="flex items-center gap-2 text-xs text-oxblood bg-oxblood/10 border border-oxblood/20 px-3 py-2 rounded-lg mb-4">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>Duplicate SKU detected! Every variant must have a globally unique SKU.</span>
                  </div>
                )}

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                  {/* Color Name */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone mb-1">
                      Color Name <span className="text-oxblood">*</span>
                    </label>
                    <input
                      required
                      placeholder="e.g. Royal Blue"
                      value={v.color}
                      onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                      className="w-full border border-stone/30 px-3 py-1.5 text-xs sm:text-sm bg-paper rounded-lg focus:outline-none focus:border-oxblood focus:ring-1 focus:ring-oxblood"
                    />
                  </div>

                  {/* Color Hex Swatch */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone mb-1">
                      Color Hex Code
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={v.color_hex || '#000000'}
                        onChange={(e) => updateVariant(idx, 'color_hex', e.target.value)}
                        className="w-10 h-8 border border-stone/30 rounded cursor-pointer p-0.5 bg-paper shrink-0"
                      />
                      <input
                        type="text"
                        placeholder="#000000"
                        value={v.color_hex || ''}
                        onChange={(e) => updateVariant(idx, 'color_hex', e.target.value)}
                        className="w-full font-mono text-xs border border-stone/30 px-2 py-1.5 bg-paper rounded-lg uppercase"
                        maxLength={7}
                      />
                    </div>
                  </div>

                  {/* SKU with Auto Generate */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-stone">
                        SKU <span className="text-oxblood">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => autoGenerateSku(idx)}
                        className="text-[10px] text-oxblood hover:underline flex items-center gap-1 font-medium"
                        title="Auto generate SKU from base SKU and color"
                      >
                        <Sparkles size={11} /> Auto
                      </button>
                    </div>
                    <input
                      required
                      placeholder="e.g. KAN-BLU-01"
                      value={v.sku}
                      onChange={(e) => updateVariant(idx, 'sku', e.target.value.toUpperCase())}
                      className="w-full font-mono uppercase border border-stone/30 px-3 py-1.5 text-xs sm:text-sm bg-paper rounded-lg focus:outline-none focus:border-oxblood focus:ring-1 focus:ring-oxblood"
                    />
                  </div>

                  {/* Price Override */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone mb-1">
                      Price Override (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      placeholder={basePrice ? `Base: ₹${basePrice}` : 'Optional (₹)'}
                      value={v.price_override ?? ''}
                      onChange={(e) =>
                        updateVariant(
                          idx,
                          'price_override',
                          e.target.value === '' ? null : Number(e.target.value)
                        )
                      }
                      className="w-full border border-stone/30 px-3 py-1.5 text-xs sm:text-sm bg-paper rounded-lg focus:outline-none focus:border-oxblood focus:ring-1 focus:ring-oxblood"
                    />
                  </div>

                  {/* Stock Quantity */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone mb-1">
                      {v.id ? 'Current Stock' : 'Initial Stock'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="Stock quantity"
                      value={v.id ? v.stock_quantity ?? 0 : v.stock_quantity}
                      disabled={Boolean(v.id)}
                      onChange={(e) => updateVariant(idx, 'stock_quantity', Number(e.target.value))}
                      title={v.id ? 'Adjust stock from Admin > Inventory page to record audit transactions' : 'Initial stock count'}
                      className="w-full border border-stone/30 px-3 py-1.5 text-xs sm:text-sm bg-paper rounded-lg disabled:bg-stone/10 disabled:text-stone focus:outline-none focus:border-oxblood"
                    />
                    {v.id && (
                      <span className="text-[10px] text-stone mt-0.5 block">
                        Locked here. Adjust via Inventory.
                      </span>
                    )}
                  </div>

                  {/* Low Stock Threshold */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone mb-1">
                      Low Stock Alert
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="5"
                      value={v.low_stock_threshold ?? 5}
                      onChange={(e) => updateVariant(idx, 'low_stock_threshold', Number(e.target.value))}
                      className="w-full border border-stone/30 px-3 py-1.5 text-xs sm:text-sm bg-paper rounded-lg focus:outline-none focus:border-oxblood"
                    />
                  </div>

                  {/* Blouse Size (if stitched) */}
                  {blouseStitched && (
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone mb-1">
                        Blouse Size
                      </label>
                      <input
                        placeholder="e.g. 36, 38, M, L"
                        value={v.blouse_size || ''}
                        onChange={(e) => updateVariant(idx, 'blouse_size', e.target.value)}
                        className="w-full border border-stone/30 px-3 py-1.5 text-xs sm:text-sm bg-paper rounded-lg focus:outline-none focus:border-oxblood"
                      />
                    </div>
                  )}
                </div>

                {/* Variant-Specific Images Section */}
                <div className="pt-3 border-t border-stone/15">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-stone">
                      Images for {v.color || 'this variant'} ({variantImages.length})
                    </span>
                    {isEditing && v.id && (
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[v.id]?.click()}
                        disabled={isUploading}
                        className="inline-flex items-center gap-1.5 text-xs text-oxblood hover:underline font-medium disabled:opacity-50"
                      >
                        <Upload size={13} /> {isUploading ? 'Uploading…' : '+ Upload Image'}
                      </button>
                    )}
                  </div>

                  {isEditing && v.id ? (
                    <div>
                      <div className="flex flex-wrap gap-2.5 items-center">
                        {variantImages.map((img) => (
                          <div
                            key={img.id}
                            className="relative w-20 h-24 group rounded-md overflow-hidden border border-stone/20 bg-stone/5 shadow-xs"
                          >
                            <img
                              src={img.image_url}
                              alt={v.color || 'Variant'}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                              loading="lazy"
                            />
                            {img.is_hover_image && (
                              <span className="absolute bottom-0 left-0 right-0 bg-ink/90 text-paper text-[9px] tracking-wider uppercase text-center py-0.5">
                                Hover
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => onDeleteImage && onDeleteImage(img.id)}
                              className="absolute top-1 right-1 bg-oxblood text-paper rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                              title="Delete variant image"
                              aria-label="Delete variant image"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[v.id]?.click()}
                          disabled={isUploading}
                          className="w-20 h-24 border-2 border-dashed border-stone/30 rounded-md text-stone text-xs flex flex-col items-center justify-center gap-1 hover:border-oxblood hover:text-oxblood transition-colors disabled:opacity-50"
                        >
                          <Plus size={16} />
                          <span className="text-[10px]">Add</span>
                        </button>
                      </div>

                      <input
                        ref={(el) => (fileInputRefs.current[v.id] = el)}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleVariantFileChange(idx, v, e)}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-stone italic">
                      Save product first to upload images for this variant.
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Color Variant Button */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={addVariant}
          className="inline-flex items-center gap-2 btn-secondary !py-2.5 !px-5 text-xs sm:text-sm font-medium hover:border-oxblood hover:text-oxblood"
        >
          <Plus size={16} /> Add Color Variant
        </button>

        <p className="text-xs text-stone text-right">
          Each variant gets its own SKU, price, stock, and image gallery.
        </p>
      </div>
    </div>
  )
}
