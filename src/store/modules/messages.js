/**
 * 消息未读数 store module。
 * 作为未读数据的单一事实源：NavBar 角标、首页今日动态、消息页共用同一计数，
 * 避免各处写死 mock 数据导致前后不一致（评审 P6）。
 */

import { Messages } from '../../api/messages'

const state = () => ({
  unreadCount: 0,
  loaded: false
})

const getters = {
  unreadCount: (s) => s.unreadCount,
  hasUnread: (s) => s.unreadCount > 0
}

const mutations = {
  setUnreadCount(s, n) {
    s.unreadCount = Math.max(0, Number(n) || 0)
  },
  setLoaded(s, v) {
    s.loaded = !!v
  }
}

const actions = {
  // 从接口拉取消息列表并统计未读数，刷新单一计数源
  async refreshUnread({ commit }) {
    try {
      const res = await Messages.getAllReceivedMessages()
      const list = (res && res.data) || []
      const unread = list.filter((m) => !m.is_read).length
      commit('setUnreadCount', unread)
      commit('setLoaded', true)
      return unread
    } catch (e) {
      return 0
    }
  },
  // 由消息页在本地状态变化后同步计数，保证角标即时更新
  syncUnread({ commit }, count) {
    commit('setUnreadCount', count)
    commit('setLoaded', true)
  }
}

export default { namespaced: true, state, getters, mutations, actions }
