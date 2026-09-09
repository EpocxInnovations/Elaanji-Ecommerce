import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { productsApi, categoriesApi } from '../api/products'

export function useProducts(params, options = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    refetchOnMount: true,
    ...options,
  })
}

export function useProduct(slug, options = {}) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getBySlug(slug),
    enabled: Boolean(slug),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    refetchOnMount: true,
    ...options,
  })
}

export function useRelatedProducts(slug, options = {}) {
  return useQuery({
    queryKey: ['product', slug, 'related'],
    queryFn: () => productsApi.getRelated(slug),
    enabled: Boolean(slug),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    refetchOnMount: true,
    ...options,
  })
}

export function useCategories(options = {}) {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    ...options,
  })
}

