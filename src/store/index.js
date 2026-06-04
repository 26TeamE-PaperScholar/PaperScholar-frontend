import Vuex from 'vuex'
import compare from './modules/compare'
import assistant from './modules/assistant'
import messages from './modules/messages'

export default new Vuex.Store({
  state: {
    isLoggedIn: false,
    isAdmin: false
  },
  actions: {
  },
  mutations: {
    setIsLoggedIn(state, value) {
      state.isLoggedIn = value
    },
    setIsAdmin(state, value) {
      state.isAdmin = !!value
    }
  },
  modules: {
    compare,
    assistant,
    messages
  }
})
