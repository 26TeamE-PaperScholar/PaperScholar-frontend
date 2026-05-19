<template>
  <main class="ps-auth">
    <section class="ps-auth__brand">
      <div class="ps-auth__brand-inner">
        <div class="ps-auth__logo">
          <svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ps-auth-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#FFFFFF" />
                <stop offset="100%" stop-color="#D4AF37" />
              </linearGradient>
            </defs>
            <rect width="28" height="28" rx="8" fill="url(#ps-auth-grad)" />
            <path d="M9 8h7c2.8 0 4.6 1.7 4.6 4.2 0 2.6-1.8 4.3-4.6 4.3h-3.4V20H9V8Zm6.6 5.9c1.3 0 2.1-.7 2.1-1.7 0-1.1-.8-1.7-2.1-1.7h-3v3.4h3Z" fill="#2D1B69" />
          </svg>
          <span>PaperScholar</span>
        </div>
        <div class="ps-auth__brand-text">
          <p class="ps-auth__eyebrow">学术检索 · 智能导航</p>
          <h1>用更可信的方式 <br />与人类知识对话</h1>
          <p class="ps-auth__lede">
            统一的学术索引 · 引用图谱 · 生成式问答；让综述、毕设、组会、路演变得轻松而严谨。
          </p>
        </div>
        <ul class="ps-auth__bullets">
          <li>
            <AppIcon name="FlashOutline" :size="16" />
            <div>
              <strong>2.4M+ 学术成果</strong>
              <span>多语言、跨学科语义检索</span>
            </div>
          </li>
          <li>
            <AppIcon name="GitBranch" :size="16" />
            <div>
              <strong>实时引用图谱</strong>
              <span>追踪研究脉络，发现潜力工作</span>
            </div>
          </li>
          <li>
            <AppIcon name="Sparkles" :size="16" />
            <div>
              <strong>AI 学术助手</strong>
              <span>可追溯出处、可生成 BibTeX</span>
            </div>
          </li>
        </ul>
        <p class="ps-auth__brand-foot">© PaperScholar · 学术展示与路演平台</p>
      </div>
    </section>

    <section class="ps-auth__form-side">
      <div class="ps-auth__form-wrap">
        <nav class="ps-auth__tabs">
          <button
            v-for="t in tabs"
            :key="t.mode"
            :class="{ 'ps-auth__tab--active': currentMode === t.mode }"
            class="ps-auth__tab"
            @click="setMode(t.mode)"
          >{{ t.label }}</button>
        </nav>

        <transition name="ps-fade" mode="out-in">
          <form v-if="currentMode === 'login'" key="login" class="ps-auth__form" @submit.prevent="login">
            <h2>欢迎回来</h2>
            <p class="ps-auth__sub">输入邮箱与密码继续。</p>
            <label>
              <span>{{ $t('email_text') || '邮箱' }}</span>
              <input type="text" class="basic-input" v-model="loginForm.email" autocomplete="email" placeholder="you@example.edu" />
            </label>
            <label>
              <span>{{ $t('password_text') || '密码' }}</span>
              <input type="password" class="basic-input" v-model="loginForm.password" autocomplete="current-password" placeholder="••••••••" />
            </label>
            <div class="ps-auth__row">
              <label class="ps-auth__check">
                <input type="checkbox" v-model="rememberMe" />
                <span>记住我</span>
              </label>
              <button type="button" class="ps-auth__text-link" @click="setMode('reset')">忘记密码？</button>
            </div>
            <button class="basic-btn ps-auth__submit" type="submit">
              <AppIcon name="LogIn" :size="16" />
              {{ $t('login_text') }}
            </button>
            <p class="ps-auth__divider"><span>或</span></p>
            <p class="ps-auth__hint">还没有账号？ <button type="button" class="ps-auth__text-link" @click="setMode('register')">免费注册</button></p>
          </form>

          <form v-else-if="currentMode === 'register'" key="register" class="ps-auth__form" @submit.prevent="register">
            <h2>创建账号</h2>
            <p class="ps-auth__sub">两分钟开启你的学术工作台。</p>
            <label>
              <span>{{ $t('email_text') || '邮箱' }}</span>
              <input type="text" class="basic-input" v-model="registerForm.email" autocomplete="email" placeholder="you@example.edu" />
            </label>
            <p class="ps-auth__field-note">{{ $t('email_usage_prompt') || '我们将向该邮箱发送验证邮件。' }}</p>
            <label>
              <span>{{ $t('username_text') || '用户名' }}</span>
              <input type="text" class="basic-input" v-model="registerForm.username" autocomplete="username" />
            </label>
            <label>
              <span>{{ $t('password_text') || '密码' }}</span>
              <input type="password" class="basic-input" v-model="registerForm.password" autocomplete="new-password" />
            </label>
            <label>
              <span>{{ $t('confirm_password_text') || '确认密码' }}</span>
              <input type="password" class="basic-input" v-model="registerForm.password_confirm" autocomplete="new-password" />
            </label>
            <button class="basic-btn ps-auth__submit" type="submit">
              <AppIcon name="Add" :size="16" />
              {{ $t('register_text') }}
            </button>
          </form>

          <form v-else key="reset" class="ps-auth__form" @submit.prevent="resetPassword">
            <h2>找回密码</h2>
            <p class="ps-auth__sub">输入注册邮箱，我们会发送重置链接。</p>
            <label>
              <span>{{ $t('email_text') || '邮箱' }}</span>
              <input type="text" class="basic-input" v-model="resetEmail" autocomplete="email" />
            </label>
            <button class="basic-btn ps-auth__submit" type="submit">
              <AppIcon name="Mail" :size="16" />
              {{ $t('confirm_text') || '发送重置邮件' }}
            </button>
            <p class="ps-auth__hint">
              <button type="button" class="ps-auth__text-link" @click="setMode('login')">返回登录</button>
            </p>
          </form>
        </transition>

        <p class="ps-auth__legal">登录即表示同意 <a href="#" @click.prevent>服务条款</a> 与 <a href="#" @click.prevent>隐私政策</a>。</p>
      </div>
    </section>
  </main>
