# 后端问题汇总（2026-05-22 前后端联调）

> **测试范围**：通过前端 vite dev proxy（`http://localhost:5173/api/` → `http://1.95.137.119:8080/api/`）对 swagger 中全部 67 个端点做冒烟测试，分公开 / 登录态两轮。
> **测试账号**：`jerrygao` / id=11 / `1850464693@qq.com`
> **swagger 来源**：`http://1.95.137.119:8080/swagger/?format=openapi`（OpenAPI 2.0，`basePath: /api`）

---

## 一、🔴 P0 — 后端 500 错误（必修）

后端在以下场景直接抛出未捕获异常，返回 Django 的 HTML 500 页：

### 1. `POST /api/chat/completions/` — AI 补全崩溃

**复现**（已登录 session）：

```bash
curl -b cookies.txt -X POST -H "Content-Type: application/json" \
  -d '{"conversation_id":5,"content":"什么是 transformer？"}' \
  http://1.95.137.119:8080/api/chat/completions/
```

**现象**：HTTP 500 + HTML 错误页
**影响**：AI 论文助手功能完全不可用
**期望**：返回 `{user_message, assistant_message}` 结构（见 `PaperScholar-fronted/docs/api-contract.md §1.2`）
**推测原因**：可能是大模型上游服务未配置 / API Key 失效 / 请求体校验异常未被捕获

---

### 2. `GET /api/users/favorite/list/{id}/` — 收藏夹列表崩溃

**复现**（已登录 session，id 用自己的 user_id=11）：

```bash
curl -b cookies.txt http://1.95.137.119:8080/api/users/favorite/list/11/
```

**现象**：HTTP 500 + HTML 错误页（任意合法 user_id 都崩）
**影响**：个人主页"我的收藏"功能不可用
**期望**：返回该用户的收藏夹数组（即使为空也应是 `[]`）

---

### 3. `GET /api/download/` — 无参数直接 500

**复现**（已登录 session）：

```bash
curl -b cookies.txt http://1.95.137.119:8080/api/download/
```

**现象**：HTTP 500
**期望**：返回 HTTP 400 提示缺少必需参数（参考 `/papers/` 缺 ids 时返回的 `{"detail":"Missing required query parameter: ids."}`）
**影响**：未知（前端目前未调用 download 接口）

---

## 二、🔴 P0 — 安全漏洞（必修）

### 4. `GET /api/users/` — 无鉴权返回全量用户 + 邮箱

**复现**（无 cookie，任何人）：

```bash
curl http://1.95.137.119:8080/api/users/
```

**返回**：

```json
[
  {"id":7,"username":"josephmeng","email":"mengqiaoyuanhe@qq.com","gender":"gender_unset"},
  {"id":1,"username":"hzr","email":"...","gender":"..."},
  ...
]
```

**问题**：

- 未登录用户可以直接拿到平台**所有用户的 email + 用户名**
- 邮箱属于个人隐私（GDPR / 个保法层面也敏感）
- 即使要做"用户搜索"，也应该（a）需要登录态（b）不返回 email（c）支持搜索关键字过滤而不是 list all

**期望**：

- 改为 `IsAuthenticated` 权限
- 不返回 email 字段（或仅在 `/users/{id}/` 本人访问自己时返回）
- 提供分页 + 搜索参数

---

### 5. swagger `securityDefinitions` 标错

**现状**：

```yaml
securityDefinitions:
  basic:
    type: basic
security:
  - basic: []
```

**实际机制**：Django session cookie（`sessionid` HttpOnly + `csrftoken`）

**影响**：

- swagger UI 上点 "Authorize" 让人填 HTTP Basic 凭据，永远登不上
- 自动化生成 client SDK（如 swagger-codegen）会做错鉴权
- 第三方对接团队会被误导

**期望**：改为正确声明，例如：

```yaml
securityDefinitions:
  session:
    type: apiKey
    in: cookie
    name: sessionid
  csrf:
    type: apiKey
    in: header
    name: X-CSRFToken
security:
  - session: []
    csrf: []
```

