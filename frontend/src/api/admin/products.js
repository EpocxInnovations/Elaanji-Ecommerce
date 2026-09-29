import { api } from '../client'

export const adminProductsApi = {
  list: (params) => api.get('/admin/products', { params }).then((res) => res.data),
  get: (id) => api.get(`/admin/products/${id}`).then((res) => res.data),
  create: (payload) => api.post('/admin/products', payload).then((res) => res.data),
  update: (id, payload) => api.put(`/admin/products/${id}`, payload).then((res) => res.data),
  setStatus: (id, status) => api.patch(`/admin/products/${id}/status`, { status }).then((res) => res.data),
  duplicate: (id) => api.post(`/admin/products/${id}/duplicate`).then((res) => res.data),
  deleteImage: (productId, imageId) => api.delete(`/admin/products/${productId}/images/${imageId}`),
  reorderImages: (productId, images) =>
    api.put(`/admin/products/${productId}/images/reorder`, { images }).then((res) => res.data),
  uploadImage: (productId, file, color, isHoverImage, variantId) => {
    const formData = new FormData()
    formData.append('file', file)
    if (color) formData.append('color', color)
    if (variantId) formData.append('variant_id', variantId)
    formData.append('is_hover_image', isHoverImage ? 'true' : 'false')
    return api
      .post(`/admin/uploads/products/${productId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data)
  },
}
