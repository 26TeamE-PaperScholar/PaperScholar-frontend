# PaperScholar 前后端接口契约 v1

| 项 | 内容 |
|---|---|
| 文档版本 | v1.0 |
| 起草日期 | 2026-05-14 |
| 适用范围 | 本期新增的 AI 论文助手（/ai_assistant）与论文横向对比（/paper_compare）两个模块 |
| 参考文档 | 《PaperScholar 软件设计文档（第一部分）》§1.3.3 接口命名规范、《需求规格说明书 v2.1》§3.8（AI 论文助手）、用例 804（对比多篇论文方法） |

> 与既有 `/api/chat/`、`/api/article/` 等接口共存；本文档约束本次迭代中新增/扩展字段的契约。

---

## 0. 通用约定

### 0.1 URL 风格

- RESTful；URL 形如 `/api/<resource>/<action>/`
- 资源名用名词复数（与设计文档一致）
- 尾部带 `/`

### 0.2 鉴权

- Header：`Authorization: Bearer <jwt_token>`
- Token 由 `/api/accounts/login/` 颁发，写入 cookie + 同步注入 Authorization Header
- 未登录访问鉴权接口返回 401，前端跳 `/auth?mode=login`

### 0.3 响应封装

所有响应统一封装为如下结构（对齐设计文档 §1.3.3）：

```json
{
  "code": 0,
  "message": "ok",
  "data": { /* 业务负载 */ }
}
```

| code | 含义 |
|------|------|
| 0 | 成功 |
| 1xxx | 客户端错误（参数、鉴权） |
| 2xxx | 业务错误（资源不存在、超出配额） |
| 5xxx | 服务端错误 |

具体业务码在各接口章节列出。

### 0.4 命名规范

- 请求体、响应体字段统一 **snake_case**（设计文档 §1.3.2）
- 数组字段后缀 `_list` 或直接复数；时间字段统一 ISO 8601（`2026-05-14T08:30:00Z`）
- 布尔字段前缀 `is_` / `has_`

### 0.5 分页

- 查询参数：`page`（从 1 起）、`per_page`（默认 10）
- 响应 `data` 内含 `items[]` 与 `pagination: { page, per_page, total }`

---

## 1. AI 论文助手（/ai_assistant）

### 1.1 业务模型

#### 1.1.1 Conversation

```json
{
  "id": "CV-20260514-001",
  "title": "了解 RAG 在学术检索的应用",
  "context_papers": ["W2024-001"],
  "last_message_at": "2026-05-14T10:42:00Z",
  "created_at": "2026-05-14T10:38:00Z",
  "message_count": 6
}
```

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | 是 | 会话唯一标识，建议 `CV-<yyyymmdd>-<seq>` |
| title | string | 是 | 会话标题，新建时为 "新会话"，首条用户消息后自动更新为消息前 30 字 |
| context_papers | string[] | 否 | 该会话绑定的论文 id 列表（0..N）；空数组表示无论文上下文 |
| last_message_at | ISO8601 | 是 | 最后一条消息的时间 |
| created_at | ISO8601 | 是 | 会话创建时间 |
| message_count | int | 否 | 列表接口返回，详情接口不返回 |

#### 1.1.2 ChatMessage（扩展）

```json
{
  "id": "MSG-20260514-0007",
  "conversation_id": "CV-20260514-001",
  "role": "assistant",
  "content": "RAG 的核心优势是......",
  "created_at": "2026-05-14T10:42:00Z",

  "mode": "full",
  "evidences": [
    {
      "paper_id": "W2024-001",
      "snippet": "We combine citation-aware search with abstract summarization...",
      "location": "abstract"
    }
  ],
  "sources": [
    {
      "paper_id": "W2024-001",
      "title": "Retrieval-Augmented Generation for Scholarly Literature Review",
      "authors": ["Ming Chen", "Elena Park"],
      "url": "https://doi.org/10.1145/3624918.3625203"
    }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | 是 | 消息 id |
| conversation_id | string | 是 | 所属会话 |
| role | enum | 是 | `user` / `assistant` / `system` |
| content | string | 是 | markdown 文本 |
| created_at | ISO8601 | 是 | — |
| **mode** | enum | assistant 必填 | `full`：基于全文/丰富元数据；`restricted`：仅基于题录、摘要、关键词等有限数据（对齐主文档 §1.3 术语 11） |
| **evidences** | array | assistant 必填 | 证据片段列表，对应主文档 §1.3 术语 10。可为空数组（表示无引用） |
| evidences[].paper_id | string | 是 | 来源论文 id |
| evidences[].snippet | string | 是 | 原文片段，≤500 字符 |
| evidences[].location | string | 是 | `abstract` / `metadata` / `section_<n>` / `conclusion` 等 |
| **sources** | array | assistant 必填 | 来源标注，对应主文档 §1.3 术语 13 |
| sources[].paper_id | string | 是 | 论文 id |
| sources[].title | string | 是 | — |
| sources[].authors | string[] | 否 | 前 3 位作者 |
| sources[].url | string | 否 | DOI 链接或论文详情页 |

**前端显式标识规则**（对齐主文档 §1.3 术语 12）：所有 `role === 'assistant'` 消息一律附 "AI 生成内容" 徽章；`mode === 'restricted'` 时消息顶部追加横幅 "基于摘要/题录的受限分析"。

### 1.2 接口列表

#### 1.2.1 列出会话

```
GET /api/chat/conversations/
```

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| page | int | 否 | 默认 1 |
| per_page | int | 否 | 默认 20 |

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "items": [/* Conversation[] */],
    "pagination": { "page": 1, "per_page": 20, "total": 35 }
  }
}
```

