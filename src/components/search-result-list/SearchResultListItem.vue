<template>
  <AppCard class="ps-result-item" hover interactive @click="jumpArticle">
    <div class="ps-result-item__head">
      <div class="ps-result-item__index" aria-hidden="true">{{ paddedIndex }}</div>
      <div class="ps-result-item__head-main">
        <h3 class="ps-result-item__title" v-html="highlightedText(infoItem.keyword, infoItem.title)"></h3>
        <div class="ps-result-item__authors">
          <AppAvatar
            v-for="(a, idx) in displayedAuthors"
            :key="idx"
            :name="a.author.display_name"
            :id="a.author.id"
            size="xs"
          />
          <span class="ps-result-item__authors-text">
            <template v-for="(a, idx) in displayedAuthors" :key="idx">
              <span
                class="ps-result-item__author-link"
                @click.stop="jumpAuthor(a.author.id)"
              >{{ a.author.display_name }}</span>
              <span v-if="idx < displayedAuthors.length - 1">、</span>
            </template>
            <span v-if="moreAuthors > 0" class="ps-result-item__author-more"> +{{ moreAuthors }} 位作者</span>
          </span>
        </div>
      </div>
      <div class="ps-result-item__actions" @click.stop>
        <AddToCompareButton :paper="infoItem" size="sm" />
        <AppIconButton
          icon="Bookmark"
          variant="soft"
          tooltip="收藏到我的收藏夹"
          aria-label="收藏"
          @click="showCollectModal"
        />
        <AppIconButton
          icon="Share"
          variant="ghost"
          tooltip="分享"
          aria-label="分享"
          @click="sharePaper"
        />
      </div>
    </div>

    <p
      class="ps-result-item__excerpt"
      v-html="highlightedText(infoItem.keyword, infoItem.abstract)"
    ></p>

    <div class="ps-result-item__meta">
      <AppMetricBadge
        :value="infoItem.cited_by_count"
        :label="$t('search_result_cited_times') || '引用'"
        tone="violet"
        icon="FlameOutline"
      />
      <AppMetricBadge
        v-if="infoItem.publication_date"
        :value="infoItem.publication_date"
        label="发表"
        tone="neutral"
        icon="Calendar"
      />
      <AppMetricBadge
        v-if="infoItem.open_access"
        value="OA"
        label="开放获取"
        tone="success"
        icon="GlobeOutline"
      />
      <AppMetricBadge
        v-if="venueName"
        :value="venueName"
        tone="gold"
        icon="BookOutline"
      />

      <div class="ps-result-item__concepts">
        <AppTagChip
          v-for="c in (infoItem.concepts || []).slice(0, 3)"
          :key="c.id"
          size="sm"
          variant="subtle"
        >
          {{ c.display_name }}
        </AppTagChip>
      </div>

      <a
        v-if="infoItem.primary_location && infoItem.primary_location.pdf_url"
        class="ps-result-item__pdf"
        :href="infoItem.primary_location.pdf_url"
        target="_blank"
        rel="noopener"
        @click.stop
      >
        <AppIcon name="Document" :size="13" />
        PDF
      </a>
    </div>
  </AppCard>
  <ChooseFavoriteModal :paperId="infoItem.id" :show="collectModalShouldShow" @close="collectModalShouldShow = false" />
</template>

<script>
import ChooseFavoriteModal from '../modals/ChooseFavoriteModal.vue'
import AddToCompareButton from '../compare/AddToCompareButton.vue'
import { AppCard, AppIcon, AppAvatar, AppTagChip, AppMetricBadge, AppIconButton } from '../ui'

