<template>
  <div class="ps-compare-cell" :class="[low ? 'ps-compare-cell--low' : '', empty ? 'ps-compare-cell--empty' : '']">
    <template v-if="empty">
      <RestrictedHint :label="resolvedEmptyLabel" />
    </template>
    <template v-else>
      <div class="ps-compare-cell__head">
        <span v-if="low" class="ps-compare-cell__confidence">{{ $t('compare_inferred') }}</span>
        <button
          v-if="source"
          type="button"
          class="ps-compare-cell__src-btn"
          :aria-label="$t('compare_view_source_aria')"
          @click="popoverOpen = !popoverOpen"
          @blur="popoverOpen = false"
        >
          <AppIcon name="InformationCircleOutline" :size="14" />
        </button>
      </div>

      <template v-if="metrics">
        <ul class="ps-compare-cell__metrics">
          <li v-for="(m, i) in metrics" :key="i">
            <span class="ps-compare-cell__metric-name">{{ m.name }}</span>
            <span class="ps-compare-cell__metric-value">{{ m.value }}</span>
            <span class="ps-compare-cell__metric-src">{{ formatLocation(m.source) }}</span>
          </li>
        </ul>
        <p v-if="!metrics.length" class="ps-compare-cell__hint">{{ $t('compare_metric_empty') }}</p>
      </template>
      <template v-else>
        <p class="ps-compare-cell__value">{{ value }}</p>
      </template>

      <transition name="ps-pop">
        <div v-if="popoverOpen" class="ps-compare-cell__popover" @mousedown.prevent>
          <p class="ps-compare-cell__popover-row">
            <strong>{{ $t('compare_source_label') }}</strong>{{ formatLocation(source) }}
          </p>
          <p v-if="confidence" class="ps-compare-cell__popover-row">
            <strong>{{ $t('compare_confidence_label') }}</strong>
            <span :class="'ps-confidence-' + confidence">{{ confidence === 'high' ? $t('compare_confidence_high') : $t('compare_confidence_low') }}</span>
          </p>
        </div>
      </transition>
    </template>
  </div>
</template>

<script>
import AppIcon from '../ui/Icon.vue'
import RestrictedHint from './RestrictedHint.vue'

const LOCATION_LABEL = {
  abstract: 'assistant_location_abstract',
  metadata: 'assistant_location_metadata',
  introduction: 'assistant_location_introduction',
  conclusion: 'assistant_location_conclusion'
}

export default {
  name: 'CompareCell',
  components: { AppIcon, RestrictedHint },
  props: {
    /** 单一字段 { value, source, confidence } 或 null */
    cell: { type: Object, default: null },
    /** metrics 数组（用于评价指标行） */
    metrics: { type: Array, default: null },
    /** 整篇是否进入 restricted 模式（用于空态文案） */
    restricted: { type: Boolean, default: false },
    /** 空态自定义标签 */
    emptyLabel: { type: String, default: '' }
  },
  data() {
    return { popoverOpen: false }
  },
  computed: {
    empty() {
      if (this.metrics) return false
      return !this.cell || !this.cell.value
    },
    value() {
      return this.cell && this.cell.value ? this.cell.value : ''
    },
    source() {
      return this.cell && this.cell.source ? this.cell.source : ''
    },
    confidence() {
      return this.cell && this.cell.confidence ? this.cell.confidence : ''
    },
    low() {
      return this.confidence === 'low'
    },
    resolvedEmptyLabel() {
      return this.emptyLabel || this.$t('compare_restricted_hint')
    }
  },
  methods: {
    formatLocation(loc) {
      if (!loc) return '—'
      if (LOCATION_LABEL[loc]) return this.$t(LOCATION_LABEL[loc])
      const m = loc.match(/^section_(\d+)$/)
      if (m) return this.$t('assistant_location_section', { index: m[1] })
      const t = loc.match(/^table_(\d+)$/)
      if (t) return this.$t('assistant_location_table', { index: t[1] })
      return loc
    }
  }
}
</script>

<style scoped>
.ps-compare-cell {
  position: relative;
  padding: 14px 16px;
  min-height: 88px;
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ps-compare-cell--low {
  background: var(--ps-color-warning-soft);
  border-color: var(--ps-color-warning);
}
.ps-compare-cell--empty {
  background: var(--ps-bg-sunken);
  border-style: dashed;
  align-items: flex-start;
  justify-content: flex-start;
}
.ps-compare-cell__head {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
  min-height: 16px;
}
.ps-compare-cell__confidence {
  font-size: 11px;
  padding: 1px 6px;
  background: var(--ps-color-warning-soft);
  color: var(--ps-color-warning-strong);
  border: 1px solid var(--ps-color-warning);
  border-radius: 999px;
  margin-right: auto;
}
.ps-compare-cell__src-btn {
  background: transparent;
  border: none;
  padding: 2px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  color: var(--ps-text-3);
  border-radius: 4px;
}
.ps-compare-cell__src-btn:hover {
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary);
}
.ps-compare-cell__value {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--ps-text-1);
  white-space: pre-wrap;
  word-break: break-word;
}
.ps-compare-cell__hint {
  margin: 0;
  font-size: 12px;
  color: var(--ps-text-3);
  font-style: italic;
}
.ps-compare-cell__metrics {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ps-compare-cell__metrics li {
  display: grid;
  grid-template-columns: minmax(80px, 1fr) auto auto;
  gap: 8px;
  align-items: baseline;
  font-size: 13px;
}
.ps-compare-cell__metric-name { color: var(--ps-text-2); }
.ps-compare-cell__metric-value {
  font-weight: 600;
  color: var(--ps-color-primary);
  font-variant-numeric: tabular-nums;
}
.ps-compare-cell__metric-src {
  font-size: 11px;
  color: var(--ps-text-3);
}

.ps-compare-cell__popover {
  position: absolute;
  right: 10px;
  top: 36px;
  z-index: 10;
  min-width: 200px;
  padding: 10px 12px;
  background: var(--ps-bg-elevated);
  color: var(--ps-text-1);
  border: 1px solid var(--ps-border-1);
  border-radius: 10px;
  box-shadow: var(--ps-shadow-2);
  font-size: 12.5px;
  line-height: 1.5;
}
.ps-compare-cell__popover-row { margin: 0; }
.ps-compare-cell__popover-row + .ps-compare-cell__popover-row { margin-top: 4px; }
.ps-confidence-high { color: var(--ps-color-success); font-weight: 600; }
.ps-confidence-low { color: var(--ps-color-warning); font-weight: 600; }
.ps-pop-enter-active, .ps-pop-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.ps-pop-enter-from, .ps-pop-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
