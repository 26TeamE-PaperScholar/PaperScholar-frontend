<template>
  <button
    type="button"
    class="ps-color-setter"
    :aria-label="theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
    @click="toggleColorMode"
  >
    <svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="12" y1="2.5" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="21.5" />
        <line x1="2.5" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="21.5" y2="12" />
        <line x1="5" y1="5" x2="6.8" y2="6.8" />
        <line x1="17.2" y1="17.2" x2="19" y2="19" />
        <line x1="19" y1="5" x2="17.2" y2="6.8" />
        <line x1="6.8" y1="17.2" x2="5" y2="19" />
      </g>
    </svg>
    <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"
        fill="currentColor"
      />
    </svg>
  </button>
</template>

<script>
/**
 * ColorSetter
 * 浅色 / 深色主题切换器。
 *
 * 行为：
 * - 点击切换 `<html data-theme="dark|light">`，整套 design tokens 自动跟着切换
 * - 选择写入 localStorage，刷新仍生效
 * - 在 NavBar 中、PersonalHomepage 等任何位置可独立放置
 *
 * 与原 ColorSetter 保持一致的可见效果（一个开关按钮），但底层不再手动 set
 * 一堆 `--theme-mode-*` 变量，而是统一通过 `[data-theme='dark']` 选择器在
 * tokens.css 中覆盖。
 */
export default {
  name: 'ColorSetter',
  data() {
    return {
      theme: 'light'
    }
  },
  mounted() {
    const stored = (typeof localStorage !== 'undefined' && localStorage.getItem('ps-theme')) || 'light'
    this.theme = stored === 'dark' ? 'dark' : 'light'
    this.applyTheme()
  },
  methods: {
    toggleColorMode() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      this.applyTheme()
      try { localStorage.setItem('ps-theme', this.theme) } catch (e) {}
      this.$emit('change', this.theme)
    },
    /**
     * 兼容旧 API：原 ColorSetter 暴露的方法名是 `changeColorMode`。
     */
    changeColorMode() {
      this.toggleColorMode()
    },
    applyTheme() {
      document.documentElement.setAttribute('data-theme', this.theme)
    }
  }
}
</script>

<style scoped>
.ps-color-setter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--ps-radius-md);
  background: transparent;
  color: var(--ps-text-2);
  cursor: pointer;
  transition: background var(--ps-motion-fast) var(--ps-ease-out),
    color var(--ps-motion-fast) var(--ps-ease-out);
}

.ps-color-setter:hover {
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary);
}
</style>
