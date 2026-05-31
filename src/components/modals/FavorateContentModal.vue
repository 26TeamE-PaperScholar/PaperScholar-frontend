<template>
  <PopoutModal :show="show" size="lg" @close="handleClose">
    <section class="favorite-detail">
      <header class="favorite-detail__head">
        <h3>{{ favoriteTitle }}</h3>
        <p v-if="!loadingContent" class="favorite-detail__count">
          {{ $t('favorite_paper_count', { count: contentList.length }) }}
        </p>
      </header>

      <div v-if="loadingContent" class="favorite-detail__state">
        <span class="favorite-detail__spinner" aria-hidden="true"></span>
        {{ $t('favorite_loading') }}
      </div>
      <div v-else-if="!contentList.length" class="favorite-detail__state">
        {{ $t('favorite_empty_papers') }}
      </div>
      <ul v-else class="favorite-detail__list">
        <li
          v-for="(item, idx) in contentList"
          :key="item.id || idx"
          class="favorite-detail__item"
          @click="openPaper(item)"
          @contextmenu.prevent="handleRightClick($event, idx)"
          :id="'item-' + String(item.id || idx)"
        >
          <div class="favorite-detail__item-main">
            <h4 class="favorite-detail__title">{{ paperTitle(item) }}</h4>
            <p class="favorite-detail__authors">{{ paperAuthorsText(item) }}</p>
            <p class="favorite-detail__meta">{{ paperMetaText(item) }}</p>
          </div>
          <div class="favorite-detail__actions" @click.stop>
            <button
              class="favorite-detail__icon-btn"
              type="button"
              :title="$t('move_favorite')"
              :aria-label="$t('move_favorite')"
              @click="moveFavorate(idx)"
            >
              <AppIcon name="SwapHorizontalOutline" :size="15" />
            </button>
            <button
              class="favorite-detail__icon-btn favorite-detail__icon-btn--danger"
              type="button"
              :title="$t('delete')"
              :aria-label="$t('delete')"
              @click="removePaper(idx)"
            >
              <AppIcon name="TrashOutline" :size="15" />
            </button>
          </div>
          <div
            class="menu"
            v-if="item.showContext"
            :style="{ left: x + 'px', top: y + 'px'}"
            @click.stop
          >
            <button class="basic-btn block-btn" @click="moveFavorate(idx)">{{ $t('move_favorite') }}</button>
            <button class="basic-btn block-btn" @click="removePaper(idx)">{{ $t('delete') }}</button>
          </div>
        </li>
      </ul>
    </section>
  </PopoutModal>

  <ChooseFavoriteModal :fid="idTobeMoved" :paperId="paperIdTobeMoved" :show="chooseFavoriteModalShouldShow" @close="handleMoveModalClose"/>

</template>

