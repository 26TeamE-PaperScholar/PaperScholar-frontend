<template>
  <section class="ps-hero" :class="['ps-hero--' + variant, compact ? 'ps-hero--compact' : '']">
    <div class="ps-hero__bg" aria-hidden="true">
      <div class="ps-hero__orb ps-hero__orb--a"></div>
      <div class="ps-hero__orb ps-hero__orb--b"></div>
      <svg class="ps-hero__grid" viewBox="0 0 1200 400" preserveAspectRatio="none">
        <defs>
          <pattern id="ps-hero-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="var(--ps-hero-grid-dot)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ps-hero-dots)" />
      </svg>
    </div>
    <div class="ps-hero__content">
      <slot />
    </div>
  </section>
</template>

<script>
export default {
  name: 'AppGradientHero',
  props: {
    variant: {
      type: String,
      default: 'dark',
      validator: (v) => ['dark', 'soft', 'gold'].includes(v)
    },
    compact: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.ps-hero {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  padding: var(--ps-space-10) var(--ps-space-6);
  border-radius: var(--ps-radius-xl);
  color: var(--ps-hero-text-strong);
}

.ps-hero--compact {
  padding: var(--ps-space-8) var(--ps-space-6);
}

/* dark 变体的底色由 --ps-bg-hero-* token 决定，
   亮色主题下这些 token 是 cream 色，暗色主题下回到深紫渐变。 */
.ps-hero--dark {
  background:
    radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.18), transparent 55%),
    radial-gradient(circle at 80% 30%, rgba(155, 123, 255, 0.32), transparent 60%),
    linear-gradient(135deg, var(--ps-bg-hero-from), var(--ps-bg-hero-mid) 55%, var(--ps-bg-hero-to));
  color: var(--ps-hero-text-strong);
}

/* 亮色主题下，dark 变体也展示一道淡淡的边框，避免和页面背景糊在一起。
   暗色主题下这条边框走透明，hero 仍然是纯渐变。 */
:root:not([data-theme='dark']) .ps-hero--dark {
  border: 1px solid var(--ps-border-1);
  box-shadow: var(--ps-shadow-2);
}

.ps-hero--soft {
  background:
    radial-gradient(circle at 20% 0%, var(--ps-color-primary-soft), transparent 60%),
    radial-gradient(circle at 80% 20%, var(--ps-color-accent-soft), transparent 60%),
    linear-gradient(180deg, var(--ps-bg-elevated), var(--ps-bg-page));
  color: var(--ps-text-1);
  border: 1px solid var(--ps-border-1);
}

.ps-hero--gold {
  background:
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.2), transparent 50%),
    linear-gradient(135deg, #D4AF37, #B8932C);
  color: #1B1147;
}

.ps-hero__bg {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.ps-hero__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: var(--ps-hero-orb-opacity);
}

.ps-hero__orb--a {
  width: 360px;
  height: 360px;
  top: -90px;
  right: -60px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.6), transparent 70%);
}

.ps-hero__orb--b {
  width: 320px;
  height: 320px;
  bottom: -120px;
  left: -40px;
  background: radial-gradient(circle, rgba(155, 123, 255, 0.55), transparent 70%);
}

.ps-hero--soft .ps-hero__orb,
.ps-hero--gold .ps-hero__orb {
  opacity: 0.35;
}

.ps-hero__grid {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.6;
  mix-blend-mode: var(--ps-hero-grid-blend);
}

.ps-hero--soft .ps-hero__grid {
  display: none;
}

.ps-hero__content {
  position: relative;
  z-index: 1;
  max-width: var(--ps-content-max);
  margin: 0 auto;
}
</style>
