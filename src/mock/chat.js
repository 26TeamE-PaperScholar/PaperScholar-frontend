/**
 * Mock 数据：AI 论文助手会话与消息。
 *
 * 对齐 docs/api-contract.md §1.1.1 (Conversation) 与 §1.1.2 (ChatMessage 扩展)：
 * - Conversation: id / title / context_papers / last_message_at / created_at / message_count
 * - ChatMessage: id / conversation_id / role / content / created_at
 *   + assistant 消息追加 mode / evidences / sources
 */
import { mockPapers } from './papers'

const findPaperMeta = (id) => mockPapers.find((p) => p.id === id) || null

const buildSource = (paperId) => {
  const p = findPaperMeta(paperId)
  if (!p) {
    return { paper_id: paperId, title: '(未知论文)', authors: [], url: '' }
  }
  return {
    paper_id: paperId,
    title: p.title,
    authors: (p.authorships || []).slice(0, 3).map((a) => a.author && a.author.display_name).filter(Boolean),
    url: p.doi || (p.primary_location && p.primary_location.landing_page_url) || ''
  }
}

export const mockConversations = [
  {
    id: 'CV-20260514-001',
    title: '了解 RAG 在学术检索的应用',
    context_papers: ['W2024-001'],
    last_message_at: '2026-05-14T10:42:00Z',
    created_at: '2026-05-14T10:38:00Z',
    message_count: 4,
    messages: [
      {
        id: 'MSG-20260514-0001',
        conversation_id: 'CV-20260514-001',
        role: 'user',
        content: 'RAG 在学术检索里相比传统倒排索引的优势是什么？',
        created_at: '2026-05-14T10:38:30Z'
      },
      {
        id: 'MSG-20260514-0002',
        conversation_id: 'CV-20260514-001',
        role: 'assistant',
        content:
          'RAG 在学术检索场景相比纯 BM25 倒排索引主要有三点优势：\n\n1. **语义召回更全**：稠密向量可以补齐 BM25 字面不匹配的漏召回，对术语漂移和缩略语友好；\n2. **生成式答疑**：直接给出综述级摘要，而不是仅给链接，节省用户做二次摘读的时间；\n3. **可追溯**：通过引用片段（evidence）将生成内容与具体段落绑定，便于做事实核查。\n\n本论文给出的 hybrid 流水线在 18 学科上把证据覆盖率提升了 27%。',
        created_at: '2026-05-14T10:39:10Z',
        mode: 'full',
        evidences: [
          {
            paper_id: 'W2024-001',
            snippet:
              'We combine citation-aware search with abstract summarization, and report a 27% gain in evidence coverage over baseline IR systems on 18 disciplines.',
            location: 'abstract'
          },
          {
            paper_id: 'W2024-001',
            snippet:
              'Our reranker stage uses citation-graph features alongside an LLM-based cross-encoder.',
            location: 'section_3'
          }
        ],
        sources: [buildSource('W2024-001')]
      },
      {
        id: 'MSG-20260514-0003',
        conversation_id: 'CV-20260514-001',
        role: 'user',
        content: '那它在中文文献上效果怎么样？',
        created_at: '2026-05-14T10:41:00Z'
      },
      {
        id: 'MSG-20260514-0004',
        conversation_id: 'CV-20260514-001',
        role: 'assistant',
        content:
          '论文作者在结论部分明确指出**未在中文文献集上做评估**，跨语种泛化能力未知。如需中文学术 RAG 的效果数据，建议关注同一作者团队后续发布的中文子集 benchmark 或参考其他中文检索综述。',
        created_at: '2026-05-14T10:42:00Z',
        mode: 'full',
        evidences: [
          {
            paper_id: 'W2024-001',
            snippet:
              '未在中文文献集上评估，跨语种泛化能力未知；reranker 推理延迟较 BM25 基线增加 3.2 倍。',
            location: 'conclusion'
          }
        ],
        sources: [buildSource('W2024-001')]
      }
    ]
  },
  {
    id: 'CV-20260512-002',
    title: '图神经网络在文献网络的早期工作',
    context_papers: ['W2024-012'],
    last_message_at: '2026-05-12T22:09:00Z',
    created_at: '2026-05-12T22:00:00Z',
    message_count: 2,
    messages: [
      {
        id: 'MSG-20260512-0001',
        conversation_id: 'CV-20260512-002',
        role: 'user',
        content: '中文文献的 GNN 综述这篇没全文，能基于摘要先帮我提炼一下要点吗？',
        created_at: '2026-05-12T22:00:30Z'
      },
      {
        id: 'MSG-20260512-0002',
        conversation_id: 'CV-20260512-002',
        role: 'assistant',
        content:
          '基于该论文摘要可以提炼出三个层面的关注点：\n\n- 综述对象：中文学术文献的引文网络与作者协作网络；\n- 方法分类：把 GNN 应用分为节点表示学习、链路预测、社区发现三类；\n- 评估难点：中文社区缺乏统一 benchmark，作者主要使用自建数据。\n\n以上为基于摘要级数据的**受限分析**，结论强度低于全文阅读。',
        created_at: '2026-05-12T22:09:00Z',
        mode: 'restricted',
        evidences: [
          {
            paper_id: 'W2024-012',
            snippet:
              '本文综述图神经网络在中文文献网络中的应用，覆盖节点表示、链路预测与社区发现三大方向。',
            location: 'abstract'
          }
        ],
        sources: [buildSource('W2024-012')]
      }
    ]
  },
  {
    id: 'CV-20260510-003',
    title: '新会话',
    context_papers: [],
    last_message_at: '2026-05-10T09:00:00Z',
    created_at: '2026-05-10T09:00:00Z',
    message_count: 0,
    messages: []
  }
]

