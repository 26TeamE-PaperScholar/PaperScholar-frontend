<template>
  <span class="ps-avatar" :class="'ps-avatar--' + size" :style="rootStyle" :title="name">
    <img v-if="src" :src="src" :alt="name" class="ps-avatar__img" />
    <span v-else class="ps-avatar__initials" :style="gradientStyle">{{ initials }}</span>
  </span>
</template>

<script>
const PALETTES = [
  ['#2D1B69', '#D4AF37'],
  ['#1B1147', '#9B7BFF'],
  ['#1F4068', '#65C2C9'],
  ['#4A1942', '#E8A2C0'],
  ['#1E3A3A', '#6BC5A0'],
  ['#2C2E5A', '#FFC773']
]

const hashId = (id) => {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 88,
  '2xl': 128
}

export default {
  name: 'AppAvatar',
  props: {
    name: { type: String, default: '' },
    id: { type: String, default: '' },
    src: { type: String, default: '' },
    size: { type: String, default: 'md' },
    gradient: { type: Array, default: null }
  },
  computed: {
    initials() {
      const n = (this.name || '?').trim()
      if (!n) return '?'
      const parts = n.split(/\s+/)
      if (parts.length === 1) return n.slice(0, 2).toUpperCase()
      return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase()
    },
    pickedGradient() {
      if (this.gradient && this.gradient.length >= 2) return this.gradient
      const idx = hashId(this.id || this.name || 'x') % PALETTES.length
      return PALETTES[idx]
    },
    gradientStyle() {
      const [a, b] = this.pickedGradient
      return {
        background: `linear-gradient(135deg, ${a}, ${b})`
      }
    },
    rootStyle() {
      const px = sizeMap[this.size] || sizeMap.md
      return {
        width: px + 'px',
        height: px + 'px',
        fontSize: Math.max(11, Math.round(px * 0.35)) + 'px'
      }
    }
  }
}
</script>

<style scoped>
.ps-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: var(--ps-bg-sunken);
  color: var(--ps-text-inverse);
  flex: none;
  user-select: none;
  border: 1px solid var(--ps-border-1);
}

.ps-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ps-avatar__initials {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #fff;
  font-family: var(--ps-font-sans);
}
</style>
