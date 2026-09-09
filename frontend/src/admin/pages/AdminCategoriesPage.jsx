import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useAdminCategories } from '../../hooks/admin/useAdminCategories'

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
}

export function AdminCategoriesPage() {
  const { categories, isLoading, createCategory, removeCategory } = useAdminCategories()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createCategory.mutateAsync({ name, slug: slugify(name), display_order: categories.length })
      setName('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create category.')
    }
  }

  const handleDelete = async (id) => {
    setError('')
    try {
      await removeCategory.mutateAsync(id)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not delete category.')
    }
  }

  return (
    <div className="max-w-2xl pb-10">
      <h1 className="font-display text-2xl sm:text-3xl mb-4 sm:mb-8 text-ink">Categories</h1>

      <form onSubmit={handleCreate} className="flex gap-2 sm:gap-3 mb-6 sm:mb-8">
        <input
          required
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input flex-1 text-xs sm:text-sm"
        />
        <button type="submit" disabled={createCategory.isPending} className="btn-primary !py-2.5 !px-4 text-xs sm:text-sm disabled:opacity-50">
          {createCategory.isPending ? 'Adding…' : 'Add'}
        </button>
      </form>

      {error && <p className="text-sm text-oxblood mb-4 bg-oxblood/10 p-3 rounded">{error}</p>}

      {isLoading && <p className="text-stone text-xs sm:text-sm">Loading…</p>}

      {!isLoading && (
        <div className="border border-stone/20 divide-y divide-stone/10 rounded-lg overflow-hidden bg-paper shadow-sm">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3 sm:p-4">
              <div>
                <p className="text-sm font-medium text-ink">{c.name}</p>
                <p className="text-xs text-stone">{c.slug}</p>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                aria-label="Delete category"
                className="p-1.5 text-stone hover:text-oxblood rounded hover:bg-oxblood/10 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="p-6 text-stone text-xs sm:text-sm text-center">No categories yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
