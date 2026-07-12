import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ttc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ttc_token')
      const path = window.location.pathname
      if (path !== '/login' && path !== '/register' && path !== '/apply') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default client
