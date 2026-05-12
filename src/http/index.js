import axios from 'axios'

const service = axios.create({
  baseURL: '/api',
  timeout: 0,
  withCredentials: true
})

// 静默错误：mock 模式下后端不可达时不报红
service.interceptors.response.use(
  (res) => res,
  (err) => {
    if (import.meta.env.VITE_USE_MOCK !== 'false') {
      console.warn('[http] request failed in mock mode, swallowed:', err.config && err.config.url)
      return Promise.resolve({ data: null, status: 0 })
    }
    return Promise.reject(err)
  }
)

export default service
