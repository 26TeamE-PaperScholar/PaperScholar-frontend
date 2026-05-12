/**
 * Mock messages.
 */
export const mockMessages = {
  received: [
    {
      id: 'M-001',
      sender: { id: 'sys', display_name: 'PaperScholar 系统' },
      title: '欢迎来到 PaperScholar',
      content: '感谢使用 PaperScholar 学术检索平台。我们已为您预加载了 18 篇精选论文与 10 余位关注学者，开始探索吧。',
      created_at: '2024-12-01 09:00',
      is_read: false,
      category: 'system'
    },
    {
      id: 'M-002',
      sender: { id: 'sys', display_name: 'PaperScholar 系统' },
      title: '您关注的 Elena Park 发表了新论文',
      content: '《Large Language Models as Research Assistants: A Survey》已收录，点击查看详情。',
      created_at: '2024-11-29 14:23',
      is_read: false,
      category: 'follow'
    },
    {
      id: 'M-003',
      sender: { id: 'A002', display_name: 'Elena Park' },
      title: '感谢您的关注',
      content: '欢迎一同探讨 retrieval-augmented research workflow，欢迎邮件交流。',
      created_at: '2024-11-25 21:08',
      is_read: true,
      category: 'private'
    },
    {
      id: 'M-004',
      sender: { id: 'sys', display_name: 'PaperScholar 审核' },
      title: '身份认证已通过',
      content: '您提交的身份认证申请已审核通过，欢迎使用学者主页与高级检索功能。',
      created_at: '2024-11-20 11:46',
      is_read: true,
      category: 'audit'
    },
    {
      id: 'M-005',
      sender: { id: 'sys', display_name: 'PaperScholar 系统' },
      title: '本周学术热点摘要',
      content: '为您推送本周内您关注方向（信息检索 · 图神经网络）的 5 篇精选工作。',
      created_at: '2024-11-18 08:00',
      is_read: true,
      category: 'system'
    }
  ],
  sent: [
    {
      id: 'M-201',
      receiver: { id: 'A001', display_name: 'Ming Chen' },
      title: '关于 RAG 数据集的问询',
      content: '陈教授您好，请问贵组使用的 RAG 评测数据集是否对外开放？...',
      created_at: '2024-11-22 22:15'
    }
  ]
}
