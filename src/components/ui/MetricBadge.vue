<template>
  <span class="ps-metric" :class="'ps-metric--' + tone">
    <AppIcon v-if="icon" :name="icon" :size="14" />
    <span class="ps-metric__value">{{ value }}</span>
    <span v-if="label" class="ps-metric__label">{{ label }}</span>
  </span>
</template>

<script>
import AppIcon from './Icon.vue'

export default {
  name: 'AppMetricBadge',
  components: { AppIcon },
  props: {
    value: { type: [String, Number], required: true },
    label: { type: String, default: '' },
    icon: { type: String, default: '' },
    tone: {
      type: String,
      default: 'neutral',
      validator: (v) => ['neutral', 'violet', 'gold', 'success', 'warning', 'danger', 'info'].includes(v)
    }
  }
}
</script>

<style scoped>
.ps-metric {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--ps-radius-sm);
  font-size: var(--ps-fs-xs);
  font-weight: 600;
  line-height: 1.2;
  background: var(--ps-bg-sunken);
  color: var(--ps-text-2);
  white-space: nowrap;
}

.ps-metric__value {
  font-weight: 700;
  color: var(--ps-text-1);
}

.ps-metric__label {
  color: inherit;
}

.ps-metric--violet {
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary);
}
.ps-metric--violet .ps-metric__value { color: var(--ps-color-primary); }

.ps-metric--gold {
  background: var(--ps-color-accent-soft);
  color: var(--ps-color-accent-strong);
}
.ps-metric--gold .ps-metric__value { color: var(--ps-color-accent-strong); }

.ps-metric--success {
  background: var(--ps-color-success-soft);
  color: var(--ps-color-success);
}
.ps-metric--success .ps-metric__value { color: var(--ps-color-success); }

.ps-metric--warning {
  background: var(--ps-color-warning-soft);
  color: var(--ps-color-warning);
}

.ps-metric--danger {
  background: var(--ps-color-danger-soft);
  color: var(--ps-color-danger);
}

.ps-metric--info {
  background: var(--ps-color-info-soft);
  color: var(--ps-color-info);
}
</style>