export const mockChatSuggestions = [
  '帮我总结这篇论文的方法部分',
  '生成 BibTeX 引用',
  '这些作者还合作过哪些工作？',
  '与这篇相关的最新研究有哪些？'
]

const restrictedSuggestionsForPaper = (paperId) => {
  const p = findPaperMeta(paperId)
  if (!p) return mockChatSuggestions
  const base = [
    `请基于摘要提炼《${p.title.slice(0, 24)}${p.title.length > 24 ? '…' : ''}》的核心贡献`,
    '它与最近 2 年相关工作有什么差异？',
    '帮我生成这篇的 BibTeX 引用'
  ]
  return base
}

/**
 * 生成 mock 的 user_message + assistant_message 对，供 createCompletion 使用。
 * 后端真实接入后此函数被替换为真实 API 调用。
 */
let _seq = 1000
const nextId = (prefix) => `${prefix}-${Date.now()}-${++_seq}`

export const mockCompletion = ({ conversation_id, message, context_papers }) => {
  const nowIso = new Date().toISOString()
  const userMessage = {
    id: nextId('MSG'),
    conversation_id,
    role: 'user',
    content: message,
    created_at: nowIso
  }

  const papers = (context_papers || []).map(findPaperMeta).filter(Boolean)
  const hasFullText = papers.length > 0 && papers.every((p) => Boolean(p.primary_location && p.primary_location.pdf_url))
  const mode = papers.length === 0 ? 'full' : hasFullText ? 'full' : 'restricted'

  let content
  let evidences = []
  let sources = []

  if (papers.length === 0) {
    content =
      '当前会话没有绑定具体论文上下文。可以在右上角通过"添加论文上下文"挑选 1-2 篇，回答将基于具体论文给出可追溯的证据片段。\n\n如果只是想了解某个学术主题，也可以直接提问，我会基于通用知识回答（不附证据）。'
  } else if (mode === 'restricted') {
    const titles = papers.map((p) => `《${p.title}》`).join(' 与 ')
    content =
      `当前论文 ${titles} **仅有题录与摘要**，我无法访问全文，以下回答属于**受限分析**：\n\n` +
      papers
        .map((p, i) => `${i + 1}. ${p.abstract.slice(0, 140)}${p.abstract.length > 140 ? '…' : ''}`)
        .join('\n\n') +
      '\n\n如需更精细的方法或实验细节，建议结合论文 PDF 阅读。'
    evidences = papers.map((p) => ({
      paper_id: p.id,
      snippet: (p.abstract || '').slice(0, 220),
      location: 'abstract'
    }))
    sources = papers.map((p) => buildSource(p.id))
  } else {
    const lead = papers
      .map((p) => `《${p.title}》`)
      .join('、')
    content =
      `基于 ${lead} 的全文上下文，简要回应"${message.slice(0, 40)}${message.length > 40 ? '…' : ''}"：\n\n` +
      papers
        .map((p, i) => {
          const cmp = p.comparison || {}
          const method = cmp.method && cmp.method.value
          const contribution = cmp.contribution && cmp.contribution.value
          return `**论文 ${i + 1}**\n- 方法：${method || '（mock 未填充）'}\n- 主要贡献：${contribution || '（mock 未填充）'}`
        })
        .join('\n\n') +
      '\n\n下面是直接相关的证据片段，可点开查看出处。'
    evidences = papers.flatMap((p) => {
      const cmp = p.comparison || {}
      const out = []
      if (cmp.method && cmp.method.value) {
        out.push({ paper_id: p.id, snippet: cmp.method.value, location: cmp.method.source || 'section_3' })
      }
      if (cmp.contribution && cmp.contribution.value) {
        out.push({ paper_id: p.id, snippet: cmp.contribution.value, location: cmp.contribution.source || 'introduction' })
      }
      return out
    })
    sources = papers.map((p) => buildSource(p.id))
  }

  const assistantMessage = {
    id: nextId('MSG'),
    conversation_id,
    role: 'assistant',
    content,
    created_at: new Date(Date.now() + 300).toISOString(),
    mode,
    evidences,
    sources
  }

  return { user_message: userMessage, assistant_message: assistantMessage }
}

/** 新建一个空 Conversation（供 mock 后端 POST /conversations/ 使用） */
export const mockCreateConversation = ({ title, context_papers } = {}) => {
  const nowIso = new Date().toISOString()
  const cv = {
    id: nextId('CV'),
    title: title || '新会话',
    context_papers: context_papers || [],
    last_message_at: nowIso,
    created_at: nowIso,
    message_count: 0,
    messages: []
  }
  mockConversations.unshift(cv)
  return cv
}

/** 用于会话详情：返回与契约一致的 messages 数组 */
export const mockConversationDetail = (id) => {
  const c = mockConversations.find((x) => x.id === id)
  if (!c) return null
  return {
    id: c.id,
    title: c.title,
    context_papers: c.context_papers || [],
    messages: c.messages || []
  }
}

/** 把一对 user/assistant 消息持久化到 mock conversation（仅会话内存） */
export const mockAppendMessages = (id, userMsg, assistantMsg) => {
  const c = mockConversations.find((x) => x.id === id)
  if (!c) return
  c.messages.push(userMsg)
  c.messages.push(assistantMsg)
  c.message_count = c.messages.length
  c.last_message_at = assistantMsg.created_at
  if (c.title === '新会话' && userMsg.role === 'user') {
    c.title = userMsg.content.slice(0, 30) + (userMsg.content.length > 30 ? '…' : '')
  }
}

export { restrictedSuggestionsForPaper }
