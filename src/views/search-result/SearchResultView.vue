<template>
  <div class="main-area">

    <div class="cond-area" style="display: vertical">
      <section class="side-section">
        <h3>{{ $t("search_text") }}</h3>
        <button
          v-for="option in searchTypeOptions"
          :key="option.type"
          class="side-option"
          :class="{ active: selectedSearchTypeOption === option.type }"
          @click="setSearchTypeFromSidebar(option.type)"
        >
          {{ $t(option.label) }}
        </button>
        <button class="side-option" :class="{ active: showAdvancedSearch }" @click="showAdvancedSearch = !showAdvancedSearch">
          {{ $t("advanced_search_text") }}
        </button>
      </section>

      <section v-show="showAdvancedSearch" class="side-section advanced-search-section">
        <label>
          <span>{{ $t("advanced_search_author") }}</span>
          <input class="basic-input" type="text" :placeholder="$t('advanced_search_author_example')" v-model="advancedSearchForm.author" />
        </label>
        <label>
          <span>{{ $t("advanced_search_publication") }}</span>
          <input class="basic-input" type="text" :placeholder="$t('advanced_search_publication_example')" v-model="advancedSearchForm.publication" />
        </label>
        <label>
          <span>{{ $t("advanced_search_publish_time") }}</span>
          <div class="time-range">
            <input class="basic-input" type="text" placeholder="1997" v-model="advancedSearchForm.start_time" />
            <span>~</span>
            <input class="basic-input" type="text" placeholder="1998" v-model="advancedSearchForm.end_time" />
          </div>
        </label>
        <label>
          <span>{{ $t("advanced_search_publish_keyword") }}</span>
          <input class="basic-input" type="text" v-model="advancedSearchForm.keyword" />
        </label>
        <label class="checkbox-row">
          <input type="checkbox" v-model="advancedSearchForm.is_key_title" />
          <span>{{ $t("advanced_search_publish_keyword_isTitle") }}</span>
        </label>
        <button class="basic-btn advanced-submit" @click="submitAdvancedSearch">{{ $t("search_text") }}</button>
      </section>

      <!-- <div class="filter-card"  v-html="test_v_html"></div> -->
      <h3 class="filter-switch" :class="{ 'filter-switch-active': show_filte }" @click="show_filte = !show_filte">
        {{ $t("filter") }}
      </h3>
      <div v-show="show_filte">
        <div v-show="search_type == 1 || search_type == 3" 
         class="filter-card" style="
            display: vertical;
            margin-left: auto;
            margin-right: auto;
            text-align: center;
          ">
          <ul>
            <li @click="show_filte_by_time = !show_filte_by_time">
              {{ $t("filte_by_time") }} <svg  t="1703580067074" class="icon" viewBox="256 256 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4195" width="20" height="20"><path d="M680.1408 414.976c9.9328-8.704 24.2176-6.656 31.8976 4.608a27.8016 27.8016 0 0 1-4.096 35.84l-172.032 149.76a35.6352 35.6352 0 0 1-47.8208 0l-172.032-149.7088a27.8016 27.8016 0 0 1-4.096-35.9424c7.68-11.1616 22.016-13.2096 31.8976-4.608L512 561.3056l168.1408-146.2784z" fill="#17232B" p-id="4196"></path></svg>
            </li>
            <li @click="setFilterTime(1)" v-show="show_filte_by_time" style="cursor: pointer">
              {{ $t("no_limit_time") }}
            </li>
            <li @click="setFilterTime(2)" v-show="show_filte_by_time" style="cursor: pointer">
              {{ $t("since_2023") }}
            </li>
            <li @click="setFilterTime(3)" v-show="show_filte_by_time" style="cursor: pointer">
              {{ $t("since_2022") }}
            </li>
            <li @click="setFilterTime(4)" v-show="show_filte_by_time" style="cursor: pointer">
              {{ $t("since_2019") }}
            </li>
            <li v-show="show_filte_by_time" style="cursor: pointer" @click="setFilterTime(5)">
              
              <div>
                <span style="white-space: nowrap ;">{{ $t("self_define_time_range") }}</span>
                <input @click.stop=";"
                  class="basic-input" v-model="search_start_time" type="text" style="width: 30%;height: 25px; font-size: 14px; margin-left: 10px" />
                ~
                <input @click.stop=";"
                  class="basic-input" v-model="search_end_time" type="text" style="width: 30%; height: 25px; font-size: 14px"/> 
                <br>
              <!-- <button class="basic-btn-outline" @click="setFilterTime(5)" style="width: 40%; margin: 10px auto; display: block;">{{$t('search_text')}}</button> -->
                
              </div>
            </li>
            <!-- <li>

            </li> -->
          </ul>
        </div>

        <div v-show="search_type == 1 || search_type == 2 || search_type == 3 || search_type == 4" class="filter-card" style="
            display: vertical;
            margin-left: auto;
            margin-right: auto;
            text-align: center;
          ">
          <ul>
            <li @click="show_filte_by_cite = !show_filte_by_cite">
              {{ $t("filte_cite") }}<svg  t="1703580067074" class="icon" viewBox="256 256 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4195" width="20" height="20"><path d="M680.1408 414.976c9.9328-8.704 24.2176-6.656 31.8976 4.608a27.8016 27.8016 0 0 1-4.096 35.84l-172.032 149.76a35.6352 35.6352 0 0 1-47.8208 0l-172.032-149.7088a27.8016 27.8016 0 0 1-4.096-35.9424c7.68-11.1616 22.016-13.2096 31.8976-4.608L512 561.3056l168.1408-146.2784z" fill="#17232B" p-id="4196"></path></svg>
            </li>
            <li @click="filteByCount(0)" v-show="show_filte_by_cite" style="cursor: pointer">
              {{ $t("filte_cite_no_limit") }}
            </li>
            <li v-show="show_filte_by_cite" style="cursor: pointer" @click="filteByCount(1)">
              {{ $t("filte_cite_more_than") }}
              <input  @click.stop=";"
                class="basic-input" type="text" v-model="filte_count_value" style="width: 30%; height: 25px; font-size: 14px; margin-left: 10px" />
              <!-- <br>
              <button class="basic-btn-outline" style="width: 40%; margin: 10px auto;" @click="filteByCount(1)">{{$t('search_text')}}</button> -->

            </li>
            <!-- <li @click="filteByCount(1)" v-show="show_filte_by_cite" style="cursor: pointer">
              <input class="basic-input" type="text" v-model="filte_count_value" style="width: 30%" />
            </li> -->
            
          </ul>
        </div>

        <div v-show="search_type == 1" class="filter-card" style="display: vertical; text-align: center">
          <ul>
            <li @click="show_filte_by_language = !show_filte_by_language" style="cursor: pointer">
              {{ $t("filte_language") }} <svg  t="1703580067074" class="icon" viewBox="256 256 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4195" width="20" height="20"><path d="M680.1408 414.976c9.9328-8.704 24.2176-6.656 31.8976 4.608a27.8016 27.8016 0 0 1-4.096 35.84l-172.032 149.76a35.6352 35.6352 0 0 1-47.8208 0l-172.032-149.7088a27.8016 27.8016 0 0 1-4.096-35.9424c7.68-11.1616 22.016-13.2096 31.8976-4.608L512 561.3056l168.1408-146.2784z" fill="#17232B" p-id="4196"></path></svg>
            </li>
            <li @click="setLanguage(1)" v-show="show_filte_by_language" style="cursor: pointer">
              {{ $t("no_language_limit") }}
            </li>
            <li @click="setLanguage(2)" v-show="show_filte_by_language" style="cursor: pointer">
              {{ $t("chinece_language") }}
            </li>
            <li @click="setLanguage(3)" v-show="show_filte_by_language" style="cursor: pointer">
              {{ $t("english_language") }}
            </li>
            <!-- <li>时间不限</li> -->
          </ul>
        </div>

        <!-- <div
        v-if="search_type == 1"
        class="filter-card"
        style="display: vertical; text-align: center"
      >
        <ul>
          <li style="cursor: pointer"><input type="checkbox" />包含专利</li>
          <li style="cursor: pointer"><input type="checkbox" />包含引用</li>
        </ul>
      </div> -->
        <div v-show="search_type == 3" class="filter-card" style="display: vertical; text-align: center">
          <ul>
            <!--  -->
            <li @click="show_filte_publication = !show_filte_publication" style="cursor: pointer">
              {{ $t("filte_source") }} <svg  t="1703580067074" class="icon" viewBox="256 256 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4195" width="20" height="20"><path d="M680.1408 414.976c9.9328-8.704 24.2176-6.656 31.8976 4.608a27.8016 27.8016 0 0 1-4.096 35.84l-172.032 149.76a35.6352 35.6352 0 0 1-47.8208 0l-172.032-149.7088a27.8016 27.8016 0 0 1-4.096-35.9424c7.68-11.1616 22.016-13.2096 31.8976-4.608L512 561.3056l168.1408-146.2784z" fill="#17232B" p-id="4196"></path></svg>
            </li>
            <li @click="setJounalType(0)" v-show="show_filte_publication" style="cursor: pointer">
              {{ $t("filte_source_no_limit") }}
            </li>
            <li @click="setJounalType(1)" v-show="show_filte_publication" style="cursor: pointer">
              {{ $t("filte_source_journal") }}
            </li>
            <li @click="setJounalType(2)" v-show="show_filte_publication" style="cursor: pointer">
              {{ $t("filte_source_respository") }}
            </li>
            <li @click="setJounalType(3)" v-show="show_filte_publication" style="cursor: pointer">
              {{ $t("filte_source_conference") }}
            </li>
            <!-- <li @click="setJounalType(4)" v-show="show_filte_publication" style="cursor: pointer">
              ebook
            </li>
            <li @click="setJounalType(5)" v-show="show_filte_publication" style="cursor: pointer">
              platform
            </li>
            <li @click="setJounalType(5)" v-show="show_filte_publication" style="cursor: pointer">
              book series
            </li> -->
          </ul>
        </div>
      </div>

      <h3 class="sort-switch" :class="{ 'sort-switch-active': show_sort }" @click="show_sort = !show_sort">
        {{ $t("sort") }}
      </h3>
      <div v-show="show_sort">
        <div v-show="search_type == 1" class="filter-card" style="display: vertical; text-align: center">
          <ul>
            <li v-show="search_type == 1" @click="show_sort_by_date = !show_sort_by_date">
              {{ $t("sort_by_date") }}<svg  t="1703580067074" class="icon" viewBox="256 256 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4195" width="20" height="20"><path d="M680.1408 414.976c9.9328-8.704 24.2176-6.656 31.8976 4.608a27.8016 27.8016 0 0 1-4.096 35.84l-172.032 149.76a35.6352 35.6352 0 0 1-47.8208 0l-172.032-149.7088a27.8016 27.8016 0 0 1-4.096-35.9424c7.68-11.1616 22.016-13.2096 31.8976-4.608L512 561.3056l168.1408-146.2784z" fill="#17232B" p-id="4196"></path></svg>
            </li>
            <li v-show="show_sort_by_date && search_type == 1" @click="sortByTime(2)" style="cursor: pointer">
              {{ $t("ascending_sort") }}
            </li>
            <li v-show="show_sort_by_date && search_type == 1" @click="sortByTime(1)" style="cursor: pointer">
              {{ $t("descending_sort") }}
            </li>
          </ul>
        </div>

        <div v-show="search_type == 1 ||
          search_type == 2 ||
          search_type == 3 ||
          search_type == 4
          " class="filter-card" style="display: vertical; text-align: center">
          <ul>
            <li v-show="search_type == 1 ||
              search_type == 2 ||
              search_type == 3 ||
              search_type == 4
              " @click="show_sort_by_cite = !show_sort_by_cite">
              {{ $t("sort_by_cite_count") }}<svg  t="1703580067074" class="icon" viewBox="256 256 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4195" width="20" height="20"><path d="M680.1408 414.976c9.9328-8.704 24.2176-6.656 31.8976 4.608a27.8016 27.8016 0 0 1-4.096 35.84l-172.032 149.76a35.6352 35.6352 0 0 1-47.8208 0l-172.032-149.7088a27.8016 27.8016 0 0 1-4.096-35.9424c7.68-11.1616 22.016-13.2096 31.8976-4.608L512 561.3056l168.1408-146.2784z" fill="#17232B" p-id="4196"></path></svg>
            </li>
            <li @click="sortByCite(1)" v-show="show_sort_by_cite &&
              (search_type == 1 ||
                search_type == 2 ||
                search_type == 3 ||
                search_type == 4)
              " style="cursor: pointer">
              {{ $t("ascending_sort") }}
            </li>
            <li @click="sortByCite(2)" v-show="show_sort_by_cite &&
              (search_type == 1 ||
                search_type == 2 ||
                search_type == 3 ||
                search_type == 4)
              " style="cursor: pointer">
              {{ $t("descending_sort") }}
            </li>
          </ul>
        </div>

        <div v-show="search_type == 2 || search_type == 3 || search_type == 4" class="filter-card"
          style="display: vertical; text-align: center">
          <ul>
            <li v-show="search_type == 2 || search_type == 3 || search_type == 4"
              @click="show_sort_by_works_count = !show_sort_by_works_count">
              {{ $t("sort_by_works_count") }} <svg  t="1703580067074" class="icon" viewBox="256 256 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4195" width="20" height="20"><path d="M680.1408 414.976c9.9328-8.704 24.2176-6.656 31.8976 4.608a27.8016 27.8016 0 0 1-4.096 35.84l-172.032 149.76a35.6352 35.6352 0 0 1-47.8208 0l-172.032-149.7088a27.8016 27.8016 0 0 1-4.096-35.9424c7.68-11.1616 22.016-13.2096 31.8976-4.608L512 561.3056l168.1408-146.2784z" fill="#17232B" p-id="4196"></path></svg>
            </li>
            <li @click="sortByWorksCount(1)" v-show="show_sort_by_works_count &&
              (search_type == 2 || search_type == 3 || search_type == 4)
              " style="cursor: pointer">
              {{ $t("ascending_sort") }}
            </li>
            <li @click="sortByWorksCount(2)" v-show="show_sort_by_works_count &&
              (search_type == 2 || search_type == 3 || search_type == 4)
              " style="cursor: pointer">
              {{ $t("descending_sort") }}
            </li>
          </ul>
        </div>

        <div v-show="search_type == 1 ||
          search_type == 2 ||
          search_type == 3 ||
          search_type == 4
          " class="filter-card" style="display: vertical; text-align: center">
          <ul>
            <li v-show="search_type == 1 ||
              search_type == 2 ||
              search_type == 3 ||
              search_type == 4
              " @click="show_sort_by_display_name = !show_sort_by_display_name">
              {{ $t("sort_by_alpha") }}<svg  t="1703580067074" class="icon" viewBox="256 256 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4195" width="20" height="20"><path d="M680.1408 414.976c9.9328-8.704 24.2176-6.656 31.8976 4.608a27.8016 27.8016 0 0 1-4.096 35.84l-172.032 149.76a35.6352 35.6352 0 0 1-47.8208 0l-172.032-149.7088a27.8016 27.8016 0 0 1-4.096-35.9424c7.68-11.1616 22.016-13.2096 31.8976-4.608L512 561.3056l168.1408-146.2784z" fill="#17232B" p-id="4196"></path></svg>
            </li>
            <li @click="sortByDisplayName(1)" v-show="show_sort_by_display_name &&
              (search_type == 1 ||
                search_type == 2 ||
                search_type == 3 ||
                search_type == 4)
              " style="cursor: pointer">
              {{ $t("ascending_sort") }}
            </li>
            <li @click="sortByDisplayName(2)" v-show="show_sort_by_display_name &&
              (search_type == 1 ||
                search_type == 2 ||
                search_type == 3 ||
                search_type == 4)
              " style="cursor: pointer">
              {{ $t("descending_sort") }}
            </li>
          </ul>
        </div>
      </div>

      <!-- <hr> -->
    </div>

    <div class="search-container-wrapper">
      <div class="search-container">
        <SearchPanel ref="searchPanelRef" @senddata="handleModoleSearch" @setSearchTypeChild="handleChildSearchType">
        </SearchPanel>
      </div>
      <div>
        <ul>
          <li v-for="(item, index) in autoCompleteLists" :key="index">
            {{ item.display_name }}
          </li>
        </ul>
      </div>

      <!--     //this.$emit('change-item-per-page',itemsPerPage)
    //this.$emit('change-page',page) -->
      <!-- 
       -->
      <Pagination @change-item-per-page="changeItemPerpage" @change-page="changePages" :itemsPerPage="itemsPerPage"
        :currentPage="currentPage" :totalPages="totalPages" class="pagination" :defaultItemsPerPage="5">
        <div v-if="search_type == 1">
          <SearchResultListItem v-for="(info, index) in infoItems" :key="index" :infoItem="info"></SearchResultListItem>
        </div>
        <div v-else-if="search_type == 2">
          <ScholarListItem v-show="search_type == 2" v-for="(info, index) in infoItems" :key="index" :infoItem="info">
          </ScholarListItem>
        </div>
        <div v-else-if="search_type == 3">
          <JournalListItem v-for="(info, index) in infoItems" :key="index" :infoItem="info"></JournalListItem>
        </div>

        <div v-else>
          <InstitutionListItem v-show="search_type == 4" v-for="(info, index) in infoItems" :key="index" :infoItem="info">
          </InstitutionListItem>
        </div>
      </Pagination>
    </div>
    <!-- <ChatGPT style="display: vertical; position: sticky; top: 60px"></ChatGPT> -->
  </div>
  <div v-if="$cookies.get('user_id')"
    id="chat" :class="{ chat: true, dragging: isDragging }"
    :style="{ top: topDistance + 'px', left: leftDistance + 'px' }" @mousedown.stop="startDrag">
    <template v-if="showChat">
      <ChatGPT />
      <svg class="fold-icon" @click="showChat = false" t="1703515853080" viewBox="0 0 1024 1024" version="1.1"
        xmlns="http://www.w3.org/2000/svg" p-id="3724" width="200" height="200">
        <path
          d="M904.533333 674.133333l-362.666666-362.666666c-17.066667-17.066667-42.666667-17.066667-59.733334 0l-362.666666 362.666666c-17.066667 17.066667-17.066667 42.666667 0 59.733334 17.066667 17.066667 42.666667 17.066667 59.733333 0L512 401.066667l332.8 332.8c8.533333 8.533333 19.2 12.8 29.866667 12.8s21.333333-4.266667 29.866666-12.8c17.066667-17.066667 17.066667-42.666667 0-59.733334z"
          p-id="3725"></path>
      </svg>
    </template>
    <template v-else>
      <div class="talk-hint-container">
        <span class="talk-hint">{{ $t("talk_with_chat") }}</span>
        <svg class="unfold-chat" @click="showChat = true" t="1703515339866" viewBox="0 0 1024 1024" version="1.1"
          xmlns="http://www.w3.org/2000/svg" p-id="3584" width="200" height="200">
          <path
            d="M904.533333 311.466667c-17.066667-17.066667-42.666667-17.066667-59.733333 0L512 644.266667 179.2 311.466667c-17.066667-17.066667-42.666667-17.066667-59.733333 0-17.066667 17.066667-17.066667 42.666667 0 59.733333l362.666666 362.666667c8.533333 8.533333 19.2 12.8 29.866667 12.8s21.333333-4.266667 29.866667-12.8l362.666666-362.666667c17.066667-17.066667 17.066667-42.666667 0-59.733333z"
            p-id="3585"></path>
        </svg>
      </div>
    </template>
  </div>
