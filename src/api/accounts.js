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

export class Account {
  static async login(data) {
    if (USE_MOCK) {
      VueCookies.set('user_id', mockUser.id, '7d')
      return mockResponse({ user_id: mockUser.id, username: mockUser.username, token: 'mock-token' })
    }
    return service(url.login, { method: 'post', data }).then((response) => {
      const userId = response && response.data && response.data.user_id
      if (userId) VueCookies.set('user_id', userId, '7d')
      return response
    })
  }

  static async logout() {
    if (USE_MOCK) {
      VueCookies.remove('user_id')
      return mockResponse({ ok: true })
    }
    return service(url.logout, { method: 'get' }).then((response) => {
      VueCookies.remove('user_id')
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
