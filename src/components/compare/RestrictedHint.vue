<template>
  <div class="ps-restricted-hint">
    <AppIcon name="AlertCircleOutline" :size="14" inline />
    <span>{{ label }}</span>
  </div>
</template>

<script>
import AppIcon from '../ui/Icon.vue'

export default {
  name: 'RestrictedHint',
  components: { AppIcon },
  props: {
    label: { type: String, default: '基于摘要的受限推断' }
  }
}
</script>

<style scoped>
.ps-restricted-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(212, 175, 55, 0.12);
  color: #8b6a13;
  border-radius: 6px;
  font-size: 12px;
  font-style: italic;
  line-height: 1.4;
}
</style>
