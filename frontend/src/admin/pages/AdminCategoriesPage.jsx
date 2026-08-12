import { useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { useAdminCategories } from '../../hooks/admin/useAdminCategories'

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
}

export function AdminCategoriesPage() {
  const { categories, isLoading, createCategory, updateCategory, removeCategory } = useAdminCategories()
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
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

  const startEdit = (cat) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const handleUpdate = async (id) => {
    setError('')
    if (!editName.trim()) return
    try {
      await updateCategory.mutateAsync({
        id,
        payload: { name: editName, slug: slugify(editName) },
      })
      setEditingId(null)
      setEditName('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not update category.')
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
            <div key={c.id} className="flex items-center justify-between p-4 gap-3">
              {editingId === c.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input py-1 px-3 flex-1 text-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdate(c.id)}
                    disabled={updateCategory.isPending}
                    className="p-2 text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                    title="Save category"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 text-stone hover:text-ink"
                    title="Cancel edit"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-stone">{c.slug}{c.parent_id ? ' · subcategory' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(c)}
                      className="p-1.5 text-stone hover:text-ink transition-colors"
                      title="Edit category name"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 text-stone hover:text-oxblood transition-colors"
                      title="Delete category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
