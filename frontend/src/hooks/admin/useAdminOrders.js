import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminOrdersApi, adminRefundsApi } from '../../api/admin/orders'

export function useAdminOrders(params) {
  return useQuery({ queryKey: ['admin-orders', params], queryFn: () => adminOrdersApi.list(params) })
}

export function useAdminOrder(id) {
  return useQuery({ queryKey: ['admin-orders', id], queryFn: () => adminOrdersApi.get(id), enabled: Boolean(id) })
}

export function useAdminOrderActions() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] })

  const updateStatus = useMutation({
    mutationFn: ({ id, status, note }) => adminOrdersApi.updateStatus(id, status, note),
    onSuccess: invalidate,
  })

  return { updateStatus }
}

export function useAdminRefunds(status) {
  return useQuery({ queryKey: ['admin-refunds', status], queryFn: () => adminRefundsApi.list(status) })
}

export function useAdminRefundActions() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-refunds'] })
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
  }

  const approve = useMutation({ mutationFn: ({ id, adminNote }) => adminRefundsApi.approve(id, adminNote), onSuccess: invalidate })
  const reject = useMutation({ mutationFn: ({ id, adminNote }) => adminRefundsApi.reject(id, adminNote), onSuccess: invalidate })
  const markReceived = useMutation({ mutationFn: ({ id, adminNote }) => adminRefundsApi.markReceived(id, adminNote), onSuccess: invalidate })
  const complete = useMutation({ mutationFn: ({ id, adminNote }) => adminRefundsApi.complete(id, adminNote), onSuccess: invalidate })

  return { approve, reject, markReceived, complete }
}
