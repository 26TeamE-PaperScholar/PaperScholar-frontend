<template>
  <span class="ps-pcc" :title="paperTitle">
    <AppIcon name="DocumentTextOutline" :size="12" inline />
    <span class="ps-pcc__label">{{ short }}</span>
    <button
      v-if="removable"
      type="button"
      class="ps-pcc__remove"
      :aria-label="$t('common_remove')"
      @click.stop="$emit('remove', paperId)"
    >
      <AppIcon name="Close" :size="11" />
    </button>
  </span>
</template>

<script>
import AppIcon from '../ui/Icon.vue'

export default {
  name: 'PaperContextChip',
  components: { AppIcon },
  emits: ['remove'],
  props: {
    paperId: { type: String, required: true },
    paperTitle: { type: String, default: '' },
    removable: { type: Boolean, default: false },
    maxLen: { type: Number, default: 32 }
  },
  computed: {
    short() {
      const t = this.paperTitle || this.paperId
      return t.length > this.maxLen ? t.slice(0, this.maxLen) + '…' : t
    }
  }
}
</script>

<style scoped>
.ps-pcc {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px 4px 8px;
  font-size: 12px;
  color: var(--ps-color-primary-strong);
  background: var(--ps-color-primary-soft);
  border: 1px solid var(--ps-border-1);
  border-radius: 999px;
  max-width: 280px;
}
.ps-pcc__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ps-pcc__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 0;
  padding: 0;
  margin-left: 2px;
  color: var(--ps-text-3);
  cursor: pointer;
  border-radius: 999px;
  width: 16px;
  height: 16px;
}
.ps-pcc__remove:hover {
  background: var(--ps-color-primary-hover);
  color: var(--ps-text-1);
}
</style>
