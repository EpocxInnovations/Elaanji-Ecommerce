import { useQuery } from '@tanstack/react-query'
import { productsApi, categoriesApi } from '../api/products'

export function useProducts(params) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.list(params),
    placeholderData: (prev) => prev,
  })
}

export function useProduct(slug) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getBySlug(slug),
    enabled: Boolean(slug),
  })
}

export function useRelatedProducts(slug) {
  return useQuery({
    queryKey: ['product', slug, 'related'],
    queryFn: () => productsApi.getRelated(slug),
    enabled: Boolean(slug),
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
    staleTime: 5 * 60 * 1000,
  })
}
