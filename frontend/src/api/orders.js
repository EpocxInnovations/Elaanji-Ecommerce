import { api } from './client'

export const ordersApi = {
  list: () => api.get('/orders').then((res) => res.data),
  get: (id) => api.get(`/orders/${id}`).then((res) => res.data),
  create: (payload) => api.post('/orders', payload).then((res) => res.data),
  cancel: (id) => api.post(`/orders/${id}/cancel`).then((res) => res.data),
  requestReturn: (id, reason) => api.post(`/orders/${id}/return`, { reason }).then((res) => res.data),
}

export const paymentsApi = {
  createRazorpayOrder: (orderId) =>
    api.post('/payments/razorpay/order', { order_id: orderId }).then((res) => res.data),
  verifyRazorpayPayment: (payload) => api.post('/payments/razorpay/verify', payload).then((res) => res.data),
}

export const couponsApi = {
  validate: (code, cartSubtotal) =>
    api.post('/coupons/validate', { code, cart_subtotal: cartSubtotal }).then((res) => res.data),
}
