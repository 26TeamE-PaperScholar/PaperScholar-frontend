<template>
  <div class="ps-section-header" :class="{ 'ps-section-header--center': center }">
    <div class="ps-section-header__main">
      <p v-if="eyebrow" class="ps-section-header__eyebrow">{{ eyebrow }}</p>
      <component :is="tag" class="ps-section-header__title">
        <slot name="title">{{ title }}</slot>
      </component>
      <p v-if="subtitle || $slots.subtitle" class="ps-section-header__subtitle">
        <slot name="subtitle">{{ subtitle }}</slot>
      </p>
    </div>
    <div v-if="$slots.actions" class="ps-section-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppSectionHeader',
  props: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    eyebrow: { type: String, default: '' },
    tag: { type: String, default: 'h2' },
    center: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.ps-section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--ps-space-5);
  margin-bottom: var(--ps-space-6);
}

.ps-section-header--center {
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-direction: column;
}

.ps-section-header__main {
  min-width: 0;
  flex: 1;
}

.ps-section-header--center .ps-section-header__main {
  flex: none;
  max-width: 720px;
}

.ps-section-header__eyebrow {
  font-size: var(--ps-fs-xs);
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ps-color-accent-strong);
  margin-bottom: var(--ps-space-3);
}

.ps-section-header__title {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-3xl);
  font-weight: 700;
  color: var(--ps-text-1);
  line-height: var(--ps-lh-tight);
  margin: 0;
}

.ps-section-header__subtitle {
  margin-top: var(--ps-space-3);
  font-size: var(--ps-fs-md);
  color: var(--ps-text-2);
  line-height: var(--ps-lh-normal);
  max-width: 720px;
}

.ps-section-header__actions {
  flex: none;
  display: flex;
  align-items: center;
  gap: var(--ps-space-3);
}

@media screen and (max-width: 720px) {
  .ps-section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .ps-section-header__title {
    font-size: var(--ps-fs-2xl);
  }
}
</style>
