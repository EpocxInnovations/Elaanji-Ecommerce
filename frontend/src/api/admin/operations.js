import { api } from '../client'

export const adminCustomersApi = {
  list: (params) => api.get('/admin/customers', { params }).then((res) => res.data),
  get: (id) => api.get(`/admin/customers/${id}`).then((res) => res.data),
  setStatus: (id, isActive) => api.patch(`/admin/customers/${id}/status`, { is_active: isActive }).then((res) => res.data),
}

export const adminCouponsApi = {
  list: () => api.get('/admin/coupons').then((res) => res.data),
  create: (payload) => api.post('/admin/coupons', payload).then((res) => res.data),
  update: (id, payload) => api.put(`/admin/coupons/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/admin/coupons/${id}`),
}

export const adminReviewsApi = {
  list: (params) => api.get('/admin/reviews', { params }).then((res) => res.data),
  setStatus: (id, status) => api.patch(`/admin/reviews/${id}/status`, { status }).then((res) => res.data),
  respond: (id, adminResponse) => api.post(`/admin/reviews/${id}/respond`, { admin_response: adminResponse }).then((res) => res.data),
  remove: (id) => api.delete(`/admin/reviews/${id}`),
}

export const adminBannersApi = {
  list: () => api.get('/admin/banners').then((res) => res.data),
  create: (payload) => api.post('/admin/banners', payload).then((res) => res.data),
  update: (id, payload) => api.put(`/admin/banners/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/admin/banners/${id}`),
  reorder: (items) => api.put('/admin/banners/reorder', { banners: items }).then((res) => res.data),
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/admin/uploads/banners/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((res) => res.data)
  },
}
