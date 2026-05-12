<template>
  <div class="ps-stat" :class="{ 'ps-stat--accent': accent }">
    <div class="ps-stat__label">
      <AppIcon v-if="icon" :name="icon" :size="16" />
      <span>{{ label }}</span>
    </div>
    <div class="ps-stat__value">
      <span class="ps-stat__number">{{ formattedValue }}</span>
      <span v-if="unit" class="ps-stat__unit">{{ unit }}</span>
    </div>
    <div v-if="trend !== null && trend !== undefined" class="ps-stat__trend" :class="trendClass">
      <AppIcon :name="trendIcon" :size="12" />
      <span>{{ trendLabel }}</span>
    </div>
    <div v-else-if="hint" class="ps-stat__hint">{{ hint }}</div>
  </div>
</template>

<script>
import AppIcon from './Icon.vue'

const formatNumber = (n) => {
  if (typeof n !== 'number') return n
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (Math.abs(n) >= 10_000) return (n / 1_000).toFixed(1) + 'K'
  if (Math.abs(n) >= 1_000) return n.toLocaleString('en-US')
  return n.toString()
}

export default {
  name: 'AppStat',
  components: { AppIcon },
  props: {
    label: { type: String, required: true },
    value: { type: [Number, String], required: true },
    unit: { type: String, default: '' },
    icon: { type: String, default: '' },
    trend: { type: Number, default: null },
    hint: { type: String, default: '' },
    accent: { type: Boolean, default: false }
  },
  computed: {
    formattedValue() {
      return typeof this.value === 'number' ? formatNumber(this.value) : this.value
    },
    trendClass() {
      if (this.trend == null) return ''
      if (this.trend > 0) return 'ps-stat__trend--up'
      if (this.trend < 0) return 'ps-stat__trend--down'
      return 'ps-stat__trend--flat'
    },
    trendIcon() {
      if (this.trend == null) return ''
      if (this.trend > 0) return 'ArrowUp'
      if (this.trend < 0) return 'ArrowDown'
      return 'RemoveOutline'
    },
    trendLabel() {
      if (this.trend == null) return ''
      const sign = this.trend > 0 ? '+' : ''
      return sign + this.trend + '%'
    }
  }
}
</script>

<style scoped>
.ps-stat {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-2);
  padding: var(--ps-space-5) var(--ps-space-5);
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-md);
  min-width: 0;
}

.ps-stat--accent {
  background: linear-gradient(135deg, rgba(45, 27, 105, 0.06), rgba(212, 175, 55, 0.04));
  border-color: rgba(45, 27, 105, 0.18);
}

.ps-stat__label {
  display: flex;
  align-items: center;
  gap: var(--ps-space-2);
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-2);
  font-weight: 500;
}

.ps-stat__value {
  display: flex;
  align-items: baseline;
  gap: var(--ps-space-2);
}

.ps-stat__number {
  font-family: var(--ps-font-display);
  font-weight: 700;
  font-size: var(--ps-fs-3xl);
  color: var(--ps-text-1);
  letter-spacing: -0.01em;
  line-height: 1.05;
}

.ps-stat__unit {
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-2);
  font-weight: 600;
}

.ps-stat__trend {
  display: inline-flex;
  align-items: center;
  gap: var(--ps-space-1);
  font-size: var(--ps-fs-xs);
  font-weight: 600;
  align-self: flex-start;
  padding: 2px 8px;
  border-radius: var(--ps-radius-pill);
}

.ps-stat__trend--up {
  color: var(--ps-color-success);
  background: var(--ps-color-success-soft);
}

.ps-stat__trend--down {
  color: var(--ps-color-danger);
  background: var(--ps-color-danger-soft);
}

.ps-stat__trend--flat {
  color: var(--ps-text-2);
  background: var(--ps-bg-sunken);
}

.ps-stat__hint {
  font-size: var(--ps-fs-xs);
  color: var(--ps-text-3);
}
</style>
