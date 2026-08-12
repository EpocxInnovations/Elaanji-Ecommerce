import { api } from './client'

export const authApi = {
  register: (payload) => api.post('/auth/register', payload).then((res) => res.data),
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me').then((res) => res.data),
  loginWithGoogle: (credential) => api.post('/auth/google', { credential }).then((res) => res.data),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload).then((res) => res.data),
  verifyResetOtp: (payload) => api.post('/auth/verify-reset-otp', payload).then((res) => res.data),
  resetPassword: (payload) => api.post('/auth/reset-password', payload).then((res) => res.data),
}

