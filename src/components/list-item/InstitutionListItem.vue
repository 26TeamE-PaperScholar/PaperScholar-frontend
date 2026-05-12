<template>
  <AppCard hover interactive class="ps-inst-item" @click="jumpDetailView">
    <div class="ps-inst-item__main">
      <div class="ps-inst-item__seal" aria-hidden="true">
        <AppIcon name="RibbonOutline" :size="22" />
      </div>
      <div class="ps-inst-item__body">
        <h3 class="ps-inst-item__name">
          {{ infoItem.display_name }}
          <span v-if="infoItem.display_name_alt" class="ps-inst-item__alt">{{ infoItem.display_name_alt }}</span>
        </h3>
        <p class="ps-inst-item__loc">
          <AppIcon name="LocationOutline" :size="14" />
          {{ locationText }}
        </p>
        <div class="ps-inst-item__topics">
          <AppTagChip
            v-for="(c, idx) in (infoItem.top_concepts || []).slice(0, 4)"
            :key="idx"
            size="sm"
            variant="subtle"
          >{{ c }}</AppTagChip>
        </div>
      </div>
      <div class="ps-inst-item__stats">
        <div class="ps-inst-item__stat">
          <span class="ps-inst-item__stat-num">{{ formatNumber(infoItem.works_count) }}</span>
          <span class="ps-inst-item__stat-label">{{ $t('institution_works_count') || '发表' }}</span>
        </div>
        <div class="ps-inst-item__stat">
          <span class="ps-inst-item__stat-num">{{ formatNumber(infoItem.cited_by_count) }}</span>
          <span class="ps-inst-item__stat-label">{{ $t('institution_cited_by_count') || '被引' }}</span>
        </div>
        <div class="ps-inst-item__stat">
          <AppTagChip variant="gold" size="md">{{ infoItem.type === 'company' ? '产业研究' : '教研机构' }}</AppTagChip>
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script>
import { AppCard, AppIcon, AppTagChip } from '../ui'

export default {
  name: 'InstitutionListItem',
  components: { AppCard, AppIcon, AppTagChip },
  props: { infoItem: { type: Object, required: true } },
  computed: {
    locationText() {
      const parts = [this.infoItem.geo && this.infoItem.geo.city, this.infoItem.country].filter(Boolean)
      return parts.join(', ') || this.infoItem.country_code || '-'
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
    jumpDetailView() {
      this.$router.push('/institution_detail/' + this.infoItem.id)
    }
  }
}
</script>

<style scoped>
.ps-inst-item {
  margin-bottom: var(--ps-space-4);
}

.ps-inst-item__main {
  display: flex;
  align-items: center;
  gap: var(--ps-space-5);
}

.ps-inst-item__seal {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ps-color-primary-soft), var(--ps-color-accent-soft));
  color: var(--ps-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  border: 1px solid var(--ps-border-1);
}

.ps-inst-item__body { flex: 1; min-width: 0; }

.ps-inst-item__name {
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

.ps-inst-item__alt {
  font-family: var(--ps-font-sans);
  font-size: var(--ps-fs-sm);
  font-weight: 500;
  color: var(--ps-text-3);
}

.ps-inst-item__loc {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-2);
  margin-bottom: var(--ps-space-3);
}

.ps-inst-item__topics {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ps-inst-item__stats {
  display: flex;
  align-items: center;
  gap: var(--ps-space-5);
  padding-left: var(--ps-space-5);
  border-left: 1px solid var(--ps-border-1);
  flex: none;
}

.ps-inst-item__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
}

.ps-inst-item__stat-num {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-2xl);
  font-weight: 700;
  color: var(--ps-text-1);
  line-height: 1.0;
}

.ps-inst-item__stat-label {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--ps-text-3);
  text-transform: uppercase;
  margin-top: 4px;
}

@media screen and (max-width: 720px) {
  .ps-inst-item__main { flex-wrap: wrap; }
  .ps-inst-item__stats {
    border-left: 0;
    border-top: 1px solid var(--ps-border-1);
    padding-left: 0;
    padding-top: var(--ps-space-3);
    width: 100%;
    justify-content: space-around;
  }
}
</style>
