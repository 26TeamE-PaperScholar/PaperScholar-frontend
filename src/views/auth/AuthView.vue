<template>
  <main class="auth-page">
    <section class="auth-shell">
      <div class="auth-heading">
        <p>PaperScholar</p>
        <h1>{{ currentMode === 'register' ? $t('register_text') : currentMode === 'reset' ? $t('retrieve_password_text') : $t('login_text') }}</h1>
      </div>

      <nav class="auth-tabs">
        <button :class="{ active: currentMode === 'login' }" @click="setMode('login')">{{ $t('login_text') }}</button>
        <button :class="{ active: currentMode === 'register' }" @click="setMode('register')">{{ $t('register_text') }}</button>
      </nav>

      <form v-if="currentMode === 'login'" class="auth-form" @submit.prevent="login">
        <label>
          <span>{{ $t('email_text') }}</span>
          <input type="text" class="basic-input" v-model="loginForm.email" autocomplete="email" />
        </label>
        <label>
          <span>{{ $t('password_text') }}</span>
          <input type="password" class="basic-input" v-model="loginForm.password" autocomplete="current-password" />
        </label>
        <button class="basic-btn" type="submit">{{ $t('login_text') }}</button>
        <button class="text-action" type="button" @click="setMode('reset')">
          {{ $t('retrieve_password_prompt_1') }}{{ $t('retrieve_password_prompt_2') }}
        </button>
      </form>

      <form v-else-if="currentMode === 'register'" class="auth-form" @submit.prevent="register">
        <label>
          <span>{{ $t('email_text') }}</span>
          <input type="text" class="basic-input" v-model="registerForm.email" autocomplete="email" />
        </label>
        <p class="field-note">{{ $t('email_usage_prompt') }}</p>
        <label>
          <span>{{ $t('username_text') }}</span>
          <input type="text" class="basic-input" v-model="registerForm.username" autocomplete="username" />
        </label>
        <label>
          <span>{{ $t('password_text') }}</span>
          <input type="password" class="basic-input" v-model="registerForm.password" autocomplete="new-password" />
        </label>
        <label>
          <span>{{ $t('confirm_password_text') }}</span>
          <input type="password" class="basic-input" v-model="registerForm.password_confirm" autocomplete="new-password" />
        </label>
        <button class="basic-btn" type="submit">{{ $t('register_text') }}</button>
      </form>

      <form v-else class="auth-form" @submit.prevent="resetPassword">
        <label>
          <span>{{ $t('email_text') }}</span>
          <input type="text" class="basic-input" v-model="resetEmail" autocomplete="email" />
        </label>
        <p class="field-note">{{ $t('retrieve_password_message') }}</p>
        <button class="basic-btn" type="submit">{{ $t('confirm_text') }}</button>
        <button class="text-action" type="button" @click="setMode('login')">{{ $t('login_text') }}</button>
      </form>
    </section>
  </main>
</template>

<script>
import { mapMutations } from 'vuex'
import { Account } from '../../api/accounts.js'
import i18n from '../../language'

export default {
  name: 'AuthView',
  components: {
    i18n
  },
  data() {
    return {
      currentMode: 'login',
      loginForm: {
        email: '',
        password: ''
      },
      registerForm: {
        email: '',
        username: '',
        password: '',
        password_confirm: ''
      },
      resetEmail: ''
    }
  },
  watch: {
    '$route.query.mode': {
      immediate: true,
      handler(mode) {
        this.currentMode = ['login', 'register', 'reset'].includes(mode) ? mode : 'login'
      }
    }
  },
  methods: {
    ...mapMutations(['setIsLoggedIn']),
    setMode(mode) {
      this.$router.replace({ path: '/auth', query: { mode } })
    },
    login() {
      Account.login(this.loginForm).then(
        () => {
          this.setIsLoggedIn(true)
          this.$router.push('/search')
        },
        () => {
          this.$bus.emit('message', { title: this.$t('login_failure'), content: this.$t('login_failure_hint'), time: 1500 })
        }
      )
    },
    register() {
      Account.register(this.registerForm).then(
        () => {
          this.$bus.emit('message', { title: this.$t('register_success'), content: this.$t('check_email_hint'), time: 1500 })
          this.setMode('login')
        },
        () => {
          const content = this.registerForm.password !== this.registerForm.password_confirm
            ? this.$t('different_password')
            : this.$t('register_failure_hint')
          this.$bus.emit('message', { title: this.$t('register_failure'), content, time: 1500 })
        }
      )
    },
    resetPassword() {
      Account.sendPasswordResetEmail({ email: this.resetEmail }).then(
        () => {
          this.$bus.emit('message', { title: this.$t('retrieve_password_text'), content: this.$t('retrieve_password_message'), time: 1500 })
          this.setMode('login')
        },
        () => {
          this.$bus.emit('message', { title: this.$t('retrieve_password_text'), content: this.$t('login_failure_hint'), time: 1500 })
        }
      )
    }
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 56px);
  display: flex;
  justify-content: center;
  padding: 78px 24px;
  box-sizing: border-box;
}

.auth-shell {
  width: min(520px, 100%);
}

.auth-heading {
  padding-bottom: 28px;
  border-bottom: var(--border-soft);
}

.auth-heading p {
  color: var(--theme-mode-high-contrast);
  font-size: 14px;
  margin-bottom: 12px;
}

.auth-heading h1 {
  color: var(--theme-mode-very-high-contrast);
  font-size: 42px;
  line-height: 1.12;
  font-weight: 650;
}

.auth-tabs {
  display: flex;
  gap: 20px;
  padding: 22px 0;
  border-bottom: var(--border-soft);
}

.auth-tabs button,
.text-action {
  width: auto;
  height: auto;
  padding: 0;
  background: transparent;
  color: var(--theme-mode-high-contrast);
  font-size: 15px;
}

.auth-tabs button.active {
  color: var(--theme-mode-very-high-contrast);
  text-decoration: underline;
  text-underline-offset: 5px;
}

.auth-form {
  display: grid;
  gap: 18px;
  padding-top: 28px;
}

.auth-form label {
  display: grid;
  gap: 8px;
}

.auth-form label span,
.field-note {
  color: var(--theme-mode-high-contrast);
  font-size: 14px;
  line-height: 1.5;
}

.auth-form .basic-input {
  width: 100%;
}

.auth-form .basic-btn {
  width: 100%;
  margin-top: 8px;
}

.text-action {
  justify-self: start;
}

.text-action:hover {
  color: var(--theme-mode-very-high-contrast);
  text-decoration: underline;
  text-underline-offset: 4px;
}

@media screen and (max-width: 600px) {
  .auth-page {
    padding: 48px 18px;
  }

  .auth-heading h1 {
    font-size: 34px;
  }
}
</style>