---

## 三、🟡 P1 — swagger 文档不完整 / 字段不一致

### 6. `POST /accounts/register/` swagger 字段齐了，但 200 响应缺 schema

swagger 列出了 RegisterSlz 的 4 个 required 字段（username/email/password/password_confirm），但 201 响应只写了 `description: 创建成功`，没说返回什么。实测会返回完整的 UserSlz 含 `id/email/gender/is_member/is_author/openalex_id/real_name/...`。

**期望**：补齐 201 响应 schema。

---

### 7. 多处 200 响应缺 schema

`POST /accounts/login/` 的 200 响应在 swagger 里只写"登录成功"，没说会 set 哪些 cookie。实际后端会 set 5 个 cookie：

| Cookie | Httponly | 用途 |
|---|---|---|
| `sessionid` | ✅ | 真正的认证 cookie，14 天 |
| `csrftoken` | ❌ | CSRF 防护，1 年 |
| `user_id` | ❌ | 给前端识别当前用户 id |
| `is_member` | ❌ | 是否会员 |
| `is_staff` | ❌ | 是否 staff |

**期望**：在 swagger description 里说明，或在公开的接口文档中明确这套约定。

---

### 8. swagger 没列出"必需但要传"的字段

部分 endpoint 的 swagger 没列出 body schema 或列得不全，前端无法仅凭 swagger 编程：

| 端点 | 实测期望字段 | swagger 状态 |
|---|---|---|
| `POST /chat/completions/` | `conversation_id`, `content` | 未列出 body schema |
| `POST /messages/` | `receiver`, `content` | 未列出（前端目前发的 `receiver_id` 后端不认）|
| `POST /users/follow/` | `openalex_id`（关注**学者**，不是用户）| 未列出 |
| `POST /article/interest/select/` | `interests`（数组）| 未列出 |
| `POST /users/favorite/create/{id}/` | `{id}` 是**父收藏夹 id**，不是 user_id | 路径参数语义未说明 |

**期望**：补齐 body schema + 路径参数的语义注释。

---

## 四、🟡 P1 — 业务规则需要文档化

以下是**正常工作**但**需要说明**的设计，否则前端容易写错：

### 9. `/users/follow/` 关注的是学者不是用户

请求体字段是 `openalex_id`（OpenAlex 作者 ID，如 `A5103423779`），不是站内 `user_id`。

```bash
# 正确
POST /api/users/follow/  {"openalex_id":"A5103423779"}

# 错误（前端 src/api/users.js 当前可能这么写）
POST /api/users/follow/  {"user_id":7}    # → 400
```

### 10. `/users/favorite/create/{id}/` 不支持嵌套收藏夹

`{id}` 是**父收藏夹 id**。当前后端只允许在最外层创建：

```bash
POST /api/users/favorite/create/0/  {"name":"my folder"}    # 期望最外层 → id=0 或某个保留值
POST /api/users/favorite/create/11/  ...                    # → 400 "当前不支持收藏夹层级嵌套"
```

**期望**：明确"最外层"用什么值（0、null、还是省略路径参数？）

### 11. `/cache/clear/` 是 staff 专用

普通已登录用户访问会返回 403 `{"detail":"您没有执行该操作的权限。"}` —— 这是正常行为，但 swagger 应该标注 `permission_classes` 或在 description 写明"仅管理员"。

---

## 五、🟢 P2 — 注册激活流程对开发不友好

- `POST /accounts/register/` 返回 201 但账号 `is_active=false`
- `POST /accounts/login/` 拒绝未激活账号，返回 401 + `{"detail":"账号未激活"}`
- 激活路径 `GET /accounts/active/?token=...`（推测）通过邮件链接发送

**对开发的影响**：

- 本地开发 / CI 测试用例无法仅靠 API 走通注册 → 登录流程
- 测试同学没法批量造账号

**建议**（任选）：

