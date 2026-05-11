<template>
<div >
  <ul style="margin:0 auto">
    <li  v-for="(article, index) in articles" :key="index">
      <h3 @click="JumpArticle(article.paper_id)">{{ article.title }}</h3>
      <p class="abstract" v-ellipsis="{ maxLine: 3, maxWidth: '100%', wrappable: false}">
        {{ article.abstract }}
      </p>
      <span v-for="(author, index) in article.authorships" :key="index" class="author">
        {{ author.author.display_name }}
      </span>
      <p v-if="article.primary_location != null && article.primary_location.source != null" class="journal">
            {{ article.primary_location.source.display_name }}
      </p>
    </li>
  </ul>
</div>
</template>

<script>
import { Article } from '../../api/article.js';
export default {
  name: 'InterestRecommendation',
  data() {
    return {
      articles: [],
    }
  },
  mounted() {
      Article.getInterestRecommend().then(
        response => {
          this.articles = response.data
          console.log(this.articles)
        }
      )
  },


  methods:{
    JumpArticle(paper_id){
      this.$router.push({
        path: "/paper_detail/" + paper_id,
        url: this.url
        
      })
    }
  }
}
</script>

<style scoped>
ul {
  width: min(920px, 100%);
}

li {
  padding: 22px 0;
  box-sizing: border-box;
  border-bottom: var(--border-soft);
  background: transparent;
  box-shadow: none;
  transition: .2s ease;
}

li:not(:last-of-type) {
  margin-bottom: 0;
}

li:hover {
  border-color: #c9c9c9;
  transform: none;
}

li h3 {
  color: var(--theme-mode-very-high-contrast);
  font-size: 20px;
  line-height: 1.35;
  font-weight: 650;
  cursor: pointer;
}

li:hover h3 {
  text-decoration: underline;
}

.abstract {
  color: var(--theme-mode-high-contrast);
  font-size: 14px;
  line-height: 1.65;
  margin: 8px 0;
}

.author, .journal {
  font-size: 14px;
  font-weight: 600;
  color: var(--theme-mode-high-contrast);
  margin-right: 12px;
}

@media screen and (max-width: 960px) {
  ul {
    width: 100%;
  }
}
  </style>
