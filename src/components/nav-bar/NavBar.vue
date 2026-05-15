<template>
  <header class="ps-nav">
    <div class="ps-nav__inner">
      <button class="ps-nav__brand" @click="backToHome" aria-label="PaperScholar 主页">
        <span class="ps-nav__brand-mark" aria-hidden="true">
          <svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ps-brand-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#2D1B69" />
                <stop offset="100%" stop-color="#D4AF37" />
              </linearGradient>
            </defs>
            <rect width="28" height="28" rx="8" fill="url(#ps-brand-grad)" />
            <path d="M9 8h7c2.8 0 4.6 1.7 4.6 4.2 0 2.6-1.8 4.3-4.6 4.3h-3.4V20H9V8Zm6.6 5.9c1.3 0 2.1-.7 2.1-1.7 0-1.1-.8-1.7-2.1-1.7h-3v3.4h3Z" fill="#fff" />
          </svg>
        </span>
        <span class="ps-nav__brand-text">
          <span class="ps-nav__brand-name">PaperScholar</span>
          <span class="ps-nav__brand-tag">学术检索 · 智能导航</span>
        </span>
      </button>

      <nav class="ps-nav__links" aria-label="primary">
        <button
          v-for="item in links"
          :key="item.path"
          class="ps-nav__link"
          :class="{ 'ps-nav__link--active': isActive(item) }"
          @click="navigate(item)"
        >
          {{ $t(item.labelKey) || item.fallback }}
        </button>
      </nav>

      <form class="ps-nav__search" @submit.prevent="searchFromNav">
        <AppIcon name="Search" :size="16" />
        <input
          v-model="navSearchKeyword"
          type="text"
          :placeholder="$t('huge_input_placeholder')"
          aria-label="search"
        />
        <AppKbdHint size="sm">⌘K</AppKbdHint>
      </form>

      <div class="ps-nav__actions">
        <button class="ps-nav__icon-btn" :aria-label="$t('change_lang') || 'lang'" @click="toggleLocale">
          <AppIcon name="LanguageOutline" :size="18" />
        </button>
        <ColorSetter />
        

        <template v-if="!isLoggedIn">
          <button class="ps-nav__btn ps-nav__btn--ghost" @click="jumpToAuth('login')">{{ $t('login_text') }}</button>
          <button class="ps-nav__btn ps-nav__btn--primary" @click="jumpToAuth('register')">{{ $t('register_text') }}</button>
        </template>

        <template v-else>
          <button class="ps-nav__icon-btn ps-nav__icon-btn--with-dot" @click="jumpToMessage" :aria-label="'messages'">
            <AppIcon name="Notifications" :size="18" />
            <span v-if="hasUnreadMessage" class="ps-nav__dot" aria-hidden="true"></span>
          </button>

          <div class="ps-nav__profile" tabindex="0">
            <AppAvatar :name="currentUsername" :id="currentUserId" size="sm" />
            <span class="ps-nav__profile-name">{{ currentUsername }}</span>
            <AppIcon name="ChevronDown" :size="14" />
            <ul class="ps-nav__dropdown" role="menu">
              <li @click="jumpToPersonalHomepage">
                <AppIcon name="Person" :size="14" />
                {{ $t('personal_homepage_text') }}
              </li>
              <li @click="jumpToChangePassword">
                <AppIcon name="LockClosed" :size="14" />
                {{ $t('change_password_text') }}
              </li>
              <li class="ps-nav__dropdown-danger" @click="handleLogout">
                <AppIcon name="LogOut" :size="14" />
                {{ $t('logout_text') }}
              </li>
            </ul>
          </div>
        </template>
      </div>
    </div>
    <ChangePasswordModal :show="changePasswordModalShow" @close="changePasswordModalShow = false" />
  </header>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import ChangePasswordModal from '../modals/ChangePasswordModal.vue'
import ColorSetter from '../color/ColorSetter.vue'
import { Account } from '../../api/accounts.js'
import { User } from '../../api/users.js'
import AppIcon from '../ui/Icon.vue'
import AppAvatar from '../ui/Avatar.vue'
import AppKbdHint from '../ui/KbdHint.vue'

