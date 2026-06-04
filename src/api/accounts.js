import service from '../http'
import VueCookies from 'vue-cookies'
import { USE_MOCK, mockResponse, mockUser } from '../mock'

const url = {
  active: '/accounts/active/',
  login: '/accounts/login/',
  logout: '/accounts/logout/',
  passwordChange: '/accounts/password_change/',
  passwordReset: '/accounts/password_reset/',
  sendPasswordResetEmail: '/accounts/send_password_reset_email/',
  register: '/accounts/register/'
}

// 从用户/登录数据中判定是否为管理员（兼容多种后端字段命名）
function resolveIsAdmin(data) {
  if (!data) return false
  return !!(
    data.is_admin ||
    data.is_staff ||
    data.is_superuser ||
    data.role === 'admin' ||
    data.user_type === 'admin'
  )
}

export class Account {
  static async login(data) {
    if (USE_MOCK) {
      // mock 模式忽略账密：邮箱含 admin 视为管理员，便于演示后台；其余为普通用户
      const isAdmin = /admin/i.test((data && data.email) || '')
      VueCookies.set('user_id', mockUser.id, '7d')
      VueCookies.set('ps_role', isAdmin ? 'admin' : 'user', '7d')
      return mockResponse({
        user_id: mockUser.id,
        username: mockUser.username,
        token: 'mock-token',
        is_admin: isAdmin
      })
    }
    return service(url.login, { method: 'post', data }).then((response) => {
      const payload = (response && response.data) || {}
      const userId = payload.user_id
      if (userId) VueCookies.set('user_id', userId, '7d')
      VueCookies.set('ps_role', resolveIsAdmin(payload) ? 'admin' : 'user', '7d')
      return response
    })
  }

  static async logout() {
    if (USE_MOCK) {
      VueCookies.remove('user_id')
      VueCookies.remove('ps_role')
      return mockResponse({ ok: true })
    }
    return service(url.logout, { method: 'get' }).then((response) => {
      VueCookies.remove('user_id')
      VueCookies.remove('ps_role')
      return response
    })
  }

  static async passwordChange(data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.passwordChange, { method: 'patch', data })
  }

  static async passwordReset(data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.passwordReset, { method: 'patch', data })
  }

  static async sendPasswordResetEmail(data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.sendPasswordResetEmail, { method: 'post', data })
  }

  static async register(data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.register, { method: 'post', data })
  }
}
