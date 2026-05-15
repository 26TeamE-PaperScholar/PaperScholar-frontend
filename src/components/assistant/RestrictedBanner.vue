<template>
  <div class="ps-restricted-banner" role="status">
    <AppIcon name="AlertCircleOutline" :size="16" inline />
    <div class="ps-restricted-banner__body">
      <strong>受限模式：</strong>
      <span>{{ message }}</span>
      <span v-if="papers && papers.length" class="ps-restricted-banner__papers">
        相关论文：{{ papers.map((p) => p.title || p.id).join('、') }}
      </span>
    </div>
  </div>
</template>

<script>
import AppIcon from '../ui/Icon.vue'

export default {
  name: 'RestrictedBanner',
  components: { AppIcon },
  props: {
    message: {
      type: String,
      default: '本回答仅基于论文题录、摘要、关键词等有限数据生成，结论强度低于全文阅读。'
    },
    /** [{id, title}] */
    papers: { type: Array, default: () => [] }
  }
}
</script>

<style scoped>
.ps-restricted-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  background: var(--ps-color-warning-soft);
  border: 1px solid var(--ps-color-warning);
  border-left: 4px solid var(--ps-color-warning-strong);
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--ps-color-warning-strong);
}
.ps-restricted-banner__body {
  flex: 1;
  min-width: 0;
}
.ps-restricted-banner__body strong { color: var(--ps-color-warning-strong); margin-right: 4px; }
.ps-restricted-banner__papers {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--ps-color-warning);
}
</style>
