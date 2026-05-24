<template>
  <component
    :is="rootTag"
    class="ps-chip"
    :class="chipClass"
    :type="rootTag === 'button' ? 'button' : null"
    :role="clickable && rootTag !== 'button' ? 'button' : null"
    :tabindex="clickable && rootTag !== 'button' ? 0 : null"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <AppIcon v-if="icon" :name="icon" :size="12" inline />
    <span class="ps-chip__label"><slot>{{ label }}</slot></span>
    <button v-if="removable" type="button" class="ps-chip__remove" @click.stop="$emit('remove')" aria-label="Remove">
      <AppIcon name="Close" :size="10" />
    </button>
  </component>
</template>

<script>
import AppIcon from './Icon.vue'

export default {
  name: 'AppTagChip',
  components: { AppIcon },
  props: {
    label: { type: String, default: '' },
    icon: { type: String, default: '' },
    variant: {
      type: String,
      default: 'subtle',
      validator: (v) => ['subtle', 'solid', 'outline', 'gold', 'success', 'warning', 'danger'].includes(v)
    },
    size: { type: String, default: 'md' },
    clickable: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
    removable: { type: Boolean, default: false }
  },
  emits: ['click', 'remove'],
  computed: {
    rootTag() {
      return this.clickable && !this.removable ? 'button' : 'span'
    },
    chipClass() {
      return [
        'ps-chip--' + this.variant,
        'ps-chip--size-' + this.size,
        this.clickable ? 'ps-chip--clickable' : '',
        this.active ? 'ps-chip--active' : ''
      ]
    }
  },
  methods: {
    handleClick(e) {
      if (this.clickable) this.$emit('click', e)
    }
  }
}
</script>

<style scoped>
.ps-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--ps-space-1);
  padding: 4px 10px;
  font-size: var(--ps-fs-xs);
  font-weight: 600;
  border-radius: var(--ps-radius-pill);
  border: 1px solid transparent;
  line-height: 1.2;
  white-space: nowrap;
  cursor: default;
  transition: background var(--ps-motion-fast) var(--ps-ease-out),
    color var(--ps-motion-fast) var(--ps-ease-out),
    border-color var(--ps-motion-fast) var(--ps-ease-out);
}

.ps-chip--size-sm { padding: 2px 8px; font-size: 11px; }
.ps-chip--size-md { padding: 4px 10px; font-size: var(--ps-fs-xs); }
.ps-chip--size-lg { padding: 6px 14px; font-size: var(--ps-fs-sm); }

.ps-chip--subtle {
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary);
}

.ps-chip--solid {
  background: var(--ps-color-primary);
  color: var(--ps-text-inverse);
}

.ps-chip--outline {
  background: transparent;
  color: var(--ps-color-primary);
  border-color: var(--ps-color-primary);
}

.ps-chip--gold {
  background: var(--ps-color-accent-soft);
  color: var(--ps-color-accent-strong);
}

.ps-chip--success {
  background: var(--ps-color-success-soft);
  color: var(--ps-color-success);
}

.ps-chip--warning {
  background: var(--ps-color-warning-soft);
  color: var(--ps-color-warning);
}

.ps-chip--danger {
  background: var(--ps-color-danger-soft);
  color: var(--ps-color-danger);
}

.ps-chip--clickable {
  cursor: pointer;
  border: 1px solid transparent;
}

.ps-chip--clickable:hover {
  background: var(--ps-color-primary-hover);
}

.ps-chip--active {
  background: var(--ps-color-primary);
  color: var(--ps-text-inverse);
}

.ps-chip__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-left: 2px;
  background: rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

.ps-chip__remove:hover {
  background: rgba(0, 0, 0, 0.12);
}
</style>
