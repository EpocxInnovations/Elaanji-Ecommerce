import { api } from '../client'

export const adminOrdersApi = {
  list: (params) => api.get('/admin/orders', { params }).then((res) => res.data),
  get: (id) => api.get(`/admin/orders/${id}`).then((res) => res.data),
  updateStatus: (id, status, note) => api.patch(`/admin/orders/${id}/status`, { status, note }).then((res) => res.data),
}

export const adminRefundsApi = {
  list: (status) => api.get('/admin/refunds', { params: { status } }).then((res) => res.data),
  approve: (id, adminNote) => api.post(`/admin/refunds/${id}/approve`, { admin_note: adminNote }).then((res) => res.data),
  reject: (id, adminNote) => api.post(`/admin/refunds/${id}/reject`, { admin_note: adminNote }).then((res) => res.data),
  markReceived: (id, adminNote) => api.post(`/admin/refunds/${id}/mark-received`, { admin_note: adminNote }).then((res) => res.data),
  complete: (id, adminNote) => api.post(`/admin/refunds/${id}/complete`, { admin_note: adminNote }).then((res) => res.data),
}