</template>
  
<script>
import SearchResultListItem from "../../components/search-result-list/SearchResultListItem.vue";
import Pagination from "../../components/pagination/Pagination.vue";
import i18n from "../../language";
import { Search } from "../../api/search.js";
import { AutoComplete } from "../../api/autocomplete.js";
// import AsideBar from "../../components/search-property/AsideBar.vue";
import InstitutionListItem from "../../components/list-item/InstitutionListItem.vue";
import JournalListItem from "../../components/list-item/JournalListItem.vue";
import ScholarListItem from "../../components/list-item/ScholarListItem.vue";
// import SearchModelVue
import SearchPanel from "../search/SearchPanel.vue";
import ChatGPT from "../../components/chat/Chat.vue";
import { ref } from "vue";
import FavouriteListChoosableVue from "../../components/favorites/FavouriteListChoosable.vue";
export default {
  name: "SearchResultView",
  components: {
    SearchResultListItem,
    Pagination,
    i18n,
    InstitutionListItem,
    JournalListItem,
    ScholarListItem,
    Search,
    ChatGPT,
    SearchPanel,
  },
  data() {
    return {
      /***
     * display_name
        cited_by_count
        works_count
        publication_date
        relevance_score (only exists if there's a search filter active)
     */
      show_sort_by_date: false,
      show_sort_by_cite: false,
      show_sort_by_works_count: false,
      show_sort_by_display_name: false,
      selectedSearchTypeOption: 0,
      showAdvancedSearch: false,
      searchTypeOptions: [
        { type: 0, label: "kerword_search" },
        { type: 1, label: "abstract_search" },
        { type: 2, label: "full_text_search" },
        { type: 3, label: "title_search" },
        { type: 4, label: "author_search" },
        { type: 5, label: "journal_search" },
        { type: 6, label: "institution_search" },
      ],
      advancedSearchForm: {
        author: "",
        publication: "",
        start_time: "",
        end_time: "",
        keyword: "",
        is_key_title: true,
      },

      show_filte_by_time: false,
      show_filte_by_cite: false,
      show_filte_by_works_count: false,
      show_filte_by_language: false,
      show_filte_publication: false,

      test_v_html: "",

      filte_count_value: 10,
      filte_cite_value: 100,

      show_sort: true,
      show_filte: true,
      showChat: false,

      totalPages: 1,
      currentPage: 1,
      itemsPerPage: 5,
      //加载条参数
      accelerate: false,
      isReal: false,
      displayLoading: false,
      progress: 0,

      resultlist: null,
      infoItems: [],
      demoInfoItems: [
        {
          id: "demo-work-1",
          title: "Retrieval-Augmented Generation for Scholarly Literature Review",
          keyword: this.search || "retrieval",
          abstract:
            "This paper presents a retrieval-augmented workflow for scientific literature review, combining citation-aware search, abstract summarization, and author disambiguation to support evidence-grounded academic discovery.",
          cited_by_count: 284,
          authorships: [
            { author: { display_name: "Ming Chen" } },
            { author: { display_name: "Elena Park" } },
            { author: { display_name: "David Kumar" } },
          ],
          primary_location: {
            pdf_url: "",
          },
        },
        {
          id: "demo-work-2",
          title: "Large Language Models as Research Assistants: A Survey",
          keyword: this.search || "language",
          abstract:
            "We survey recent work on language-model-based research assistants, focusing on search intent understanding, trustworthy citation generation, human feedback loops, and evaluation protocols for academic information systems.",
          cited_by_count: 619,
          authorships: [
            { author: { display_name: "Sarah Williams" } },
            { author: { display_name: "Jiahao Li" } },
          ],
          primary_location: {
            pdf_url: "",
          },
        },
        {
          id: "demo-work-3",
          title: "Graph-Based Recommendation in Academic Search Platforms",
          keyword: this.search || "graph",
          abstract:
            "A heterogeneous graph model is introduced to recommend papers, scholars, institutions, and venues from sparse interaction signals. Experiments show improved coverage for early-stage researchers and interdisciplinary queries.",
          cited_by_count: 143,
          authorships: [
            { author: { display_name: "Ava Thompson" } },
            { author: { display_name: "Yuki Tanaka" } },
            { author: { display_name: "Rafael Costa" } },
          ],
          primary_location: {
            pdf_url: "",
          },
        },
        {
          id: "demo-work-4",
          title: "Evaluating Trust and Transparency in Citation Search",
          keyword: this.search || "citation",
          abstract:
            "This study proposes interface-level metrics for transparent citation search, including source provenance, result explainability, temporal coverage, and user confidence across exploratory academic tasks.",
          cited_by_count: 87,
          authorships: [
            { author: { display_name: "Nora Singh" } },
            { author: { display_name: "Michael Adams" } },
          ],
          primary_location: {
            pdf_url: "",
          },
        },
      ],
      infoItem: {
        title: "低碳经济: 人类经济发展方式的新变革",
        author: "鲍健强， 苗阳， 陈锋 - 中国工业经济, 2008 - cqvip.com",
        excerpt: "0",
        timeCited: 57,
        keyword: "经济",
        publicationYear: 2008,
        journalName: "中国工业经济",
        abstract:
          "This work discusses the new changes in human economic development towards a low carbon economy...",
        url: "https://example.com/link-to-work",
      },
      searchdata: null,

      // search
      filter: "",
      search: "",
      sort: "cited_by_count:desc",
      per_page: "10",
      page: "1",
      cursor: "",

      search_start_time: 2020,
      search_end_time: 2022,
      show_range: true,
      search_type: 1,

      autoCompleteLists: [],
      // work type
      options: [
        { text: "Article", value: "article" },
        { text: "Book", value: "book" },
        { text: "Letter", value: "letter" },
      ],
      selectedOption: null,

      placehold: "",
      searchPanelRef: null,

      topDistance: window.innerWidth > 500 ? 200 : 215,
      leftDistance:
        window.innerWidth > 500
          ? window.innerWidth - 330
          : window.innerWidth * 0.5 - 160,
      startX: 0,
      startY: 0,
      isDragging: false,
    };
  },
  watch: {
    search(newValue, oldValue) {
      if (newValue.length == 0 || newValue == this.searchdata.search) {
        this.autoCompleteLists = [];
      } else {
        this.autoComplete();
      }
    },
    "$route.query": {
      immediate: true,
      handler(newQuery, oldQuery) {
        const query = newQuery;
        this.currentPage = 1
        // alert(newQuery.search);
        const searchdata = query;
        this.searchdata = searchdata;
        this.search = searchdata.search;
        this.sort = searchdata.sort;
        this.per_page = searchdata.per_page;
        this.cursor = searchdata.cursor;
        this.search_type = searchdata.search_type;
        this.$nextTick(() => {
          this.changeSearchPanelContent();
        });

        // this.changeSearchPanelContent();
        if (this.searchdata && "search_type" in this.searchdata) {
          delete this.searchdata["search_type"];
        }
        console.log(searchdata);
        if (searchdata.filter != null)
          searchdata.filter = searchdata.filter.replace(/,$/, "");
        this.searchmethod();
        /**
           * 
           *         filter: this.search_filter,
        search: this.search_search,
        sort: this.search_sort,
        per_page: this.search_perpage,
        page: this.search_page,
        cursor: "",
        search_type: this.search_type,
           */

        // 这里是当查询参数变化时执行的代码
        // 比如，您可以根据新的查询参数重新加载数据
      },
    },
  },
  methods: {
    // ==== CHAT ====
    startDrag(event) {
      const rectWidth = 320;
      const rectHeight = 60;

      const div = document.getElementById("chat");

      if (
        event.clientX <= div.getBoundingClientRect().left + rectWidth &&
        event.clientY <= div.getBoundingClientRect().top + rectHeight
      ) {
        this.isDragging = true;
        this.startX = event.clientX - this.leftDistance;
        this.startY = event.clientY - this.topDistance;
        document.addEventListener("mousemove", this.handleDrag);
        document.addEventListener("mouseup", this.stopDrag);
      }
    },
    handleDrag(event) {
      if (this.isDragging) {
        this.leftDistance = event.clientX - this.startX;
        this.topDistance = event.clientY - this.startY;
      }
    },
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener("mousemove", this.handleDrag);
      document.removeEventListener("mouseup", this.stopDrag);
    },

    changePages(data) {
      this.currentPage = data;
      this.searchmethod(true);
    },
    changeItemPerpage(data) {
      this.itemsPerPage = data;
      this.currentPage = 1
      this.searchmethod(true);
    },
    // #region resultlistToInfoItems
    resultlistToInfoItems() {
      this.infoItems = this.demoInfoItems;
    },
    showDemoResults() {
      this.resultlist = this.demoInfoItems;
      this.resultlistToInfoItems();
      this.totalPages = 1;
      this.currentPage = 1;
      this.progress = 100;
    },

    changeSearchPanelContent() {
      this.searchPanelRef = this.$refs.searchPanelRef.setSearchContent(
        this.search
      );
    },
    //this.$emit('change-item-per-page',itemsPerPage)
    //this.$emit('change-page',page)

    // #region AsideBar
    showAsideBar() {
      this.show_property_search = !this.show_property_search;
    },
    setSearchTypeFromSidebar(type) {
      this.selectedSearchTypeOption = type;
      if (this.$refs.searchPanelRef && this.$refs.searchPanelRef.setSearchType) {
        this.$refs.searchPanelRef.setSearchType(type);
      }
      if (type <= 3) {
        this.search_type = 1;
      } else if (type === 4) {
        this.search_type = 2;
      } else if (type === 5) {
        this.search_type = 3;
      } else if (type === 6) {
        this.search_type = 4;
      }
    },
    submitAdvancedSearch() {
      this.advsearch({ ...this.advancedSearchForm });
    },
    setWorkType() {
      if (this.selectedOption != null) {
        console.log(this.selectedOption);
      }
    },
    // #endregion

    //! 在我重新筛选或者搜索的时候都算是搜索
    setFilterTime(type) {
      if (type == 1) {
        this.filter = "";
      } else if (type == 2) {
        // 2023

        this.filter = "publication_year:2023-";
      } else if (type == 3) {
        // 2022
        this.filter = "publication_year:2022-";
      } else if (type == 4) {
        this.filter = "publication_year:2019-";
      } else if (type == 5) {
        this.filter =
          "publication_year:" +
          this.search_start_time +
          "-" +
          this.search_end_time +
          "";
      }
      this.searchdata.filter = this.filter;
      this.setQuery();
    },
    setJounalType(type) {
      if (type == 0) {
        this.filter = "";
      } else if (type == 1) {
        this.filter = "type:journal";
      } else if (type == 2) {
        this.filter = "type:repository";
      } else if (type == 3) {
        this.filter = "type:conference";
      } else if (type == 4) {
        this.filter = "type:ebook";
      } else if (type == 5) {
        this.filter = "type:platform";
      } else if (type == 6) {
        this.filter = "type:book series";
      }
      this.searchdata.filter = this.filter;
      this.setQuery();
    },

    setLanguage(type) {
      this.accelerate = true;
      this.displayLoading = true;
      this.progress = 0;
      if (type == 1) {
        this.filter = "";
      } else if (type == 2) {
        this.filter = "language:zh-cn";
      } else if (type == 3) {
        this.filter = "language:en";
      }

      this.searchdata.filter = this.filter;
      this.setQuery();
    },

    // instit
    filteByCount(type) {
      if (type == 0) {
        return;
      }
      if (type == 1) {
        // alert(this.filter)
        this.filter = "cited_by_count:>" + this.filte_count_value;
        // alert(this.filter);
        this.setQuery();
      }
    },
    // instit
    filteWorksCount(type) { },
    advsearch(data) {
      this.filter = "";
      if (data.author) {
        this.filter += `author.search:${encodeURIComponent(data.author)},`;
      }
      if (data.publication) {
        this.filter += `source.search:${encodeURIComponent(
          data.publication
        )},`;
      }
      if (data.start_time && data.end_time) {
        this.filter += `publication_year:${data.start_time}-${data.end_time},`;
      }
      if (data.keyword) {
        const field = data.is_key_title ? "title.search" : "abstract.search";
        this.filter += `${field}:${encodeURIComponent(data.keyword)},`;
      }

      console.log(this.filter);
      this.searchdata.filter = this.filter;
      this.setQuery();
    },

    /***
     * display_name
        cited_by_count
        works_count
        publication_date
        relevance_score (only exists if there's a search filter active)
     */
    setQuery() {
      const query = {
        filter: this.filter,
        search: this.search,
        sort: this.sort,
        per_page: this.per_page,
        page: this.page,
        cursor: this.cursor,
        search_type: this.search_type,
      };

      this.$router.push({
        query: query,
      });
    },
    sortByTime(type) {
      if (type == 1) {
        this.sort = "publication_date:";
      }
      // 晚
      else if (type == 2) {
        this.sort = "publication_date:desc";
      }
      this.setQuery();
    },

    sortByWorksCount(type) {
      if (type == 1) {
        this.sort = "works_count:";
      } else if (type == 2) {
        this.sort = "works_count:desc";
      }
      this.setQuery();
    },
    sortByCite(type) {
      if (type == 1) {
        this.sort = "cited_by_count:";
      } else if (type == 2) {
        this.sort = "cited_by_count:desc";
      }
      this.setQuery();
    },

    sortByDisplayName(type) {
      if (type == 1) {
        this.sort = "display_name:";
      } else if (type == 2) {
        this.sort = "display_name:desc";
      }
      this.setQuery();
    },

    handleChildSearchType(searchType) {
      this.search_type = searchType;
    },

    handleModoleSearch(searchdata) {
      // alert("data send to here");
      console.log(searchdata);
      this.searchdata = searchdata;
      this.search = searchdata.search;
      this.sort = searchdata.sort;
      this.per_page = searchdata.per_page;
      this.cursor = searchdata.cursor;
      this.search_type = searchdata.search_type;
      // this.search_type = searchdata.search_type;
      if (this.searchdata && "search_type" in this.searchdata) {
        delete this.searchdata["search_type"];
      }

      // console.log(searchdata);

      this.searchmethod(false);
    },
    // 真正做搜索后端
    // 请传入是否快加速的参数accelerate
    searchmethod(accelerate) {
      this.showDemoResults();
      return;
      if (accelerate) {
        this.accelerate = accelerate;
      }
      this.displayLoading = true;
      this.progress = 0;

      this.per_page = this.itemsPerPage;
      this.page = this.currentPage;
      const searchdata = {
        filter: this.filter.replace(/,$/, ""),
        search: this.search,
        sort: this.sort,
        per_page: this.per_page,
        cursor: this.cursor,
        page: this.page,
      };

      // alert("fuck");
      // this.searchdata.filter = this.filter.replace(/,$/, "");
      // this.searchdata.search = this.search;
      // this.searchdata.sort = this.sort;
      // this.searchdata.per_page = this.per_page;
      // this.searchdata.cursor = this.cursor;
      // this.searchdata.page = this.page;
      // console.log(JSON.parse(JSON.stringify(this.searchdata)));
      // JSON.parse(JSON.stringify(this.searchdata));

      // #region search
      if (this.search_type == 1) {
        Search.searchWorks(searchdata).then(
          (res) => {
            console.log(res.data);

            this.resultlist = res.data.results;
            this.resultlistToInfoItems();

            this.totalPages = Math.ceil(
              res.data.meta.count / res.data.meta.per_page
            );
            this.currentPage = res.data.meta.page;
            // this.totalPages = Math.ceil(this.totalPages/this.currentPage)
            this.per_page = res.data.meta.per_page;
            this.progress = 100;
          },
          () => {
            this.showDemoResults();
          }
        );
      }
      // author
      else if (this.search_type == 2) {
        Search.searchAuthor(searchdata).then(
          (res) => {
            console.log(res.data);
            this.resultlist = res.data.results;
            this.resultlistToInfoItems();

            this.totalPages = Math.ceil(
              res.data.meta.count / res.data.meta.per_page
            );
            this.currentPage = res.data.meta.page;
            // this.totalPages = Math.ceil(this.totalPages/this.currentPage)
            this.per_page = res.data.meta.per_page;

            this.progress = 100;
          },
          () => {
            this.showDemoResults();
          }
        );
      }
      // 期刊
      else if (this.search_type == 3) {
        Search.searchSources(searchdata).then(
          (res) => {
            console.log(res.data.results);
            this.resultlist = res.data.results;
            this.resultlistToInfoItems();

            this.totalPages = Math.ceil(
              res.data.meta.count / res.data.meta.per_page
            );
            this.currentPage = res.data.meta.page;
            // this.totalPages = Math.ceil(this.totalPages/this.currentPage)
            this.per_page = res.data.meta.per_page;

            this.progress = 100;
          },
          () => {
            this.showDemoResults();
          }
        );
      }
      // 机构
      else if (this.search_type == 4) {
        Search.searchInstitutions(searchdata).then(
          (res) => {
            console.log(res.data.results);
            this.resultlist = res.data.results;
            this.resultlistToInfoItems();

            this.totalPages = Math.ceil(
              res.data.meta.count / res.data.meta.per_page
            );
            this.currentPage = res.data.meta.page;
            // this.totalPages = Math.ceil(this.totalPages/this.currentPage)
            this.per_page = res.data.meta.per_page;

            this.progress = 100;
          },
          () => {
            this.showDemoResults();
          }
        );
      }
    },
    autoComplete() {
      let data = {
        q: this.search,
      };
      console.log(data);
      if (this.search_type == 1) {
        AutoComplete.getAutoWorks(data).then((response) => {
          this.autoCompleteLists = response.data.results;
        });
      } else if (this.search_type == 2) {
        AutoComplete.getAutoAuthor(data).then((response) => {
          this.autoCompleteLists = response.data.results;
        });
      } else if (this.search_type == 3) {
        AutoComplete.getAutoConcepts(data).then((response) => {
          this.autoCompleteLists = response.data.results;
        });
      } else if (this.search_type == 4) {
        AutoComplete.getAutoInstitutions(data).then((response) => {
          this.autoCompleteLists = response.data.results;
        });
      }
    },

    // search
  },



  mounted() {
    this.showDemoResults();
    // let htmlString =
    //   "<title>Depth-image-based rendering (DIBR), compression, and transmission for a new approach on 3D-TV</title>";
    //   this.test_v_html = htmlString
    // let parser = new DOMParser();
    // let doc = parser.parseFromString(htmlString, "text/html");
    // let title = doc.querySelector("title").textContent;
    // alert(title);

    // const searchdata = this.$route.query;
    // this.searchdata = searchdata;
    // this.search = searchdata.search;
    // this.sort = searchdata.sort;
    // this.per_page = searchdata.per_page;
    // this.cursor = searchdata.cursor;
    // this.search_type = searchdata.search_type;
    // this.changeSearchPanelContent();
    // if (this.searchdata && "search_type" in this.searchdata) {
    //   delete this.searchdata["search_type"];
    // }
    // console.log(searchdata);
    // if (searchdata.filter != null)
    //   searchdata.filter = searchdata.filter.replace(/,$/, "");
    // this.searchmethod();
  },

  computed: {
    currentComponent() {
      // alert(
      //   "current search type decide the component render",
      //   this.search_type
      // );
      switch (this.search_type) {
        case 1:
          return ref("SearchResultListItem"); // 搜索结果
        case 2:
          return ref("ScholarListItem"); // 学者列表项
        case 3:
          return ref("JournalListItem"); // 期刊列表项
        case 4:
          return ref("InstitutionListItem"); // 机构列表项
        default:
          return null; // 默认情况（可选）
      }
    },
  },
};
</script>
  
