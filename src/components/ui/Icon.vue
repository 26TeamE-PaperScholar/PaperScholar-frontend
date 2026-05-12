<template>
  <span class="ps-icon" :class="[sizeClass, { 'ps-icon--inline': inline }]" :style="iconStyle" aria-hidden="true">
    <component :is="resolved" v-if="resolved" />
    <svg v-else viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" /></svg>
  </span>
</template>

<script>
import * as ionicons from '@vicons/ionicons5'

export default {
  name: 'AppIcon',
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: [Number, String],
      default: 18
    },
    color: {
      type: String,
      default: ''
    },
    inline: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    resolved() {
      return ionicons[this.name] || null
    },
    sizeClass() {
      if (typeof this.size === 'string') return ''
      if (this.size <= 14) return 'ps-icon--xs'
      if (this.size <= 18) return 'ps-icon--sm'
      if (this.size <= 24) return 'ps-icon--md'
      return 'ps-icon--lg'
    },
    iconStyle() {
      const style = {}
      const s = typeof this.size === 'number' ? `${this.size}px` : this.size
      style.width = s
      style.height = s
      if (this.color) style.color = this.color
      return style
    }
  }
}
</script>

<style scoped>
.ps-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  flex: none;
  line-height: 0;
}

.ps-icon--inline {
  vertical-align: -0.15em;
}

.ps-icon :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
