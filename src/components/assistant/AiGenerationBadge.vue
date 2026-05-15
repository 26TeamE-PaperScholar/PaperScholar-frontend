<template>
  <span class="ps-ai-badge" :title="title">
    <AppIcon name="SparklesOutline" :size="11" inline />
    <span class="ps-ai-badge__label">AI 生成内容</span>
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
      default: '本条回答由 AI 自动生成，请结合证据片段与来源进行核查。'
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