export default {
  name: 'SearchResultListItem',
  components: {
    ChooseFavoriteModal,
    AddToCompareButton,
    AppCard,
    AppIcon,
    AppAvatar,
    AppTagChip,
    AppMetricBadge,
    AppIconButton
  },
  props: {
    infoItem: { type: Object, required: true },
    index: { type: Number, default: 0 }
  },
  data() {
    return {
      collectModalShouldShow: false
    }
  },
  computed: {
    displayedAuthors() {
      return (this.infoItem.authorships || []).slice(0, 3)
    },
    moreAuthors() {
      return Math.max(0, (this.infoItem.authorships || []).length - 3)
    },
    paddedIndex() {
      return String(this.index + 1).padStart(2, '0')
    },
    venueName() {
      const loc = this.infoItem.primary_location
      if (!loc || !loc.source) return ''
      return loc.source.display_name || ''
    }
  },
  methods: {
    highlightedText(matcher, str) {
      if (!matcher || !str) return str || ''
      try {
        const safe = String(matcher).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(safe, 'gi')
        return String(str).replace(regex, (m) => `<mark class="ps-hit">${m}</mark>`)
      } catch (e) {
        return str
      }
    },
    jumpArticle() {
      this.$router.push('/paper_detail/' + this.infoItem.id)
    },
    jumpAuthor(id) {
      if (!id) return
      this.$router.push('/scholar_portal/' + id)
    },
    showCollectModal() {
      this.collectModalShouldShow = true
    },
    sharePaper() {
      const text = window.location.origin + '/paper_detail/' + this.infoItem.id
      try {
        navigator.clipboard.writeText(text)
        this.$bus.emit('message', { title: '已复制链接', content: text, time: 1800 })
      } catch (e) {
        this.$bus.emit('message', { title: '复制失败', content: text, time: 1800 })
      }
    }
  }
}
</script>

<style scoped>
.ps-result-item {
  margin-bottom: var(--ps-space-4);
}

.ps-result-item__head {
  display: flex;
  align-items: flex-start;
  gap: var(--ps-space-4);
  margin-bottom: var(--ps-space-3);
}

.ps-result-item__index {
  font-family: var(--ps-font-mono);
  font-size: 11px;
  color: var(--ps-text-3);
  width: 30px;
  flex: none;
  padding-top: 6px;
}

.ps-result-item__head-main {
  flex: 1;
  min-width: 0;
}

.ps-result-item__title {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-xl);
  font-weight: 700;
  color: var(--ps-text-1);
  line-height: 1.35;
  margin-bottom: var(--ps-space-2);
}

.ps-result-item__title :deep(.ps-hit) {
  background: var(--ps-color-accent-soft);
  color: var(--ps-color-accent-strong);
  padding: 0 4px;
  border-radius: 4px;
}

.ps-result-item__authors {
  display: flex;
  align-items: center;
  gap: var(--ps-space-2);
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-2);
}

.ps-result-item__authors :deep(.ps-avatar) {
  margin-right: -6px;
  box-shadow: 0 0 0 2px var(--ps-bg-elevated);
}

.ps-result-item__authors :deep(.ps-avatar:last-of-type) { margin-right: 4px; }

.ps-result-item__author-link {
  color: var(--ps-text-2);
  font-weight: 500;
  cursor: pointer;
  transition: color var(--ps-motion-fast) var(--ps-ease-out);
}

.ps-result-item__author-link:hover {
  color: var(--ps-color-primary);
  text-decoration: underline;
}

.ps-result-item__author-more {
  color: var(--ps-text-3);
  margin-left: 4px;
}

.ps-result-item__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: none;
}

.ps-result-item__excerpt {
  font-size: var(--ps-fs-base);
  color: var(--ps-text-2);
  line-height: 1.7;
  margin-left: 42px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.ps-result-item__excerpt :deep(.ps-hit) {
  background: var(--ps-color-accent-soft);
  color: var(--ps-color-accent-strong);
  padding: 0 2px;
  border-radius: 3px;
}

.ps-result-item__meta {
  margin-top: var(--ps-space-4);
  margin-left: 42px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ps-space-2);
}

.ps-result-item__concepts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-left: var(--ps-space-2);
}

.ps-result-item__pdf {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  font-size: var(--ps-fs-xs);
  font-weight: 600;
  color: var(--ps-color-primary);
  padding: 4px 10px;
  border: 1px solid var(--ps-color-primary);
  border-radius: var(--ps-radius-pill);
}

.ps-result-item__pdf:hover {
  background: var(--ps-color-primary);
  color: var(--ps-text-inverse);
  text-decoration: none;
}

@media screen and (max-width: 720px) {
  .ps-result-item__excerpt,
  .ps-result-item__meta {
    margin-left: 0;
  }
  .ps-result-item__index { display: none; }
}
</style>
