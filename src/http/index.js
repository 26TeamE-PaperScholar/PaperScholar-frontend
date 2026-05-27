import axios from 'axios'

const CSRF_COOKIE_NAME = 'csrftoken'
const CSRF_HEADER_NAME = 'X-CSRFToken'
const SAFE_METHODS = new Set(['get', 'head', 'options', 'trace'])

function readCookie(name) {
  if (typeof document === 'undefined') return ''
  const target = `${name}=`
  const cookie = document.cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(target))
  return cookie ? decodeURIComponent(cookie.slice(target.length)) : ''
}

const service = axios.create({
  baseURL: '/api',
  timeout: 0,
  withCredentials: true,
  xsrfCookieName: CSRF_COOKIE_NAME,
  xsrfHeaderName: CSRF_HEADER_NAME
})

service.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase()
  if (!SAFE_METHODS.has(method)) {
    const csrfToken = readCookie(CSRF_COOKIE_NAME)
    if (csrfToken) {
      config.headers = config.headers || {}
      config.headers[CSRF_HEADER_NAME] = csrfToken
    }
  }
  return config
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