</template>

<script>
import { mapMutations } from 'vuex'
import { Account } from '../../api/accounts.js'
import { AppIcon } from '../../components/ui'

export default {
  name: 'AuthView',
  components: { AppIcon },
  data() {
    return {
      currentMode: 'login',
      routeNoticeKey: '',
      tabs: [
        { mode: 'login', label: this.$t('login_text') || '登录' },
        { mode: 'register', label: this.$t('register_text') || '注册' }
      ],
      loginForm: { email: '', password: '' },
      registerForm: { email: '', username: '', password: '', password_confirm: '' },
      resetEmail: '',
      rememberMe: true
    }
  },
  watch: {
    '$route.query.mode': {
      immediate: true,
      handler(mode) {
        this.currentMode = ['login', 'register', 'reset'].includes(mode) ? mode : 'login'
      }
    },
    '$route.query.reason': {
      immediate: true,
      handler() {
        this.notifyRouteReason()
      }
    }
  },
  methods: {
    ...mapMutations(['setIsLoggedIn']),
    setMode(mode) {
      const query = { mode }
      const redirect = this.getSafeRedirect()
      const reason = this.getRouteReason()
      if (redirect !== '/search') query.redirect = redirect
      if (reason) query.reason = reason
      this.$router.replace({ path: '/auth', query })
    },
    getSafeRedirect() {
      const redirect = this.$route.query.redirect
      if (typeof redirect === 'string' && redirect.startsWith('/')) return redirect
      return '/search'
    },
    getRouteReason() {
      const reason = this.$route.query.reason
      return typeof reason === 'string' ? reason : ''
    },
    notifyRouteReason() {
      const reason = this.getRouteReason()
      if (!reason) return
      const redirect = this.getSafeRedirect()
      const noticeKey = `${reason}:${redirect}`
      if (this.routeNoticeKey === noticeKey) return
      this.routeNoticeKey = noticeKey
      const content = redirect.startsWith('/personal_homepage')
        ? '登录后即可查看我的页面'
        : '登录后即可继续访问'
      this.$bus.emit('message', { title: '请先登录', content, time: 1600 })
    },
    login() {
      Account.login(this.loginForm).then(
        () => {
          this.setIsLoggedIn(true)
          this.$bus.emit('message', { title: '登录成功', content: '已进入工作台', time: 1500 })
          this.$router.push(this.getSafeRedirect())
        },
        () => {
          this.$bus.emit('message', { title: this.$t('login_failure') || '登录失败', content: this.$t('login_failure_hint') || '请检查邮箱与密码', time: 2000 })
        }
      )
    },
    register() {
      Account.register(this.registerForm).then(
        () => {
          this.$bus.emit('message', { title: this.$t('register_success') || '注册成功', content: this.$t('check_email_hint') || '请前往邮箱完成验证', time: 1800 })
          this.setMode('login')
        },
        () => {
          const content = this.registerForm.password !== this.registerForm.password_confirm
            ? (this.$t('different_password') || '两次密码不一致')
            : (this.$t('register_failure_hint') || '注册失败')
          this.$bus.emit('message', { title: this.$t('register_failure') || '注册失败', content, time: 1800 })
        }
      )
    },
    resetPassword() {
      Account.sendPasswordResetEmail({ email: this.resetEmail }).then(
        () => {
          this.$bus.emit('message', { title: '已发送重置邮件', content: this.resetEmail, time: 1800 })
          this.setMode('login')
        },
        () => {
          this.$bus.emit('message', { title: '邮件发送失败', content: '请稍后再试', time: 1800 })
        }
      )
    }
  }
}
</script>

