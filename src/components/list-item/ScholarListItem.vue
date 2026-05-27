<template>
  <AppCard hover interactive class="ps-scholar-item" @click="jumpDetailView">
    <div class="ps-scholar-item__main">
      <AppAvatar :name="infoItem.display_name" :id="infoItem.id" size="lg" />
      <div class="ps-scholar-item__body">
        <h3 class="ps-scholar-item__name">
          {{ infoItem.display_name }}
          <span v-if="infoItem.display_name_alt" class="ps-scholar-item__alt">{{ infoItem.display_name_alt }}</span>
        </h3>
        <p v-if="institutionName" class="ps-scholar-item__institution">
          <AppIcon name="School" :size="14" />
          {{ institutionName }}
        </p>
        <div class="ps-scholar-item__interests">
          <AppTagChip
            v-for="(interest, idx) in (infoItem.research_interests || []).slice(0, 4)"
            :key="idx"
            size="sm"
            variant="subtle"
          >
            {{ interest }}
          </AppTagChip>
        </div>
      </div>
      <div class="ps-scholar-item__stats">
        <div class="ps-scholar-item__stat">
          <span class="ps-scholar-item__stat-num">{{ infoItem.h_index || 0 }}</span>
          <span class="ps-scholar-item__stat-label">h-index</span>
        </div>
        <div class="ps-scholar-item__stat">
          <span class="ps-scholar-item__stat-num">{{ formatNumber(infoItem.works_count) }}</span>
          <span class="ps-scholar-item__stat-label">{{ $t('institution_works_count') || '发表' }}</span>
        </div>
        <div class="ps-scholar-item__stat">
          <span class="ps-scholar-item__stat-num">{{ formatNumber(infoItem.cited_by_count) }}</span>
          <span class="ps-scholar-item__stat-label">{{ $t('institution_cited_by_count') || '被引' }}</span>
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script>
import { AppCard, AppAvatar, AppIcon, AppTagChip } from '../ui'
import { scholarPortalPath } from '../../utils/personal-page.mjs'

export default {
  name: 'ScholarListItem',
  components: { AppCard, AppAvatar, AppIcon, AppTagChip },
  props: { infoItem: { type: Object, required: true } },
  computed: {
    institutionName() {
      const i = this.infoItem.last_known_institution
      return i ? i.display_name : ''
    }
  },
  methods: {
    formatNumber(n) {
      if (typeof n !== 'number') return n || 0
      if (Math.abs(n) >= 10_000) return (n / 1_000).toFixed(1) + 'K'
      if (Math.abs(n) >= 1_000) return n.toLocaleString('en-US')
      return n.toString()
    },
    jumpDetailView() {
      const path = scholarPortalPath(this.infoItem)
      if (path) this.$router.push(path)
    }
  }
}
</script>

<style scoped>
.ps-scholar-item {
  margin-bottom: var(--ps-space-4);
}

.ps-scholar-item__main {
  display: flex;
  align-items: center;
  gap: var(--ps-space-5);
}

.ps-scholar-item__body {
  flex: 1;
  min-width: 0;
}

.ps-scholar-item__name {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-lg);
  font-weight: 700;
  color: var(--ps-text-1);
  margin-bottom: 4px;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.ps-scholar-item__alt {
  font-family: var(--ps-font-sans);
  font-size: var(--ps-fs-sm);
  font-weight: 500;
  color: var(--ps-text-3);
}

.ps-scholar-item__institution {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-2);
  margin-bottom: var(--ps-space-3);
}

.ps-scholar-item__interests {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ps-scholar-item__stats {
  display: flex;
  gap: var(--ps-space-5);
  padding-left: var(--ps-space-5);
  border-left: 1px solid var(--ps-border-1);
  flex: none;
}

.ps-scholar-item__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
}

.ps-scholar-item__stat-num {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-2xl);
  font-weight: 700;
  color: var(--ps-text-1);
  line-height: 1.0;
}

.ps-scholar-item__stat-label {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--ps-text-3);
  text-transform: uppercase;
  margin-top: 4px;
}

@media screen and (max-width: 720px) {
  .ps-scholar-item__main { flex-wrap: wrap; }
  .ps-scholar-item__stats {
    border-left: 0;
    border-top: 1px solid var(--ps-border-1);
    padding-left: 0;
    padding-top: var(--ps-space-3);
    width: 100%;
    justify-content: space-around;
  }
}
</style>
