import { useState, useRef } from 'react'
import {
  Trash2,
  UploadCloud,
  X,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Plus,
  ExternalLink,
  Image as ImageIcon,
  Edit2,
} from 'lucide-react'
import { useAdminBanners } from '../../hooks/admin/useAdminOperations'

const EMPTY_FORM = {
  heading: '',
  description: '',
  cta_text: '',
  cta_url: '',
  placement: 'hero',
  direct_url: '',
}

export function AdminBannersPage() {
  const { banners, isLoading, createBanner, updateBanner, removeBanner, reorderBanners, uploadImage } =
    useAdminBanners()

  const [form, setForm] = useState(EMPTY_FORM)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [filePreviews, setFilePreviews] = useState([])
  const [uploadProgress, setUploadProgress] = useState(null)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [editingBanner, setEditingBanner] = useState(null)
  const [editForm, setEditForm] = useState({
    heading: '',
    description: '',
    cta_text: '',
    cta_url: '',
    placement: 'hero',
  })
  const fileInputRef = useRef(null)

  const handleOpenEdit = (banner) => {
    setEditingBanner(banner)
    setEditForm({
      heading: banner.heading || '',
      description: banner.description || '',
      cta_text: banner.cta_text || '',
      cta_url: banner.cta_url || '',
      placement: banner.placement || 'hero',
    })
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editingBanner) return
    try {
      await updateBanner.mutateAsync({
        id: editingBanner.id,
        payload: {
          ...editingBanner,
          heading: editForm.heading.trim() || null,
          description: editForm.description.trim() || null,
          cta_text: editForm.cta_text.trim() || null,
          cta_url: editForm.cta_url.trim() || null,
          placement: editForm.placement,
        },
      })
      setSuccessMsg('Banner updated successfully!')
      setEditingBanner(null)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update banner.')
    }
  }

  // Handle multiple file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Clean up old object URLs
    filePreviews.forEach((url) => URL.revokeObjectURL(url))

    const previews = files.map((file) => URL.createObjectURL(file))
    setSelectedFiles(files)
    setFilePreviews(previews)
    setError('')
  }

  // Remove a specific image from the selected batch
  const removeSelectedFile = (index) => {
    URL.revokeObjectURL(filePreviews[index])
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = filePreviews.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setFilePreviews(newPreviews)
  }

  // Clear all selected files
  const clearSelection = () => {
    filePreviews.forEach((url) => URL.revokeObjectURL(url))
    setSelectedFiles([])
    setFilePreviews([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Submit batch of banners
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    const hasFiles = selectedFiles.length > 0
    const hasDirectUrl = Boolean(form.direct_url?.trim())

    if (!hasFiles && !hasDirectUrl) {
      setError('Please select one or more banner images, or provide an image URL.')
      return
    }

    try {
      // Calculate current max order for this placement
      const placementBanners = banners.filter((b) => b.placement === form.placement)
      let nextOrder = placementBanners.length > 0 ? Math.max(...placementBanners.map((b) => b.display_order)) + 1 : 0

      if (hasFiles) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i]
          setUploadProgress(`Uploading image ${i + 1} of ${selectedFiles.length}...`)

          const { image_url } = await uploadImage.mutateAsync(file)

          setUploadProgress(`Saving slide ${i + 1} of ${selectedFiles.length}...`)
          await createBanner.mutateAsync({
            image_url,
            heading: form.heading || null,
            description: form.description || null,
            cta_text: form.cta_text || null,
            cta_url: form.cta_url || null,
            placement: form.placement,
            display_order: nextOrder++,
            is_active: true,
          })
        }
        setSuccessMsg(`Successfully added ${selectedFiles.length} banner(s) to ${form.placement.toUpperCase()} slideshow!`)
      } else if (hasDirectUrl) {
        setUploadProgress('Saving banner...')
        await createBanner.mutateAsync({
          image_url: form.direct_url.trim(),
          heading: form.heading || null,
          description: form.description || null,
          cta_text: form.cta_text || null,
          cta_url: form.cta_url || null,
          placement: form.placement,
          display_order: nextOrder,
          is_active: true,
        })
        setSuccessMsg(`Successfully added banner to ${form.placement.toUpperCase()} slideshow!`)
      }

      clearSelection()
      setForm(EMPTY_FORM)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || err.message || 'Could not upload or create banner(s).')
    } finally {
      setUploadProgress(null)
    }
  }

  // Toggle active status of a banner
  const handleToggleActive = (banner) => {
    updateBanner.mutate({
      id: banner.id,
      payload: {
        ...banner,
        is_active: !banner.is_active,
      },
    })
  }

  // Move slide up or down in order
  const handleMoveOrder = (banner, direction) => {
    const list = banners.filter((b) => b.placement === banner.placement).sort((a, b) => a.display_order - b.display_order)
    const index = list.findIndex((b) => b.id === banner.id)
    if (index === -1) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= list.length) return

    const otherBanner = list[targetIndex]
    const reorderedItems = [
      { id: banner.id, display_order: otherBanner.display_order },
      { id: otherBanner.id, display_order: banner.display_order },
    ]

    reorderBanners.mutate(reorderedItems)
  }

  const placements = [
    {
      id: 'hero',
      label: 'Hero Banner Slideshow (Landing Page Top)',
      ratio: '24:5 panoramic ratio (edge-to-edge with smooth cross-fade)',
      description: 'The premier full-width landing page banner strip. Supports multiple rotating slides.',
    },
    {
      id: 'promo',
      label: 'Promotion Offer Slideshow (Mid Section)',
      ratio: '32:9 widescreen banner with dark gradient & text overlay',
      description: 'Highlight handloom collections, festival discounts, and special offers.',
    },
    {
      id: 'sale',
      label: 'Sale Offer Slideshow (Lower Section)',
      ratio: 'Seasonal offers & flash sale promotions',
      description: 'Targeted seasonal saree sale banners.',
    },
  ]

  const isSubmitting = Boolean(uploadProgress) || createBanner.isPending || uploadImage.isPending

  return (
    <div className="max-w-4xl pb-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink">Banners &amp; Slideshows</h1>
        <p className="text-stone text-sm mt-1">
          Upload multiple images to create smooth, zero-buffering cross-fade slideshows for customers.
        </p>
      </div>

      {/* ─── Add Multiple Banners Form ─── */}
      <form onSubmit={handleSubmit} className="bg-paper border border-stone/20 rounded-lg p-6 mb-10 shadow-card">
        <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
          <Plus size={18} className="text-gold" />
          Add Images to Slideshow
        </h2>

        {/* Multi-File Upload Dropzone */}
        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone mb-2">
            Select Multiple Images for Slideshow
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone/30 hover:border-gold/60 rounded-lg p-6 text-center cursor-pointer transition-colors bg-stone/5 hover:bg-gold/5"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <UploadCloud size={32} className="mx-auto text-stone mb-2" />
            <p className="text-sm font-medium text-ink">
              Click to select <span className="text-oxblood font-semibold">multiple images</span>, or drag &amp; drop
            </p>
            <p className="text-xs text-stone mt-1">
              Supports PNG, JPG, WEBP. You can pick multiple files at once for the slideshow.
            </p>
          </div>
        </div>

        {/* Selected Images Preview Grid */}
        {selectedFiles.length > 0 && (
          <div className="mb-5 p-4 bg-stone/5 rounded-lg border border-stone/15">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-ink uppercase tracking-wider">
                {selectedFiles.length} Image(s) Ready for Slideshow
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs text-oxblood hover:underline cursor-pointer"
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {filePreviews.map((url, idx) => (
                <div key={idx} className="relative group rounded overflow-hidden border border-stone/20 bg-paper">
                  <img src={url} alt="" className="w-full h-24 object-cover object-top" />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-ink/70 text-paper text-[10px] font-mono rounded">
                    Slide {idx + 1}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeSelectedFile(idx)
                    }}
                    className="absolute top-1 right-1 w-5 h-5 bg-oxblood text-paper rounded-full flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X size={12} />
                  </button>
                  <p className="p-1 text-[11px] text-stone truncate">{selectedFiles[idx]?.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Direct Image URL (Fallback / Alternative) */}
        {selectedFiles.length === 0 && (
          <div className="mb-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone mb-1.5">
              Or Paste Direct Image URL
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={form.direct_url}
                onChange={(e) => setForm({ ...form, direct_url: e.target.value })}
                className="input text-sm pl-9"
              />
              <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
            </div>
          </div>
        )}

        {/* Placement Selector */}
        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone mb-1.5">
            Slideshow Placement
          </label>
          <select
            value={form.placement}
            onChange={(e) => setForm({ ...form, placement: e.target.value })}
            className="input text-sm"
          >
            {placements.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-stone mt-1">
            {placements.find((p) => p.id === form.placement)?.ratio}
          </p>
        </div>

        {/* Optional Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone mb-1.5">
              Heading (Optional)
            </label>
            <input
              placeholder="e.g. Royal Wedding Collection"
              value={form.heading}
              onChange={(e) => setForm({ ...form, heading: e.target.value })}
              className="input text-sm"
            />
            <p className="text-[11px] text-stone mt-1">Used for image alt text and admin identification.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone mb-1.5">
              Description (Optional)
            </label>
            <input
              placeholder="Leave blank if banner graphic has text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input text-sm"
            />
            <p className="text-[11px] text-stone mt-1">Leave blank if your Canva/Photoshop graphic already includes text.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone mb-1.5">
              CTA Text (Optional)
            </label>
            <input
              placeholder="Leave blank if graphic has button"
              value={form.cta_text}
              onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
              className="input text-sm"
            />
            <p className="text-[11px] text-stone mt-1">Leave blank if graphic already has a button. Entire banner is clickable.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone mb-1.5">
              CTA Link URL (Optional)
            </label>
            <input
              placeholder="e.g. /shop?saree_type=kanjivaram"
              value={form.cta_url}
              onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
              className="input text-sm"
            />
            <p className="text-[11px] text-stone mt-1">Destination page when customer clicks the banner.</p>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && <p className="text-sm text-oxblood bg-oxblood/10 p-3 rounded mb-4">{error}</p>}
        {successMsg && (
          <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} />
            {successMsg}
          </p>
        )}

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-paper/40 border-t-paper rounded-full animate-spin" />
                {uploadProgress || 'Saving…'}
              </>
            ) : selectedFiles.length > 1 ? (
              `Add ${selectedFiles.length} Images to Slideshow`
            ) : (
              'Add Banner to Slideshow'
            )}
          </button>
          {uploadProgress && <span className="text-xs text-stone animate-pulse">{uploadProgress}</span>}
        </div>
      </form>

      {/* ─── Existing Banners Grouped by Placement ─── */}
      <div className="space-y-8">
        <h2 className="font-display text-2xl text-ink">Active Slideshows</h2>

        {isLoading ? (
          <p className="text-stone text-sm">Loading banners…</p>
        ) : (
          placements.map((placement) => {
            const placementBanners = banners
              .filter((b) => b.placement === placement.id)
              .sort((a, b) => a.display_order - b.display_order)

            return (
              <div
                key={placement.id}
                className="bg-paper border border-stone/20 rounded-lg overflow-hidden shadow-sm"
              >
                {/* Section Header */}
                <div className="bg-stone/5 px-5 py-3.5 border-b border-stone/15 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-ink">{placement.label}</h3>
                    <p className="text-xs text-stone">{placement.description}</p>
                  </div>
                  <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-paper border border-stone/20 text-stone">
                    {placementBanners.filter((b) => b.is_active).length} / {placementBanners.length} Active Slides
                  </span>
                </div>

                {/* Banners List */}
                {placementBanners.length === 0 ? (
                  <div className="p-6 text-center text-stone text-xs">
                    No banners configured for this placement yet. Upload images above to populate the slideshow.
                  </div>
                ) : (
                  <div className="divide-y divide-stone/10">
                    {placementBanners.map((banner, index) => (
                      <div
                        key={banner.id}
                        className={`flex items-center justify-between p-4 transition-colors ${
                          banner.is_active ? 'hover:bg-stone/5' : 'bg-stone/[0.02] opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Slide Number Badge */}
                          <span className="text-xs font-mono font-semibold text-stone w-6 text-center">
                            #{index + 1}
                          </span>

                          {/* Image Thumbnail */}
                          <div className="w-24 h-14 rounded overflow-hidden bg-stone/10 border border-stone/20 shrink-0">
                            <img
                              src={banner.image_url}
                              alt=""
                              className="w-full h-full object-cover object-top"
                            />
                          </div>

                          {/* Details */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-ink truncate">
                                {banner.heading || '(Banner with no heading)'}
                              </p>
                              {banner.is_active ? (
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Active in Slideshow" />
                              ) : (
                                <span className="inline-block w-2 h-2 rounded-full bg-stone-400" title="Inactive" />
                              )}
                            </div>
                            <p className="text-xs text-stone truncate max-w-md">
                              {banner.description || banner.cta_url || 'No extra text'}
                            </p>
                            {banner.cta_url && (
                              <a
                                href={banner.cta_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-gold hover:text-oxblood inline-flex items-center gap-1 mt-0.5"
                              >
                                {banner.cta_url}
                                <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Order Up / Down */}
                          <div className="flex flex-col border border-stone/20 rounded overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleMoveOrder(banner, 'up')}
                              disabled={index === 0}
                              className="px-1.5 py-0.5 text-stone hover:text-ink hover:bg-stone/10 disabled:opacity-25"
                              aria-label="Move slide up"
                            >
                              <ChevronUp size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveOrder(banner, 'down')}
                              disabled={index === placementBanners.length - 1}
                              className="px-1.5 py-0.5 text-stone hover:text-ink hover:bg-stone/10 disabled:opacity-25 border-t border-stone/10"
                              aria-label="Move slide down"
                            >
                              <ChevronDown size={13} />
                            </button>
                          </div>

                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(banner)}
                            className="p-1.5 text-stone hover:text-gold transition-colors rounded hover:bg-gold/10"
                            aria-label="Edit banner"
                            title="Edit banner details"
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Toggle Active Switch */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(banner)}
                            className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                              banner.is_active
                                ? 'border-emerald-600/30 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                : 'border-stone/20 text-stone hover:text-ink hover:bg-stone/10'
                            }`}
                          >
                            {banner.is_active ? 'Active' : 'Paused'}
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Delete this banner from the slideshow?')) {
                                removeBanner.mutate(banner.id)
                              }
                            }}
                            className="p-1.5 text-stone hover:text-oxblood transition-colors rounded hover:bg-oxblood/10"
                            aria-label="Delete banner"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* ─── Edit Banner Modal ─── */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
          <div className="bg-paper border border-stone/20 rounded-xl max-w-lg w-full p-6 shadow-luxury relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setEditingBanner(null)}
              className="absolute top-4 right-4 p-1 text-stone hover:text-ink rounded-full hover:bg-stone/10"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <h3 className="font-display text-xl text-ink mb-1">Edit Banner Slide</h3>
            <p className="text-xs text-stone mb-4">
              Update banner slide settings and destination URL.
            </p>

            {/* Thumbnail preview */}
            <div className="mb-4 rounded-lg overflow-hidden border border-stone/20 aspect-[21/9] bg-stone/5">
              <img
                src={editingBanner.image_url}
                alt="Banner Preview"
                className="w-full h-full object-cover"
              />
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone mb-1">
                  Placement
                </label>
                <select
                  value={editForm.placement}
                  onChange={(e) => setEditForm({ ...editForm, placement: e.target.value })}
                  className="input text-xs"
                >
                  {placements.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone mb-1">
                  Heading (Alt Text / Screen Reader)
                </label>
                <input
                  type="text"
                  value={editForm.heading}
                  onChange={(e) => setEditForm({ ...editForm, heading: e.target.value })}
                  placeholder="e.g. Grace in Every Drape"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone mb-1">
                  HTML Description Overlay
                </label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Leave empty if image already has text"
                  className="input text-xs"
                />
                <p className="text-[10px] text-stone mt-0.5">
                  Leave blank for graphic banners (Canva creatives).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={editForm.cta_text}
                    onChange={(e) => setEditForm({ ...editForm, cta_text: e.target.value })}
                    placeholder="Leave empty if graphic has button"
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone mb-1">
                    Destination URL
                  </label>
                  <input
                    type="text"
                    value={editForm.cta_url}
                    onChange={(e) => setEditForm({ ...editForm, cta_url: e.target.value })}
                    placeholder="/shop"
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-stone/15">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="btn-secondary !py-2 !px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateBanner.isPending}
                  className="btn-primary !py-2 !px-5 text-xs"
                >
                  {updateBanner.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
