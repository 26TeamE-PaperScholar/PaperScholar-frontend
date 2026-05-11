<template>
  <div class="pagination">
    <!-- 第一页 -->
    <button @click="firstPage">
      &lt;&lt;
    </button>
    <!-- 前一页 -->
    <button @click="prevPage" :disabled="currentPage === 1" :class="{ 'disabled': currentPage === 1 }">
      &lt;
    </button>
    <!-- 页面前省略号 -->
    <span
      v-if="currentPage - (currentPage > 2 ? (totalPages - currentPage > 2 ? 2 : 4 - (totalPages - currentPage)) : currentPage - 1) > 1">
      ... </span>
    <!-- 很多页码.显示前后五页 -->
    <button
      v-for="page in [...Array(Math.min(totalPages, currentPage + (currentPage > 2 ? (totalPages - currentPage > 2 ? 2 : totalPages - currentPage) : 5 - currentPage)) + 1).keys()]
        .slice(Math.max(1, currentPage - (currentPage > 2 ? (totalPages - currentPage > 2 ? 2 : 4 - (totalPages - currentPage)) : currentPage - 1)))"
      :key="page" @click="changePage(page)" :class="{ active: page === currentPage }">
      {{ page }}
    </button>
    <!-- 页面后省略号 -->
    <span
      v-if="currentPage + (currentPage > 2 ? (totalPages - currentPage > 2 ? 2 : totalPages - currentPage) : 5 - currentPage) < totalPages">
      ... </span>
    <button @click="nextPage" :disabled="currentPage === totalPages" :class="{ 'disabled': currentPage === totalPages }">
      &gt;
    </button>
    <button @click="lastPage">
      &gt;&gt;
    </button>
    <section>
      <div class="flatten no-margin"> {{ $t('pagination_current_page_1') }} </div>
      <input v-model="jumpPage" @input="handleJumpNumberInput" @keydown.enter="jumpToPage" min="1" :max="totalPages"
        placeholder="Go to Page" class="jump_page_number flatten" />
      <div class="flatten no-margin"> / {{ totalPages }} {{ $t('pagination_current_page_2') }} </div>
      <button @click="jumpToPage" class="flatten"> {{ $t('pagination_jump') }} </button>
    </section>
    <div class="flatten">
      <select class="flatten" :value="itemsPerPage" @change="$emit('item-per-page-change', Number($event.target.value))">
        <option v-if="![5, 10, 20, 50].includes(itemsPerPage)" :value="itemsPerPage">{{ itemsPerPage }}</option>
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
      </select>
      <div class="flatten">{{ $t('pagination_per_page') }}</div>
    </div>
  </div>
</template>

<script>
import i18n from '../../language'
export default {
  components: {
    i18n
  },
  data() {
    return {
      jumpPage: 1,
    }
  },
  props: {
    currentPage: {
      type: Number,
      default: 1.
    },
    totalPages: {
      type: Number,
      default: 10
    },
    itemsPerPage: {
      type: Number,
      default: 10
    },
  },
  methods: {
    firstPage() {
      this.$emit('page-change', 1)
    },
    lastPage() {
      this.$emit('page-change', this.totalPages)
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.$emit('page-change', this.currentPage - 1)
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.$emit('page-change', this.currentPage + 1)
      }
    },
    changePage(page) {
      this.$emit('page-change', page)
    },
    jumpToPage() {
      if (this.jumpPage > 0 && this.jumpPage <= this.totalPages)
        this.$emit('page-change', this.jumpPage)
    },
    handleJumpNumberInput() {
      if (!/^[1-9]\d*$/.test(this.jumpPage)) {
        this.jumpPage = this.currentPage
      }
      else {
        this.jumpPage = parseInt(this.jumpPage)
      }
    }
  },
  watch: {
    currentPage(value) {
      this.jumpPage = value
    }
  }
}
</script>

<style scoped>
.pagination {
  font-weight: 700;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  gap: 10px;
  padding: 18px 0;
  background: transparent;
  border-top: var(--border-soft);
  border-radius: 0;
  box-shadow: none;
}

.pagination div {
  color: var(--theme-mode-high-contrast);
  font-size: 14px;
}

button {
  width: fit-content;
  min-width: 42px;
  height: 40px;
  padding: 0 14px;
  background: var(--theme-mode-like);
  color: var(--theme-mode-very-high-contrast);
  font-weight: 600;
  margin: 0;
  border: 1px solid #111111;
  border-radius: 999px;
}

button:hover {
  background: #f2f2f2;
  border-color: #111111;
}

button.active {
  background: #111111;
  color: #fff;
  border-color: #111111;
}

button.disabled {
  background: var(--theme-mode-like);
  border-color: #d9d9d9;
  color: var(--theme-mode-high-contrast);
  cursor: not-allowed;
}

select {
  height: 40px;
  background: var(--theme-mode-like);
  color: var(--theme-mode-very-high-contrast);
  border: 1px solid #d9d9d9;
  border-radius: 999px;
  padding: 0 14px;
  cursor: pointer;
}

select option {
  color: var(--theme-mode-very-high-contrast);
  transition: all linear 0.5s;
}

.jump_page_number {
  color: var(--theme-mode-very-high-contrast);
  background: var(--theme-mode-like);
  border: 1px solid #d9d9d9;
  border-radius: 999px;
  padding: 0 12px;
  max-width: 58px;
  height: 40px;
  margin: 0 !important;
  text-align: center;
}

.flatten {
  display: inline-block;
  white-space: nowrap;
  margin: auto 4px;
  font-size: 14px;
}
</style>
