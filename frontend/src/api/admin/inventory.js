import { api } from '../client'

export const adminInventoryApi = {
  list: (params) => api.get('/admin/inventory', { params }).then((res) => res.data),
  adjust: (variantId, changeQuantity, note) =>
    api.post('/admin/inventory/adjust', { variant_id: variantId, change_quantity: changeQuantity, note }).then((res) => res.data),
  getHistory: (variantId) => api.get(`/admin/inventory/${variantId}/history`).then((res) => res.data),
}
