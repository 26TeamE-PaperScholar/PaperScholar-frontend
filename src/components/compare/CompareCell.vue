<template>
  <div class="ps-compare-cell" :class="[low ? 'ps-compare-cell--low' : '', empty ? 'ps-compare-cell--empty' : '']">
    <template v-if="empty">
      <RestrictedHint :label="emptyLabel" />
    </template>
    <template v-else>
      <div class="ps-compare-cell__head">
        <span v-if="low" class="ps-compare-cell__confidence">推断</span>
        <button
          v-if="source"
          type="button"
          class="ps-compare-cell__src-btn"
          :aria-label="'查看来源'"
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
        <p v-if="!metrics.length" class="ps-compare-cell__hint">作者未列出对比指标</p>
      </template>
      <template v-else>
        <p class="ps-compare-cell__value">{{ value }}</p>
      </template>

      <transition name="ps-pop">
        <div v-if="popoverOpen" class="ps-compare-cell__popover" @mousedown.prevent>
          <p class="ps-compare-cell__popover-row">
            <strong>来源：</strong>{{ formatLocation(source) }}
          </p>
          <p v-if="confidence" class="ps-compare-cell__popover-row">
            <strong>置信度：</strong>
            <span :class="'ps-confidence-' + confidence">{{ confidence === 'high' ? '高' : '低（多为基于摘要的推断）' }}</span>
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
  abstract: '摘要',
  metadata: '元数据',
  introduction: '引言',
  conclusion: '结论',
  table_1: '表 1',
  table_2: '表 2',
  table_3: '表 3'
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
    emptyLabel: { type: String, default: '基于摘要的受限推断' }
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
    }
  },
  methods: {
    formatLocation(loc) {
      if (!loc) return '—'
      if (LOCATION_LABEL[loc]) return LOCATION_LABEL[loc]
      const m = loc.match(/^section_(\d+)$/)
      if (m) return `第 ${m[1]} 节`
      const t = loc.match(/^table_(\d+)$/)
      if (t) return `表 ${t[1]}`
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
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(45, 27, 105, 0.08);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ps-compare-cell--low {
  background: rgba(255, 244, 220, 0.7);
  border-color: rgba(212, 175, 55, 0.32);
}
.ps-compare-cell--empty {
  background: rgba(0, 0, 0, 0.025);
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
  background: rgba(212, 175, 55, 0.18);
  color: #8b6a13;
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
  color: var(--ps-text-3, #888);
  border-radius: 4px;
}
.ps-compare-cell__src-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: var(--ps-accent, #2d1b69);
}
.ps-compare-cell__value {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--ps-text-1, #1f1f1f);
  white-space: pre-wrap;
  word-break: break-word;
}
.ps-compare-cell__hint {
  margin: 0;
  font-size: 12px;
  color: var(--ps-text-3, #888);
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
.ps-compare-cell__metric-name { color: var(--ps-text-2, #555); }
.ps-compare-cell__metric-value {
  font-weight: 600;
  color: var(--ps-accent, #2d1b69);
  font-variant-numeric: tabular-nums;
}
.ps-compare-cell__metric-src {
  font-size: 11px;
  color: var(--ps-text-3, #888);
}

.ps-compare-cell__popover {
  position: absolute;
  right: 10px;
  top: 36px;
  z-index: 10;
  min-width: 200px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(45, 27, 105, 0.18);
  font-size: 12.5px;
  line-height: 1.5;
}
.ps-compare-cell__popover-row { margin: 0; }
.ps-compare-cell__popover-row + .ps-compare-cell__popover-row { margin-top: 4px; }
.ps-confidence-high { color: #1f7a37; font-weight: 600; }
.ps-confidence-low { color: #b06d00; font-weight: 600; }
.ps-pop-enter-active, .ps-pop-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.ps-pop-enter-from, .ps-pop-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