<script>
import PopoutModal from '../popout-modal/PopoutModal.vue'
import ChooseFavoriteModal from './ChooseFavoriteModal.vue'
import {
  authorNameOf,
  normalizeFavoriteId,
  normalizeFavoriteItem,
  paperIdOf
} from '../../utils/personal-page.mjs'
import {
  getFavoriteFolderContent,
  getFavoriteFolderContentSnapshot,
  removePaperFromFavorite
} from '../../utils/favorite-store.mjs'
import { AppIcon } from '../ui'
export default {
  name: 'FavorateContentModal',
  components: {
    PopoutModal,
    ChooseFavoriteModal,
    AppIcon
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    favoriteId: {
      type: [String, Number]
    },
    favorite: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      contentList: [],
      chooseFavoriteModalShouldShow: false,
      x: 0,
      y: 0,
      idTobeMoved: '',
      paperIdTobeMoved: '',
      favoriteTitle: '',
      detailRequestId: 0,
      loadingContent: false
    }
  },
  emits: ['close'],
  watch: {
    show: {
      immediate: true,
      handler(show) {
        if (show) this.fetchData()
      }
    },
    favoriteId() {
      if (this.show) this.fetchData()
    }
  },
  mounted() {
    window.addEventListener('click', this.closeAll)
  },
  beforeUnmount() {
    window.removeEventListener('click', this.closeAll)
  },
  methods: {
    async fetchData() {
      const favoriteId = normalizeFavoriteId(this.favoriteId)
      if (!favoriteId) {
        this.favoriteTitle = ''
        this.contentList = []
        return
      }
      const requestId = ++this.detailRequestId
      const userId = this.$cookies.get('user_id') || 'current'
      const fallbackFavorite = normalizeFavoriteItem(this.favorite || {}, { id: favoriteId })
      if (fallbackFavorite.name) this.favoriteTitle = fallbackFavorite.name
      const cached = getFavoriteFolderContentSnapshot(userId, favoriteId)
      if (cached) {
        this.applyFavoriteContent(cached, fallbackFavorite)
        this.loadingContent = false
      } else {
        this.contentList = []
        this.loadingContent = true
      }
      this.closeAll()
      try {
        const detail = await getFavoriteFolderContent(userId, fallbackFavorite)
        if (requestId !== this.detailRequestId || normalizeFavoriteId(this.favoriteId) !== favoriteId) return
        this.applyFavoriteContent(detail, fallbackFavorite)
      } catch (e) {
        if (requestId !== this.detailRequestId) return
        if (!cached) {
          this.favoriteTitle = fallbackFavorite.name || ''
          this.contentList = []
        }
      } finally {
        if (requestId === this.detailRequestId) this.loadingContent = false
      }
    },
    applyFavoriteContent(detail, fallbackFavorite) {
      const favorite = normalizeFavoriteItem(detail && detail.favorite, fallbackFavorite)
      const papers = this.resolveFavoritePapers(detail)
      this.favoriteTitle = favorite.name || fallbackFavorite.name || ''
      this.contentList = papers.map((paper) => ({ ...paper, showContext: false }))
    },
    normalizeDetailPaper(paper, favoriteId) {
      const source = paper && typeof paper === 'object'
        ? (paper.paper || paper.work || paper.article || paper.item || paper)
        : paper
      const base = paper && typeof paper === 'object' ? paper : {}
      const body = source && typeof source === 'object' ? source : {}
      const id = paperIdOf(body) || paperIdOf(base) || paperIdOf(source)
      if (!id) return null
      return {
        ...base,
        ...body,
        id,
        favorite_id: base.favorite_id || base.favoriteId || body.favorite_id || body.favoriteId || '',
        folder_id: base.folder_id || base.folderId || body.folder_id || body.folderId || favoriteId,
        title: body.title || body.display_name || base.title || base.display_name || id,
        abstract: body.abstract || base.abstract || '',
        publication_year: body.publication_year || base.publication_year || body.year || base.year || this.yearFromDate(body.publication_date || base.publication_date),
        publication_date: body.publication_date || base.publication_date || '',
        authorships: Array.isArray(body.authorships) ? body.authorships : (Array.isArray(base.authorships) ? base.authorships : []),
        authors: Array.isArray(body.authors) ? body.authors : (Array.isArray(base.authors) ? base.authors : [])
      }
    },
    resolveFavoritePapers(detail) {
      const favoriteId = normalizeFavoriteId(detail && detail.favorite && detail.favorite.id) || normalizeFavoriteId(this.favoriteId)
      const paperMap = new Map()
      ;((detail && detail.papers) || []).forEach((paper) => {
        const normalized = this.normalizeDetailPaper(paper, favoriteId)
        if (normalized) paperMap.set(normalized.id, normalized)
      })

      const ids = (detail.favorite && detail.favorite.paper_ids || [])
        .map((id) => paperIdOf(id))
        .filter(Boolean)
      const uniqueIds = Array.from(new Set([...ids, ...paperMap.keys()]))

      return uniqueIds
        .map((id) => paperMap.get(id) || this.normalizeDetailPaper({ id, title: id }, favoriteId))
        .filter(Boolean)
    },
    handleClose() {
      this.$emit('close')
    },
    handleRightClick(event, idx) {
      for (let i = 0; i < this.contentList.length; i++) {
        this.contentList[i].showContext = false
      }
      this.contentList.splice(idx, 1, {...this.contentList[idx], showContext: true})
      const itemObj = document.getElementById('item-' + String(this.contentList[idx].id || idx))
      if (!itemObj) return
      this.x = event.clientX - itemObj.getBoundingClientRect().left
      this.y = event.clientY - itemObj.getBoundingClientRect().top
    },
    closeAll() {
      for (let i = 0; i < this.contentList.length; i++)
      {
        this.contentList[i].showContext = false
      }
    },
    moveFavorate(idx) {
      this.chooseFavoriteModalShouldShow = true
      this.idTobeMoved = normalizeFavoriteId(this.favoriteId)
      this.paperIdTobeMoved = this.contentList[idx].id
    },
    removePaper(idx) {
      const userId = this.$cookies.get('user_id')
      const favoriteId = normalizeFavoriteId(this.favoriteId)
      const paper = this.contentList[idx]
      if (!userId || !favoriteId || !paper) return
      const previous = [...this.contentList]
      this.contentList.splice(idx, 1)
      removePaperFromFavorite(userId, favoriteId, paper).then(
        () => {
          this.$bus.emit('message', { title: this.$t('favorite_removed'), content: paper.title || paper.id, time: 1500 })
        },
        () => {
          this.contentList = previous
          this.$bus.emit('message', { title: this.$t('favorite_remove_failed'), content: this.$t('common_retry_later'), time: 1500 })
        }
      )
    },
    handleMoveModalClose() {
      this.chooseFavoriteModalShouldShow = false
      this.fetchData()
    },
    openPaper(item) {
      const id = item && item.id
      if (!id) return
      this.$router.push('/paper_detail/' + encodeURIComponent(id))
      this.handleClose()
    },
    paperTitle(item) {
      return (item && (item.title || item.display_name)) || this.$t('common_no_title')
    },
    paperAuthorsText(item) {
      const names = this.paperAuthors(item)
      if (!names.length) return this.$t('common_unknown_scholar')
      const visible = names.slice(0, 3)
      const more = names.length - visible.length
      return visible.join(this.$i18n.locale === 'zh' ? '、' : ', ') +
        (more > 0 ? ` ${this.$t('common_authors_more', { count: more })}` : '')
    },
    paperAuthors(item) {
      const names = []
      const pushName = (value) => {
        const text = String(value || '').trim()
        if (text && !names.includes(text)) names.push(text)
      }
      ;(item && item.authorships || []).forEach((authorship) => pushName(authorNameOf(authorship)))
      ;(item && item.authors || []).forEach((author) => {
        if (typeof author === 'string') pushName(author)
        else pushName(authorNameOf(author) || author.display_name || author.name)
      })
      const raw = item && (
        item.author_names ||
        item.authorNames ||
        item.authors_name ||
        item.authorsName ||
        item.author ||
        item.author_name
      )
      if (Array.isArray(raw)) raw.forEach(pushName)
      else if (typeof raw === 'string') raw.split(/[,;；、]/).forEach(pushName)
      return names
    },
    paperMetaText(item) {
      return [this.paperYear(item), this.paperVenue(item)].filter(Boolean).join(' · ') || (item && item.id) || ''
    },
    paperYear(item) {
      const raw = item && (item.publication_year || item.year || item.published_year || this.yearFromDate(item.publication_date))
      const year = Number(raw)
      return Number.isInteger(year) && year > 0 ? String(year) : ''
    },
    yearFromDate(date) {
      const match = String(date || '').match(/\d{4}/)
      return match ? match[0] : ''
    },
    paperVenue(item) {
      if (!item) return ''
      const location = item.primary_location || item.best_oa_location || {}
      const source = location.source || item.source || item.host_venue || item.venue || {}
      if (typeof source === 'string') return source
      return source.display_name ||
        source.name ||
        (typeof item.venue === 'string' ? item.venue : '') ||
        item.source_display_name ||
        item.source_name ||
        item.journal ||
        item.journal_name ||
        item.publication ||
        item.container_title ||
        ''
    }
  }

}
</script>

