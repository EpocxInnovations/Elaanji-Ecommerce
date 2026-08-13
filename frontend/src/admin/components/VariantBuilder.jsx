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
          <div key={idx} className="grid grid-cols-12 gap-2 items-center border border-stone/20 p-3">
            <input
              placeholder="SKU"
              value={v.sku}
              onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
              className="col-span-3 border border-stone/30 px-2 py-1.5 text-sm bg-transparent"
            />
            <input
              placeholder="Color"
              value={v.color}
              onChange={(e) => updateVariant(idx, 'color', e.target.value)}
              className="col-span-2 border border-stone/30 px-2 py-1.5 text-sm bg-transparent"
            />
            <input
              type="color"
              value={v.color_hex || '#000000'}
              onChange={(e) => updateVariant(idx, 'color_hex', e.target.value)}
              className="col-span-1 h-8 border border-stone/30"
            />
            {blouseStitched && (
              <input
                placeholder="Blouse Size"
                value={v.blouse_size || ''}
                onChange={(e) => updateVariant(idx, 'blouse_size', e.target.value)}
                className="col-span-2 border border-stone/30 px-2 py-1.5 text-sm bg-transparent"
              />
            )}
            <input
              type="number"
              min={0}
              placeholder="Stock"
              value={v.id ? undefined : v.stock_quantity}
              disabled={Boolean(v.id)}
              onChange={(e) => updateVariant(idx, 'stock_quantity', Number(e.target.value))}
              title={v.id ? 'Existing variant stock: adjust from the Inventory page' : 'Initial stock'}
              className={`${blouseStitched ? 'col-span-2' : 'col-span-4'} border border-stone/30 px-2 py-1.5 text-sm bg-transparent disabled:opacity-40`}
            />
            <button
              type="button"
              onClick={() => removeVariant(idx)}
              className="col-span-1 text-stone hover:text-oxblood flex justify-center"
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
