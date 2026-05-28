<template>
  <div class="ps-restricted-hint">
    <AppIcon name="AlertCircleOutline" :size="14" inline />
    <span>{{ resolvedLabel }}</span>
  </div>
</template>

<script>
import AppIcon from '../ui/Icon.vue'

export default {
  name: 'RestrictedHint',
  components: { AppIcon },
  props: {
    label: { type: String, default: '' }
  },
  computed: {
    resolvedLabel() {
      return this.label || this.$t('compare_restricted_hint')
    }
  }
}
</script>

<style scoped>
.ps-restricted-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--ps-color-warning-soft);
  color: var(--ps-color-warning-strong);
  border-radius: 6px;
  font-size: 12px;
  font-style: italic;
  line-height: 1.4;
}
</style>
