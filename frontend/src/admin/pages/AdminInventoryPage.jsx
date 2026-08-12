import { useState } from 'react'
import { useAdminInventory, useAdminInventoryActions } from '../../hooks/admin/useAdminInventory'

export function AdminInventoryPage() {
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const { data: rows, isLoading } = useAdminInventory(lowStockOnly)
  const { adjustStock } = useAdminInventoryActions()
  const [adjustments, setAdjustments] = useState({})
  const [error, setError] = useState('')

  const handleAdjust = async (variantId, direction) => {
    setError('')
    const amount = Number(adjustments[variantId]) || 1
    try {
      await adjustStock.mutateAsync({
        variantId,
        changeQuantity: direction === 'add' ? amount : -amount,
        note: direction === 'add' ? 'Restocked via admin panel' : 'Removed via admin panel',
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not adjust stock.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Inventory</h1>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} className="accent-oxblood" />
          Low stock only
        </label>
      </div>

      {error && <p className="text-sm text-oxblood mb-4">{error}</p>}
      {isLoading && <p className="text-stone text-sm">Loading…</p>}

      {!isLoading && (
        <div className="border border-stone/20 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-beige text-xs tracking-widest2 uppercase text-stone">
              <tr>
                <th className="text-left p-3">Product</th>
                <th className="text-left p-3">SKU</th>
                <th className="text-left p-3">Color</th>
                <th className="text-right p-3">Stock</th>
                <th className="text-right p-3">Reserved</th>
                <th className="text-right p-3">Available</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/10">
              {rows?.map((row) => (
                <tr key={row.variant_id}>
                  <td className="p-3">{row.product_name}</td>
                  <td className="p-3 text-stone">{row.sku}</td>
                  <td className="p-3">{row.color}{row.blouse_size ? ` / ${row.blouse_size}` : ''}</td>
                  <td className="p-3 text-right">{row.stock_quantity}</td>
                  <td className="p-3 text-right">{row.reserved_quantity}</td>
                  <td className="p-3 text-right font-medium">{row.available_quantity}</td>
                  <td className="p-3 text-center">
                    {row.is_low_stock ? (
                      <span className="text-xs bg-oxblood text-paper px-2 py-0.5">Low</span>
                    ) : (
                      <span className="text-xs text-stone">OK</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 justify-center">
                      <input
                        type="number"
                        min={1}
                        placeholder="qty"
                        value={adjustments[row.variant_id] || ''}
                        onChange={(e) => setAdjustments({ ...adjustments, [row.variant_id]: e.target.value })}
                        className="w-16 border border-stone/30 px-1.5 py-1 text-xs bg-transparent"
                      />
                      <button onClick={() => handleAdjust(row.variant_id, 'add')} className="text-xs border border-stone/30 px-2 py-1 hover:border-ink">+</button>
                      <button onClick={() => handleAdjust(row.variant_id, 'remove')} className="text-xs border border-stone/30 px-2 py-1 hover:border-ink">−</button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows?.length === 0 && (
                <tr><td colSpan={8} className="p-6 text-center text-stone">No inventory to show.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
