import { useRef } from 'react'
import { X } from 'lucide-react'

export function ImageUploader({ images, onUpload, onDelete, isUploading }) {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    e.target.value = ''
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((img) => (
          <div key={img.id} className="relative w-20 h-24 group">
            <img src={img.image_url} alt="" className="w-full h-full object-cover border border-stone/20" />
            {img.is_hover_image && (
              <span className="absolute bottom-0 left-0 right-0 bg-ink text-paper text-[9px] text-center py-0.5">
                hover
              </span>
            )}
            <button
              type="button"
              onClick={() => onDelete(img.id)}
              className="absolute -top-2 -right-2 bg-oxblood text-paper rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Delete image"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-20 h-24 border border-dashed border-stone/40 text-stone text-xs flex items-center justify-center hover:border-ink disabled:opacity-50"
        >
          {isUploading ? 'Uploading…' : '+ Upload'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>
      <p className="text-xs text-stone">
        Requires Cloudinary credentials configured in the backend <code>.env</code> file.
      </p>
    </div>
  )
}
