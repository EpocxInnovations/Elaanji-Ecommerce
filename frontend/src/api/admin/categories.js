import { api } from '../client'

export const adminCategoriesApi = {
  list: () => api.get('/admin/categories').then((res) => res.data),
  create: (payload) => api.post('/admin/categories', payload).then((res) => res.data),
  update: (id, payload) => api.put(`/admin/categories/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/admin/categories/${id}`),
  reorder: (categories) => api.put('/admin/categories/reorder', { categories }).then((res) => res.data),
}
