import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminSettingsApi } from '../../api/admin/settings'

export function useAdminSettings() {
  const queryClient = useQueryClient()
  const settingsQuery = useQuery({ queryKey: ['admin-settings'], queryFn: adminSettingsApi.getAll })
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-settings'] })

  const updateStoreInfo = useMutation({ mutationFn: (payload) => adminSettingsApi.updateStoreInfo(payload), onSuccess: invalidate })
  const updateShipping = useMutation({ mutationFn: (payload) => adminSettingsApi.updateShipping(payload), onSuccess: invalidate })
  const updateTax = useMutation({ mutationFn: (payload) => adminSettingsApi.updateTax(payload), onSuccess: invalidate })
  const updatePayment = useMutation({ mutationFn: (payload) => adminSettingsApi.updatePayment(payload), onSuccess: invalidate })
  const updateNotifications = useMutation({ mutationFn: (payload) => adminSettingsApi.updateNotifications(payload), onSuccess: invalidate })
  const updateProfile = useMutation({ mutationFn: (payload) => adminSettingsApi.updateProfile(payload) })
  const changePassword = useMutation({ mutationFn: (payload) => adminSettingsApi.changePassword(payload) })

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    updateStoreInfo,
    updateShipping,
    updateTax,
    updatePayment,
    updateNotifications,
    updateProfile,
    changePassword,
  }
}