<style scoped>
* {
  box-sizing: border-box;
  max-width: 100%;
  /* overflow: hidden; */
}

svg {
  cursor: pointer;
}

.main-area {
  /* border: 2px solid blue; */
  display: flex;
  justify-content: flex-start;
  gap: 28px;
  width: calc(100% - 40px);
  max-width: 1320px;
  margin: 24px 0 70px 20px;
}

.cond-area {
  width: 168px;
  /* height: 600px; */
  margin-top: 0;
  margin-left: 0;

  /* display: flex; */
  justify-content: center;
  align-items: center;
  font-size: 30px;
  flex: none;
  position: sticky;
  top: 76px;
  align-self: flex-start;
}

.side-section {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: var(--border-soft);
  text-align: left;
}

.side-section h3 {
  color: var(--theme-mode-high-contrast);
  font-size: 13px;
  font-weight: 650;
  margin-bottom: 10px;
}

.side-option {
  width: 100%;
  height: auto;
  display: block;
  padding: 6px 8px;
  background: transparent;
  color: var(--theme-mode-high-contrast);
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
}

.side-option:hover,
.side-option.active {
  color: var(--theme-mode-very-high-contrast);
  background: var(--theme-mode-slight-contrast);
  text-decoration: none;
}

.advanced-search-section {
  display: grid;
  gap: 12px;
}

