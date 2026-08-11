import { api } from './client'

export const addressesApi = {
  list: () => api.get('/addresses').then((res) => res.data),
  create: (payload) => api.post('/addresses', payload).then((res) => res.data),
  update: (id, payload) => api.put(`/addresses/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/addresses/${id}`),
}
