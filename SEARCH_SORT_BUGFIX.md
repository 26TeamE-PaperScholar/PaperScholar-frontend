# 搜索排序 Bug 修复说明

## 问题现象

搜索关键词（如 `attention is all`）时，结果列表里出现大量不相关的论文。
但**直接调用后端接口是正确的**，说明问题出在前端构造请求的方式上。

## 根因

后端约定：
- `sort` 参数**不传 / 为空** → 按**相关性**排序（relevance）
- `sort` 支持多个字段用逗号分隔，例如 `relevance_score:desc,cited_by_count:desc` 表示**先按相关性、再按引用量**排序

而前端把默认排序**硬编码成了引用量降序** `cited_by_count:desc`，并且在多个地方做了"兜底"——只要 sort 为空就强制改成 `cited_by_count:desc`，导致：

1. 每次新搜索都默认按引用量排，而不是相关性；
2. 前端根本无法表达"相关性"这个状态（排序下拉里压根没有相关性选项）；
3. 即使后端按相关性返回，前端还会用 `sortItemsForCurrentPage()` 把当前页**再按引用量本地重排一遍**，进一步打乱相关性顺序。

### 接口验证对比（`search=attention is all`）

| 排序方式 | 第 1 条结果 |
|---|---|
| 相关性（`relevance_score:desc,cited_by_count:desc`） | ✅ Attention Is All You Need |
| 引用量（`cited_by_count:desc`） | ❌ From ultrasoft pseudopotentials...（完全不相关的高引论文） |

## 修复方案

默认排序改为后端建议的 **`relevance_score:desc,cited_by_count:desc`**（先相关性、再引用量），
并在排序选项里新增「相关性」选项放在最上面，作为默认选中项。

### 改动文件

**1. `src/views/search-result/SearchResultView.vue`（核心）**

- 新增常量 `RELEVANCE_SORT = 'relevance_score:desc,cited_by_count:desc'`。
- `SORT_OPTIONS` / `ENTITY_SORT_OPTIONS`：在最前面加入「相关性」选项（`value: RELEVANCE_SORT`, `labelKey: 'sort_relevance'`）。
- `normalizeSortValue()`：空值兜底从 `cited_by_count:desc` 改为 `RELEVANCE_SORT`。
- `normalizeSortForType()`：非法 sort 的兜底从 `cited_by_count:desc` 改为 `RELEVANCE_SORT`。
- `sortItemsForCurrentPage()`：当排序为相关性时**直接返回原顺序，不做前端二次排序**，保留后端的相关性排名。
- `data()` 初始值：`sort` / `activeSort` / `quickSort` 从 `cited_by_count:desc` 改为 `RELEVANCE_SORT`。
- 路由 `$route.query` watcher：`q.sort` 缺省值从 `cited_by_count:desc` 改为 `RELEVANCE_SORT`。

**2. `src/language/modules/zh.js` / `src/language/modules/en.js`**

- 新增文案 `sort_relevance`：中文「相关性」/ 英文「Relevance」。

### 未改动的地方（刻意保留）

- `src/views/search/SearchView.vue` 的 `viewMore()` 仍用 `cited_by_count:desc`。
  该入口是首页「推荐 / 热门」列表的"查看更多"，**不带搜索关键词**，纯浏览场景下相关性没有意义，按引用量排是合理的浏览默认。

## 验证方式

1. `npm run dev`（已配置真实后端，`.env.local` 中 `VITE_USE_MOCK=false`）。
2. 在搜索框输入 `attention is all` 并搜索。
3. 预期：第一条结果为 **Attention Is All You Need**，排序下拉默认选中「相关性」。
4. 切换到「引用 高 → 低」等其它排序仍正常工作。

接口层验证（通过前端代理）：

```bash
curl "http://localhost:5173/api/search/works/?search=attention%20is%20all&sort=relevance_score:desc,cited_by_count:desc&per_page=3&page=1"
# 第 1 条应为 Attention Is All You Need
```
