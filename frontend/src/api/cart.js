import { api } from './client'

export const cartApi = {
  get: () => api.get('/cart').then((res) => res.data),
  addItem: (variantId, quantity = 1) =>
    api.post('/cart/items', { variant_id: variantId, quantity }).then((res) => res.data),
  updateItem: (itemId, payload) =>
    api.patch(`/cart/items/${itemId}`, payload).then((res) => res.data),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`).then((res) => res.data),
}
