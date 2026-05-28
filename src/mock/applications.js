/**
 * Mock identity-authentication applications.
 *
 * Two field shapes are exported:
 * - `auditRecord(row)`: maps an audit record to the shape that
 *   `src/views/admin/AuditDetailView.vue` expects via `v-bind`. Status enum
 *   is the original 0..3 (0=未审核, 1=通过, 2=不通过, 3=未确认).
 * - The list also keeps modern fields (`status: 'pending'|'approved'|'rejected'`)
 *   so the new admin shell can show summary cards / filter chips.
 */

const AUDIT_SAMPLE = [
  {
    raw: {
      id: 'AP-001',
      userId: 1001,
      auditId: 1,
      userName: 'wjcao',
      realName: '曹文杰',
      institution: '复旦大学计算机科学学院',
      position: '副教授',
      workEmail: 'wjcao@fudan.example.edu',
      concepts: [
        { display_name: 'Information Retrieval' },
        { display_name: 'Knowledge Graphs' }
      ],
      content: '主要研究面向中文学术文献的信息检索与知识图谱构建，详见附件简历。',
      submitTime: '2024-11-22 14:08',
      status: 0,
      applicationType: '学者门户认证',
      images: [],
      rejectReason: ''
    }
  },
  {
    raw: {
      id: 'AP-002',
      userId: 1002,
      auditId: 2,
      userName: 'hpark',
      realName: 'Hyeon Park',
      institution: 'KAIST · School of Computing',
      position: 'Assistant Professor',
      workEmail: 'hpark@kaist.example.edu',
      concepts: [
        { display_name: 'Algorithmic Fairness' },
        { display_name: 'Recommender Systems' }
      ],
      content: 'Recommender systems and algorithmic fairness; affiliated with KAIST since 2022.',
      submitTime: '2024-11-19 09:42',
      status: 0,
      applicationType: '学者门户认证',
      images: [],
      rejectReason: ''
    }
  },
  {
    raw: {
      id: 'AP-003',
      userId: 1003,
      auditId: 3,
      userName: 'ytsun',
      realName: '孙宇田',
      institution: '中国科学院计算所',
      position: '研究员',
      workEmail: 'ytsun@ict.ac.example.cn',
      concepts: [
        { display_name: 'Graph Neural Networks' },
        { display_name: 'Causal Inference' }
      ],
      content: '图神经网络与因果推断的交叉研究。',
      submitTime: '2024-11-15 21:31',
      status: 1,
      applicationType: '学者门户认证',
      images: [],
      rejectReason: ''
    }
  },
  {
    raw: {
      id: 'AP-004',
      userId: 1004,
      auditId: 4,
      userName: 'aman',
      realName: 'Aman Verma',
      institution: 'IIT Delhi',
      position: 'PhD Candidate',
      workEmail: 'aman@iitd.example.in',
      concepts: [
        { display_name: 'Multimodal Learning' }
      ],
      content: 'Working on multimodal foundation models for medical imaging.',
      submitTime: '2024-11-10 16:00',
      status: 2,
      applicationType: '学者门户认证',
      images: [],
      rejectReason: '提交材料模糊，请重新上传清晰扫描件。'
    }
  }
]

const STATUS_TO_NEW = { 0: 'pending', 1: 'approved', 2: 'rejected', 3: 'pending' }

const enrich = (sample) => {
  const raw = sample.raw
  return {
    ...raw,
    // 给新的 admin 列表 + stat 卡片用的"现代字段"
    status_new: STATUS_TO_NEW[raw.status] || 'pending',
    applicant: {
      id: 'U' + raw.userId,
      display_name: raw.userName,
      email: raw.workEmail,
      institution: raw.institution
    },
    submitted_at: raw.submitTime,
    real_name: raw.realName,
    orcid: '',
    materials_url: ''
  }
}

export const mockAuditList = AUDIT_SAMPLE.map(enrich)

export const mockSubmittedApplications = []
