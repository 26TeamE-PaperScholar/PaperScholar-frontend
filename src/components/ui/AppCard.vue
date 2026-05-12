<template>
  <component :is="tag" class="ps-card" :class="cardClass" @click="$emit('click', $event)">
    <header v-if="$slots.header || title" class="ps-card__header">
      <slot name="header">
        <div class="ps-card__heading">
          <h3 v-if="title" class="ps-card__title">{{ title }}</h3>
          <p v-if="subtitle" class="ps-card__subtitle">{{ subtitle }}</p>
        </div>
        <div v-if="$slots.actions" class="ps-card__actions">
          <slot name="actions" />
        </div>
      </slot>
    </header>
    <div class="ps-card__body" :class="{ 'ps-card__body--flush': flush }">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="ps-card__footer">
      <slot name="footer" />
    </footer>
  </component>
</template>

<script>
export default {
  name: 'AppCard',
  props: {
    tag: { type: String, default: 'article' },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    elevation: { type: Number, default: 1 },
    hover: { type: Boolean, default: false },
    accent: { type: String, default: '' },
    flush: { type: Boolean, default: false },
    interactive: { type: Boolean, default: false }
  },
  emits: ['click'],
  computed: {
    cardClass() {
      return [
        'ps-card--elevation-' + this.elevation,
        this.hover ? 'ps-card--hover' : '',
        this.interactive ? 'ps-card--interactive' : '',
        this.accent ? 'ps-card--accent-' + this.accent : ''
      ]
    }
  }
}
</script>

<style scoped>
.ps-card {
  display: block;
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-lg);
  padding: var(--ps-space-6);
  transition: box-shadow var(--ps-motion-base) var(--ps-ease-out),
    transform var(--ps-motion-base) var(--ps-ease-out),
    border-color var(--ps-motion-base) var(--ps-ease-out);
  text-align: left;
}

.ps-card--elevation-0 { box-shadow: none; }
.ps-card--elevation-1 { box-shadow: var(--ps-shadow-1); }
.ps-card--elevation-2 { box-shadow: var(--ps-shadow-2); }
.ps-card--elevation-3 { box-shadow: var(--ps-shadow-3); }

.ps-card--hover:hover {
  box-shadow: var(--ps-shadow-2);
  border-color: var(--ps-border-2);
  transform: translateY(-2px);
}

.ps-card--interactive {
  cursor: pointer;
}

.ps-card--accent-violet {
  border-top: 3px solid var(--ps-color-primary);
}
.ps-card--accent-gold {
  border-top: 3px solid var(--ps-color-accent);
}
.ps-card--accent-success {
  border-top: 3px solid var(--ps-color-success);
}

.ps-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ps-space-4);
  margin-bottom: var(--ps-space-4);
}

.ps-card__heading {
  flex: 1;
  min-width: 0;
}

.ps-card__title {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-xl);
  font-weight: 700;
  color: var(--ps-text-1);
  margin: 0;
  line-height: var(--ps-lh-snug);
}

.ps-card__subtitle {
  margin-top: var(--ps-space-1);
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-2);
}

.ps-card__actions {
  display: flex;
  align-items: center;
  gap: var(--ps-space-2);
  flex: none;
}

.ps-card__body--flush {
  margin: calc(var(--ps-space-6) * -1);
  margin-top: 0;
}

.ps-card__footer {
  margin-top: var(--ps-space-5);
  padding-top: var(--ps-space-4);
  border-top: 1px solid var(--ps-border-1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ps-space-3);
}
</style>
