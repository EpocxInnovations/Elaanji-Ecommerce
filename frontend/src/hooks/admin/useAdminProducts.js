import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminProductsApi } from '../../api/admin/products'

export function useAdminProducts(params) {
  return useQuery({
    queryKey: ['admin-products', params],
    queryFn: () => adminProductsApi.list(params),
  })
}

export function useAdminProduct(id) {
  return useQuery({
    queryKey: ['admin-products', id],
    queryFn: () => adminProductsApi.get(id),
    enabled: Boolean(id),
  })
}

export function useAdminProductActions() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  const createProduct = useMutation({ mutationFn: (payload) => adminProductsApi.create(payload), onSuccess: invalidate })
  const updateProduct = useMutation({
    mutationFn: ({ id, payload }) => adminProductsApi.update(id, payload),
    onSuccess: invalidate,
  })
  const setStatus = useMutation({
    mutationFn: ({ id, status }) => adminProductsApi.setStatus(id, status),
    onSuccess: invalidate,
  })
  const duplicateProduct = useMutation({ mutationFn: (id) => adminProductsApi.duplicate(id), onSuccess: invalidate })
  const uploadImage = useMutation({
    mutationFn: ({ productId, file, color, isHoverImage }) =>
      adminProductsApi.uploadImage(productId, file, color, isHoverImage),
    onSuccess: invalidate,
  })
  const deleteImage = useMutation({
    mutationFn: ({ productId, imageId }) => adminProductsApi.deleteImage(productId, imageId),
    onSuccess: invalidate,
  })

  return { createProduct, updateProduct, setStatus, duplicateProduct, uploadImage, deleteImage }
}
