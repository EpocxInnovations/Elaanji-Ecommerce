import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminInventoryApi } from '../../api/admin/inventory'

export function useAdminInventory(lowStockOnly) {
  return useQuery({
    queryKey: ['admin-inventory', lowStockOnly],
    queryFn: () => adminInventoryApi.list(lowStockOnly),
  })
}

export function useAdminInventoryActions() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-inventory'] })

  const adjustStock = useMutation({
    mutationFn: ({ variantId, changeQuantity, note }) => adminInventoryApi.adjust(variantId, changeQuantity, note),
    onSuccess: invalidate,
  })

  return { adjustStock }
}
