import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { bannersApi } from '../api/banners'

export function useBanners(placement) {
  return useQuery({
    queryKey: ['banners', placement],
    queryFn: () => bannersApi.list(placement),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    refetchOnMount: true,
  })
}