- 提供一个 `dev` 模式 / 环境变量，让注册接口自动激活
- 或提供 `/accounts/active_by_admin/<user_id>/` 给 staff 一键激活的接口
- 或在响应里直接带 `active_url`（仅 DEBUG=True 时）

---

## 六、📋 已验证正常的接口清单（无需关注，仅作记录）

### 公开接口（不需登录，全部 200）

```
GET  /api/search/{works,authors,institutions,concepts,sources}/?q=...
GET  /api/search/{resource}/{openalex_id}/
GET  /api/autocomplete/?q=...
GET  /api/autocomplete/{works,authors,institutions,concepts,sources}/?q=...
GET  /api/papers/?ids=W3038568908
POST /api/compare/extract/  {"paper_ids":[...]}
POST /api/accounts/register/   # 字段校验正常
POST /api/accounts/login/      # 字段校验正常
GET  /api/accounts/logout/
```

### 登录后接口（用 session cookie，全部 200）

```
GET    /api/users/settings/
GET    /api/users/{id}/   /avatar/   /followers/   /following/
GET    /api/chat/conversations/        # 列表
POST   /api/chat/conversations/        # 创建（返回 id）
GET    /api/chat/conversations/{id}/   # 详情
GET    /api/chat/conversations/{id}/chat_messages/
PUT/PATCH/DELETE /api/chat/conversations/{id}/
GET    /api/messages/received/  /sent/
GET    /api/history/search_history/  /view_history/
GET    /api/history/get_relation_map/{user_id}/
GET    /api/applications/submitted/  /audited/
GET    /api/article/hotspot/recommend/
GET    /api/article/interest/list/  /recommend/
POST   /api/article/interest/select/  {"interests":[1,2]}
```

---

## 七、🛠️ 前端侧已修复的对接 bug（与后端无关）

供后端同学了解前端配合改动：

| 文件 | bug | 修复 |
|---|---|---|
| `src/api/compare.js:10` | `/api/compare/extract/` 双 `/api` 前缀 → 实际请求 `/api/api/...` 必 404 | 改为 `/compare/extract/` |
| `src/api/compare.js:38` | `/api/papers/` 双前缀 | 改为 `/papers/` |

待修复（前端字段与 swagger 对齐）：

| 文件 | 现状 | 期望 |
|---|---|---|
| `src/store/modules/assistant.js:144` | 发 `{message:...}` | 改 `{content:...}` 对齐后端 |
| `src/api/users.js` followUser | 推测发 `{user_id:...}` | 改 `{openalex_id:...}` |
| `src/api/messages.js:10` | `/messages/sent/delete_all` 缺尾斜杠 | 加 `/` → `/messages/sent/delete_all/` |

---

## 附录 A：测试方法

dev proxy 配置（`PaperScholar-fronted/vite.config.js`）：

```js
server: { proxy: { '/api': 'http://1.95.137.119:8080/' } }
```

`.env.local`：

```env
VITE_USE_MOCK=false
```

curl 测试模板：

```bash
# 登录拿 session
curl -c cookies.txt -X POST -H "Content-Type: application/json" \
  -d '{"email":"1850464693@qq.com","password":"1233211234567"}' \
  http://localhost:5173/api/accounts/login/

# 用 session 访问受保护接口
curl -b cookies.txt http://localhost:5173/api/users/settings/

# 写操作需要带 CSRF
csrf=$(awk '/csrftoken/{print $7}' cookies.txt)
curl -b cookies.txt -X POST \
  -H "Content-Type: application/json" -H "X-CSRFToken: $csrf" \
  -H "Referer: http://localhost:5173/" \
  -d '{"interests":[1,2]}' \
  http://localhost:5173/api/article/interest/select/
```

## 附录 B：测试残留数据

测试期间在后端创建的数据（按需清理）：

- 注册账号 `smoke_1779450679@example.com`（未激活，可保留作压测数据）
- chat conversation id=4（已 DELETE 清理）
- chat conversation id=5（已 DELETE 清理）
- jerrygao 的兴趣分类被改为 `[1, 2]`（如需复原请重置）
