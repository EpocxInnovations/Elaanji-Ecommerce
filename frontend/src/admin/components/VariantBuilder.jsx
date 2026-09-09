import { Trash2, Plus } from 'lucide-react'

export function VariantBuilder({ variants, onChange, blouseStitched }) {
  const updateVariant = (index, field, value) => {
    const next = [...variants]
    next[index] = { ...next[index], [field]: value }
    onChange(next)
  }

  const addVariant = () => {
    onChange([
      ...variants,
      { sku: '', color: '', color_hex: '#000000', blouse_size: '', stock_quantity: 0, low_stock_threshold: 5, is_active: true },
    ])
  }

  const removeVariant = (index) => {
    onChange(variants.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="space-y-3">
        {variants.map((v, idx) => (
          <div key={idx} className="flex flex-col sm:grid sm:grid-cols-12 gap-2.5 sm:gap-2 items-stretch sm:items-center border border-stone/20 p-3 bg-stone/[0.02] rounded-lg">
            <div className="flex items-center justify-between sm:hidden mb-0.5">
              <span className="text-xs font-mono font-semibold text-stone">Variant #{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeVariant(idx)}
                className="text-stone hover:text-oxblood p-1"
                aria-label="Remove variant"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="w-full sm:col-span-3">
              <label className="sm:hidden text-[10px] uppercase font-semibold text-stone mb-0.5 block">SKU</label>
              <input
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                className="w-full border border-stone/30 px-2 py-1.5 text-xs sm:text-sm bg-paper rounded"
              />
            </div>

            <div className="grid grid-cols-3 sm:contents gap-2">
              <div className="col-span-2 sm:col-span-2">
                <label className="sm:hidden text-[10px] uppercase font-semibold text-stone mb-0.5 block">Color</label>
                <input
                  placeholder="Color"
                  value={v.color}
                  onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                  className="w-full border border-stone/30 px-2 py-1.5 text-xs sm:text-sm bg-paper rounded"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="sm:hidden text-[10px] uppercase font-semibold text-stone mb-0.5 block">Hex</label>
                <input
                  type="color"
                  value={v.color_hex || '#000000'}
                  onChange={(e) => updateVariant(idx, 'color_hex', e.target.value)}
                  className="w-full h-8 border border-stone/30 rounded cursor-pointer"
                />
              </div>
            </div>

            {blouseStitched && (
              <div className="w-full sm:col-span-2">
                <label className="sm:hidden text-[10px] uppercase font-semibold text-stone mb-0.5 block">Blouse Size</label>
                <input
                  placeholder="Blouse Size"
                  value={v.blouse_size || ''}
                  onChange={(e) => updateVariant(idx, 'blouse_size', e.target.value)}
                  className="w-full border border-stone/30 px-2 py-1.5 text-xs sm:text-sm bg-paper rounded"
                />
              </div>
            )}

            <div className={`w-full ${blouseStitched ? 'sm:col-span-2' : 'sm:col-span-4'}`}>
              <label className="sm:hidden text-[10px] uppercase font-semibold text-stone mb-0.5 block">Stock Quantity</label>
              <input
                type="number"
                min={0}
                placeholder="Stock"
                value={v.id ? undefined : v.stock_quantity}
                disabled={Boolean(v.id)}
                onChange={(e) => updateVariant(idx, 'stock_quantity', Number(e.target.value))}
                title={v.id ? 'Existing variant stock: adjust from the Inventory page' : 'Initial stock'}
                className="w-full border border-stone/30 px-2 py-1.5 text-xs sm:text-sm bg-paper rounded disabled:opacity-40"
              />
            </div>

            <button
              type="button"
              onClick={() => removeVariant(idx)}
              className="hidden sm:flex col-span-1 text-stone hover:text-oxblood justify-center p-1"
              aria-label="Remove variant"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addVariant}
        className="flex items-center gap-2 text-sm text-oxblood mt-3"
      >
        <Plus size={16} /> Add Color Variant
      </button>

      <p className="text-xs text-stone mt-2">
        Stock for existing variants is locked here: adjust it from the Inventory page so every
        change is logged.
      </p>
    </div>
  )
}
