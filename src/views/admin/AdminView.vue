<template>
  <div class="ps-admin">
    <AppGradientHero variant="soft" compact class="ps-admin__hero">
      <div class="ps-admin__hero-content">
        <div>
          <p class="ps-admin__eyebrow">管理后台 · ADMIN</p>
          <h1 class="ps-admin__title">身份认证审核</h1>
          <p class="ps-admin__lede">审阅、审批与驳回学者身份认证申请，维护平台学术生态的真实性。</p>
        </div>
        <aside class="ps-admin__hero-stats">
          <div class="ps-admin__stat">
            <span class="ps-admin__stat-num">{{ countByLegacyStatus(0) }}</span>
            <span class="ps-admin__stat-label">待审核</span>
          </div>
          <div class="ps-admin__stat">
            <span class="ps-admin__stat-num">{{ countByLegacyStatus(1) }}</span>
            <span class="ps-admin__stat-label">已通过</span>
          </div>
          <div class="ps-admin__stat">
            <span class="ps-admin__stat-num">{{ countByLegacyStatus(2) }}</span>
            <span class="ps-admin__stat-label">已驳回</span>
          </div>
          <button class="basic-btn-outline ps-admin__tutorial-btn" @click="displayTutorial = true">
            <AppIcon name="HelpCircle" :size="14" />
            查看教程
          </button>
        </aside>
      </div>
    </AppGradientHero>

    <AppCard class="ps-admin__filters">
      <div class="ps-admin__filter-row">
        <label class="ps-admin__filter-label">
          <AppIcon name="FilterOutline" :size="14" />
          状态
        </label>
        <div class="ps-admin__chips">
          <button
            v-for="s in statusOptions"
            :key="s.value"
            class="ps-admin__chip"
            :class="{ 'ps-admin__chip--active': selectStatus === s.value }"
            @click="selectStatus = s.value"
          >{{ s.label }}</button>
        </div>
        <button class="basic-btn-outline ps-admin__refresh" @click="load">
          <AppIcon name="Refresh" :size="14" />
          刷新
        </button>
      </div>
    </AppCard>

    <div class="ps-admin__list">
      <AppEmptyState
        v-if="!filteredRows.length"
        title="没有匹配的申请"
        description="当前筛选条件下未发现申请记录。"
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
    <TutorialView :display="displayTutorial" @stop-display="displayTutorial = false" />
  </div>
</template>

<script>
import { Application } from '../../api/applications'
import AuditDetailView from './AuditDetailView.vue'
import TutorialView from '../tutorialView/TutorialView.vue'
import { AppCard, AppIcon, AppGradientHero, AppEmptyState } from '../../components/ui'

export default {
  name: 'AdminView',
  components: {
    AuditDetailView,
    TutorialView,
    AppCard,
    AppIcon,
    AppGradientHero,
    AppEmptyState
  },
  data() {
    return {
      displayTutorial: false,
      selectStatus: -1,
      statusOptions: [
        { value: -1, label: '全部' },
        { value: 0, label: '待审核' },
        { value: 1, label: '已通过' },
        { value: 2, label: '已驳回' },
        { value: 3, label: '未确认' }
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

.ps-admin__tutorial-btn {
  height: 38px;
  gap: 6px;
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
