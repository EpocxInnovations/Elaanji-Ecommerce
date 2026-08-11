import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminCategoriesApi } from '../../api/admin/categories'

export function useAdminCategories() {
  const queryClient = useQueryClient()

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminCategoriesApi.list,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    queryClient.invalidateQueries({ queryKey: ['categories'] })
  }

  const createCategory = useMutation({ mutationFn: (payload) => adminCategoriesApi.create(payload), onSuccess: invalidate })
  const updateCategory = useMutation({
    mutationFn: ({ id, payload }) => adminCategoriesApi.update(id, payload),
    onSuccess: invalidate,
  })
  const removeCategory = useMutation({ mutationFn: (id) => adminCategoriesApi.remove(id), onSuccess: invalidate })
  const reorderCategories = useMutation({ mutationFn: (categories) => adminCategoriesApi.reorder(categories), onSuccess: invalidate })

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    createCategory,
    updateCategory,
    removeCategory,
    reorderCategories,
  }
}
