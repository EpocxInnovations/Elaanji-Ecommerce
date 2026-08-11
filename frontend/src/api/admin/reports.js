import { api } from '../client'

export const adminReportsApi = {
  getKpis: () => api.get('/admin/dashboard/kpis').then((res) => res.data),
  getRecentOrders: (limit) => api.get('/admin/dashboard/recent-orders', { params: { limit } }).then((res) => res.data),
  getLowStock: (limit) => api.get('/admin/dashboard/low-stock', { params: { limit } }).then((res) => res.data),
  getSales: (params) => api.get('/admin/reports/sales', { params }).then((res) => res.data),
  getBestSelling: (params) => api.get('/admin/reports/products/best-selling', { params }).then((res) => res.data),
  getWorstPerforming: (params) => api.get('/admin/reports/products/worst-performing', { params }).then((res) => res.data),
  getMostViewed: (params) => api.get('/admin/reports/products/most-viewed', { params }).then((res) => res.data),
  getCategoryPerformance: (params) => api.get('/admin/reports/categories', { params }).then((res) => res.data),
  getCustomerReport: (params) => api.get('/admin/reports/customers', { params }).then((res) => res.data),
  getOrderStatusBreakdown: () => api.get('/admin/reports/orders/status-breakdown').then((res) => res.data),
  exportSalesCsv: async (params) => {
    const response = await api.get('/admin/reports/sales/export', { params, responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `sales-report-${params.granularity || 'daily'}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