<style scoped>
.ps-auth {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 460px);
  min-height: calc(100vh - var(--ps-nav-height));
}

/* ── Brand side (dark hero) ─────────────────────────── */
.ps-auth__brand {
  position: relative;
  --ps-auth-brand-strong: var(--ps-color-primary-strong);
  --ps-auth-brand-muted: rgba(45, 27, 105, 0.82);
  --ps-auth-brand-faint: rgba(45, 27, 105, 0.64);
  --ps-auth-brand-subtle: rgba(45, 27, 105, 0.5);
  --ps-auth-brand-chip-bg: rgba(45, 27, 105, 0.04);
  --ps-auth-brand-chip-border: rgba(45, 27, 105, 0.12);
  --ps-auth-brand-icon: var(--ps-color-primary);
  background:
    radial-gradient(circle at 0% 0%, rgba(212, 175, 55, 0.16), transparent 55%),
    radial-gradient(circle at 100% 100%, rgba(155, 123, 255, 0.32), transparent 60%),
    linear-gradient(135deg, var(--ps-bg-hero-from), var(--ps-bg-hero-mid) 55%, var(--ps-bg-hero-to));
  color: var(--ps-auth-brand-strong);
  overflow: hidden;
  padding: var(--ps-space-8) var(--ps-space-9);
  display: flex;
  align-items: stretch;
}

:global(html[data-theme='dark']) .ps-auth__brand {
  --ps-auth-brand-strong: #FFFFFF;
  --ps-auth-brand-muted: rgba(255, 255, 255, 0.78);
  --ps-auth-brand-faint: rgba(255, 255, 255, 0.6);
  --ps-auth-brand-subtle: rgba(255, 255, 255, 0.4);
  --ps-auth-brand-chip-bg: rgba(255, 255, 255, 0.05);
  --ps-auth-brand-chip-border: rgba(255, 255, 255, 0.12);
  --ps-auth-brand-icon: var(--ps-color-accent);
}

.ps-auth__brand-inner {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  max-width: 520px;
}

.ps-auth__logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-lg);
  font-weight: 700;
  color: var(--ps-auth-brand-strong);
}

.ps-auth__logo svg { width: 32px; height: 32px; }

.ps-auth__brand-text { max-width: 480px; }

.ps-auth__eyebrow {
  font-size: 11px;
  letter-spacing: 0.22em;
  font-weight: 700;
  color: var(--ps-auth-brand-icon);
  text-transform: uppercase;
  margin-bottom: var(--ps-space-4);
}

.ps-auth__brand-text h1 {
  font-family: var(--ps-font-display);
  font-size: clamp(34px, 4.2vw, 50px);
  font-weight: 700;
  line-height: 1.1;
  color: var(--ps-auth-brand-strong);
  margin-bottom: var(--ps-space-5);
}

.ps-auth__lede {
  font-size: var(--ps-fs-md);
  color: var(--ps-auth-brand-muted);
  line-height: 1.6;
}

.ps-auth__bullets {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-3);
}

