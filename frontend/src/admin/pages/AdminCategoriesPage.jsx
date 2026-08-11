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
    <div className="max-w-2xl">
      <p className="label-eyebrow mb-2">Phase 4</p>
      <h1 className="font-display text-3xl mb-8">Categories</h1>

      <form onSubmit={handleCreate} className="flex gap-3 mb-8">
        <input
          required
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input flex-1"
        />
        <button type="submit" disabled={createCategory.isPending} className="btn-primary disabled:opacity-50">
          {createCategory.isPending ? 'Adding…' : 'Add'}
        </button>
      </form>

      {error && <p className="text-sm text-oxblood mb-4">{error}</p>}

      {isLoading && <p className="text-stone text-sm">Loading…</p>}

      {!isLoading && (
        <div className="border border-stone/20 divide-y divide-stone/10">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-stone">{c.slug}{c.parent_id ? ' · subcategory' : ''}</p>
              </div>
              <button onClick={() => handleDelete(c.id)} className="text-stone hover:text-oxblood" aria-label="Delete category">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
