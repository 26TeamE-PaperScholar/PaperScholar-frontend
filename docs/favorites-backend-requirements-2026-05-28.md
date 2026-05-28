# 收藏功能后端对接需求

**日期**：2026-05-28
**来源**：前端联调（PaperScholar-fronted main 分支，对接 `http://1.95.137.119:8080/api/`）
**面向**：后端团队
**前置文档**：`docs/backend-issues-2026-05-22.md`（既有联调问题汇总）

---

## 1. 背景

2026-05-28 前端走查收藏功能全链路，发现多处不可用或与后端契约对不上。本文档把"需要后端配合的部分"沉淀为需求清单，与"前端单方面就能修的部分"分开。

前端代码层面的修复（参数错传、UI 无限循环、删改无确认/无回滚等）由前端在另一组 commit 中处理，本文档第 8 节简要列出。

---

## 2. 后端现状（基于 swagger + curl 实测 @ 2026-05-28 17:21）

测试账号：`1850464693@qq.com`（user_id=11）

### 2.1 已有接口

| 方法 | 路径 | swagger summary | 说明 |
|---|---|---|---|
| POST | `/accounts/login/` | 登录 | 设 `csrftoken`/`user_id` cookie |
| GET | `/users/favorite/list/{pk}/` | 获取当前层级收藏列表 | `pk=0` 为根（列收藏夹）；`pk=folder_id` 列夹内论文 |
| GET | `/users/favorite/{id}/` | 获取收藏详情 | 返回 `{id, name, is_paper, add_time}` |
| PUT | `/users/favorite/{id}/` | 更新收藏详情 | 接受 `FavoriteSlz` 全字段 |
| PATCH | `/users/favorite/{id}/` | 部分更新收藏详情 | 同上 |
| POST | `/users/favorite/create/{id}/` | 创建收藏夹 | `pk` 必须为 0（swagger desc 注明） |
| POST | `/users/favorite/collect/{id}/` | 收藏论文到收藏夹 | body `{paper_id}` |
| POST | `/users/favorite/rename/{id}/` | 重命名收藏夹 | body `{name}` |
| DELETE | `/users/favorite/delete/{id}/` | 删除 | 删除收藏夹或单条收藏（folder vs paper entry 均走此口） |

### 2.2 实测响应示例

```bash
# 列根（所有收藏夹）
GET /api/users/favorite/list/0/
→ 200
[
  {"id":16,"name":"默认收藏夹","is_paper":false,"add_time":"2026-05-22 19:56:33"},
  {"id":58,"name":"111","is_paper":false,"add_time":"2026-05-28 15:59:58"},
  ...
]

# 收藏夹详情
GET /api/users/favorite/16/
→ 200
{"id":16,"name":"默认收藏夹","is_paper":false,"add_time":"2026-05-22 19:56:33"}
# ⚠ 没有 paper_count、没有 papers 字段

# 列夹内论文
GET /api/users/favorite/list/64/
→ 200
[
  {
    "id":"W2787959293",        # 注意是 OpenAlex paper_id
    "name":"默认收藏夹",         # ⚠ 这里是 folder 名而不是 paper title
    "is_paper":true,
    "add_time":"2026-05-28 17:21:40",
    "doi":"...","title":"Fractional Differential Equations",
    "abstract":"...","publication_year":2025,
    "favorite_id":65,           # ✅ 用于后续 delete/move 的关键字段
    ...                          # 大量 OpenAlex 透传字段
  }
]

# 创建收藏夹
POST /api/users/favorite/create/0/  body: {"name":"probe-test"}
→ 201  {"id":64}
# ⚠ 没有返回 name、add_time，前端只能本地兜底拼装

# 收藏论文
POST /api/users/favorite/collect/64/  body: {"paper_id":"W2787959293"}
→ 201  {"id":65}
# ⚠ 没有返回 favorite_id 字段名、没有论文摘要信息

# 错误样例：folder_id 不属于当前用户 / 不存在
GET /api/users/favorite/list/11/      # 11 是 user_id，非 folder_id
→ 500  Django DEBUG HTML 异常页（DoesNotExist at /api/users/favorite/list/11/）
# ⚠ 不是 JSON，前端无法解析；且 5xx 让 axios 进 catch 分支，无业务语义
```

### 2.3 swagger 文档与实际行为不一致

| 接口 | swagger 声明 | 实际返回 | 问题 |
|---|---|---|---|
| `POST /create/{id}/` | `FavoriteCreateSlz {name}` | `{id}` | 字段完全不同 |
| `POST /collect/{id}/` | `PaperCollectSlz {paper_id}` | `{id}` | 字段完全不同 |
| `GET /list/{id}/` | `{}` | 异构数组（folder 项 vs paper 项字段差异大） | schema 未声明 |
| `POST /rename/{id}/` | `FavoriteRenameSlz {name}` | （未验证） | 待确认 |

