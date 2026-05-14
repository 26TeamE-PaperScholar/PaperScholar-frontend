import Vuex from 'vuex'
import compare from './modules/compare'

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
    compare
  }
})