.advanced-search-section label {
  display: grid;
  gap: 6px;
  text-align: left;
}

.advanced-search-section label span,
.time-range span {
  color: var(--theme-mode-high-contrast);
  font-size: 13px;
  line-height: 1.4;
}

.advanced-search-section .basic-input {
  width: 100%;
  height: 38px;
  font-size: 14px;
}

.time-range {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
}

.checkbox-row {
  grid-template-columns: auto 1fr;
  justify-content: center;
  align-items: center;
  text-align: left;
}

.checkbox-row input {
  width: 14px;
  height: 14px;
}

.advanced-submit {
  width: 100%;
  height: 36px;
  margin-top: 2px;
}

.cond-area .filter-switch,
.cond-area .sort-switch {
  background: transparent;
  border-radius: 0;
  cursor: pointer;
  transition: all ease-in-out 0.15s;
  text-align: left;
  margin: 0 auto;
  margin-bottom: 12px;
  padding: 8px 0;
  font-size: 13px;
  width: 100%;
  font-weight: 650;
  color: var(--theme-mode-very-high-contrast);
  box-shadow: none;
  border-bottom: var(--border-soft);
}

.cond-area .filter-switch:hover,
.cond-area .sort-switch:hover {
  background: transparent;
  color: var(--theme-mode-very-high-contrast);
  text-decoration: none;
  padding: 8px 0;
}