---

## 3. 前端期待的完整功能

按用户视角列出：

1. **查看我的收藏夹列表**（个人主页 `/personal_homepage` → 收藏页签）
2. **创建收藏夹**
3. **重命名收藏夹**
4. **删除收藏夹**（含其内所有收藏）
5. **查看收藏夹内论文**（弹窗 `FavorateContentModal`）
6. **把论文加入收藏夹**（论文页/搜索结果页"加入收藏夹"按钮 → `ChooseFavoriteModal`）
7. **从收藏夹移除单篇论文**
8. **把单篇论文从一个收藏夹移动到另一个**
9. **论文页判断"是否已收藏"**（用于显示已收藏状态、切换"取消收藏"）

---

## 4. 现状与期待差距（请后端处理项）

按优先级标注；P0 强烈建议本期解决，P1 是增强（不做的话前端自行兜底，但体验差），P2 是清理。

### D1（P0）`POST /collect/{id}/` 应校验 `paper_id` 格式

**现状**：`paper_id` 不做格式校验，落到 OpenAlex 触发其 404，被后端包成 502（参见 `backend-issues-2026-05-22.md` 同类问题）。

**期待**：
- 后端接到非 `^W\d+$` 的 `paper_id` 直接返回 400 + JSON `{"detail":"invalid paper_id"}`
- OpenAlex 404 时返回 404 + JSON `{"detail":"paper not found in OpenAlex"}`，而不是包成 502

**理由**：前端目前的容错代码已经处理 404/400 → "论文不存在"提示；但 502 走 toast"网络错误"路径，体验割裂。

### D2（P0）`POST /create/{0}/` 返回应包含 `name` + `add_time`

**现状**：仅返回 `{id}`。

**期待**：
```json
201 {"id":64, "name":"probe-test", "is_paper":false, "add_time":"2026-05-28 17:21:31"}
```

**理由**：前端创建后要立即在列表插入新项渲染。当前前端用本地输入回退拼装 `name` 没问题，但 `add_time` 拼不出（前后端时钟不同步）；统一让后端授时是清洁做法。

### D3（P0）`POST /collect/{id}/` 返回应包含 `favorite_id` 字段名 + 论文摘要

**现状**：返回 `{id}`，前端不确定这个 `id` 是新建 Favorite 记录的 PK（即 `favorite_id`）还是别的。

**期待**：
```json
201 {"favorite_id":65, "folder_id":64, "paper_id":"W2787959293", "add_time":"..."}
```
（不需要返回完整 paper，前端已有 paper 数据）

**理由**：明确字段名避免误解；前端 optimistic update 需要 `favorite_id` 才能在用户立刻"取消收藏"时调用 `DELETE /delete/{favorite_id}/`。

### D4（P0）`GET /list/{folder_id}/` 异常时应返 404 而不是 500

**现状**：传不存在或不属于当前用户的 folder_id 时，落 Django `DoesNotExist`，返回 500 HTML 调试页。

**期待**：
- 不存在 / 不属于当前用户 → `404 {"detail":"folder not found"}`
- 也建议生产环境关掉 `DEBUG=True`（避免泄漏内部路径与 traceback；这是安全问题，前述 `backend-issues-2026-05-22.md` 已提）

**理由**：前端 axios 拦截器对 5xx 走"重试"路径，但这其实是用户输入错误（虽然前端会修参数 bug，但防御性建议保留）。

### D5（P0）`GET /favorite/{id}/`（folder 详情）建议增字段 `paper_count`

**现状**：返回 `{id, name, is_paper, add_time}`，没有夹内论文数量。

**期待**：
```json
{"id":16, "name":"默认收藏夹", "is_paper":false, "add_time":"...", "paper_count":3}
```

**理由**：个人主页要显示"我的 N 个收藏夹，共 M 篇论文"，目前前端必须遍历所有 folder 调 `list/{id}` 才能算出 M，N+1 请求严重。也可考虑在 `list/0/` 的每个 folder 项里就带 `paper_count`，更省一次往返。

### D6（P1，**新接口**）`GET /favorite/check/?paper_id=Wxxxx`

**现状**：无此接口。

**期待**：
```
GET /api/users/favorite/check/?paper_id=W2787959293
→ 200 {"collected":true, "entries":[
   {"favorite_id":65, "folder_id":64, "folder_name":"probe-test"}
]}
```
（同一篇论文可能在多个收藏夹里；返回数组覆盖该场景）

**理由**：论文页要显示"已收藏"图标 + 提供"取消收藏"入口。

**如果后端不做**：前端 fallback 方案——打开论文页时遍历用户所有 folder 调 `list/{folder_id}` 反查 `favorite_id`。N+1 请求，但用户的 folder 通常 ≤ 10 个，可接受。**前端会先按 fallback 实现，等后端有此接口再切**。

