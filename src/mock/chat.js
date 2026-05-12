/**
 * Mock conversations for the side chat.
 */
export const mockConversations = [
  {
    id: 'CV-001',
    title: '了解 RAG 在学术检索的应用',
    last_message_at: '2024-12-01 10:42',
    messages: [
      {
        role: 'user',
        content: 'RAG 在学术检索里相比传统倒排索引的优势是什么？',
        created_at: '2024-12-01 10:38'
      },
      {
        role: 'assistant',
        content:
          'RAG 主要优势有三点：\n1. **语义召回更全**：用稠密向量补齐 BM25 漏召回；\n2. **生成式答疑**：可直接给摘要级回答而非链接；\n3. **可追溯**：可以引用具体段落作为依据。\n\n常见落地范式是 hybrid retrieval（BM25 + dense）+ rerank + 生成总结。',
        created_at: '2024-12-01 10:39'
      }
    ]
  },
  {
    id: 'CV-002',
    title: '图神经网络综述',
    last_message_at: '2024-11-28 22:09',
    messages: []
  }
]

export const mockChatSuggestions = [
  '帮我总结这篇论文的方法部分',
  '生成 BibTeX 引用',
  '这些作者还合作过哪些工作？',
  '与这篇相关的最新研究有哪些？'
]
