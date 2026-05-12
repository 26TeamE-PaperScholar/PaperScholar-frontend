<template>
  <teleport to="body">
    <transition name="ps-toast">
      <div v-if="showMessage" class="ps-toast" :class="{ 'ps-toast--leaving': !show }">
        <span class="ps-toast__indicator" aria-hidden="true"></span>
        <div class="ps-toast__body">
          <h4 v-if="title" class="ps-toast__title">{{ title }}</h4>
          <p v-if="content" class="ps-toast__content">{{ content }}</p>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: 'PopoutMessage',
  props: {
    show: { type: Boolean, default: false },
    title: { type: String, default: '' },
    content: { type: String, default: '' }
  },
  data() {
    return { showMessage: false }
  },
  watch: {
    show(value) {
      if (value === false) {
        setTimeout(() => { this.showMessage = false }, 600)
      } else {
        this.showMessage = true
      }
    }
  }
}
</script>

<style scoped>
.ps-toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1100;
  min-width: 280px;
  max-width: 480px;
  display: flex;
  align-items: flex-start;
  gap: var(--ps-space-3);
  padding: var(--ps-space-3) var(--ps-space-5) var(--ps-space-3) var(--ps-space-4);
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-md);
  box-shadow: var(--ps-shadow-3);
}

.ps-toast__indicator {
  width: 4px;
  align-self: stretch;
  border-radius: var(--ps-radius-pill);
  background: linear-gradient(180deg, var(--ps-color-primary), var(--ps-color-accent));
}

.ps-toast__body { flex: 1; min-width: 0; }

.ps-toast__title {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-md);
  font-weight: 700;
  color: var(--ps-text-1);
  margin-bottom: 2px;
}

.ps-toast__content {
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-2);
  word-break: break-word;
  line-height: 1.5;
}

.ps-toast--leaving {
  opacity: 0;
  transform: translate(-50%, -10px);
  transition: opacity var(--ps-motion-base) var(--ps-ease-out),
    transform var(--ps-motion-base) var(--ps-ease-out);
}

.ps-toast-enter-active, .ps-toast-leave-active {
  transition: opacity var(--ps-motion-base) var(--ps-ease-out),
    transform var(--ps-motion-base) var(--ps-ease-out);
}
.ps-toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -10px);
}
.ps-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
