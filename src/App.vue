<template>
  <div id="ps-shell">
    <NavBar />
    <main class="ps-page">
      <RouterView v-slot="{ Component, route }">
        <transition name="ps-route" mode="out-in" appear>
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </RouterView>
    </main>
    <PopoutMessage :show="showMessage" :title="messageTitle" :content="messageContent" />
    <CompareFloatingBar />
  </div>
</template>

<script>
import { getCurrentInstance } from 'vue'
import NavBar from './components/nav-bar/NavBar.vue'
import PopoutMessage from './components/popout-message/PopoutMessage.vue'
import CompareFloatingBar from './components/compare/CompareFloatingBar.vue'

export default {
  name: 'App',
  components: {
    NavBar,
    PopoutMessage,
    CompareFloatingBar
  },
  data() {
    return {
      showMessage: false,
      messageTitle: '',
      messageContent: ''
    }
  },
  mounted() {
    const instance = getCurrentInstance()
    instance.proxy.$bus.on('message', this.handleMessage)
    this.$store.dispatch('compare/hydrateCompare')
  },
  beforeUnmount() {
    const instance = getCurrentInstance()
    instance.proxy.$bus.off('message', this.handleMessage)
  },
  methods: {
    handleMessage(data) {
      this.messageTitle = data.title
      this.messageContent = data.content
      this.showMessage = true
      setTimeout(() => {
        this.showMessage = false
        setTimeout(() => {
          this.messageTitle = ''
          this.messageContent = ''
        }, 1000)
      }, data.time || 1500)
    }
  }
}
</script>

<style scoped>
#ps-shell {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 90% 60% at 50% -10%, rgba(212, 175, 55, 0.06), transparent 60%),
    radial-gradient(ellipse 60% 50% at 110% 0%, rgba(45, 27, 105, 0.05), transparent 60%),
    var(--ps-bg-page);
  display: flex;
  flex-direction: column;
}

.ps-page {
  flex: 1;
  width: 100%;
}
</style>
