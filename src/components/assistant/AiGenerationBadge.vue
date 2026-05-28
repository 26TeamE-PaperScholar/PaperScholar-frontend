<template>
  <span class="ps-ai-badge" :title="resolvedTitle">
    <AppIcon name="SparklesOutline" :size="11" inline />
    <span class="ps-ai-badge__label">{{ $t('assistant_ai_generated') }}</span>
  </span>
</template>

<script>
import AppIcon from '../ui/Icon.vue'

export default {
  name: 'AiGenerationBadge',
  components: { AppIcon },
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  computed: {
    resolvedTitle() {
      return this.title || this.$t('assistant_ai_generated_title')
    }
  }
}
</script>

<style scoped>
.ps-ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--ps-color-primary-strong);
  background: linear-gradient(135deg, var(--ps-color-primary-soft), var(--ps-color-accent-soft));
  border: 1px solid var(--ps-border-1);
  border-radius: 999px;
}
.ps-ai-badge__label { line-height: 1; }
</style>