<style scoped>
.favorite-detail {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--ps-space-4);
  box-sizing: border-box;
  max-height: min(660px, calc(100vh - 140px));
  overflow-y: auto;
}

.favorite-detail__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ps-space-4);
  padding-right: 44px;
}

.favorite-detail__head h3 {
  margin: 0;
  color: var(--ps-text-1);
  overflow-wrap: anywhere;
  font-size: var(--ps-fs-3xl);
  font-weight: bold;
  line-height: 1.25;
}

.favorite-detail__count {
  flex: none;
  margin: 6px 0 0;
  color: var(--ps-text-3);
  font-size: 12px;
  font-weight: 600;
}

.favorite-detail::-webkit-scrollbar {
  display: none;
}

.favorite-detail__state {
  min-height: 132px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--ps-text-3);
  font-size: 13px;
  border: 1px dashed var(--ps-border-1);
  border-radius: 8px;
  background: var(--ps-bg-soft, #f8f7fb);
}

.favorite-detail__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--ps-border-1);
  border-top-color: var(--ps-color-primary);
  border-radius: 50%;
  animation: favorite-detail-spin 0.8s linear infinite;
}

@keyframes favorite-detail-spin {
  to { transform: rotate(360deg); }
}

.favorite-detail__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
}

.favorite-detail__item {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--ps-space-3);
  min-height: 82px;
  padding: 12px 12px 12px 14px;
  border: 1px solid var(--ps-border-1);
  border-radius: 8px;
  background: var(--ps-bg-elevated);
  cursor: pointer;
  transition: background var(--ps-motion-fast) var(--ps-ease-out),
    border-color var(--ps-motion-fast) var(--ps-ease-out),
    box-shadow var(--ps-motion-fast) var(--ps-ease-out);
}

