import { useState, useRef } from 'react'
import {
  Trash2,
  Edit2,
  Plus,
  UploadCloud,
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { useAdminCategories } from '../../hooks/admin/useAdminCategories'

const PRESET_IMAGES = [
  { name: 'Kanjivaram Silk', url: '/images/categories/kanjivaram.jpg' },
  { name: 'Banarasi Brocade', url: '/images/categories/banarasi.jpg' },
  { name: 'Handloom Cotton', url: '/images/categories/cotton.jpg' },
  { name: 'Designer Georgette', url: '/images/categories/designer.jpg' },
  { name: 'Pure Silk', url: '/images/categories/puresilk.jpg' },
  { name: 'Organza & Chanderi', url: '/images/categories/organza.jpg' },
]

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

function getFallbackImage(slug) {
  if (!slug) return '/images/categories/puresilk.jpg'
  const lower = slug.toLowerCase()
  if (lower.includes('kanjivaram')) return '/images/categories/kanjivaram.jpg'
  if (lower.includes('banarasi')) return '/images/categories/banarasi.jpg'
  if (lower.includes('cotton')) return '/images/categories/cotton.jpg'
  if (lower.includes('designer')) return '/images/categories/designer.jpg'
  if (lower.includes('organza') || lower.includes('chanderi')) return '/images/categories/organza.jpg'
  return '/images/categories/puresilk.jpg'
}

export function AdminCategoriesPage() {
  const {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    removeCategory,
    uploadImage,
  } = useAdminCategories()

  // New Category Form State
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newImageFile, setNewImageFile] = useState(null)
  const [newImagePreview, setNewImagePreview] = useState('')
  const [isUploadingNew, setIsUploadingNew] = useState(false)

  // Edit Modal State
  const [editingCategory, setEditingCategory] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: 0,
    is_active: true,
  })
  const [editImageFile, setEditImageFile] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState('')
  const [isUploadingEdit, setIsUploadingEdit] = useState(false)

  // Status feedback
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const newFileInputRef = useRef(null)
  const editFileInputRef = useRef(null)

  const clearMessages = () => {
    setError('')
    setSuccessMsg('')
  }

  // --- Handle Open Edit Modal ---
  const handleOpenEdit = (category) => {
    clearMessages()
    setEditingCategory(category)
    setEditImageFile(null)
    setEditImagePreview('')
    setIsUploadingEdit(false)
    setEditForm({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      image_url: category.image_url || '',
      display_order: category.display_order ?? 0,
      is_active: category.is_active ?? true,
    })
  }

  // --- Handle New Category File Selection ---
  const handleNewFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setNewImageFile(file)
    setNewImagePreview(URL.createObjectURL(file))
  }

  // --- Handle Edit Category File Selection ---
  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEditImageFile(file)
    setEditImagePreview(URL.createObjectURL(file))
  }

  // --- Handle Upload New Category Image ---
  const handleUploadNewFile = async () => {
    if (!newImageFile) return
    try {
      setIsUploadingNew(true)
      clearMessages()
      const res = await uploadImage.mutateAsync(newImageFile)
      setNewImageUrl(res.image_url)
      setNewImagePreview('')
      setNewImageFile(null)
      setSuccessMsg('Image uploaded successfully!')
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Image upload failed.')
    } finally {
      setIsUploadingNew(false)
    }
  }

  // --- Handle Upload Edit Category Image ---
  const handleUploadEditFile = async () => {
    if (!editImageFile) return
    try {
      setIsUploadingEdit(true)
      clearMessages()
      const res = await uploadImage.mutateAsync(editImageFile)
      setEditForm((prev) => ({ ...prev, image_url: res.image_url }))
      setEditImagePreview('')
      setEditImageFile(null)
      setSuccessMsg('Image uploaded successfully!')
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Image upload failed.')
    } finally {
      setIsUploadingEdit(false)
    }
  }

  // --- Create Category ---
  const handleCreate = async (e) => {
    e.preventDefault()
    clearMessages()
    try {
      let finalImageUrl = newImageUrl.trim() || null

      // If user selected a file but didn't click upload button separately, upload it now
      if (newImageFile) {
        setIsUploadingNew(true)
        const res = await uploadImage.mutateAsync(newImageFile)
        finalImageUrl = res.image_url
      }

      await createCategory.mutateAsync({
        name: newName.trim(),
        slug: (newSlug.trim() || slugify(newName)).trim(),
        description: newDesc.trim() || null,
        image_url: finalImageUrl,
        display_order: categories.length,
        is_active: true,
      })

      setNewName('')
      setNewSlug('')
      setNewDesc('')
      setNewImageUrl('')
      setNewImageFile(null)
      setNewImagePreview('')
      setShowAddForm(false)
      setSuccessMsg('Category created successfully!')
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Could not create category.')
    } finally {
      setIsUploadingNew(false)
    }
  }

  // --- Save Edited Category ---
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editingCategory) return
    clearMessages()
    try {
      let finalImageUrl = editForm.image_url?.trim() || null

      // If a new file was chosen without clicking separate upload, upload it now
      if (editImageFile) {
        setIsUploadingEdit(true)
        const res = await uploadImage.mutateAsync(editImageFile)
        finalImageUrl = res.image_url
      }

      await updateCategory.mutateAsync({
        id: editingCategory.id,
        payload: {
          name: editForm.name.trim(),
          slug: editForm.slug.trim(),
          description: editForm.description.trim() || null,
          image_url: finalImageUrl,
          display_order: Number(editForm.display_order) || 0,
          is_active: Boolean(editForm.is_active),
        },
      })

      setSuccessMsg(`Category "${editForm.name}" updated successfully!`)
      setEditingCategory(null)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update category.')
    } finally {
      setIsUploadingEdit(false)
    }
  }

  // --- Delete Category ---
  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete category "${category.name}"? Products in this category will be unassigned.`)) {
      return
    }
    clearMessages()
    try {
      await removeCategory.mutateAsync(category.id)
      setSuccessMsg(`Category "${category.name}" deleted.`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not delete category.')
    }
  }

  return (
    <div className="max-w-5xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-stone/15">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-ink tracking-tight flex items-center gap-2">
            Categories &amp; Showcase Images
          </h1>
          <p className="text-stone text-xs sm:text-sm mt-1">
            Replace category images, adjust descriptions, and manage how collections look in the 3D Showcase.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            clearMessages()
            setShowAddForm(!showAddForm)
          }}
          className="btn-primary flex items-center justify-center gap-2 !py-2.5 !px-4 text-xs sm:text-sm shrink-0"
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          {showAddForm ? 'Cancel' : 'New Category'}
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-oxblood/10 border border-oxblood/20 text-oxblood text-sm flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add New Category Panel */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="mb-8 p-6 rounded-2xl bg-paper border border-gold/30 shadow-md">
          <h2 className="font-display text-lg text-ink mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-gold" /> Add New Category
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-stone uppercase tracking-wider mb-1.5">
                Category Name *
              </label>
              <input
                required
                placeholder="e.g. Pure Silk Sarees"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value)
                  if (!newSlug || newSlug === slugify(newName)) {
                    setNewSlug(slugify(e.target.value))
                  }
                }}
                className="input w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone uppercase tracking-wider mb-1.5">
                Slug (URL Identifier) *
              </label>
              <input
                required
                placeholder="e.g. pure-silk"
                value={newSlug}
                onChange={(e) => setNewSlug(slugify(e.target.value))}
                className="input w-full text-sm font-mono"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-stone uppercase tracking-wider mb-1.5">
              Description / Tagline
            </label>
            <input
              placeholder="e.g. Mulberry Weave · Temple Borders"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="input w-full text-sm"
            />
          </div>

          {/* Image Upload for New Category */}
          <div className="mb-6 p-4 rounded-xl bg-stone/5 border border-stone/15">
            <label className="block text-xs font-semibold text-stone uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-gold" /> Category Showcase Image
            </label>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Preview */}
              <div className="w-24 h-32 rounded-lg border border-stone/20 bg-stone/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                {newImagePreview || newImageUrl ? (
                  <img
                    src={newImagePreview || newImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-2 text-stone/60">
                    <ImageIcon size={24} className="mx-auto mb-1" />
                    <span className="text-[10px]">No image</span>
                  </div>
                )}
              </div>

              {/* Upload & Preset Options */}
              <div className="flex-1 space-y-3 w-full">
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={newFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleNewFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => newFileInputRef.current?.click()}
                    className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5"
                  >
                    <UploadCloud size={14} /> Browse Image File…
                  </button>

                  {newImageFile && (
                    <button
                      type="button"
                      disabled={isUploadingNew}
                      onClick={handleUploadNewFile}
                      className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
                    >
                      {isUploadingNew ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" /> Uploading…
                        </>
                      ) : (
                        'Upload to Cloudinary'
                      )}
                    </button>
                  )}
                </div>

                <div>
                  <input
                    placeholder="Or paste direct image URL (e.g. https://... or /images/categories/...)"
                    value={newImageUrl}
                    onChange={(e) => {
                      setNewImageUrl(e.target.value)
                      setNewImageFile(null)
                      setNewImagePreview('')
                    }}
                    className="input w-full text-xs"
                  />
                </div>

                {/* Preset quick picks */}
                <div>
                  <span className="text-[11px] text-stone font-medium block mb-1.5">
                    Or select luxury preset:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setNewImageUrl(preset.url)
                          setNewImageFile(null)
                          setNewImagePreview('')
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                          newImageUrl === preset.url
                            ? 'bg-gold/15 border-gold text-ink font-medium shadow-sm'
                            : 'bg-paper border-stone/20 text-stone hover:border-gold/50'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn-ghost !py-2 !px-4 text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCategory.isPending || isUploadingNew}
              className="btn-primary !py-2 !px-5 text-xs sm:text-sm"
            >
              {createCategory.isPending ? 'Saving…' : 'Create Category'}
            </button>
          </div>
        </form>
      )}

      {/* Category List */}
      {isLoading ? (
        <div className="py-12 text-center text-stone text-sm">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-gold" />
          Loading categories…
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center bg-paper rounded-2xl border border-stone/20 text-stone text-sm">
          No categories found. Click &quot;New Category&quot; above to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((c) => {
            const displayImage = c.image_url || getFallbackImage(c.slug)
            const hasCustomImage = Boolean(c.image_url)

            return (
              <div
                key={c.id}
                className="bg-paper border border-stone/20 hover:border-gold/40 rounded-2xl p-4 sm:p-5 flex gap-4 transition-all duration-200 shadow-sm hover:shadow group"
              >
                {/* Category Image Box */}
                <div className="relative w-20 h-28 sm:w-24 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-stone/10 border border-stone/15">
                  <img
                    src={displayImage}
                    alt={c.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Badge */}
                  <div className="absolute top-1.5 left-1.5">
                    {hasCustomImage ? (
                      <span className="text-[9px] uppercase tracking-wider font-bold bg-gold text-ink px-1.5 py-0.5 rounded shadow-sm">
                        Custom
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase tracking-wider font-medium bg-ink/75 text-paper px-1.5 py-0.5 rounded">
                        Preset
                      </span>
                    )}
                  </div>

                  {/* Hover Quick Edit Overlay */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(c)}
                    className="absolute inset-0 bg-ink/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-paper text-[11px] font-medium transition-opacity"
                    title="Replace Image"
                  >
                    <Edit2 size={16} className="text-gold" />
                    Replace
                  </button>
                </div>

                {/* Category Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-base sm:text-lg text-ink font-medium truncate">
                        {c.name}
                      </h3>
                      {c.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone bg-stone/10 px-2 py-0.5 rounded-full shrink-0">
                          Inactive
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-mono text-stone mt-0.5 truncate">
                      /{c.slug}
                    </p>

                    <p className="text-xs text-stone/80 mt-2 line-clamp-2">
                      {c.description || 'No description added.'}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-stone/10">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5 hover:border-gold"
                    >
                      <ImageIcon size={13} className="text-gold" />
                      Replace Image / Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(c)}
                      aria-label={`Delete ${c.name}`}
                      className="p-1.5 text-stone/60 hover:text-oxblood hover:bg-oxblood/10 rounded-lg transition-colors"
                      title="Delete category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit / Replace Image Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-paper border border-stone/20 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone/15">
              <div>
                <h2 className="font-display text-lg sm:text-xl text-ink flex items-center gap-2">
                  <ImageIcon size={18} className="text-gold" />
                  Edit Category &amp; Image
                </h2>
                <p className="text-xs text-stone mt-0.5">
                  Update the showcase photo that renders in the 3D Circular Gallery.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-2 text-stone hover:text-ink rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Image Replacement Section */}
              <div className="p-4 rounded-xl bg-stone/5 border border-stone/15">
                <label className="block text-xs font-semibold text-stone uppercase tracking-wider mb-2">
                  Category Showcase Image
                </label>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {/* Live Image Preview */}
                  <div className="w-28 h-36 rounded-xl border border-stone/20 bg-stone/10 overflow-hidden shrink-0 relative shadow-inner">
                    <img
                      src={
                        editImagePreview ||
                        editForm.image_url ||
                        getFallbackImage(editForm.slug)
                      }
                      alt="Category Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-ink/75 backdrop-blur-[2px] text-paper text-[10px] text-center py-1 font-sans">
                      {editImagePreview
                        ? 'New file selected'
                        : editForm.image_url
                        ? 'Custom photo'
                        : 'Default preset'}
                    </div>
                  </div>

                  {/* Replacement Controls */}
                  <div className="flex-1 space-y-3 w-full">
                    {/* File Upload Button */}
                    <div className="flex flex-wrap gap-2">
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleEditFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5"
                      >
                        <UploadCloud size={14} className="text-gold" /> Choose File to Upload…
                      </button>

                      {editImageFile && (
                        <button
                          type="button"
                          disabled={isUploadingEdit}
                          onClick={handleUploadEditFile}
                          className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
                        >
                          {isUploadingEdit ? (
                            <>
                              <RefreshCw size={12} className="animate-spin" /> Uploading…
                            </>
                          ) : (
                            'Upload to Cloudinary'
                          )}
                        </button>
                      )}
                    </div>

                    {/* Direct Image URL */}
                    <div>
                      <label className="block text-[11px] text-stone font-medium mb-1">
                        Direct Image URL:
                      </label>
                      <input
                        placeholder="https://... or /images/categories/..."
                        value={editForm.image_url}
                        onChange={(e) => {
                          setEditForm((prev) => ({ ...prev, image_url: e.target.value }))
                          setEditImageFile(null)
                          setEditImagePreview('')
                        }}
                        className="input w-full text-xs font-mono"
                      />
                    </div>

                    {/* Quick Presets */}
                    <div>
                      <span className="text-[11px] text-stone font-medium block mb-1.5">
                        Or select luxury preset:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_IMAGES.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setEditForm((prev) => ({ ...prev, image_url: preset.url }))
                              setEditImageFile(null)
                              setEditImagePreview('')
                            }}
                            className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                              editForm.image_url === preset.url
                                ? 'bg-gold/15 border-gold text-ink font-medium shadow-sm'
                                : 'bg-paper border-stone/20 text-stone hover:border-gold/50'
                            }`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clear custom image button */}
                    {editForm.image_url && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditForm((prev) => ({ ...prev, image_url: '' }))
                          setEditImageFile(null)
                          setEditImagePreview('')
                        }}
                        className="text-[11px] text-oxblood hover:underline block pt-1"
                      >
                        Reset to default preset image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone uppercase tracking-wider mb-1.5">
                    Category Name *
                  </label>
                  <input
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="input w-full text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone uppercase tracking-wider mb-1.5">
                    Slug *
                  </label>
                  <input
                    required
                    value={editForm.slug}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                    className="input w-full text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone uppercase tracking-wider mb-1.5">
                  Description / Heritage Tagline
                </label>
                <input
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Temple-woven silk heritage"
                  className="input w-full text-sm"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded text-gold focus:ring-gold"
                  />
                  <span>Active in store</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-stone">Display Order:</label>
                  <input
                    type="number"
                    value={editForm.display_order}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, display_order: e.target.value }))}
                    className="input w-16 text-center text-xs py-1"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-stone/15">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="btn-ghost !py-2 !px-4 text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateCategory.isPending || isUploadingEdit}
                  className="btn-primary !py-2 !px-5 text-xs sm:text-sm"
                >
                  {updateCategory.isPending || isUploadingEdit ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
