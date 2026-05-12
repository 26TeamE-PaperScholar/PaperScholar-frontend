<template>
  <AppCard hover interactive class="ps-journal-item" @click="onClick">
    <div class="ps-journal-item__main">
      <div class="ps-journal-item__cover" aria-hidden="true">
        <AppIcon :name="typeIcon" :size="22" />
      </div>
      <div class="ps-journal-item__body">
        <h3 class="ps-journal-item__title">
          {{ infoItem.display_name }}
          <span v-if="infoItem.display_name_alt" class="ps-journal-item__alt">{{ infoItem.display_name_alt }}</span>
        </h3>
        <p class="ps-journal-item__meta">
          <span v-if="infoItem.publisher">{{ infoItem.publisher }}</span>
          <span v-if="infoItem.issn">ISSN {{ infoItem.issn }}</span>
        </p>
        <div class="ps-journal-item__chips">
          <AppTagChip variant="subtle" size="sm">{{ typeLabel }}</AppTagChip>
          <AppTagChip v-if="infoItem.is_oa" variant="success" size="sm" icon="GlobeOutline">开放获取</AppTagChip>
          <AppTagChip v-if="infoItem.impact_factor" variant="gold" size="sm">IF {{ infoItem.impact_factor }}</AppTagChip>
        </div>
      </div>
      <div class="ps-journal-item__stats">
        <div class="ps-journal-item__stat">
          <span class="ps-journal-item__stat-num">{{ infoItem.h_index || '-' }}</span>
          <span class="ps-journal-item__stat-label">h-index</span>
        </div>
        <div class="ps-journal-item__stat">
          <span class="ps-journal-item__stat-num">{{ formatNumber(infoItem.works_count) }}</span>
          <span class="ps-journal-item__stat-label">{{ $t('institution_works_count') || '收录' }}</span>
        </div>
        <div class="ps-journal-item__stat">
          <span class="ps-journal-item__stat-num">{{ formatNumber(infoItem.cited_by_count) }}</span>
          <span class="ps-journal-item__stat-label">{{ $t('institution_cited_by_count') || '被引' }}</span>
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script>
import { AppCard, AppIcon, AppTagChip } from '../ui'

const TYPE_META = {
  journal: { icon: 'BookOutline', label: '期刊' },
  conference: { icon: 'People', label: '会议' },
  repository: { icon: 'Cloud', label: '预印本' },
  ebook: { icon: 'Library', label: '电子书' },
  platform: { icon: 'Apps', label: '平台' }
}

export default {
  name: 'JournalListItem',
  components: { AppCard, AppIcon, AppTagChip },
  props: { infoItem: { type: Object, required: true } },
  computed: {
    typeIcon() {
      return (TYPE_META[this.infoItem.type] || TYPE_META.journal).icon
    },
    typeLabel() {
      return (TYPE_META[this.infoItem.type] || TYPE_META.journal).label
    }
  },
  methods: {
    formatNumber(n) {
      if (typeof n !== 'number') return n || 0
      if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
      if (Math.abs(n) >= 10_000) return (n / 1_000).toFixed(1) + 'K'
      if (Math.abs(n) >= 1_000) return n.toLocaleString('en-US')
      return n.toString()
    },
    onClick() {
      if (this.infoItem.homepage_url) {
        window.open(this.infoItem.homepage_url, '_blank')
      }
    }
  }
}
</script>

<style scoped>
.ps-journal-item {
  margin-bottom: var(--ps-space-4);
}

.ps-journal-item__main {
  display: flex;
  align-items: center;
  gap: var(--ps-space-5);
}

.ps-journal-item__cover {
  width: 56px;
  height: 72px;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--ps-color-primary), var(--ps-color-accent));
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  box-shadow: var(--ps-shadow-1);
}

.ps-journal-item__body { flex: 1; min-width: 0; }

.ps-journal-item__title {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-lg);
  font-weight: 700;
  color: var(--ps-text-1);
  margin-bottom: 4px;
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}

.ps-journal-item__alt {
  font-family: var(--ps-font-sans);
  font-size: var(--ps-fs-sm);
  font-weight: 500;
  color: var(--ps-text-3);
}

.ps-journal-item__meta {
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-2);
  margin-bottom: var(--ps-space-3);
  display: flex;
  gap: var(--ps-space-3);
}

.ps-journal-item__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ps-journal-item__stats {
  display: flex;
  gap: var(--ps-space-5);
  padding-left: var(--ps-space-5);
  border-left: 1px solid var(--ps-border-1);
  flex: none;
}

.ps-journal-item__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
}

.ps-journal-item__stat-num {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-2xl);
  font-weight: 700;
  color: var(--ps-text-1);
  line-height: 1.0;
}

.ps-journal-item__stat-label {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--ps-text-3);
  text-transform: uppercase;
  margin-top: 4px;
}

@media screen and (max-width: 720px) {
  .ps-journal-item__main { flex-wrap: wrap; }
  .ps-journal-item__stats {
    border-left: 0;
    border-top: 1px solid var(--ps-border-1);
    padding-left: 0;
    padding-top: var(--ps-space-3);
    width: 100%;
    justify-content: space-around;
  }
}
</style>
