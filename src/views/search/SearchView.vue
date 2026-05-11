<template>
  <div>
    <!-- <AsideBar @setSearchType="setSearchType" @advsearch="advsearch"></AsideBar> -->
    <main class="container">
      <section class="search-panel">
        <h2>
          {{ $t("ipaper_scholar_text") }}
        </h2>
        <div class="search-container">
          <SearchPanel></SearchPanel>
        </div>
        <!-- <search></search> -->
        <!-- <search></search> -->
      </section>
      <section class="recommendation">
        <div>
          <h3 id="anchor-rec">{{ $t('recommend_for_you') }}</h3>
          <svg @click="scrollToAnchor('anchor-hot')"
            t="1703145799149" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2081" id="mx_n_1703145799150" width="200" height="200"><path d="M764.326842 578.044182l-222.712361 222.722594c-3.837398 3.837398-9.046027 5.996574-14.479783 5.996574-5.423523 0-10.632151-2.159176-14.46955-5.996574l-222.722594-222.732827c-7.992021-7.992021-7.992021-20.947078 0-28.939099s20.947078-7.992021 28.939099 0l187.78692 187.78692 0-603.89392c0-11.307533 9.15859-20.466124 20.466124-20.466124s20.466124 9.15859 20.466124 20.466124l0 603.89392 187.776687-187.776687c8.002254-7.992021 20.957311-7.992021 28.949332 0S772.318864 570.052161 764.326842 578.044182z" p-id="2082"></path><path d="M842.875826 858.071923c0 11.2973-9.15859 20.466124-20.466124 20.466124l-590.550007 0c-11.307533 0-20.466124-9.168824-20.466124-20.466124 0-11.307533 9.15859-20.466124 20.466124-20.466124l590.550007 0C833.717236 837.605799 842.875826 846.76439 842.875826 858.071923z" p-id="2083"></path></svg>
          <InterestRecommendation/>
        </div>
        <div>
          <h3 id="anchor-hot">{{ $t('hotspots') }}</h3>
          <svg @click="scrollToAnchor('anchor-rec')"
            t="1703145975593" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2151" width="200" height="200"><path d="M764.326842 459.350896c-7.992021 7.992021-20.947078 7.992021-28.949332 0l-187.776687-187.78692 0 603.904153c0 11.2973-9.15859 20.466124-20.466124 20.466124s-20.466124-9.168824-20.466124-20.466124l0-603.904153-187.78692 187.797154c-3.990894 3.990894-9.230222 5.986341-14.46955 5.986341s-10.468422-1.995447-14.46955-5.986341c-7.992021-8.002254-7.992021-20.957311 0-28.949332l222.722594-222.722594c3.837398-3.837398 9.046027-5.996574 14.46955-5.996574 5.433756 0 10.642384 2.159176 14.479783 5.996574l222.712361 222.712361C772.318864 438.393585 772.318864 451.348642 764.326842 459.350896z" p-id="2152"></path><path d="M842.875826 150.384056c0 11.2973-9.15859 20.466124-20.466124 20.466124l-590.550007 0c-11.307533 0-20.466124-9.168824-20.466124-20.466124 0-11.307533 9.15859-20.466124 20.466124-20.466124l590.550007 0C833.717236 129.917932 842.875826 139.076522 842.875826 150.384056z" p-id="2153"></path></svg>
          <ArticleRecommendation/>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import i18n from "../../language";

import ArticleRecommendation from "../../components/recommendation/ArticleRecommendation.vue";
import InterestRecommendation from "../../components/recommendation/InterestRecommendation.vue";

import AsideBar from "../../components/search-property/AsideBar.vue";
import SearchPanel from "./SearchPanel.vue";
export default {
  name: "SearchView",
  components: {
    i18n,
    AsideBar,
    ArticleRecommendation,
    InterestRecommendation,
    SearchPanel
  },
  data() {
    return {
    };
  },

  methods: {
    scrollToAnchor(anchor) {
      const offset =  document.getElementById(anchor).getBoundingClientRect().top 
                      - document.body.getBoundingClientRect().top - 60
      window.scrollTo({ top: offset, behavior: 'smooth' })
    }
  },
};
</script>
<style scoped>
* {
  max-width: 100%;
  /* overflow: hidden; */
}
.container {
  width: min(1180px, calc(100% - 48px));
  /* height: calc(100vh - 80px); */
  margin: 0 auto 72px;
}

.search-panel h2 {
  color: var(--theme-mode-very-high-contrast);
  text-align: center;
  padding: 54px 0 34px;
  font-size: 48px;
  font-weight: 650;
  line-height: 1.15;
  position: relative;
  z-index: 10;
}

.suggestion-active {
  background: var(--theme-mode-contrast);
  font-weight: bold;
}

.recommendation {
  width: 100%;
  margin: 0 auto;
}

.recommendation h3 {
  color: var(--theme-mode-very-high-contrast);
  font-size: 26px;
  font-weight: 650;
  line-height: 1.2;
  padding-left: 0;
  border-left: 0;
  padding-bottom: 12px;
  border-bottom: var(--border-soft);
}

.recommendation div:nth-of-type(2) {
  margin-top: 34px;
}

.recommendation div {
  position: relative;
}

.recommendation svg {
  width: 36px;
  height: 36px;
  position: absolute;
  right: 0;
  top: 0;
  /* margin-right: 15%; */
  margin-top: 2px;
  fill: var(--theme-mode-very-high-contrast);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  background: transparent;
  box-sizing: border-box;
  transition: .2s ease;
}

.recommendation svg:hover {
  background: var(--theme-mode-slight-contrast);
  fill: var(--theme-mode-very-high-contrast);
}

.search-container {
  width: min(760px, 100%);
  margin: 0 auto;
  margin-bottom: 58px;
  /* display: flex;
  justify-content: center; */
}

@media screen and (max-width: 960px) {
  .recommendation svg {
    margin-right: 0;
  }
}

@media screen and (max-width: 450px) {
  .search-panel h2 {
    font-size: 36px;
  }

  .recommendation {
    width: 100%;
  }

  .container {
    width: min(100% - 28px, 1180px);
  }
}

/* for property search */

.aside {
  width: 20%;
  top: 20%;
  height: 80%;
  position: relative;
  z-index: 1;
  /* background-color: lightblue;
  background-color: antiquewhite; */
  position: absolute;
}
</style>
