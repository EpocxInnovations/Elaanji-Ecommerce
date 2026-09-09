import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminCustomersApi, adminCouponsApi, adminReviewsApi, adminBannersApi } from '../../api/admin/operations'

export function useAdminCustomers(search) {
  return useQuery({ queryKey: ['admin-customers', search], queryFn: () => adminCustomersApi.list(search) })
}

export function useAdminCustomerActions() {
  const queryClient = useQueryClient()
  const setStatus = useMutation({
    mutationFn: ({ id, isActive }) => adminCustomersApi.setStatus(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-customers'] }),
  })
  return { setStatus }
}

export function useAdminCoupons() {
  const queryClient = useQueryClient()
  const couponsQuery = useQuery({ queryKey: ['admin-coupons'], queryFn: adminCouponsApi.list })
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })

  const createCoupon = useMutation({ mutationFn: (payload) => adminCouponsApi.create(payload), onSuccess: invalidate })
  const updateCoupon = useMutation({ mutationFn: ({ id, payload }) => adminCouponsApi.update(id, payload), onSuccess: invalidate })
  const removeCoupon = useMutation({ mutationFn: (id) => adminCouponsApi.remove(id), onSuccess: invalidate })

  return { coupons: couponsQuery.data || [], isLoading: couponsQuery.isLoading, createCoupon, updateCoupon, removeCoupon }
}

export function useAdminReviews(status) {
  return useQuery({ queryKey: ['admin-reviews', status], queryFn: () => adminReviewsApi.list(status) })
}

export function useAdminReviewActions() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })

  const setStatus = useMutation({ mutationFn: ({ id, status }) => adminReviewsApi.setStatus(id, status), onSuccess: invalidate })
  const respond = useMutation({ mutationFn: ({ id, adminResponse }) => adminReviewsApi.respond(id, adminResponse), onSuccess: invalidate })
  const remove = useMutation({ mutationFn: (id) => adminReviewsApi.remove(id), onSuccess: invalidate })

  return { setStatus, respond, remove }
}

export function useAdminBanners() {
  const queryClient = useQueryClient()
  const bannersQuery = useQuery({ queryKey: ['admin-banners'], queryFn: adminBannersApi.list })
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-banners'] })
    queryClient.invalidateQueries({ queryKey: ['banners'] })
  }

  const createBanner = useMutation({ mutationFn: (payload) => adminBannersApi.create(payload), onSuccess: invalidate })
  const updateBanner = useMutation({ mutationFn: ({ id, payload }) => adminBannersApi.update(id, payload), onSuccess: invalidate })
  const removeBanner = useMutation({ mutationFn: (id) => adminBannersApi.remove(id), onSuccess: invalidate })
  const reorderBanners = useMutation({ mutationFn: (items) => adminBannersApi.reorder(items), onSuccess: invalidate })
  const uploadImage = useMutation({ mutationFn: (file) => adminBannersApi.uploadImage(file) })

  return {
    banners: bannersQuery.data || [],
    isLoading: bannersQuery.isLoading,
    createBanner,
    updateBanner,
    removeBanner,
    reorderBanners,
    uploadImage,
  }
}