---

#### 1.2.2 新建会话

```
POST /api/chat/conversations/
```

请求体：

```json
{
  "title": "新会话",
  "context_papers": ["W2024-001"]
}
```

| 字段 | 必填 | 说明 |
|---|---|---|
| title | 否 | 默认 "新会话" |
| context_papers | 否 | 默认 `[]` |

响应：`data` 为 Conversation 对象。

**业务码**：

| code | 含义 |
|------|------|
| 2001 | context_papers 中存在无效 paper_id |

---

#### 1.2.3 会话详情（含消息）

```
GET /api/chat/conversations/<id>/
```

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": "CV-20260514-001",
    "title": "...",
    "context_papers": ["W2024-001"],
    "messages": [/* ChatMessage[] */]
  }
}
```

**业务码**：`2002` 会话不存在；`1003` 无权访问（非本人）。

---

#### 1.2.4 重命名 / 修改会话

```
PATCH /api/chat/conversations/<id>/
```

请求体（字段全部可选，至少一项）：

```json
{
  "title": "改后的标题",
  "context_papers": ["W2024-001", "W2024-002"]
}
```

响应：`data: { "ok": true }`。

---

#### 1.2.5 删除会话

```
DELETE /api/chat/conversations/<id>/
```

响应：`data: { "ok": true }`。

---

#### 1.2.6 发送消息 / 获取 AI 回复

```
POST /api/chat/completions/
```

请求体：

```json
{
  "conversation_id": "CV-20260514-001",
  "message": "RAG 在学术检索里相比传统倒排索引的优势是什么？",
  "context_papers": ["W2024-001"]
}
```

| 字段 | 必填 | 说明 |
|---|---|---|
| conversation_id | 是 | 会话 id |
| message | 是 | 用户输入文本 |
| context_papers | 否 | 本次回答的论文上下文；不传则取会话默认 |

**响应模式 A（同步，本期默认）**：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "user_message": { /* ChatMessage, role=user */ },
    "assistant_message": { /* ChatMessage, role=assistant，含 mode/evidences/sources */ }
  }
}
```

**响应模式 B（流式，v2 规划）**：`Content-Type: text/event-stream`，事件序列：

```
event: delta
data: {"type":"content","text":"RAG"}

event: delta
data: {"type":"content","text":" 的核心优势"}

event: evidence
data: {"paper_id":"W2024-001","snippet":"...","location":"abstract"}

event: done
data: {"message_id":"MSG-20260514-0007","mode":"full"}
```

前端先按模式 A 实现，预留模式 B 切换开关。

**业务码**：

| code | 含义 |
|------|------|
| 2003 | conversation_id 不存在 |
| 2004 | context_papers 中存在被下架的论文 |
| 2010 | LLM 服务降级，本次响应为 restricted（仍返回 200 + 内容，`mode='restricted'`） |
| 5001 | LLM 上游错误 |

---

### 1.3 受限模式触发条件（后端实现）

后端在以下任一情况下返回 `mode='restricted'` 且通过 `RestrictedBanner` 在前端横幅提示：

1. `context_papers` 中至少一篇没有全文，仅有题录 + 摘要
2. 论文语言与查询语言不匹配，仅基于元数据回答
3. LLM 上游限流，降级到本地模板回答
4. 用户身份为游客或普通用户访问需会员的深度分析

前端**不应**对 mode 做二次判断，完全信任后端字段。

---

## 2. 论文横向对比（/paper_compare）

对应需求规格说明书用例 **804「对比多篇论文方法」**。

### 2.1 业务模型

#### 2.1.1 Paper.comparison（扩展字段）

在既有 Paper 对象上增加 `comparison` 可选字段：

