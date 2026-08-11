import { SAREE_TYPE_LABELS, OCCASION_LABELS } from '../utils/format'

const SAREE_TYPES = Object.entries(SAREE_TYPE_LABELS)
const OCCASIONS = Object.entries(OCCASION_LABELS)

export function ShopFilters({ filters, onChange }) {
  const toggleValue = (key, value) => {
    onChange({ ...filters, [key]: filters[key] === value ? undefined : value })
  }

  return (
    <aside className="w-full md:w-64 shrink-0 space-y-8">
      <div>
        <h3 className="text-xs tracking-widest2 uppercase text-stone mb-3">Saree Type</h3>
        <div className="space-y-2">
          {SAREE_TYPES.map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="saree_type"
                checked={filters.saree_type === value}
                onChange={() => toggleValue('saree_type', value)}
                className="accent-oxblood"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs tracking-widest2 uppercase text-stone mb-3">Occasion</h3>
        <div className="space-y-2">
          {OCCASIONS.map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="occasion"
                checked={filters.occasion === value}
                onChange={() => toggleValue('occasion', value)}
                className="accent-oxblood"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs tracking-widest2 uppercase text-stone mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.min_price || ''}
            onChange={(e) => onChange({ ...filters, min_price: e.target.value || undefined })}
            className="w-full border border-stone/30 px-3 py-2 text-sm bg-transparent"
          />
          <span className="text-stone">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.max_price || ''}
            onChange={(e) => onChange({ ...filters, max_price: e.target.value || undefined })}
            className="w-full border border-stone/30 px-3 py-2 text-sm bg-transparent"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(filters.in_stock_only)}
          onChange={(e) => onChange({ ...filters, in_stock_only: e.target.checked || undefined })}
          className="accent-oxblood"
        />
        In Stock Only
      </label>

      <button
        onClick={() => onChange({})}
        className="text-xs tracking-widest2 uppercase text-oxblood underline underline-offset-4"
      >
        Clear Filters
      </button>
    </aside>
  )
}