### D7（P1，**新接口**）`POST /favorite/move/{favorite_id}/`

**现状**：无原子移动接口；前端只能"先 collect 新夹、再 delete 旧条目"两步级联。

**期待**：
```
POST /api/users/favorite/move/{favorite_id}/  body: {"target_folder_id":58}
→ 200 {"favorite_id":65, "folder_id":58}
```

**理由**：两步级联存在中间失败可能（collect 成功但 delete 失败 → 论文同时存在于两个夹，与"移动"语义不符）。

**如果后端不做**：前端在"先 collect 新夹"成功之后，仅当 delete 旧条目也成功才显示"移动成功"toast；任一步失败给出明确错误并尝试回滚（删除已 collect 的新条目）。

### D8（P1）修正 swagger 响应 schema

请按 §2.3 表格列出的差异，更新 swagger 的 `responses` 描述至与实际行为一致。前端 + 测试都依赖 swagger 作为单一事实源。

### D9（P2）`PUT/PATCH /favorite/{id}/` 用途说明

**现状**：swagger 允许通过 PUT/PATCH 修改 `id, name, is_paper, add_time` 全部字段。但：
- `id` 不应可改
- `is_paper` 是 folder/paper 区分标志，不应跨类型变更
- `add_time` 改了会影响列表排序，业务上谁需要改？

**期待**：要么把 PUT/PATCH 砍掉（统一用 `/rename/{id}/`），要么明确仅允许改 `name` 并在 schema 中限定。

### D10（P2）`create/{pk}/` 的 pk 是否真的"必须为 0"？

swagger desc 写"当前不支持收藏夹层级嵌套，pk必须为0"，但接口路径允许任意 pk。请确认：
- 是否对非 0 的 pk 返回 400？
- 嵌套收藏夹是否在 roadmap 上？（影响前端是否要预留 UI）

---

## 5. 字段约定建议

为减少字段名混乱，建议后端统一以下命名（与本文 §4 D2/D3/D5 一致）：

### Folder 项（in `list/0/` 和 `get /favorite/{id}/`）
```json
{
  "id": 16,
  "name": "默认收藏夹",
  "is_paper": false,
  "add_time": "2026-05-22 19:56:33",
  "paper_count": 3
}
```

### Paper 项（in `list/{folder_id}/`）
```json
{
  "favorite_id": 65,             // 主键，用于 delete/move
  "folder_id": 64,
  "paper_id": "W2787959293",     // OpenAlex ID
  "add_time": "2026-05-28 17:21:40",
  "is_paper": true,
  // 以下 OpenAlex 透传字段保持现状
  "title": "...", "abstract": "...", "doi": "...", ...
}
```
**关键变更**：`id` 字段冲突——目前后端把 OpenAlex `paper_id` 放到 `id` 字段位置，而 folder 项的 `id` 是数据库 PK；同一字段名含义不一致。建议把 paper 项里的 OpenAlex ID 改名 `paper_id`，数据库 PK 用 `favorite_id`。

### Create / Collect / Move 返回
见 §4 D2 / D3 / D7。

---

## 6. 错误码约定

| 状态 | 适用场景 | body 示例 |
|---|---|---|
| 200 / 201 | 成功 | 业务数据 |
| 400 | 参数格式错误（paper_id 非 `^W\d+$`、name 空串、folder_id 非整数） | `{"detail":"invalid paper_id format"}` |
| 401 | 未登录 | `{"detail":"authentication required"}` |
| 403 | 收藏夹不属于当前用户 | `{"detail":"forbidden"}` |
| 404 | folder_id 或 favorite_id 不存在 / OpenAlex 论文不存在 | `{"detail":"folder not found"}` |
| 409 | 重复收藏同一论文到同一夹 | `{"detail":"already collected", "favorite_id":65}` |

**核心要求**：所有错误必须返回 JSON，**不要返回 Django DEBUG HTML 页**。

---

## 7. 联调 / 验收 curl 清单

前置：
```bash
# 登录拿 cookie
curl -s -c cookies.txt -X POST "http://1.95.137.119:8080/api/accounts/login/" \
  -H "Content-Type: application/json" \
  -d '{"email":"1850464693@qq.com","password":"1233211234567"}'

CSRF=$(grep csrftoken cookies.txt | awk '{print $NF}')
```

