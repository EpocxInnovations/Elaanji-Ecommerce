import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wishlistApi } from '../api/wishlist'
import { useAuth } from '../context/AuthContext'

export function useWishlist() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const wishlistQuery = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.get,
    enabled: isAuthenticated,
  })

  const setData = (data) => queryClient.setQueryData(['wishlist'], data)

  const addItem = useMutation({
    mutationFn: (productId) => wishlistApi.addItem(productId),
    onSuccess: setData,
  })

  const removeItem = useMutation({
    mutationFn: (itemId) => wishlistApi.removeItem(itemId),
    onSuccess: setData,
  })

  const isWishlisted = (productId) =>
    Boolean(wishlistQuery.data?.items?.some((item) => item.product.id === productId))

  const findItemId = (productId) =>
    wishlistQuery.data?.items?.find((item) => item.product.id === productId)?.id

  return {
    wishlist: wishlistQuery.data,
    isLoading: wishlistQuery.isLoading,
    addItem,
    removeItem,
    isWishlisted,
    findItemId,
  }
}
