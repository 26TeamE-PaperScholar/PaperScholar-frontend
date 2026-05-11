<template>
  <div class="color-container">
    <button class="color-mode-switch" @click="changeColorMode" aria-label="Toggle color mode"></button>
  </div>
</template>

<script>
export default {
  name: 'ColorSetter',
  methods: {
    changeColorMode() {
      let mode = getComputedStyle(document.documentElement).getPropertyValue('--theme-mode')
      if (mode === '#181818') {
        document.documentElement.style.setProperty('--theme-mode', '#ffffff')
        document.documentElement.style.setProperty('--theme-mode-translucent', '#fffffff2')
        document.documentElement.style.setProperty('--theme-mode-like', '#ffffff')
        document.documentElement.style.setProperty('--theme-mode-slight-contrast', '#f7f7f7')
        document.documentElement.style.setProperty('--theme-mode-contrast', '#e5e5e5')
        document.documentElement.style.setProperty('--theme-mode-high-contrast', '#6f6f6f')
        document.documentElement.style.setProperty('--theme-mode-very-high-contrast', '#111111')
        document.documentElement.style.setProperty('--default-text-color', '#111111')
        document.documentElement.style.setProperty('--article-list-item-icon-color', '#111111')
      } else {
        document.documentElement.style.setProperty('--theme-mode', '#181818')
        document.documentElement.style.setProperty('--theme-mode-translucent', '#181818d9')
        document.documentElement.style.setProperty('--theme-mode-like', '#22262c')
        document.documentElement.style.setProperty('--theme-mode-slight-contrast', '#2b3138')
        document.documentElement.style.setProperty('--theme-mode-contrast', '#3a424c')
        document.documentElement.style.setProperty('--theme-mode-high-contrast', '#b4beca')
        document.documentElement.style.setProperty('--theme-mode-very-high-contrast', '#edf1f5')
        document.documentElement.style.setProperty('--default-text-color', '#e6ebf0')
        document.documentElement.style.setProperty('--article-list-item-icon-color', 'rgb(135, 186, 222)')
      }
    }
  }
}
</script>

<style scoped>
.color-container {
  position: relative;
  border-radius: 6px;
  cursor: pointer;
}

.color-mode-switch {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: transparent;
  border: var(--border-soft);
  box-shadow: none;
  transition: .3s cubic-bezier(0.075, 0.82, 0.165, 1);
  position: relative;
}

.color-mode-switch::before {
  content: '';
  position: absolute;
  inset: 9px;
  border: 1.5px solid var(--theme-mode-very-high-contrast);
  border-radius: 999px;
  background: linear-gradient(90deg, var(--theme-mode-very-high-contrast) 0 50%, transparent 50% 100%);
}

.color-mode-switch:hover {
  background-color: var(--theme-mode-slight-contrast);
}
</style>
