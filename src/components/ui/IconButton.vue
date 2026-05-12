<template>
  <button
    type="button"
    class="ps-icon-btn"
    :class="[
      'ps-icon-btn--' + variant,
      'ps-icon-btn--size-' + size,
      tooltip ? 'ps-icon-btn--has-tooltip' : ''
    ]"
    :aria-label="ariaLabel || tooltip"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <AppIcon :name="icon" :size="iconSize" />
    <span v-if="tooltip" class="ps-icon-btn__tip">{{ tooltip }}</span>
  </button>
</template>

<script>
import AppIcon from './Icon.vue'

const sizeMap = { sm: 28, md: 36, lg: 44 }

export default {
  name: 'AppIconButton',
  components: { AppIcon },
  props: {
    icon: { type: String, required: true },
    variant: {
      type: String,
      default: 'ghost',
      validator: (v) => ['ghost', 'solid', 'soft', 'gold'].includes(v)
    },
    size: { type: String, default: 'md' },
    tooltip: { type: String, default: '' },
    ariaLabel: { type: String, default: '' },
    disabled: { type: Boolean, default: false }
  },
  emits: ['click'],
  computed: {
    iconSize() {
      return Math.round((sizeMap[this.size] || 36) * 0.5)
    }
  }
}
</script>

<style scoped>
.ps-icon-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--ps-radius-md);
  color: var(--ps-text-2);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background var(--ps-motion-fast) var(--ps-ease-out),
    color var(--ps-motion-fast) var(--ps-ease-out),
    border-color var(--ps-motion-fast) var(--ps-ease-out);
}

.ps-icon-btn--size-sm { width: 28px; height: 28px; }
.ps-icon-btn--size-md { width: 36px; height: 36px; }
.ps-icon-btn--size-lg { width: 44px; height: 44px; }

.ps-icon-btn--ghost:hover {
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary);
}

.ps-icon-btn--solid {
  background: var(--ps-color-primary);
  color: var(--ps-text-inverse);
}
.ps-icon-btn--solid:hover { background: var(--ps-color-primary-strong); }

.ps-icon-btn--soft {
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary);
}
.ps-icon-btn--soft:hover { background: var(--ps-color-primary-hover); }

.ps-icon-btn--gold {
  background: var(--ps-color-accent-soft);
  color: var(--ps-color-accent-strong);
}
.ps-icon-btn--gold:hover { background: rgba(212, 175, 55, 0.22); }

.ps-icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ps-icon-btn__tip {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(-4px);
  background: var(--ps-text-1);
  color: var(--ps-text-inverse);
  font-size: 11px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: var(--ps-radius-sm);
  pointer-events: none;
  opacity: 0;
  white-space: nowrap;
  transition: opacity var(--ps-motion-fast) var(--ps-ease-out),
    transform var(--ps-motion-fast) var(--ps-ease-out);
  z-index: 20;
}

.ps-icon-btn--has-tooltip:hover .ps-icon-btn__tip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
