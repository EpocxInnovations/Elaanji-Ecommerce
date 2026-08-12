import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { SAREE_TYPE_LABELS, OCCASION_LABELS } from '../utils/format'

const SAREE_TYPES = Object.entries(SAREE_TYPE_LABELS)
const OCCASIONS = Object.entries(OCCASION_LABELS)

function FilterSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-stone/10 pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left group"
        aria-expanded={open}
      >
        <h3 className="text-xs tracking-widest2 uppercase text-stone group-hover:text-ink transition-colors">
          {title}
        </h3>
        <ChevronDown
          size={14}
          className={`text-stone transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
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
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FilterRadio({ name, value, checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2.5 py-1 cursor-pointer group">
      <span
        className={`w-4 h-4 border flex items-center justify-center shrink-0 transition-colors duration-150 ${
          checked ? 'border-ink bg-ink' : 'border-stone/40 group-hover:border-stone'
        }`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#FAF9F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className={`text-sm transition-colors ${checked ? 'text-ink' : 'text-ink/70 group-hover:text-ink'}`}>
        {label}
      </span>
    </label>
  )
}

export function ShopFilters({ filters, onChange }) {
  const toggleValue = (key, value) => {
    onChange({ ...filters, [key]: filters[key] === value ? undefined : value })
  }

  const activeCount = Object.values(filters).filter(Boolean).length

  return (
    <aside className="w-full md:w-56 shrink-0">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs tracking-widest2 uppercase text-ink">
          Filters
          {activeCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center bg-ink text-paper text-[10px] w-4 h-4 leading-none">
              {activeCount}
            </span>
          )}
        </h2>
        {activeCount > 0 && (
          <button
            onClick={() => onChange({})}
            className="text-[11px] tracking-widest2 uppercase text-oxblood hover:text-ink transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <FilterSection title="Saree Type">
        <div className="space-y-0.5">
          {SAREE_TYPES.map(([value, label]) => (
            <FilterRadio
              key={value}
              name="saree_type"
              value={value}
              checked={filters.saree_type === value}
              onChange={() => toggleValue('saree_type', value)}
              label={label}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Occasion">
        <div className="space-y-0.5">
          {OCCASIONS.map(([value, label]) => (
            <FilterRadio
              key={value}
              name="occasion"
              value={value}
              checked={filters.occasion === value}
              onChange={() => toggleValue('occasion', value)}
              label={label}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range" defaultOpen={false}>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.min_price || ''}
            onChange={(e) => onChange({ ...filters, min_price: e.target.value || undefined })}
            className="input !py-2 !px-3 text-center"
          />
          <span className="text-stone text-sm">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.max_price || ''}
            onChange={(e) => onChange({ ...filters, max_price: e.target.value || undefined })}
            className="input !py-2 !px-3 text-center"
          />
        </div>
      </FilterSection>

      <label className="flex items-center gap-2.5 cursor-pointer group mt-1">
        <span
          className={`w-4 h-4 border flex items-center justify-center shrink-0 transition-colors duration-150 ${
            filters.in_stock_only ? 'border-ink bg-ink' : 'border-stone/40 group-hover:border-stone'
          }`}
        >
          {filters.in_stock_only && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="#FAF9F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <input
          type="checkbox"
          checked={Boolean(filters.in_stock_only)}
          onChange={(e) => onChange({ ...filters, in_stock_only: e.target.checked || undefined })}
          className="sr-only"
        />
        <span className="text-sm text-ink/70 group-hover:text-ink transition-colors">In Stock Only</span>
      </label>
    </aside>
  )
}
