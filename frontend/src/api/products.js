import { api } from './client'

export const productsApi = {
  list: (params) => api.get('/products', { params }).then((res) => res.data),
  getBySlug: (slug) => api.get(`/products/${slug}`).then((res) => res.data),
  getRelated: (slug) => api.get(`/products/${slug}/related`).then((res) => res.data),
}

export const categoriesApi = {
  list: () => api.get('/categories').then((res) => res.data),
}