export default {
  name: 'NavBar',
  components: {
    ChangePasswordModal,
    ColorSetter,
    AppIcon,
    AppAvatar,
    AppKbdHint
  },
  data() {
    return {
      hasUnreadMessage: true,
      changePasswordModalShow: false,
      currentUsername: '',
      currentUserId: '',
      navSearchKeyword: '',
      links: [
        { path: '/', labelKey: 'nav_home', fallback: '首页' },
        { path: '/search_result', labelKey: 'nav_explore', fallback: '探索' },
        { path: '/ai_assistant', labelKey: 'nav_assistant', fallback: 'AI 助手', requireLogin: true },
        { path: '/personal_homepage', labelKey: 'nav_my', fallback: '我的', requireLogin: true }
      ]
    }
  },
  computed: {
    ...mapState(['isLoggedIn'])
  },
  watch: {
    isLoggedIn(newValue) {
      if (newValue === true) {
        this.getUserIdAndSayHello()
      }
    }
  },
  mounted() {
    this.$bus.on('judgeHasUnreadMsg', this.handleJudgeHasUnreadMsg)
    this.getUserIdAndSayHello()
    window.addEventListener('keydown', this.handleHotkey)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleHotkey)
  },
  methods: {
    ...mapMutations(['setIsLoggedIn']),
    getUserIdAndSayHello() {
      const userId = this.$cookies.get('user_id')
      if (userId) {
        this.setIsLoggedIn(true)
        this.currentUserId = userId
        User.getUser(userId).then(
          (response) => {
            const data = response && response.data
            if (data && data.username) this.currentUsername = data.username
          },
          () => {}
        )
      }
    },
    handleJudgeHasUnreadMsg(payload) {
      this.hasUnreadMessage = !!(payload && payload.hasUnread)
    },
    toggleLocale() {
      document.documentElement.classList.add('document-fade-out')
      setTimeout(() => {
        document.documentElement.classList.remove('document-fade-out')
        this.$i18n.locale = this.$i18n.locale === 'zh' ? 'en' : 'zh'
        document.documentElement.classList.add('document-fade-in')
        setTimeout(() => document.documentElement.classList.remove('document-fade-in'), 610)
      }, 200)
    },
    isActive(item) {
      if (item.path === '/') return this.$route.path === '/' || this.$route.path === '/search'
      return this.$route.path.startsWith(item.path)
    },
    navigate(item) {
      if (item.requireLogin && !this.isLoggedIn) {
        this.$router.push(item.path)
        return
      }
      if (item.path === '/search_result') {
        this.$router.push({ path: item.path, query: { search: '', search_type: 1, per_page: '10', page: '1' } })
        return
      }
      this.$router.push(item.path)
    },
    backToHome() {
      this.$router.push(this.isLoggedIn ? '/search' : '/')
    },
    jumpToMessage() {
      this.$router.push('/message')
    },
    jumpToPersonalHomepage() {
      this.$router.push('/personal_homepage')
    },
    jumpToAuth(mode) {
      this.$router.push({ path: '/auth', query: { mode } })
    },
    searchFromNav() {
      const keyword = this.navSearchKeyword.trim()
      if (!keyword) return
      this.$router.push({
        path: '/search_result',
        query: {
          filter: '',
          search: keyword,
          sort: '',
          per_page: '10',
          page: '1',
          cursor: '',
          search_type: 1
        }
      })
    },
    handleLogout() {
      Account.logout().then(
        () => {
          this.setIsLoggedIn(false)
          this.currentUsername = ''
          this.$router.push('/')
        },
        () => {}
      )
    },
    jumpToChangePassword() {
      this.changePasswordModalShow = true
    },
    handleHotkey(e) {
      const cmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'
      if (cmdK) {
        e.preventDefault()
        const input = this.$el && this.$el.querySelector('.ps-nav__search input')
        if (input) input.focus()
      }
    }
  }
}
</script>

<style scoped>
.ps-nav {
  position: sticky;
  top: 0;
  width: 100%;
  height: var(--ps-nav-height);
  z-index: 999;
  backdrop-filter: saturate(140%) blur(18px);
  -webkit-backdrop-filter: saturate(140%) blur(18px);
  background: var(--theme-mode-translucent);
  border-bottom: 1px solid var(--ps-border-1);
}

.ps-nav__inner {
  height: 100%;
  display: flex;
  align-items: center;
  gap: var(--ps-space-5);
  max-width: var(--ps-content-max);
  margin: 0 auto;
  padding: 0 var(--ps-space-6);
}

.ps-nav__brand {
  display: flex;
  align-items: center;
  gap: var(--ps-space-3);
  background: transparent;
  border: 0;
  padding: 6px;
  border-radius: var(--ps-radius-md);
  cursor: pointer;
}

.ps-nav__brand:hover {
  background: var(--ps-color-primary-soft);
}

.ps-nav__brand-mark {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--ps-shadow-2);
}

.ps-nav__brand-mark svg {
  width: 100%;
  height: 100%;
  display: block;
}

.ps-nav__brand-text {
  display: flex;
  flex-direction: column;
  text-align: left;
  line-height: 1.1;
}

.ps-nav__brand-name {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-lg);
  font-weight: 700;
  color: var(--ps-text-1);
}

.ps-nav__brand-tag {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ps-color-accent-strong);
  margin-top: 2px;
}

.ps-nav__links {
  display: flex;
  gap: var(--ps-space-1);
  margin-left: var(--ps-space-3);
}