.favorite-detail__item:hover {
  border-color: var(--ps-color-primary);
  background: var(--ps-color-primary-soft);
  box-shadow: var(--ps-shadow-1);
}

.favorite-detail__item-main {
  min-width: 0;
}

.favorite-detail__title {
  margin: 0;
  color: var(--ps-text-1);
  font-size: 14.5px;
  font-weight: 700;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.favorite-detail__authors,
.favorite-detail__meta {
  margin: 4px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12.5px;
  line-height: 1.45;
}

.favorite-detail__authors {
  color: var(--ps-text-2);
}

.favorite-detail__meta {
  color: var(--ps-text-3);
}

.favorite-detail__actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.favorite-detail__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--ps-border-1);
  border-radius: 8px;
  background: var(--ps-bg-elevated);
  color: var(--ps-text-2);
  cursor: pointer;
}

.favorite-detail__icon-btn:hover {
  color: var(--ps-color-primary-strong);
  border-color: var(--ps-color-primary);
  background: var(--ps-color-primary-soft);
}

.favorite-detail__icon-btn--danger:hover {
  color: var(--ps-color-danger, #d64545);
  border-color: rgba(214, 69, 69, 0.35);
  background: rgba(214, 69, 69, 0.08);
}

.menu {
  padding: 10px;
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  box-shadow: var(--ps-shadow-2);
  border-radius: 5px;
  position: absolute;
  z-index: 10;
}

.menu button:first-child {
  margin-bottom: 10px;
}

.block-btn {
  display: block;
}

@media screen and (max-width: 720px) {
  .favorite-detail__head {
    display: block;
  }

  .favorite-detail__item {
    grid-template-columns: 1fr;
  }

  .favorite-detail__actions {
    justify-content: flex-end;
  }
}
</style>
