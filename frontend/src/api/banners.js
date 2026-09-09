import { api } from './client'

export const bannersApi = {
  list: (placement) =>
    api.get('/banners', { params: placement ? { placement } : undefined }).then((res) => res.data),
}
