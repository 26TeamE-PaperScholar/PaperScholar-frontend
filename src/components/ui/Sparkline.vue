<template>
  <svg :viewBox="`0 0 ${width} ${height}`" class="ps-sparkline" :class="'ps-sparkline--' + tone" preserveAspectRatio="none">
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="strokeColor" stop-opacity="0.32" />
        <stop offset="100%" :stop-color="strokeColor" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path v-if="areaPath" :d="areaPath" :fill="`url(#${gradientId})`" />
    <path :d="linePath" fill="none" :stroke="strokeColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script>
let uid = 0

export default {
  name: 'AppSparkline',
  props: {
    data: { type: Array, default: () => [] },
    width: { type: Number, default: 120 },
    height: { type: Number, default: 36 },
    tone: {
      type: String,
      default: 'violet',
      validator: (v) => ['violet', 'gold', 'success', 'neutral'].includes(v)
    }
  },
  data() {
    uid += 1
    return { gradientId: 'ps-spark-grad-' + uid }
  },
  computed: {
    strokeColor() {
      switch (this.tone) {
        case 'gold': return '#D4AF37'
        case 'success': return '#15803D'
        case 'neutral': return '#8580A0'
        default: return '#2D1B69'
      }
    },
    points() {
      if (!this.data.length) return []
      const min = Math.min(...this.data)
      const max = Math.max(...this.data)
      const span = Math.max(1, max - min)
      const stepX = this.data.length > 1 ? this.width / (this.data.length - 1) : 0
      return this.data.map((v, i) => {
        const x = i * stepX
        const y = this.height - ((v - min) / span) * (this.height - 4) - 2
        return { x, y }
      })
    },
    linePath() {
      if (this.points.length === 0) return ''
      return this.points
        .map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(2) + ',' + p.y.toFixed(2))
        .join(' ')
    },
    areaPath() {
      if (this.points.length === 0) return ''
      const start = this.points[0]
      const end = this.points[this.points.length - 1]
      return (
        this.linePath +
        ' L' + end.x.toFixed(2) + ',' + this.height +
        ' L' + start.x.toFixed(2) + ',' + this.height + ' Z'
      )
    }
  }
}
</script>

<style scoped>
.ps-sparkline {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