.ps-auth__bullets li {
  display: flex;
  align-items: flex-start;
  gap: var(--ps-space-3);
  padding: var(--ps-space-3) var(--ps-space-4);
  background: var(--ps-auth-brand-chip-bg);
  border: 1px solid var(--ps-auth-brand-chip-border);
  border-radius: var(--ps-radius-md);
  backdrop-filter: blur(8px);
}

.ps-auth__bullets li :deep(.ps-icon) { color: var(--ps-auth-brand-icon); margin-top: 2px; }

.ps-auth__bullets strong {
  display: block;
  font-size: var(--ps-fs-sm);
  font-weight: 700;
  color: var(--ps-auth-brand-strong);
}

.ps-auth__bullets span {
  font-size: 12px;
  color: var(--ps-auth-brand-faint);
}

.ps-auth__brand-foot {
  font-size: 11px;
  color: var(--ps-auth-brand-subtle);
  letter-spacing: 0.06em;
}

/* ── Form side ──────────────────────────────────────── */
.ps-auth__form-side {
  background: var(--ps-bg-page);
  padding: var(--ps-space-9) var(--ps-space-7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ps-auth__form-wrap {
  width: 100%;
  max-width: 420px;
}

.ps-auth__tabs {
  display: flex;
  gap: var(--ps-space-1);
  padding: 4px;
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-pill);
  margin-bottom: var(--ps-space-6);
  width: fit-content;
}

.ps-auth__tab {
  padding: 6px 18px;
  background: transparent;
  font-size: var(--ps-fs-sm);
  font-weight: 600;
  color: var(--ps-text-2);
  border-radius: var(--ps-radius-pill);
  cursor: pointer;
}

.ps-auth__tab:hover { color: var(--ps-text-1); }

.ps-auth__tab--active {
  background: var(--ps-color-primary);
  color: var(--ps-text-inverse);
}

.ps-auth__form {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-4);
}

.ps-auth__form h2 {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-3xl);
  font-weight: 700;
  color: var(--ps-text-1);
}

.ps-auth__sub {
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-2);
  margin-top: -10px;
}

.ps-auth__form label {
  display: grid;
  gap: 6px;
}

.ps-auth__form label span {
  font-size: var(--ps-fs-xs);
  font-weight: 600;
  color: var(--ps-text-2);
  letter-spacing: 0.04em;
}

.ps-auth__field-note {
  font-size: 11px;
  color: var(--ps-text-3);
  margin-top: -8px;
}

.ps-auth__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--ps-fs-xs);
}

.ps-auth__check {
  display: inline-flex !important;
  align-items: center;
  gap: 6px;
  color: var(--ps-text-2);
}

.ps-auth__check input {
  width: 14px;
  height: 14px;
  accent-color: var(--ps-color-primary);
}

.ps-auth__text-link {
  background: transparent;
  font-size: inherit;
  color: var(--ps-color-primary);
  font-weight: 600;
  cursor: pointer;
}

.ps-auth__text-link:hover { text-decoration: underline; }

.ps-auth__submit {
  width: 100%;
  height: 44px;
  gap: 8px;
}

.ps-auth__divider {
  position: relative;
  text-align: center;
  margin: var(--ps-space-2) 0;
  font-size: 11px;
  color: var(--ps-text-3);
}

.ps-auth__divider::before,
.ps-auth__divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 35%;
  height: 1px;
  background: var(--ps-border-1);
}
.ps-auth__divider::before { left: 0; }
.ps-auth__divider::after { right: 0; }

.ps-auth__hint {
  text-align: center;
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-2);
}

.ps-auth__legal {
  margin-top: var(--ps-space-7);
  text-align: center;
  font-size: 11px;
  color: var(--ps-text-3);
}

.ps-auth__legal a {
  color: var(--ps-text-2);
  text-decoration: underline;
}

.ps-fade-enter-active, .ps-fade-leave-active {
  transition: opacity var(--ps-motion-base) var(--ps-ease-out),
    transform var(--ps-motion-base) var(--ps-ease-out);
}
.ps-fade-enter-from { opacity: 0; transform: translateY(8px); }
.ps-fade-leave-to { opacity: 0; transform: translateY(-8px); }

@media screen and (max-width: 980px) {
  .ps-auth {
    grid-template-columns: 1fr;
  }
  .ps-auth__brand {
    padding: var(--ps-space-7) var(--ps-space-6);
  }
  .ps-auth__form-side { padding: var(--ps-space-7) var(--ps-space-5); }
}
</style>
