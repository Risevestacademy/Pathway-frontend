import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let pendingRequests: Array<() => void> = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    const isRefreshCall = originalRequest?.url === '/auth/refresh'
    if (error.response?.status !== 401 || originalRequest._retry || isRefreshCall) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push(() => resolve(api(originalRequest)))
      })
    }

    isRefreshing = true
    try {
      const { data } = await api.post('/auth/refresh')
      useAuthStore.getState().setAccessToken(data.data.accessToken)
      pendingRequests.forEach((retry) => retry())
      pendingRequests = []
      return api(originalRequest)
    } catch (refreshError) {
      pendingRequests = []
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)