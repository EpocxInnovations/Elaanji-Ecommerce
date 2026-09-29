import { api } from '../client'

export const adminCategoriesApi = {
  list: () => api.get('/admin/categories').then((res) => res.data),
  create: (payload) => api.post('/admin/categories', payload).then((res) => res.data),
  update: (id, payload) => api.put(`/admin/categories/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/admin/categories/${id}`),
  reorder: (categories) => api.put('/admin/categories/reorder', { categories }).then((res) => res.data),
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/admin/uploads/categories/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data)
  },
}