.cond-area .filter-switch-active,
.cond-area .sort-switch-active {
  background: transparent;
  color: var(--theme-mode-very-high-contrast);
}

.cond-area .filter-card {
  border: 0;
  border-bottom: var(--border-soft);
  margin-top: 12px;
  margin-bottom: 12px;
  border-radius: 0;
  z-index: 99999;
  background: transparent;
  box-shadow: none;
  overflow: hidden;
  display: block;
}
.search-button{
  display: block;
  width: 100%;
}
.cond-area .filter-card li {
  padding: 7px 0;
  border-bottom: 0;
  /* 条目之间的分隔线 */
  cursor: pointer;
  display: flex;
  align-items: center;
  font-family: inherit;
  transition: all ease-in-out 0.2s;
  justify-content: space-between;
  font-size: 13px;
  line-height: 1.35;
  color: var(--theme-mode-high-contrast);
}

.cond-area .filter-card li:hover {
  background: transparent;
  color: var(--theme-mode-very-high-contrast);
}

.search-container-wrapper {
  flex: 1;
  min-width: 0;
  position: relative;
  height: auto;
  overflow: visible;
}

.search-container-wrapper::-webkit-scrollbar {
  display: none !important;
}

.search-bar {
  /* border: 2px solid red; */
  height: 60px;
  /* width: 500px; */
  margin-top: 30px;
  /* margin-left: 30px; */

  display: flex;
  /* justify-content: center; */
  align-items: center;
  font-size: 30px;
}

