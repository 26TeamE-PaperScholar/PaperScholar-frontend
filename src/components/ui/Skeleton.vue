<template>
  <span
    class="ps-skeleton"
    :class="[circle ? 'ps-skeleton--circle' : '', rounded ? 'ps-skeleton--rounded' : '']"
    :style="rootStyle"
  ></span>
</template>

<script>
export default {
  name: 'AppSkeleton',
  props: {
    width: { type: [Number, String], default: '100%' },
    height: { type: [Number, String], default: 12 },
    radius: { type: [Number, String], default: 6 },
    circle: { type: Boolean, default: false },
    rounded: { type: Boolean, default: false }
  },
  computed: {
    rootStyle() {
      const fmt = (v) => (typeof v === 'number' ? v + 'px' : v)
      return {
        width: fmt(this.width),
        height: fmt(this.height),
        borderRadius: this.circle ? '50%' : fmt(this.radius)
      }
    }
  }
}
</script>

<style scoped>
.ps-skeleton {
  display: inline-block;
  background:
    linear-gradient(
      90deg,
      var(--ps-bg-sunken) 0%,
      var(--ps-border-1) 50%,
      var(--ps-bg-sunken) 100%
    );
  background-size: 200% 100%;
  animation: ps-skeleton-shimmer 1.4s linear infinite;
}

.ps-skeleton--rounded {
  border-radius: var(--ps-radius-md);
}

.ps-skeleton--circle {
  border-radius: 50% !important;
}

@keyframes ps-skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
