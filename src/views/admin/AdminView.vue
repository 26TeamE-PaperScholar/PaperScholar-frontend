<template>
  <div class="ps-admin">
    <AppGradientHero variant="soft" compact class="ps-admin__hero">
      <div class="ps-admin__hero-content">
        <div>
          <p class="ps-admin__eyebrow">{{ $t('admin_eyebrow') }}</p>
          <h1 class="ps-admin__title">{{ $t('admin_title') }}</h1>
          <p class="ps-admin__lede">{{ $t('admin_desc') }}</p>
        </div>
        <aside class="ps-admin__hero-stats">
          <div class="ps-admin__stat">
            <span class="ps-admin__stat-num">{{ countByLegacyStatus(0) }}</span>
            <span class="ps-admin__stat-label">{{ $t('admin_pending') }}</span>
          </div>
          <div class="ps-admin__stat">
            <span class="ps-admin__stat-num">{{ countByLegacyStatus(1) }}</span>
            <span class="ps-admin__stat-label">{{ $t('admin_approved') }}</span>
          </div>
          <div class="ps-admin__stat">
            <span class="ps-admin__stat-num">{{ countByLegacyStatus(2) }}</span>
            <span class="ps-admin__stat-label">{{ $t('admin_rejected') }}</span>
          </div>
        </aside>
      </div>
    </AppGradientHero>

    <AppCard class="ps-admin__filters">
      <div class="ps-admin__filter-row">
        <label class="ps-admin__filter-label">
          <AppIcon name="FilterOutline" :size="14" />
          {{ $t('common_status') }}
        </label>
        <div class="ps-admin__chips">
          <button
            v-for="s in statusOptions"
            :key="s.value"
            class="ps-admin__chip"
            :class="{ 'ps-admin__chip--active': selectStatus === s.value }"
            @click="selectStatus = s.value"
          >{{ $t(s.labelKey) }}</button>
        </div>
        <button class="basic-btn-outline ps-admin__refresh" @click="load">
          <AppIcon name="Refresh" :size="14" />
          {{ $t('common_refresh') }}
        </button>
      </div>
    </AppCard>

    <div class="ps-admin__list">
      <AppEmptyState
        v-if="!filteredRows.length"
        :title="$t('admin_empty_title')"
        :description="$t('admin_empty_desc')"
      />
      <ul v-else>
        <li v-for="data in filteredRows" :key="data.id">
          <AuditDetailView
            :userId="data.userId"
            :auditId="data.auditId"
            :userName="data.userName"
            :realName="data.realName"
            :institution="data.institution"
            :position="data.position"
            :workEmail="data.workEmail"
            :concepts="data.concepts"
            :content="data.content"
            :submitTime="data.submitTime"
            :status="data.status"
            :applicationType="data.applicationType"
            :images="data.images || []"
            :rejectReason="data.rejectReason"
            :isDetail="!!data.isDetail"
            @back="data.isDetail = false"
            @show-detail="data.isDetail = true"
            @approve="data.status = 1"
            @disapprove="data.status = 2"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { Application } from '../../api/applications'
import AuditDetailView from './AuditDetailView.vue'
import { AppCard, AppIcon, AppGradientHero, AppEmptyState } from '../../components/ui'

export default {
  name: 'AdminView',
  components: {
    AuditDetailView,
    AppCard,
    AppIcon,
    AppGradientHero,
    AppEmptyState
  },
  data() {
    return {
      selectStatus: -1,
      statusOptions: [
        { value: -1, labelKey: 'admin_status_all' },
        { value: 0, labelKey: 'admin_pending' },
        { value: 1, labelKey: 'admin_approved' },
        { value: 2, labelKey: 'admin_rejected' },
        { value: 3, labelKey: 'admin_unconfirmed' }
      ],
      rows: []
    }
  },
  computed: {
    filteredRows() {
      if (this.selectStatus === -1) return this.rows
      return this.rows.filter((r) => r.status === this.selectStatus)
    }
  },
  mounted() { this.load() },
  methods: {
    load() {
      Application.getAuditedList({}).then((res) => {
        const data = (res && res.data) || {}
        // 让每行带一个 UI 局部 state `isDetail`，由内层组件 show-detail/back 切换
        this.rows = (data.results || []).map((row) => ({ ...row, isDetail: false }))
      })
    },
    countByLegacyStatus(s) {
      return this.rows.filter((r) => r.status === s).length
    }
  }
}
</script>

<style scoped>
.ps-admin {
  max-width: var(--ps-content-max);
  margin: 0 auto;
  padding: var(--ps-space-5) var(--ps-space-6) var(--ps-space-10);
}

.ps-admin__hero { margin-bottom: var(--ps-space-6); }

.ps-admin__hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ps-space-5);
  flex-wrap: wrap;
}

.ps-admin__eyebrow {
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--ps-color-accent-strong);
  font-weight: 700;
  margin-bottom: var(--ps-space-2);
}

.ps-admin__title {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-3xl);
  color: var(--ps-text-1);
  font-weight: 700;
}

.ps-admin__lede {
  color: var(--ps-text-2);
  font-size: var(--ps-fs-sm);
  margin-top: 4px;
}

.ps-admin__hero-stats {
  display: flex;
  gap: var(--ps-space-5);
  align-items: center;
  flex-wrap: wrap;
}

.ps-admin__stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: var(--ps-space-3) var(--ps-space-5);
  border-left: 3px solid var(--ps-color-primary);
  background: var(--ps-bg-elevated);
  border-radius: var(--ps-radius-md);
  min-width: 100px;
}

.ps-admin__stat-num {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-2xl);
  font-weight: 700;
  color: var(--ps-text-1);
}

.ps-admin__stat-label {
  font-size: 11px;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: var(--ps-text-3);
}

/* ── Filters ───────────────────────────────────── */
.ps-admin__filters { margin-bottom: var(--ps-space-4); }

.ps-admin__filter-row {
  display: flex;
  align-items: center;
  gap: var(--ps-space-3);
  flex-wrap: wrap;
}

.ps-admin__filter-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--ps-fs-xs);
  text-transform: uppercase;
  letter-spacing: 0.10em;
  color: var(--ps-text-3);
  font-weight: 700;
}

.ps-admin__chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.ps-admin__chip {
  padding: 6px 12px;
  font-size: var(--ps-fs-xs);
  font-weight: 600;
  color: var(--ps-text-2);
  background: var(--ps-bg-sunken);
  border-radius: var(--ps-radius-pill);
  cursor: pointer;
}

.ps-admin__chip:hover { background: var(--ps-color-primary-soft); color: var(--ps-color-primary); }
.ps-admin__chip--active { background: var(--ps-color-primary); color: var(--ps-text-inverse); }

.ps-admin__refresh {
  margin-left: auto;
  height: 36px;
  gap: 6px;
  font-size: var(--ps-fs-sm);
}

.ps-admin__list ul {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-4);
}

@media screen and (max-width: 1024px) {
  .ps-admin__hero-content {
    flex-direction: column;
    align-items: flex-start;
  }
  .ps-admin__hero-stats { width: 100%; }
}

@media screen and (max-width: 720px) {
  .ps-admin { padding: var(--ps-space-4); }
}
</style>