### D1 验收
```bash
# 应返 400 + JSON（当前返 502）
curl -s -b cookies.txt -X POST "http://1.95.137.119:8080/api/users/favorite/collect/16/" \
  -H "Content-Type: application/json" -H "X-CSRFToken: $CSRF" -H "Referer: http://1.95.137.119:8080/" \
  -d '{"paper_id":"abc123"}' -w "\nHTTP:%{http_code}\n"

# 应返 404 + JSON（当前返 502）
curl -s -b cookies.txt -X POST "http://1.95.137.119:8080/api/users/favorite/collect/16/" \
  -H "Content-Type: application/json" -H "X-CSRFToken: $CSRF" -H "Referer: http://1.95.137.119:8080/" \
  -d '{"paper_id":"W9999999998"}' -w "\nHTTP:%{http_code}\n"
```

### D2 验收
```bash
# 返回应含 name + add_time
curl -s -b cookies.txt -X POST "http://1.95.137.119:8080/api/users/favorite/create/0/" \
  -H "Content-Type: application/json" -H "X-CSRFToken: $CSRF" -H "Referer: http://1.95.137.119:8080/" \
  -d '{"name":"d2-test"}'
# 期望: {"id":N, "name":"d2-test", "is_paper":false, "add_time":"YYYY-MM-DD ..."}
```

### D3 验收
```bash
# 返回应含 favorite_id + folder_id + paper_id（不是模糊的 id）
curl -s -b cookies.txt -X POST "http://1.95.137.119:8080/api/users/favorite/collect/{folder_id}/" \
  -H "Content-Type: application/json" -H "X-CSRFToken: $CSRF" -H "Referer: http://1.95.137.119:8080/" \
  -d '{"paper_id":"W2787959293"}'
# 期望: {"favorite_id":N, "folder_id":{folder_id}, "paper_id":"W2787959293", "add_time":"..."}
```

### D4 验收
```bash
# 应返 404 JSON（当前返 500 HTML）
curl -s -b cookies.txt "http://1.95.137.119:8080/api/users/favorite/list/999999/" \
  -w "\nHTTP:%{http_code}\n"
```

### D5 验收
```bash
# 返回应含 paper_count
curl -s -b cookies.txt "http://1.95.137.119:8080/api/users/favorite/16/"
# 期望: {"id":16, "name":"...", "is_paper":false, "add_time":"...", "paper_count":N}
```

### D6 验收（新接口）
```bash
curl -s -b cookies.txt "http://1.95.137.119:8080/api/users/favorite/check/?paper_id=W2787959293"
# 期望: {"collected":true, "entries":[{"favorite_id":65, "folder_id":64, "folder_name":"..."}]}
```

### D7 验收（新接口）
```bash
curl -s -b cookies.txt -X POST "http://1.95.137.119:8080/api/users/favorite/move/65/" \
  -H "Content-Type: application/json" -H "X-CSRFToken: $CSRF" -H "Referer: http://1.95.137.119:8080/" \
  -d '{"target_folder_id":58}'
# 期望: {"favorite_id":65, "folder_id":58}
```

---

## 8. 前端侧不依赖后端的修复（顺带告知）

为避免重复 / 互相等待，前端在另一组 commit 中独立完成以下修复：

| 修复 | 文件 | 说明 |
|---|---|---|
| 收藏夹列表加载 | `src/views/personal-homepage/PersonalHomepageView.vue`、`src/components/modals/ChooseFavoriteModal.vue` | `getFavoriteList(userId)` → `getFavoriteList(0)`（pk=0 才是根） |
| 总收藏数 | `PersonalHomepageView.vue` | `totalFavoriteCount` 兜底逻辑（D5 落地前先用 `favouritesInfo.length`） |
| 内容弹窗死循环 | `src/components/modals/FavorateContentModal.vue` | `updated()` 调 `fetchData()` 改为 watch `favoriteId+show` |
| 删除二次确认 + 失败回滚 | `src/components/favorites/FavouriteList.vue`、`FavouriteListChoosable.vue` | `confirm()` + 失败时把 splice 出的项 push 回去 + toast |
| 重命名失败回滚 | `src/components/favorites/FavouriteListItem.vue` | 用本地副本 v-model，避免直接改 prop；失败时回滚 |
| 收藏成功反馈 | `src/components/favorites/FavouriteListChoosable.vue` | `collectFavorite` 成功后 emit close + toast |
| 移动两步级联 | 同上 | 在 D7 落地前先做"collect 成功 → delete 旧条目"级联 + 失败回滚（不可避免有窗口期） |
| 论文页已收藏状态 | `src/views/paper/PaperDetailView.vue` | 在 D6 落地前用"遍历 folder list 反查"fallback；D6 落地后切单接口 |

---

## 9. 联系 / 反馈

- 文档维护：前端组
- 后端联调点：参见 `backend-issues-2026-05-22.md` §联系方式（保持一致）
- 本文档版本：v1（2026-05-28 初稿）；后端反馈后会在同目录追加 `favorites-backend-requirements-2026-05-28-v2.md` 或在本文档追加"反馈与决议"小节
