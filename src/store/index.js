import Vuex from 'vuex'
import compare from './modules/compare'
import assistant from './modules/assistant'

export default new Vuex.Store({
  state: {
    isLoggedIn: false
  },
  actions: {
  },
  mutations: {
    setIsLoggedIn(state, value) {
      state.isLoggedIn = value
    }
  },
  modules: {
    compare,
    assistant
  }
})
