import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAdminProduct, useAdminProductActions } from '../../hooks/admin/useAdminProducts'
import { useAdminCategories } from '../../hooks/admin/useAdminCategories'
import { VariantBuilder } from '../components/VariantBuilder'
import { ImageUploader } from '../components/ImageUploader'
import { SAREE_TYPE_LABELS, OCCASION_LABELS } from '../../utils/format'

const EMPTY_FORM = {
  name: '', slug: '', sku: '', description: '',
  category_id: '', brand_id: null, gender: 'women',
  saree_type: '', occasion: '', border_type: '', pallu_style: '', work_type: '',
  fabric: '', material: '', fit: '', care_instructions: '',
  saree_length_meters: 6.3, blouse_piece_included: true, blouse_stitched: false,
  price: '', discount_price: '', tax_percent: 5, status: 'draft',
  is_new_arrival: false, is_best_seller: false, is_featured: false, is_trending: false, is_on_sale: false,
  tags: '',
}

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
}

export function AdminProductFormPage() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { data: existing } = useAdminProduct(id)
  const { categories } = useAdminCategories()
  const { createProduct, updateProduct, uploadImage, deleteImage } = useAdminProductActions()

  const [form, setForm] = useState(EMPTY_FORM)
  const [variants, setVariants] = useState([])
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [error, setError] = useState('')
  const [initialImages, setInitialImages] = useState([
    { image_url: '', is_hover_image: false },
    { image_url: '', is_hover_image: true },
  ])

  useEffect(() => {
    if (existing) {
      setForm({
        ...EMPTY_FORM,
        ...existing,
        category_id: existing.category?.id || '',
        brand_id: existing.brand?.id || null,
        saree_type: existing.saree_type || '',
        occasion: existing.occasion || '',
      })
      setVariants(existing.variants.map((v) => ({ ...v })))
      setSlugManuallyEdited(true)
    }
  }, [existing])

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'name' && !slugManuallyEdited) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  const [selectedFiles, setSelectedFiles] = useState([])
  const fileInputRef = useRef(null)

  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const newItems = files.map((file, idx) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        is_hover_image: selectedFiles.length === 0 && idx === 1,
      }))
      setSelectedFiles((prev) => [...prev, ...newItems])
    }
  }

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const payload = {
      ...form,
      category_id: form.category_id || null,
      brand_id: form.brand_id || null,
      saree_type: form.saree_type || null,
      occasion: form.occasion || null,
      price: Number(form.price),
      discount_price: form.discount_price ? Number(form.discount_price) : null,
      tax_percent: Number(form.tax_percent),
      saree_length_meters: Number(form.saree_length_meters),
      variants: variants.map((v) => ({
        ...v,
        stock_quantity: v.id ? 0 : Number(v.stock_quantity) || 0,
      })),
    }

    try {
      let productId = id
      if (isEditing) {
        await updateProduct.mutateAsync({ id, payload })
      } else {
        const created = await createProduct.mutateAsync(payload)
        productId = created.id
      }

      // Upload any local selected files
      if (selectedFiles.length > 0) {
        for (const item of selectedFiles) {
          await uploadImage.mutateAsync({ productId, file: item.file })
        }
      }

      navigate('/admin/products')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not save product.')
    }
  }

  const isSaving = createProduct.isPending || updateProduct.isPending

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl mb-8">{isEditing ? 'Edit Product' : 'Add Product'}</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-sm tracking-widest2 uppercase text-stone">Basics</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name">
              <input required value={form.name} onChange={(e) => handleChange('name', e.target.value)} className="input" />
            </Field>
            <Field label="Slug">
              <input required value={form.slug} onChange={(e) => { setSlugManuallyEdited(true); handleChange('slug', e.target.value) }} className="input" />
            </Field>
            <Field label="SKU">
              <input required value={form.sku} onChange={(e) => handleChange('sku', e.target.value)} className="input" />
            </Field>
            <Field label="Category">
              <select required value={form.category_id} onChange={(e) => handleChange('category_id', e.target.value)} className="input">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Description">
            <textarea rows={3} value={form.description || ''} onChange={(e) => handleChange('description', e.target.value)} className="input" />
          </Field>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm tracking-widest2 uppercase text-stone">Saree Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Saree Type">
              <select value={form.saree_type} onChange={(e) => handleChange('saree_type', e.target.value)} className="input">
                <option value="">Select Saree Type</option>
                {Object.entries(SAREE_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="Occasion">
              <select value={form.occasion} onChange={(e) => handleChange('occasion', e.target.value)} className="input">
                <option value="">Select Occasion</option>
                {Object.entries(OCCASION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="Fabric">
              <input value={form.fabric || ''} onChange={(e) => handleChange('fabric', e.target.value)} className="input" />
            </Field>
            <Field label="Border Type">
              <input value={form.border_type || ''} onChange={(e) => handleChange('border_type', e.target.value)} className="input" />
            </Field>
            <Field label="Pallu Style">
              <input value={form.pallu_style || ''} onChange={(e) => handleChange('pallu_style', e.target.value)} className="input" />
            </Field>
            <Field label="Work Type">
              <input value={form.work_type || ''} onChange={(e) => handleChange('work_type', e.target.value)} className="input" />
            </Field>
            <Field label="Saree Length (meters)">
              <input type="number" step="0.1" value={form.saree_length_meters} onChange={(e) => handleChange('saree_length_meters', e.target.value)} className="input" />
            </Field>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.blouse_piece_included} onChange={(e) => handleChange('blouse_piece_included', e.target.checked)} className="accent-oxblood" />
              Blouse piece included
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.blouse_stitched} onChange={(e) => handleChange('blouse_stitched', e.target.checked)} className="accent-oxblood" />
              Blouse stitched (adds size to variants)
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm tracking-widest2 uppercase text-stone">Pricing</h2>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Price (₹)">
              <input required type="number" min={1} value={form.price} onChange={(e) => handleChange('price', e.target.value)} className="input" />
            </Field>
            <Field label="Discount Price (₹)">
              <input type="number" min={0} value={form.discount_price || ''} onChange={(e) => handleChange('discount_price', e.target.value)} className="input" />
            </Field>
            <Field label="Tax %">
              <input type="number" min={0} max={100} value={form.tax_percent} onChange={(e) => handleChange('tax_percent', e.target.value)} className="input" />
            </Field>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm tracking-widest2 uppercase text-stone">Status &amp; Labels</h2>
          <Field label="Status">
            <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} className="input max-w-xs">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </Field>
          <div className="flex flex-wrap gap-4">
            {['is_new_arrival', 'is_best_seller', 'is_featured', 'is_trending', 'is_on_sale'].map((flag) => (
              <label key={flag} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form[flag]} onChange={(e) => handleChange(flag, e.target.checked)} className="accent-oxblood" />
                {flag.replace('is_', '').replace('_', ' ')}
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm tracking-widest2 uppercase text-stone">Color Variants</h2>
          <VariantBuilder variants={variants} onChange={setVariants} blouseStitched={form.blouse_stitched} />
        </section>

        {/* Product Images Section */}
        <section className="space-y-4">
          <h2 className="text-sm tracking-widest2 uppercase text-stone">Product Images</h2>

          <div className="bg-beige/40 p-4 border border-stone/20 space-y-4">
            {/* Local File Picker Button */}
            <div>
              <p className="text-xs text-stone mb-3">Select saree photos directly from your computer / local storage:</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelection}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary !py-2 !px-4 text-xs font-medium"
              >
                📁 Select Image Files from Computer
              </button>
            </div>

            {/* Selected File Previews */}
            {selectedFiles.length > 0 && (
              <div>
                <p className="text-xs text-ink font-medium mb-2">Files Ready to Upload ({selectedFiles.length}):</p>
                <div className="flex flex-wrap gap-3">
                  {selectedFiles.map((item, idx) => (
                    <div key={idx} className="relative w-24 h-28 border border-stone/30 bg-paper p-1 group flex flex-col items-center">
                      <img src={item.previewUrl} alt="Preview" className="w-full h-20 object-cover mb-1" />
                      <div className="flex items-center justify-between w-full px-1">
                        <span className="text-[9px] text-stone truncate max-w-[50px]">{item.file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(idx)}
                          className="text-[10px] text-oxblood hover:underline font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* URL Input Option */}
            <div className="pt-3 border-t border-stone/20">
              <p className="text-xs text-stone mb-2">Or paste Image URLs (optional):</p>
              {initialImages.map((img, idx) => (
                <div key={idx} className="flex items-center gap-3 mb-2">
                  <input
                    type="url"
                    placeholder={idx === 0 ? "Primary Image URL (optional)" : "Hover Image URL (optional)"}
                    value={img.image_url}
                    onChange={(e) => {
                      const next = [...initialImages]
                      next[idx].image_url = e.target.value
                      setInitialImages(next)
                    }}
                    className="input text-xs flex-1"
                  />
                  {initialImages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setInitialImages(initialImages.filter((_, i) => i !== idx))}
                      className="text-xs text-oxblood hover:underline px-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setInitialImages([...initialImages, { image_url: '', is_hover_image: false }])}
                className="text-xs text-stone hover:text-ink tracking-wide uppercase pt-1"
              >
                + Add Another URL
              </button>
            </div>
          </div>

          {isEditing && existing && existing.images?.length > 0 && (
            <div className="pt-4">
              <p className="text-xs text-stone mb-2">Uploaded Saree Photos:</p>
              <ImageUploader
                images={existing.images || []}
                isUploading={uploadImage.isPending}
                onUpload={(file) => uploadImage.mutate({ productId: id, file })}
                onDelete={(imageId) => deleteImage.mutate({ productId: id, imageId })}
              />
            </div>
          )}
        </section>

        {error && <p className="text-sm text-oxblood">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={isSaving} className="btn-primary disabled:opacity-50">
            {isSaving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs tracking-widest2 uppercase text-stone mb-1.5">{label}</label>
      {children}
    </div>
  )
}
