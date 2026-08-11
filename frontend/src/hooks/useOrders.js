import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../api/orders'
import { useAuth } from '../context/AuthContext'

export function useOrders() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.list,
    enabled: isAuthenticated,
  })
}

export function useOrder(orderId) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => ordersApi.get(orderId),
    enabled: Boolean(orderId),
  })
}

export function useOrderActions() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['orders'] })

  const createOrder = useMutation({
    mutationFn: (payload) => ordersApi.create(payload),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const cancelOrder = useMutation({
    mutationFn: (orderId) => ordersApi.cancel(orderId),
    onSuccess: invalidate,
  })

  const requestReturn = useMutation({
    mutationFn: ({ orderId, reason }) => ordersApi.requestReturn(orderId, reason),
    onSuccess: invalidate,
  })

  return { createOrder, cancelOrder, requestReturn }
}
