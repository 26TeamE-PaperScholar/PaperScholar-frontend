import { createI18n } from 'vue-i18n/dist/vue-i18n.cjs.js'
import zh from './modules/zh'
import en from './modules/en'

const i18n = createI18n({
  legacy: false, // 支持 compositionAPI，必须为 false
  locale: 'zh',
  fallbackLocale: 'zh',
  globalInjection: true, // 全局注册 $t 方法
  missingWarn: false,
  fallbackWarn: false,
  silentTranslationWarn: true,
  silentFallbackWarn: true,
  messages: {
    zh,
    en
  }
})

export default i18n