.ps-nav__link {
  position: relative;
  padding: 8px 14px;
  font-size: var(--ps-fs-sm);
  font-weight: 600;
  color: var(--ps-text-2);
  border-radius: var(--ps-radius-md);
  cursor: pointer;
}

.ps-nav__link:hover {
  color: var(--ps-text-1);
  background: var(--ps-color-primary-soft);
}

.ps-nav__link--active {
  color: var(--ps-text-1);
}

.ps-nav__link--active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 14px;
  right: 14px;
  height: 2px;
  background: linear-gradient(90deg, var(--ps-color-primary), var(--ps-color-accent));
  border-radius: 2px;
}

.ps-nav__search {
  flex: 1;
  max-width: 320px;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--ps-space-2);
  height: 38px;
  padding: 0 var(--ps-space-4);
  background: var(--ps-bg-sunken);
  border: 1px solid transparent;
  border-radius: var(--ps-radius-pill);
  transition: border-color var(--ps-motion-base) var(--ps-ease-out),
    background var(--ps-motion-base) var(--ps-ease-out);
}

.ps-nav__search:focus-within {
  background: var(--ps-bg-elevated);
  border-color: var(--ps-color-primary);
}

.ps-nav__search input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: 0;
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-1);
  min-width: 0;
}

.ps-nav__search input::placeholder { color: var(--ps-text-3); }

.ps-nav__actions {
  display: flex;
  align-items: center;
  gap: var(--ps-space-2);
}

.ps-nav__icon-btn {
  position: relative;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--ps-radius-md);
  color: var(--ps-text-2);
  background: transparent;
  cursor: pointer;
  transition: background var(--ps-motion-fast) var(--ps-ease-out),
    color var(--ps-motion-fast) var(--ps-ease-out);
}

.ps-nav__icon-btn:hover {
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary);
}

.ps-nav__dot {
  position: absolute;
  top: 8px;
  right: 9px;
  width: 8px;
  height: 8px;
  background: var(--ps-color-accent);
  border: 2px solid var(--ps-bg-page);
  border-radius: 50%;
}

.ps-nav__btn {
  height: 36px;
  padding: 0 var(--ps-space-5);
  border-radius: var(--ps-radius-pill);
  font-size: var(--ps-fs-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--ps-motion-base) var(--ps-ease-out),
    color var(--ps-motion-base) var(--ps-ease-out),
    box-shadow var(--ps-motion-base) var(--ps-ease-out);
}

.ps-nav__btn--ghost {
  background: transparent;
  color: var(--ps-text-1);
  border: 1px solid var(--ps-border-1);
}
.ps-nav__btn--ghost:hover { background: var(--ps-color-primary-soft); }

.ps-nav__btn--primary {
  background: var(--ps-color-primary);
  color: var(--ps-text-inverse);
  box-shadow: var(--ps-shadow-1);
}
.ps-nav__btn--primary:hover {
  background: var(--ps-color-primary-strong);
  box-shadow: var(--ps-shadow-violet);
}

.ps-nav__profile {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--ps-space-2);
  padding: 4px 10px 4px 4px;
  border-radius: var(--ps-radius-pill);
  cursor: pointer;
  transition: background var(--ps-motion-fast) var(--ps-ease-out);
}

.ps-nav__profile:hover { background: var(--ps-color-primary-soft); }

.ps-nav__profile-name {
  font-size: var(--ps-fs-sm);
  font-weight: 600;
  color: var(--ps-text-1);
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ps-nav__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-md);
  box-shadow: var(--ps-shadow-3);
  padding: 6px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px);
  transition: opacity var(--ps-motion-fast) var(--ps-ease-out),
    transform var(--ps-motion-fast) var(--ps-ease-out),
    visibility var(--ps-motion-fast) linear;
  z-index: 30;
}

.ps-nav__profile:hover .ps-nav__dropdown,
.ps-nav__profile:focus-within .ps-nav__dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.ps-nav__dropdown li {
  display: flex;
  align-items: center;
  gap: var(--ps-space-2);
  padding: 8px 10px;
  font-size: var(--ps-fs-sm);
  font-weight: 500;
  color: var(--ps-text-1);
  border-radius: var(--ps-radius-sm);
  cursor: pointer;
}

.ps-nav__dropdown li:hover {
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary);
}

.ps-nav__dropdown-danger:hover {
  background: var(--ps-color-danger-soft) !important;
  color: var(--ps-color-danger) !important;
}

@media screen and (max-width: 980px) {
  .ps-nav__links { display: none; }
  .ps-nav__search { max-width: 200px; }
  .ps-nav__brand-tag { display: none; }
}

@media screen and (max-width: 720px) {
  .ps-nav__search { display: none; }
  .ps-nav__profile-name { display: none; }
}
</style>
