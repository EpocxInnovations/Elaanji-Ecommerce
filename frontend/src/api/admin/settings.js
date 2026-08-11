import { api } from '../client'

export const adminSettingsApi = {
  getAll: () => api.get('/admin/settings').then((res) => res.data),
  updateStoreInfo: (payload) => api.put('/admin/settings/store-info', payload).then((res) => res.data),
  updateShipping: (payload) => api.put('/admin/settings/shipping', payload).then((res) => res.data),
  updateTax: (payload) => api.put('/admin/settings/tax', payload).then((res) => res.data),
  updatePayment: (payload) => api.put('/admin/settings/payment', payload).then((res) => res.data),
  updateNotifications: (payload) => api.put('/admin/settings/notifications', payload).then((res) => res.data),
  updateProfile: (payload) => api.put('/admin/settings/profile', payload).then((res) => res.data),
  changePassword: (payload) => api.post('/admin/settings/change-password', payload).then((res) => res.data),
}
