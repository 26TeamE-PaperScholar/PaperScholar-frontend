<template>
  <article class="ps-evidence" :class="{ 'ps-evidence--restricted': restricted }">
    <header class="ps-evidence__head">
      <span class="ps-evidence__num">{{ $t('assistant_evidence', { index: index + 1 }) }}</span>
      <span class="ps-evidence__loc">{{ locationLabel }}</span>
      <button
        v-if="paperTitle"
        class="ps-evidence__paper"
        type="button"
        @click="$emit('open-paper', evidence.paper_id)"
        :title="paperTitle"
      >
        {{ paperTitleShort }}
        <AppIcon name="OpenOutline" :size="11" inline />
      </button>
    </header>
    <p class="ps-evidence__snippet">{{ evidence.snippet }}</p>
  </article>
</template>

<script>
import AppIcon from '../ui/Icon.vue'

const LOCATION_LABEL = {
  abstract: 'assistant_location_abstract',
  metadata: 'assistant_location_metadata',
  introduction: 'assistant_location_introduction',
  conclusion: 'assistant_location_conclusion'
}

export default {
  name: 'EvidenceCard',
  components: { AppIcon },
  emits: ['open-paper'],
  props: {
    evidence: { type: Object, required: true },
    index: { type: Number, default: 0 },
    paperTitle: { type: String, default: '' },
    /** 该消息是否处于 restricted 模式（影响外观 hint） */
    restricted: { type: Boolean, default: false }
  },
  computed: {
    locationLabel() {
      const loc = this.evidence && this.evidence.location
      if (!loc) return '—'
      if (LOCATION_LABEL[loc]) return this.$t(LOCATION_LABEL[loc])
      const m = loc.match(/^section_(\d+)$/)
      if (m) return this.$t('assistant_location_section', { index: m[1] })
      const t = loc.match(/^table_(\d+)$/)
      if (t) return this.$t('assistant_location_table', { index: t[1] })
      return loc
    },
    paperTitleShort() {
      if (!this.paperTitle) return this.evidence.paper_id
      return this.paperTitle.length > 36 ? this.paperTitle.slice(0, 36) + '…' : this.paperTitle
    }
  }
}
</script>

<style scoped>
.ps-evidence {
  background: var(--ps-color-primary-soft);
  border: 1px solid var(--ps-border-1);
  border-radius: 10px;
  padding: 10px 12px;
}
.ps-evidence--restricted {
  background: var(--ps-color-warning-soft);
  border-color: var(--ps-color-warning);
}
.ps-evidence__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.ps-evidence__num {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary-strong);
  border: 1px solid var(--ps-border-1);
  border-radius: 999px;
}
.ps-evidence--restricted .ps-evidence__num {
  background: var(--ps-color-warning-soft);
  color: var(--ps-color-warning-strong);
  border-color: var(--ps-color-warning);
}
.ps-evidence__loc {
  font-size: 11px;
  color: var(--ps-text-2);
}
.ps-evidence__paper {
  font-size: 11px;
  color: var(--ps-color-primary);
  background: transparent;
  border: 1px solid transparent;
  padding: 1px 6px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: auto;
}
.ps-evidence__paper:hover {
  background: var(--ps-color-primary-hover);
  border-color: var(--ps-border-1);
}
.ps-evidence__snippet {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--ps-text-1);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
