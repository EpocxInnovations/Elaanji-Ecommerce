import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addressesApi } from '../api/addresses'
import { useAuth } from '../context/AuthContext'

export function useAddresses() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const addressesQuery = useQuery({
    queryKey: ['addresses'],
    queryFn: addressesApi.list,
    enabled: isAuthenticated,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['addresses'] })

  const createAddress = useMutation({
    mutationFn: (payload) => addressesApi.create(payload),
    onSuccess: invalidate,
  })

  const updateAddress = useMutation({
    mutationFn: ({ id, payload }) => addressesApi.update(id, payload),
    onSuccess: invalidate,
  })

  const removeAddress = useMutation({
    mutationFn: (id) => addressesApi.remove(id),
    onSuccess: invalidate,
  })

  return {
    addresses: addressesQuery.data || [],
    isLoading: addressesQuery.isLoading,
    createAddress,
    updateAddress,
    removeAddress,
  }
}
