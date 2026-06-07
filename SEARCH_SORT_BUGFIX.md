# 搜索排序行为说明

## 当前规则

- 没有已提交关键词时，结果页是浏览态，默认使用 `cited_by_count:desc`，即「引用 高 -> 低」。
- 只有用户通过搜索按钮或回车提交关键词后，才进入关键词检索态。
- 关键词检索态默认使用 `relevance_score:desc,cited_by_count:desc`，即「相关性」优先、引用量兜底。
- 用户只是在输入框里打字，不会被视为关键词检索；排序、筛选、分页仍沿用已经提交的关键词。

## 前端实现要点

**`src/views/search-result/SearchResultView.vue`**

- `DEFAULT_BROWSE_SORT = 'cited_by_count:desc'` 表示无关键词浏览默认排序。
- `RELEVANCE_SORT = 'relevance_score:desc,cited_by_count:desc'` 表示关键词检索默认排序。
- 排序选项由已提交关键词动态决定：无关键词时隐藏「相关性」，有关键词时显示「相关性」。
- `setQuery()` 默认使用 `submittedSearch`，只有 `submitMainSearch()` 会读取输入框草稿。
- 删除了结果页内原有的 explore landing 分支，无关键词访问结果页时直接展示引用降序结果。

**`src/components/nav-bar/NavBar.vue`**

- 导航中的「探索」入口进入 `/search_result?search_type=1&per_page=10&page=1`，走空关键词浏览态。
- 顶部搜索提交时不再传空 `sort` / `filter` / `cursor` 参数。

## 验证方式

1. 打开 `/search_result?search_type=1&per_page=10&page=1`。
2. 预期排序里没有「相关性」，默认选中「引用 高 -> 低」。
3. 在结果页输入关键词并点击「搜索」。
4. 预期排序里出现「相关性」，并默认选中「相关性」。
5. 只输入关键词但不提交，再点击排序或筛选，预期不会按输入框内容检索。
