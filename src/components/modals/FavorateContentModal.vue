<template>
  <PopoutModal :show="show" @close="handleClose">
    <div class="container">
      <h3>{{ favoriteTitle }} </h3>
      <div class="list-item-wrapper" v-for="(item, idx) in contentList" :key="item.id || idx"
        @contextmenu.prevent="handleRightClick($event, idx)"
        :id="'item-' + String(item.id || idx)"
      >
        <SearchResultListItem :infoItem="item"/>
        <div 
          class="menu" 
          v-if="item.showContext"
          :style="{ left: x + 'px', top: y + 'px'}"
        >
          <button class="basic-btn block-btn" @click="moveFavorate(idx)">{{ $t('move_favorite') }}</button>
          <button class="basic-btn block-btn" @click="removePaper(idx)">{{ $t('delete') }}</button>
        </div>
      </div>
    </div>
  </PopoutModal>

  <ChooseFavoriteModal :fid="idTobeMoved" :paperId="paperIdTobeMoved" :show="chooseFavoriteModalShouldShow" @close="handleMoveModalClose"/>

</template>

<script>
import PopoutModal from '../popout-modal/PopoutModal.vue'
import SearchResultListItem from '../search-result-list/SearchResultListItem.vue'
import ChooseFavoriteModal from './ChooseFavoriteModal.vue'
import { User } from '../../api/users.js'
import { Search } from '../../api/search.js'
import {
  extractFavoriteDetail,
  normalizeFavoriteId,
  normalizeOpenAlexWorkId,
  paperIdOf,
  unwrapApiPayload
} from '../../utils/personal-page.mjs'
import { removePaperFromFavorite } from '../../utils/favorite-store.mjs'
export default {
  name: 'FavorateContentModal',
  components: {
    PopoutModal,
    SearchResultListItem,
    ChooseFavoriteModal
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    favoriteId: {
      type: [String, Number]
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
      detailRequestId: 0
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
    fetchData() {
      const favoriteId = normalizeFavoriteId(this.favoriteId)
      if (!favoriteId) {
        this.favoriteTitle = ''
        this.contentList = []
        return
      }
      const requestId = ++this.detailRequestId
      User.getFavorite(favoriteId, { cacheBust: true }).then(
        async (response) => {
          if (requestId !== this.detailRequestId || normalizeFavoriteId(this.favoriteId) !== favoriteId) return
          const detail = extractFavoriteDetail(response, favoriteId)
          const papers = await this.resolveFavoritePapers(detail)
          if (requestId !== this.detailRequestId || normalizeFavoriteId(this.favoriteId) !== favoriteId) return
          this.favoriteTitle = detail.favorite.name
          this.contentList = papers.map((paper) => ({ ...paper, showContext: false }))
        },
        () => {
          if (requestId !== this.detailRequestId) return
          this.contentList = []
        }
      )
      this.closeAll()
    },
    normalizeDetailPaper(paper, favoriteId) {
      const source = paper && typeof paper === 'object'
        ? (paper.paper || paper.work || paper.article || paper.item || paper)
        : paper
      const base = paper && typeof paper === 'object' ? paper : {}
      const body = source && typeof source === 'object' ? source : {}
      const id = normalizeOpenAlexWorkId(paperIdOf(body) || paperIdOf(base) || paperIdOf(source))
      if (!id) return null
      return {
        ...base,
        ...body,
        id,
        favorite_id: favoriteId,
        title: body.title || body.display_name || base.title || base.display_name || id,
        abstract: body.abstract || base.abstract || ''
      }
    },
    hasRenderablePaperData(paper) {
      return Boolean(
        paper &&
          (paper.title ||
            paper.abstract ||
            (Array.isArray(paper.authorships) && paper.authorships.length) ||
            paper.publication_date)
      )
    },
    async fetchPaperDetail(paperId, favoriteId, fallbackPaper = null) {
      const normalizedId = normalizeOpenAlexWorkId(paperId)
      if (!normalizedId) return fallbackPaper
      try {
        const response = await Search.workRetrieve(normalizedId)
        const payload = unwrapApiPayload(response) || {}
        return this.normalizeDetailPaper(payload, favoriteId) ||
          fallbackPaper ||
          this.normalizeDetailPaper({ id: normalizedId, title: normalizedId }, favoriteId)
      } catch (e) {
        return fallbackPaper || this.normalizeDetailPaper({ id: normalizedId, title: normalizedId }, favoriteId)
      }
    },
    async resolveFavoritePapers(detail) {
      const favoriteId = normalizeFavoriteId(detail && detail.favorite && detail.favorite.id) || normalizeFavoriteId(this.favoriteId)
      const paperMap = new Map()
      ;(detail.papers || []).forEach((paper) => {
        const normalized = this.normalizeDetailPaper(paper, favoriteId)
        if (normalized) paperMap.set(normalized.id, normalized)
      })

      const ids = (detail.favorite && detail.favorite.paper_ids || [])
        .map((id) => normalizeOpenAlexWorkId(paperIdOf(id)))
        .filter(Boolean)
      const uniqueIds = Array.from(new Set([...ids, ...paperMap.keys()]))

      const missingIds = uniqueIds.filter((id) => !this.hasRenderablePaperData(paperMap.get(id)))
      if (missingIds.length) {
        const fetched = await Promise.all(
          missingIds.map((id) => this.fetchPaperDetail(id, favoriteId, paperMap.get(id)))
        )
        fetched.forEach((paper) => {
          const normalized = this.normalizeDetailPaper(paper, favoriteId)
          if (normalized) paperMap.set(normalized.id, normalized)
        })
      }

      return uniqueIds.map((id) => paperMap.get(id)).filter(Boolean)
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
      removePaperFromFavorite(userId, favoriteId, paper.id).then(
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
    }
  }

}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--ps-space-3);
  box-sizing: border-box;
  max-height: 600px;
  overflow-y: auto;
}
.container>h3 {
  margin: 0 44px var(--ps-space-3) 0;
  color: var(--ps-text-1);
  overflow-wrap: anywhere;
}

.container>h3,
.container>h3 * {
  font-size: var(--ps-fs-3xl);
  font-weight: bold;
}

.container>*:not(h3) {
  margin-left: 0;
}

.container::-webkit-scrollbar {
  display: none;
}

.list-item-wrapper {
  position: relative;
  width: 100%;

}

.menu {
  /* width: 80px; */
  /* height: 90px; */
  padding: 10px;
  background: var(--theme-mode-like);
  /* border: 2px solid rgba(199, 29, 35, 1); */
  box-shadow: 1px 1px 10px grey;
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
</style>
