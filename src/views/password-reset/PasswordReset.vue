<template>
  <main class="ps-reset">
    <section class="ps-reset__panel">
      <button type="button" class="ps-reset__back" @click="goLogin">
        <AppIcon name="ArrowBack" :size="16" />
        {{ $t('login_text') || '登录' }}
      </button>

      <div class="ps-reset__heading">
        <div class="ps-reset__mark">
          <AppIcon name="ShieldCheckmark" :size="26" />
        </div>
        <p class="ps-reset__eyebrow">PaperScholar</p>
        <h1>{{ $t('reset_password') || '重新设置你的密码' }}</h1>
        <p>{{ $t('password_reset_subtitle') || '输入邮件中的重置 token，并设置一个新密码。' }}</p>
      </div>

      <form class="ps-reset__form" @submit.prevent="resetPassword">
        <label>
          <span>{{ $t('password_reset_token') || '重置 Token' }}</span>
          <input
            type="text"
            class="basic-input"
            v-model.trim="token"
            autocomplete="one-time-code"
            :placeholder="$t('password_reset_token_placeholder') || '复制邮件中的 token'"
          />
        </label>
        <label>
          <span>{{ $t('new_password') || '新密码' }}</span>
          <input
            type="password"
            class="basic-input"
            v-model="password"
            autocomplete="new-password"
            :placeholder="$t('password_reset_password_placeholder') || '输入新密码'"
          />
        </label>
        <label>
          <span>{{ $t('confirm_password') || '确认密码' }}</span>
          <input
            type="password"
            class="basic-input"
            v-model="password_confirm"
            autocomplete="new-password"
            :placeholder="$t('confirm_password_text') || '确认密码'"
          />
        </label>

        <button class="basic-btn ps-reset__submit" type="submit" :disabled="isSubmitting">
          <AppIcon name="Key" :size="16" />
          {{ isSubmitting ? ($t('submitting_text') || '提交中') : ($t('password_reset_submit') || '重设密码') }}
        </button>
      </form>

      <p class="ps-reset__hint">
        {{ $t('password_reset_missing_token') || '还没有 token？' }}
        <button type="button" class="ps-reset__link" @click="goRetrieve">
          {{ $t('password_reset_resend') || '重新发送邮件' }}
        </button>
      </p>
    </section>
  </main>
</template>

<script>
import { Account } from '../../api/accounts.js'
import { AppIcon } from '../../components/ui'

export default {
  name: 'PasswordReset',
  components: { AppIcon },
  data() {
    return {
      token: '',
      password: '',
      password_confirm: '',
      isSubmitting: false
    }
  },
  mounted() {
    this.syncTokenFromRoute()
  },
  methods: {
    syncTokenFromRoute() {
      const token = this.$route.query.token
      if (typeof token === 'string') this.token = token
      else if (Array.isArray(token) && typeof token[0] === 'string') this.token = token[0]
    },
    goLogin() {
      this.$router.push({ path: '/auth', query: { mode: 'login' } })
    },
    goRetrieve() {
      this.$router.push({ path: '/auth', query: { mode: 'reset' } })
    },
    getErrorMessage(error) {
      const fallback = this.$t('password_reset_check_hint') || '请检查 token 和新密码'
      const data = error && error.response && error.response.data
      if (!data) return fallback
      if (typeof data === 'string') return data
      if (typeof data.detail === 'string') return data.detail

      const firstKey = Object.keys(data)[0]
      const firstValue = firstKey ? data[firstKey] : ''
      if (Array.isArray(firstValue)) return firstValue.join('；')
      if (typeof firstValue === 'string') return firstValue
      return fallback
    },
    async resetPassword() {
      const token = this.token.trim()
      if (!token || !this.password || !this.password_confirm) {
        this.$bus.emit('message', {
          title: this.$t('password_reset_failure') || '密码重设失败',
          content: this.$t('password_reset_required_hint') || '请完整填写 token 和新密码',
          time: 1800
        })
        return
      }

      if (this.password !== this.password_confirm) {
        this.$bus.emit('message', {
          title: this.$t('password_reset_failure') || '密码重设失败',
          content: this.$t('different_password') || '两次输入的密码不一致',
          time: 1800
        })
        return
      }

      this.isSubmitting = true
      try {
        await Account.passwordReset({
          token,
          password: this.password,
          password_confirm: this.password_confirm
        })
        this.$bus.emit('message', {
          title: this.$t('password_reset_success') || '密码重设成功',
          content: this.$t('change_password_relogin_hint') || '请使用新密码重新登录',
          time: 1800
        })
        this.$router.replace({ path: '/auth', query: { mode: 'login' } })
      } catch (error) {
        this.$bus.emit('message', {
          title: this.$t('password_reset_failure') || '密码重设失败',
          content: this.getErrorMessage(error),
          time: 2200
        })
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style scoped>
.ps-reset {
  min-height: calc(100vh - var(--ps-nav-height));
  padding: var(--ps-space-8) var(--ps-space-5);
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 15% 10%, rgba(212, 175, 55, 0.16), transparent 36%),
    radial-gradient(circle at 85% 90%, rgba(45, 27, 105, 0.11), transparent 38%);
}

.ps-reset__panel {
  width: min(100%, 460px);
  padding: var(--ps-space-7);
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-lg);
  box-shadow: var(--ps-shadow-lg);
}

.ps-reset__back,
.ps-reset__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  color: var(--ps-color-primary);
  font-weight: 600;
  cursor: pointer;
}

.ps-reset__back {
  font-size: var(--ps-fs-sm);
  margin-bottom: var(--ps-space-6);
}

.ps-reset__back:hover,
.ps-reset__link:hover {
  text-decoration: underline;
}

.ps-reset__heading {
  margin-bottom: var(--ps-space-6);
}

.ps-reset__mark {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ps-color-primary);
  background: rgba(45, 27, 105, 0.08);
  border-radius: var(--ps-radius-md);
  margin-bottom: var(--ps-space-4);
}

.ps-reset__eyebrow {
  margin-bottom: var(--ps-space-2);
  font-size: var(--ps-fs-xs);
  color: var(--ps-color-accent-strong);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ps-reset__heading h1 {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-3xl);
  font-weight: 700;
  color: var(--ps-text-1);
  margin-bottom: var(--ps-space-3);
}

.ps-reset__heading p:last-child {
  color: var(--ps-text-2);
  font-size: var(--ps-fs-sm);
  line-height: 1.6;
}

.ps-reset__form {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-4);
}

.ps-reset__form label {
  display: grid;
  gap: 6px;
}

.ps-reset__form label span {
  font-size: var(--ps-fs-xs);
  font-weight: 600;
  color: var(--ps-text-2);
}

.ps-reset__submit {
  width: 100%;
  height: 44px;
  gap: 8px;
  margin-top: var(--ps-space-2);
}

.ps-reset__submit:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.ps-reset__hint {
  margin-top: var(--ps-space-5);
  text-align: center;
  color: var(--ps-text-2);
  font-size: var(--ps-fs-sm);
}

.ps-reset__link {
  font-size: inherit;
}

@media screen and (max-width: 560px) {
  .ps-reset {
    align-items: flex-start;
    padding: var(--ps-space-6) var(--ps-space-4);
  }

  .ps-reset__panel {
    padding: var(--ps-space-6) var(--ps-space-5);
  }
}
</style>