.search-input {
  max-width: 640px;
  width: 80%;
  border-color: var(--theme-mode-contrast);
  border-width: 2px;
}

.search-btn {
  width: 50px;
  height: 50px;
  margin: 0;
  margin-left: 10px;
}

.search-btn svg {
  width: 30px;
  height: 30px;
  margin: auto;
}

.pagination {
  margin: 0 auto;
  margin-top: 26px;
  padding: 0;
}

.search-container {
  padding: 0;
  width: 100%;
  margin-bottom: 18px;
}

.chat {
  width: 320px;
  display: flex;
  align-items: flex-start;
  position: absolute;
  z-index: 9999;
  box-shadow: none;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 6px;
  background: var(--theme-mode-like);
  border: var(--border-soft);
}

/* .chat svg {
  fill: var(--default-text-color);
  
  margin-right: 10px;
  cursor: pointer;
} */

.fold-icon {
  width: 30px;
  height: 30px;
  position: absolute;
  right: 10px;
  top: 15px;
  z-index: 200;
}

.talk-hint-container {
  cursor: grab;
  width: 100%;
}

.dragging .talk-hint-container {
  cursor: grabbing;
}

.talk-hint {
  font-size: 16px;
  margin: 0 20px;
  font-weight: 700;
}


.unfold-chat {
  width: 30px;
  height: 30px;
  position: absolute;
  right: 5px;
  top: 5px;
  fill: var(--default-text-color);
}

@media screen and (max-width: 1000px) {
  .main-area {
    display: block;
    width: calc(100% - 32px);
    margin-left: 16px;
    margin-right: 16px;
  }

  .cond-area {
    width: 100%;
    height: unset;
    /* min-height: 300px; */
    display: block;
    position: static;
    margin-bottom: 20px;
  }

  .cond-area .filter-switch,
  .cond-area .sort-switch {
    width: 100%;
    padding: 8px 0;
    margin: 12px auto;
  }

  .cond-area .filter-switch:hover,
  .cond-area .sort-switch:hover {
    background: transparent;
    color: var(--theme-mode-very-high-contrast);
    text-decoration: none;
    padding: 8px 0;
  }

  .search-container-wrapper {
    margin: 0 auto;
    width: 100%;
  }
}

@media screen and (max-width: 1000px) {
  .search-container-wrapper {
    padding-top: 18px;
  }
}

@media screen and (max-width: 600px) {
  .search-container-wrapper {
    padding-left: 0;
    padding-right: 0;
    width: 100%;
    margin: 0 auto ;
  }

  .main-area {
    width: calc(100% - 24px);
    margin-left: 12px;
    margin-right: 12px;
  }
}

</style>
