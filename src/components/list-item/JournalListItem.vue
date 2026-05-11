<template>
  <div :class="['out-border', { 'out-border-full': isExpanded }]">
    <a :href=infoItem.homepage_url><h3 @click="jumpDetailView" class="title">
      {{ infoItem.display_name }}
    </h3></a>
    <span class="profile">
      {{ $t("institution_region") }}{{ infoItem.country_code }}
    </span>
    <span class="profile">
      {{ $t("journal_type") }}{{ infoItem.type }}
    </span>
    <span class="profile">
      {{ $t("institution_works_count") }}{{ infoItem.works_count }}
    </span>
    <span class="profile">
      {{ $t("institution_cited_by_count")
      }}{{ infoItem.cited_by_count }}
    </span>
  </div>
</template>

<script>
import i18n from "../../language";

export default {
  props: ["infoItem"],
  components: {
    i18n,
  },
  data() {
    return {
      isExpanded: false,
    };
  },
  mounted() {
    console.log(this.infoItem);
  },
  methods: {
    jumpDetailView() {
      console.log(this.infoItem.homepage_url)
      // alert(this.infoItem.url)
      // this.$router.push({
      //   path: "/institution_detail/" + this.infoItem.id,
      // });
    },
  },
  computed: {},
};
</script>

<style scoped>
.out-border {
  /* border: 1px solid red; */
  width: 100%;
  min-height: 86px;
  position: relative;
  border-bottom: var(--border-soft);
  margin-bottom: 0;
  padding: 22px 0;
  background: transparent;
  box-shadow: none;
  transition: .2s ease;
}
.out-border:hover {
  border-color: #c9c9c9;
  transform: none;
}
.out-border-full {
  /* border: 1px solid red; */
  width: 700px;
  height: unset;
}
.title {
  font-size: 20px;
  line-height: 1.35;
  font-weight: 650;
  color: var(--theme-mode-very-high-contrast);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  cursor: pointer;
}

.title:hover {
  color: var(--theme-mode-very-high-contrast);
  text-decoration: none;
}

.profile {
  font-size: 14px;
  color: var(--theme-mode-high-contrast);
  margin-right: 8px;
  margin-top: 12px;
  display: inline-block;
  padding: 0;
  border-radius: 0;
  background: transparent;
  font-weight: 600;
}
</style>