```json
{
  "id": "W2024-001",
  "title": "...",
  "abstract": "...",
  "...": "已有字段省略",

  "comparison": {
    "method":       { "value": "Hybrid BM25 + dense retrieval + LLM reranker",
                      "source": "section_3",
                      "confidence": "high" },
    "dataset":      { "value": "MS MARCO + BEIR + 自建学术子集",
                      "source": "section_4",
                      "confidence": "high" },
    "metrics":      [
      { "name": "nDCG@10", "value": "0.612", "source": "table_2" },
      { "name": "Recall@100", "value": "0.847", "source": "table_2" }
    ],
    "contribution": { "value": "首次在学术检索场景验证 hybrid RAG 的 27% 召回提升",
                      "source": "introduction",
                      "confidence": "high" },
    "limitation":   { "value": "未在中文语料评估，跨语种泛化未知",
                      "source": "conclusion",
                      "confidence": "low" }
  }
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| method | object\|null | 方法描述 |
| dataset | object\|null | 数据集 |
| metrics | array | 评价指标列表，可为空数组 |
| contribution | object\|null | 主要贡献 |
| limitation | object\|null | 局限性 |

**单元结构**（method / dataset / contribution / limitation 共用）：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| value | string | 是 | 文本内容，≤200 字符 |
| source | string | 是 | 来源位置：`abstract` / `introduction` / `section_<n>` / `conclusion` / `table_<n>` / `metadata` |
| confidence | enum | 是 | `high` / `low`；`low` 时前端用浅色 + "推断" 标记 |

**metrics 项结构**：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| name | string | 是 | 指标名 |
| value | string | 是 | 指标值（字符串，避免 0.5 ↔ "50%" 歧义） |
| source | string | 是 | 同上 |

任一维度缺失（字段为 null 或整个 `comparison` 不存在）→ 前端单元格显示 `<RestrictedHint />` "基于摘要的受限推断"。

### 2.2 接口列表

#### 2.2.1 对比抽取

```
POST /api/compare/extract/
```

请求体：

```json
{
  "paper_ids": ["W2024-001", "W2024-002"]
}
```

| 字段 | 必填 | 说明 |
|---|---|---|
| paper_ids | 是 | 待对比论文 id 列表，长度 2（本期上限）；后续可放宽至 4 |

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "matrix": {
      "W2024-001": { /* Paper.comparison 对象 */ },
      "W2024-002": { /* Paper.comparison 对象 */ }
    },
    "restricted_papers": ["W2024-002"],
    "comparability_warning": null
  }
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| matrix | object | 以 paper_id 为 key，value 是 comparison 对象 |
| restricted_papers | string[] | 仅有部分字段、整体进入受限模式的论文 id |
| comparability_warning | string\|null | 当不同论文研究问题差异较大时返回提示文本（用例 804 备选流 C），否则 null |

**业务码**：

| code | 含义 |
|------|------|
| 1001 | paper_ids 数量不在 [2, 4] |
| 2005 | 至少一篇 paper_id 不存在 |
| 2006 | 论文已下架，无法对比 |
| 5002 | 抽取服务上游错误 |

#### 2.2.2 对比结果导出（v2 规划，本期不实现）

```
POST /api/compare/export/
```

预留接口，后期支持导出 PDF / markdown 表格。

---

### 2.3 前端 ↔ 后端对比维度的取数策略

为支持 mock 与真接口平滑切换，前端按以下顺序取 comparison 数据：

1. **优先**：调用 `POST /api/compare/extract/`，使用返回的 `matrix`
2. **降级**：如果接口返回 5xx 或 mock 模式下，直接读 `Paper.comparison` 字段
3. **兜底**：两者都没有 → 整篇标记 restricted，仅展示标题 / 作者 / 摘要 + 受限提示

---

## 3. 变更影响

### 3.1 既有 Paper 对象

- 新增可选字段 `comparison`，对其他模块（列表、详情、推荐）**完全向后兼容**
- 不带 `comparison` 字段的论文仍可正常显示、加入对比（前端走受限模式）

### 3.2 既有 Chat 接口

本次扩展是**纯增字段**：

| 字段 | 旧版 | 新版 |
|---|---|---|
| ChatMessage.mode | — | 新增，assistant 必填 |
| ChatMessage.evidences | — | 新增，assistant 必填，可为 `[]` |
| ChatMessage.sources | — | 新增，assistant 必填，可为 `[]` |
| Conversation.context_papers | — | 新增，可为 `[]` |

旧客户端读取时忽略未知字段即可正常工作。

---

## 4. Mock 实现状态（前端开发期）

| 接口 | mock 已实现 | mock 文件 |
|---|---|---|
| 列出会话 / CRUD | ✅（既有） | `src/mock/chat.js` |
| 发送消息 | ✅（既有，需扩展 evidences/sources/mode） | `src/mock/chat.js` |
| 对比抽取 | ❌（本期新增） | `src/mock/compare.js`（待建） |

mock 切换开关：环境变量 `VITE_USE_MOCK`，默认 `true`，置 `false` 时走真后端。

---

## 5. 待后端确认事项

1. 鉴权方式：本文档假设 JWT + Bearer Header，请后端确认是否一致
2. 流式响应模式 B 的实施时机：本期前端按模式 A 实现，模式 B 时机由后端定
3. 对比上限：本期前端固定 2 篇，后端建议同步约束 `paper_ids` 长度
4. `comparison` 字段在论文列表接口是否返回：建议**列表不返回**（数据量大），仅 `/api/compare/extract/` 与 `/api/papers/<id>/` 详情接口返回
5. 受限模式触发条件 §1.3 是否符合后端实际能力，需联调时校准

---

## 6. 变更记录

| 版本 | 日期 | 修改人 | 说明 |
|------|------|--------|------|
| v1.0 | 2026-05-14 | 前端 | 初稿，覆盖 AI 助手扩展字段 + 论文对比接口 |
