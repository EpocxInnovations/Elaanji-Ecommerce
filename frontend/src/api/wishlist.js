import { api } from './client'

export const wishlistApi = {
  get: () => api.get('/wishlist').then((res) => res.data),
  addItem: (productId) => api.post('/wishlist/items', { product_id: productId }).then((res) => res.data),
  removeItem: (itemId) => api.delete(`/wishlist/items/${itemId}`).then((res) => res.data),
}
