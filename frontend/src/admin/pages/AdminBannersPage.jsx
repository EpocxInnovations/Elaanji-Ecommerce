import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useAdminBanners } from '../../hooks/admin/useAdminOperations'

const EMPTY = { heading: '', description: '', cta_text: '', cta_url: '', placement: 'hero', display_order: 0, is_active: true }

export function AdminBannersPage() {
  const { banners, isLoading, createBanner, removeBanner, uploadImage } = useAdminBanners()
  const [form, setForm] = useState(EMPTY)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!file) {
      setError('Please choose an image.')
      return
    }
    try {
      const { image_url } = await uploadImage.mutateAsync(file)
      await createBanner.mutateAsync({ ...form, image_url })
      setForm(EMPTY)
      setFile(null)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create banner.')
    }
  }

  return (
    <div className="max-w-3xl">
      <p className="label-eyebrow mb-2">Phase 5</p>
      <h1 className="font-display text-3xl mb-8">Banners</h1>

      <form onSubmit={handleSubmit} className="border border-stone/20 p-4 mb-8 space-y-3">
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} className="text-sm" />
        <input placeholder="Heading" value={form.heading} onChange={(e) => setForm({ ...form, heading: e.target.value })} className="input" />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="CTA Text (e.g. Shop Now)" value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} className="input" />
          <input placeholder="CTA URL (e.g. /shop)" value={form.cta_url} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} className="input" />
        </div>
        <select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })} className="input max-w-xs">
          <option value="hero">Hero</option>
          <option value="promo">Promo</option>
          <option value="sale">Sale</option>
        </select>
        {error && <p className="text-sm text-oxblood">{error}</p>}
        <button type="submit" disabled={createBanner.isPending || uploadImage.isPending} className="btn-primary disabled:opacity-50">
          {uploadImage.isPending ? 'Uploading…' : createBanner.isPending ? 'Saving…' : 'Add Banner'}
        </button>
        <p className="text-xs text-stone">Requires Cloudinary credentials configured in the backend <code>.env</code> file.</p>
      </form>

      {isLoading && <p className="text-stone text-sm">Loading…</p>}

      {!isLoading && (
        <div className="border border-stone/20 divide-y divide-stone/10">
          {banners.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <img src={b.image_url} alt="" className="w-16 h-10 object-cover" />
                <div>
                  <p className="text-sm font-medium">{b.heading || '(no heading)'}</p>
                  <p className="text-xs text-stone">{b.placement} · {b.is_active ? 'active' : 'inactive'}</p>
                </div>
              </div>
              <button onClick={() => removeBanner.mutate(b.id)} className="text-stone hover:text-oxblood" aria-label="Delete banner">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {banners.length === 0 && <p className="p-6 text-stone text-sm">No banners yet.</p>}
        </div>
      )}
    </div>
  )
}
