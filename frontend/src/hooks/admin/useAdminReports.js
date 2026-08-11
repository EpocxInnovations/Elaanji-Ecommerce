import { useQuery, useMutation } from '@tanstack/react-query'
import { adminReportsApi } from '../../api/admin/reports'

export function useDashboardKpis() {
  return useQuery({ queryKey: ['admin-dashboard-kpis'], queryFn: adminReportsApi.getKpis })
}

export function useRecentOrders(limit = 10) {
  return useQuery({ queryKey: ['admin-dashboard-recent-orders', limit], queryFn: () => adminReportsApi.getRecentOrders(limit) })
}

export function useLowStockAlert(limit = 10) {
  return useQuery({ queryKey: ['admin-dashboard-low-stock', limit], queryFn: () => adminReportsApi.getLowStock(limit) })
}

export function useSalesReport(params) {
  return useQuery({ queryKey: ['admin-sales-report', params], queryFn: () => adminReportsApi.getSales(params) })
}

export function useBestSellingProducts(params) {
  return useQuery({ queryKey: ['admin-best-selling', params], queryFn: () => adminReportsApi.getBestSelling(params) })
}

export function useOrderStatusBreakdown() {
  return useQuery({ queryKey: ['admin-status-breakdown'], queryFn: adminReportsApi.getOrderStatusBreakdown })
}

export function useCustomerReport(params) {
  return useQuery({ queryKey: ['admin-customer-report', params], queryFn: () => adminReportsApi.getCustomerReport(params) })
}

export function useCsvExport() {
  return useMutation({ mutationFn: (params) => adminReportsApi.exportSalesCsv(params) })
}
