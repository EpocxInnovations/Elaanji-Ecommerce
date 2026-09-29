import { useEffect, useState } from 'react'
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
        price_override: v.price_override !== undefined && v.price_override !== null && v.price_override !== '' ? Number(v.price_override) : null,
        stock_quantity: v.id ? 0 : Number(v.stock_quantity) || 0,
        low_stock_threshold: Number(v.low_stock_threshold) || 5,
        is_active: v.is_active !== false,
      })),
    }

    try {
      if (isEditing) {
        await updateProduct.mutateAsync({ id, payload })
      } else {
        const created = await createProduct.mutateAsync(payload)
        navigate(`/admin/products/${created.id}/edit`)
        return
      }
      navigate('/admin/products')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not save product.')
    }
  }

  const isSaving = createProduct.isPending || updateProduct.isPending

  return (
    <div className="max-w-4xl pb-16">
      <h1 className="font-display text-2xl sm:text-3xl mb-6 sm:mb-8 text-ink">{isEditing ? 'Edit Product' : 'Add Product'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <section className="space-y-4 bg-paper border border-stone/20 rounded-lg p-4 sm:p-6 shadow-sm">
          <h2 className="text-xs sm:text-sm tracking-widest2 uppercase text-stone font-semibold">Basics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="Name">
              <input required value={form.name} onChange={(e) => handleChange('name', e.target.value)} className="input text-xs sm:text-sm" />
            </Field>
            <Field label="Slug">
              <input required value={form.slug} onChange={(e) => { setSlugManuallyEdited(true); handleChange('slug', e.target.value) }} className="input text-xs sm:text-sm" />
            </Field>
            <Field label="SKU">
              <input required value={form.sku} onChange={(e) => handleChange('sku', e.target.value)} className="input text-xs sm:text-sm" />
            </Field>
            <Field label="Category">
              <select required value={form.category_id} onChange={(e) => handleChange('category_id', e.target.value)} className="input text-xs sm:text-sm">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Description">
            <textarea rows={3} value={form.description || ''} onChange={(e) => handleChange('description', e.target.value)} className="input text-xs sm:text-sm" />
          </Field>
        </section>

        <section className="space-y-4 bg-paper border border-stone/20 rounded-lg p-4 sm:p-6 shadow-sm">
          <h2 className="text-xs sm:text-sm tracking-widest2 uppercase text-stone font-semibold">Saree Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="Saree Type">
              <select value={form.saree_type} onChange={(e) => handleChange('saree_type', e.target.value)} className="input text-xs sm:text-sm">
                <option value="">Select Saree Type</option>
                {Object.entries(SAREE_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="Occasion">
              <select value={form.occasion} onChange={(e) => handleChange('occasion', e.target.value)} className="input text-xs sm:text-sm">
                <option value="">Select Occasion</option>
                {Object.entries(OCCASION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="Fabric">
              <input value={form.fabric || ''} onChange={(e) => handleChange('fabric', e.target.value)} className="input text-xs sm:text-sm" />
            </Field>
            <Field label="Border Type">
              <input value={form.border_type || ''} onChange={(e) => handleChange('border_type', e.target.value)} className="input text-xs sm:text-sm" />
            </Field>
            <Field label="Pallu Style">
              <input value={form.pallu_style || ''} onChange={(e) => handleChange('pallu_style', e.target.value)} className="input text-xs sm:text-sm" />
            </Field>
            <Field label="Work Type">
              <input value={form.work_type || ''} onChange={(e) => handleChange('work_type', e.target.value)} className="input text-xs sm:text-sm" />
            </Field>
            <Field label="Saree Length (meters)">
              <input type="number" step="0.1" value={form.saree_length_meters} onChange={(e) => handleChange('saree_length_meters', e.target.value)} className="input text-xs sm:text-sm" />
            </Field>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 pt-1">
            <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
              <input type="checkbox" checked={form.blouse_piece_included} onChange={(e) => handleChange('blouse_piece_included', e.target.checked)} className="accent-oxblood" />
              Blouse piece included
            </label>
            <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
              <input type="checkbox" checked={form.blouse_stitched} onChange={(e) => handleChange('blouse_stitched', e.target.checked)} className="accent-oxblood" />
              Blouse stitched (adds size to variants)
            </label>
          </div>
        </section>

        <section className="space-y-4 bg-paper border border-stone/20 rounded-lg p-4 sm:p-6 shadow-sm">
          <h2 className="text-xs sm:text-sm tracking-widest2 uppercase text-stone font-semibold">Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Field label="Price (₹)">
              <input required type="number" min={1} value={form.price} onChange={(e) => handleChange('price', e.target.value)} className="input text-xs sm:text-sm" />
            </Field>
            <Field label="Discount Price (₹)">
              <input type="number" min={0} value={form.discount_price || ''} onChange={(e) => handleChange('discount_price', e.target.value)} className="input text-xs sm:text-sm" />
            </Field>
            <Field label="Tax %">
              <input type="number" min={0} max={100} value={form.tax_percent} onChange={(e) => handleChange('tax_percent', e.target.value)} className="input text-xs sm:text-sm" />
            </Field>
          </div>
        </section>

        <section className="space-y-4 bg-paper border border-stone/20 rounded-lg p-4 sm:p-6 shadow-sm">
          <h2 className="text-xs sm:text-sm tracking-widest2 uppercase text-stone font-semibold">Status &amp; Labels</h2>
          <Field label="Status">
            <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} className="input max-w-xs text-xs sm:text-sm">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </Field>
          <div className="flex flex-wrap gap-3 sm:gap-4 pt-1">
            {['is_new_arrival', 'is_best_seller', 'is_featured', 'is_trending', 'is_on_sale'].map((flag) => (
              <label key={flag} className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
                <input type="checkbox" checked={form[flag]} onChange={(e) => handleChange(flag, e.target.checked)} className="accent-oxblood" />
                <span className="capitalize">{flag.replace('is_', '').replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-4 bg-paper border border-stone/20 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 className="text-xs sm:text-sm tracking-widest2 uppercase text-stone font-semibold">Color Variants &amp; Variant Images</h2>
            <span className="text-xs text-stone">Each color variant gets its own SKU, price override, stock and photos</span>
          </div>
          <VariantBuilder
            variants={variants}
            onChange={setVariants}
            blouseStitched={form.blouse_stitched}
            productId={id}
            baseSku={form.sku}
            basePrice={form.price}
            isEditing={isEditing}
            allImages={existing?.images || []}
            onUploadImage={({ file, color, variantId }) =>
              uploadImage.mutate({ productId: id, file, color, variantId })
            }
            onDeleteImage={(imageId) => deleteImage.mutate({ productId: id, imageId })}
            isUploading={uploadImage.isPending}
          />
        </section>

        {isEditing && existing && (
          <section className="space-y-4 bg-paper border border-stone/20 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h2 className="text-xs sm:text-sm tracking-widest2 uppercase text-stone font-semibold">General / Primary Images</h2>
              <span className="text-xs text-stone">Fallback catalog photos shown when no color variant is selected</span>
            </div>
            <ImageUploader
              images={(existing.images || []).filter((img) => !img.variant_id && !img.color)}
              isUploading={uploadImage.isPending}
              onUpload={(file) => uploadImage.mutate({ productId: id, file })}
              onDelete={(imageId) => deleteImage.mutate({ productId: id, imageId })}
            />
          </section>
        )}
        {!isEditing && (
          <p className="text-xs text-stone italic">Save the product first, then you can upload images from the edit page.</p>
        )}

        {error && <p className="text-sm text-oxblood bg-oxblood/10 p-3 rounded">{error}</p>}

        <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-2">
          <button type="submit" disabled={isSaving} className="btn-primary !py-2.5 !px-5 text-xs sm:text-sm disabled:opacity-50">
            {isSaving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary !py-2.5 !px-4 text-xs sm:text-sm">
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
