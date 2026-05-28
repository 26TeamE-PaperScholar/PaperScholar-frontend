import { createI18n } from 'vue-i18n/dist/vue-i18n.cjs.js'
import zh from './modules/zh'
import en from './modules/en'

export const LOCALE_STORAGE_KEY = 'paperscholar:locale'
export const SUPPORTED_LOCALES = ['zh', 'en']

const DEFAULT_LOCALE = 'zh'

const normalizeLocale = (locale) =>
  SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE

const readSavedLocale = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_LOCALE
    return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY))
  } catch {
    return DEFAULT_LOCALE
  }
}

const persistLocale = (locale) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    }
  } catch {
    // localStorage can be unavailable in private or restricted contexts.
  }
}

const applyDocumentLocale = (locale) => {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
  }
}

const initialLocale = readSavedLocale()

const i18n = createI18n({
  legacy: false, // 支持 compositionAPI，必须为 false
  locale: initialLocale,
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

applyDocumentLocale(initialLocale)

export const getAppLocale = () => {
  const locale = i18n.global.locale
  return typeof locale === 'string' ? locale : locale.value
}

export const setAppLocale = (locale, { persist = true } = {}) => {
  const nextLocale = normalizeLocale(locale)
  const globalLocale = i18n.global.locale
  if (typeof globalLocale === 'string') {
    i18n.global.locale = nextLocale
  } else {
    globalLocale.value = nextLocale
  }
  if (persist) persistLocale(nextLocale)
  applyDocumentLocale(nextLocale)
  return nextLocale
}

export const toggleAppLocale = () =>
  setAppLocale(getAppLocale() === 'zh' ? 'en' : 'zh')

export default i18n
