import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartApi } from '../api/cart'
import { useAuth } from '../context/AuthContext'

export function useCart() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.get,
    enabled: isAuthenticated,
  })

  const invalidate = (data) => queryClient.setQueryData(['cart'], data)

  const addItem = useMutation({
    mutationFn: ({ variantId, quantity }) => cartApi.addItem(variantId, quantity),
    onSuccess: invalidate,
  })

  const updateItem = useMutation({
    mutationFn: ({ itemId, payload }) => cartApi.updateItem(itemId, payload),
    onSuccess: invalidate,
  })

  const removeItem = useMutation({
    mutationFn: (itemId) => cartApi.removeItem(itemId),
    onSuccess: invalidate,
  })

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    addItem,
    updateItem,
    removeItem,
  }
}
