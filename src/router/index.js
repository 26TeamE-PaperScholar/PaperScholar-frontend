import { createRouter, createWebHistory } from 'vue-router'
import VueCookies from 'vue-cookies'
import IntroView from '../views/intro/IntroView.vue'
import SearchResultView from '../views/search-result/SearchResultView.vue'
import AdminView from '../views/admin/AdminView.vue'
import SearchView from '../views/search/SearchView.vue'
import PersonalHomepageView from '../views/personal-homepage/PersonalHomepageView.vue'
import MessageView from '../views/message/MessageView.vue'
import PaperDetailView from '../views/paper/PaperDetailView.vue'
import ScholarPortalView from '../views/scholar-portal/ScholarPortalView.vue'
import InstitutionView from '../views/institution/InstitutionView.vue'
import TagDetailView from '../views/tags/TagDetailView.vue'
import AuthView from '../views/auth/AuthView.vue'
import PasswordReset from '../views/password-reset/PasswordReset.vue'
import PaperCompareView from '../views/paper-compare/PaperCompareView.vue'
import AiAssistantView from '../views/ai-assistant/AiAssistantView.vue'

import store from '../store'

const AUTH_REQUIRED_PATHS = new Set([
  '/personal_homepage',
  '/message',
  '/admin',
  '/search',
  '/ai_assistant'
])

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, left: 0 }
  },
  routes: [
    { path: '/', component: IntroView },
    { path: '/search_result', component: SearchResultView },
    { path: '/personal_homepage', component: PersonalHomepageView },
    { path: '/search', component: SearchView },
    { path: '/auth', component: AuthView },
    { path: '/login', redirect: { path: '/auth', query: { mode: 'login' } } },
    { path: '/register', redirect: { path: '/auth', query: { mode: 'register' } } },
    { path: '/password_reset', component: PasswordReset },
    { path: '/message', component: MessageView },
    { path: '/paper_detail/:id', component: PaperDetailView },
    { path: '/scholar_portal/:id', component: ScholarPortalView },
    { path: '/institution_detail/:id', component: InstitutionView },
    { path: '/tag_detail/:id', component: TagDetailView },
    { path: '/admin', component: AdminView },
    { path: '/paper_compare', component: PaperCompareView },
    { path: '/ai_assistant', component: AiAssistantView }
  ]
})

function resolveLoginState() {
  const hasUserCookie = !!VueCookies.get('user_id')
  const isLoggedIn = !!(store.state.isLoggedIn || hasUserCookie)
  if (store.state.isLoggedIn !== isLoggedIn) {
    store.commit('setIsLoggedIn', isLoggedIn)
  }
  return isLoggedIn
}

router.beforeEach((to, from, next) => {
  const isLoggedIn = resolveLoginState()
  if (!isLoggedIn && AUTH_REQUIRED_PATHS.has(to.path)) {
    next({
      path: '/auth',
      query: {
        mode: 'login',
        redirect: to.fullPath,
        reason: 'login-required'
      }
    })
  } else {
    next()
  }
})

export default router
