/**
 * Mock paper dataset for PaperScholar demo.
 * Schema 与后端契约一致：id / title / abstract / authorships[{author,institutions}]
 * / cited_by_count / publication_date / primary_location / concepts / keywords / doi / language
 */

export const mockPapers = [
  {
    id: 'W2024-001',
    title: 'Retrieval-Augmented Generation for Scholarly Literature Review',
    abstract:
      'This paper presents a retrieval-augmented workflow for scientific literature review, combining citation-aware search, abstract summarization, and author disambiguation. We evaluate on 18 disciplines and report a 27% gain in evidence coverage over baseline IR systems.',
    publication_date: '2024-03-12',
    publication_year: 2024,
    cited_by_count: 284,
    related_works_count: 12,
    language: 'en',
    type: 'article',
    open_access: true,
    is_hot: true,
    doi: 'https://doi.org/10.1145/3624918.3625203',
    keywords: ['retrieval-augmented generation', 'literature review', 'citation graph', 'LLM'],
    concepts: [
      { id: 'C1', display_name: 'Information Retrieval', level: 1 },
      { id: 'C2', display_name: 'Natural Language Processing', level: 1 }
    ],
    authorships: [
      {
        author: { id: 'A001', display_name: 'Ming Chen', orcid: '0000-0001-1234-0001' },
        institutions: [{ id: 'I001', display_name: 'Tsinghua University', country_code: 'CN' }]
      },
      {
        author: { id: 'A002', display_name: 'Elena Park', orcid: '0000-0001-1234-0002' },
        institutions: [{ id: 'I002', display_name: 'Stanford University', country_code: 'US' }]
      },
      {
        author: { id: 'A003', display_name: 'David Kumar' },
        institutions: [{ id: 'I003', display_name: 'IIT Bombay', country_code: 'IN' }]
      }
    ],
    primary_location: {
      source: { id: 'J001', display_name: 'ACM Transactions on Information Systems', type: 'journal' },
      landing_page_url: 'https://dl.acm.org/doi/10.1145/3624918.3625203',
      pdf_url: 'https://arxiv.org/pdf/2403.01234.pdf'
    },
    citations: [
      { id: 'W2023-099', display_name: 'Dense Passage Retrieval', cited_by_count: 1245 },
      { id: 'W2022-417', display_name: 'REALM: Retrieval-Augmented Language Model Pre-training', cited_by_count: 2105 }
    ],
    comparison: {
      method: {
        value: 'Hybrid retrieval (BM25 + dense bi-encoder) followed by an LLM-based cross-encoder reranker, with a citation-graph-aware re-ranking stage.',
        source: 'section_3',
        confidence: 'high'
      },
      dataset: {
        value: 'MS MARCO passage + BEIR scientific subset + 自建 18 学科文献子集（约 12 万条）。',
        source: 'section_4',
        confidence: 'high'
      },
      metrics: [
        { name: 'nDCG@10', value: '0.612', source: 'table_2' },
        { name: 'Recall@100', value: '0.847', source: 'table_2' },
        { name: 'Evidence Coverage (vs. baseline)', value: '+27%', source: 'abstract' }
      ],
      contribution: {
        value: '首次在学术综述场景验证 hybrid RAG 流水线，证据覆盖较纯 IR 基线提升 27%；提出可追溯的引用感知 reranker。',
        source: 'introduction',
        confidence: 'high'
      },
      limitation: {
        value: '未在中文文献集上评估，跨语种泛化能力未知；reranker 推理延迟较 BM25 基线增加 3.2 倍。',
        source: 'conclusion',
        confidence: 'high'
      }
    }
  },
  {
    id: 'W2024-002',
    title: 'Large Language Models as Research Assistants: A Survey',
    abstract:
      'We survey recent work on language-model-based research assistants, focusing on search intent understanding, trustworthy citation generation, human feedback loops, and evaluation protocols for academic information systems. We identify five open challenges that span hallucination, attribution, evaluation, multilingual coverage, and longitudinal study.',
    publication_date: '2024-06-30',
    publication_year: 2024,
    cited_by_count: 619,
    related_works_count: 28,
    language: 'en',
    type: 'article',
    open_access: true,
    is_hot: true,
    doi: 'https://doi.org/10.48550/arXiv.2406.09017',
    keywords: ['LLM', 'research assistant', 'survey', 'evaluation'],
    concepts: [
      { id: 'C3', display_name: 'Artificial Intelligence', level: 0 },
      { id: 'C2', display_name: 'Natural Language Processing', level: 1 }
    ],
    authorships: [
      {
        author: { id: 'A004', display_name: 'Sarah Williams' },
        institutions: [{ id: 'I004', display_name: 'University of Cambridge', country_code: 'GB' }]
      },
      {
        author: { id: 'A005', display_name: 'Jiahao Li' },
        institutions: [{ id: 'I001', display_name: 'Tsinghua University', country_code: 'CN' }]
      }
    ],
    primary_location: {
      source: { id: 'J002', display_name: 'arXiv preprint', type: 'repository' },
      landing_page_url: 'https://arxiv.org/abs/2406.09017',
      pdf_url: 'https://arxiv.org/pdf/2406.09017.pdf'
    },
    citations: [],
    comparison: {
      method: {
        value: '系统性文献综述：对 187 篇研究助手相关论文按"检索意图理解 / 引用生成 / 人类反馈 / 评估"四个维度编码并比较。',
        source: 'section_2',
        confidence: 'high'
      },
      dataset: {
        value: '187 篇人工筛选的 LLM 研究助手相关论文（2020–2024）；不涉及独立实验数据集。',
        source: 'section_2',
        confidence: 'high'
      },
      metrics: [],
      contribution: {
        value: '识别 LLM 研究助手领域的 5 大开放挑战：幻觉、归因、评估、多语种、纵向研究。',
        source: 'abstract',
        confidence: 'high'
      },
      limitation: {
        value: '作为综述，本文不提供独立实验结果；评估协议的可比性高度依赖各原始研究。',
        source: 'conclusion',
        confidence: 'high'
      }
    }
  },
  {
    id: 'W2024-003',
    title: 'Graph-Based Recommendation in Academic Search Platforms',
    abstract:
      'A heterogeneous graph model is introduced to recommend papers, scholars, institutions, and venues from sparse interaction signals. Experiments on three open academic graphs show improved coverage for early-stage researchers and interdisciplinary queries, with a 14% lift in NDCG@10.',
    publication_date: '2024-01-08',
    publication_year: 2024,
    cited_by_count: 143,
    related_works_count: 9,
    language: 'en',
    type: 'article',
    open_access: false,
    doi: 'https://doi.org/10.1145/3543507.3583243',
    keywords: ['recommendation', 'heterogeneous graph', 'academic search'],
    concepts: [
      { id: 'C4', display_name: 'Recommender Systems', level: 2 },
      { id: 'C5', display_name: 'Graph Neural Networks', level: 2 }
    ],
    authorships: [
      {
        author: { id: 'A006', display_name: 'Ava Thompson' },
        institutions: [{ id: 'I005', display_name: 'MIT', country_code: 'US' }]
      },
      {
        author: { id: 'A007', display_name: 'Yuki Tanaka' },
        institutions: [{ id: 'I006', display_name: 'University of Tokyo', country_code: 'JP' }]
      },
      {
        author: { id: 'A008', display_name: 'Rafael Costa' },
        institutions: [{ id: 'I007', display_name: 'University of São Paulo', country_code: 'BR' }]
      }
    ],
    primary_location: {
      source: { id: 'J003', display_name: 'The Web Conference (WWW)', type: 'conference' },
      landing_page_url: 'https://www2024.thewebconf.org/papers',
      pdf_url: ''
    },
    citations: []
  },
  {
    id: 'W2024-004',
    title: 'Evaluating Trust and Transparency in Citation Search',
    abstract:
      'This study proposes interface-level metrics for transparent citation search, including source provenance, result explainability, temporal coverage, and user confidence across exploratory academic tasks. A within-subjects study (N=68) reports significant improvements in researcher trust.',
    publication_date: '2024-02-14',
    publication_year: 2024,
    cited_by_count: 87,
    related_works_count: 6,
    language: 'en',
    type: 'article',
    open_access: true,
    doi: 'https://doi.org/10.1145/3613904.3642205',
    keywords: ['transparency', 'citation', 'HCI', 'evaluation'],
    concepts: [
      { id: 'C6', display_name: 'Human-Computer Interaction', level: 0 }
    ],
    authorships: [
      {
        author: { id: 'A009', display_name: 'Nora Singh' },
        institutions: [{ id: 'I008', display_name: 'Carnegie Mellon University', country_code: 'US' }]
      },
      {
        author: { id: 'A010', display_name: 'Michael Adams' },
        institutions: [{ id: 'I008', display_name: 'Carnegie Mellon University', country_code: 'US' }]
      }
    ],
    primary_location: {
      source: { id: 'J004', display_name: 'CHI Conference on Human Factors in Computing Systems', type: 'conference' },
      landing_page_url: 'https://chi2024.acm.org',
      pdf_url: 'https://dl.acm.org/doi/pdf/10.1145/3613904.3642205'
    },
    citations: []
  },
  {
    id: 'W2024-005',
    title: '面向中文学术语义检索的预训练模型 SciBERT-Zh',
    abstract:
      '本文针对中文学术文献检索任务，提出基于 100 万篇中文期刊论文与摘要的预训练语言模型 SciBERT-Zh。该模型在六个中文学术基准上的相关性匹配指标平均提升 9.3%，并在跨语言检索任务中显著优于多语言基线。',
    publication_date: '2024-04-21',
    publication_year: 2024,
    cited_by_count: 56,
    related_works_count: 5,
    language: 'zh-cn',
    type: 'article',
    open_access: true,
    doi: 'https://doi.org/10.13328/j.cnki.jos.000001',
    keywords: ['预训练模型', '学术检索', '中文 NLP', '跨语言'],
    concepts: [
      { id: 'C2', display_name: 'Natural Language Processing', level: 1 },
      { id: 'C7', display_name: 'Pretrained Language Models', level: 2 }
    ],
    authorships: [
      {
        author: { id: 'A011', display_name: '王志远' },
        institutions: [{ id: 'I009', display_name: '北京大学', country_code: 'CN' }]
      },
      {
        author: { id: 'A012', display_name: '李婧' },
        institutions: [{ id: 'I009', display_name: '北京大学', country_code: 'CN' }]
      }
    ],
    primary_location: {
      source: { id: 'J005', display_name: '软件学报', type: 'journal' },
      landing_page_url: 'https://www.jos.org.cn',
      pdf_url: ''
    },
    citations: []
  },
  {
    id: 'W2023-006',
    title: 'Transformers and Beyond: Architectural Innovations in 2023',
    abstract:
      'A retrospective of the most influential architectural innovations in deep learning during 2023, including state-space models, mixture-of-experts at trillion-parameter scale, and inference-time adaptation. We frame each innovation in terms of compute efficiency and downstream generalization.',
    publication_date: '2023-12-20',
    publication_year: 2023,
    cited_by_count: 912,
    related_works_count: 31,
    language: 'en',
    type: 'article',
    open_access: true,
    doi: 'https://doi.org/10.48550/arXiv.2312.10978',
    keywords: ['transformer', 'state-space model', 'MoE', 'efficiency'],
    concepts: [
      { id: 'C3', display_name: 'Artificial Intelligence', level: 0 },
      { id: 'C8', display_name: 'Deep Learning', level: 1 }
    ],
    authorships: [
      {
        author: { id: 'A013', display_name: 'Daniel Rivera' },
        institutions: [{ id: 'I010', display_name: 'UC Berkeley', country_code: 'US' }]
      },
      {
        author: { id: 'A001', display_name: 'Ming Chen' },
        institutions: [{ id: 'I001', display_name: 'Tsinghua University', country_code: 'CN' }]
      }
    ],
    primary_location: {
      source: { id: 'J002', display_name: 'arXiv preprint', type: 'repository' },
      landing_page_url: 'https://arxiv.org/abs/2312.10978',
      pdf_url: 'https://arxiv.org/pdf/2312.10978.pdf'
    },
    citations: []
  },
  {
    id: 'W2023-007',
    title: 'Climate Modeling with Foundation Models',
    abstract:
      'We propose a foundation-model approach to medium-range weather and climate forecasting. The model is trained on 40 years of reanalysis data and produces calibrated 14-day forecasts at 0.25° spatial resolution, outperforming numerical baselines on 64% of variables.',
    publication_date: '2023-09-15',
    publication_year: 2023,
    cited_by_count: 421,
    related_works_count: 18,
    language: 'en',
    type: 'article',
    open_access: true,
    is_hot: true,
    doi: 'https://doi.org/10.1038/s41586-023-06420-2',
    keywords: ['climate', 'foundation model', 'forecasting'],
    concepts: [
      { id: 'C9', display_name: 'Climate Science', level: 0 },
      { id: 'C8', display_name: 'Deep Learning', level: 1 }
    ],
    authorships: [
      {
        author: { id: 'A014', display_name: 'Hannah Müller' },
        institutions: [{ id: 'I011', display_name: 'ETH Zürich', country_code: 'CH' }]
      },
      {
        author: { id: 'A015', display_name: 'Lucas Pereira' },
        institutions: [{ id: 'I011', display_name: 'ETH Zürich', country_code: 'CH' }]
      }
    ],
    primary_location: {
      source: { id: 'J006', display_name: 'Nature', type: 'journal' },
      landing_page_url: 'https://www.nature.com/articles/s41586-023-06420-2',
      pdf_url: ''
    },
    citations: []
  },
  {
    id: 'W2023-008',
    title: 'CRISPR Base Editing for Hereditary Disease',
    abstract:
      'Adenine base editing was applied in a phase-I trial of seven patients with familial hypercholesterolemia. We observed sustained LDL-C reductions of up to 56% twelve months post infusion, with manageable adverse events.',
    publication_date: '2023-11-09',
    publication_year: 2023,
    cited_by_count: 1108,
    related_works_count: 26,
    language: 'en',
    type: 'article',
    open_access: false,
    doi: 'https://doi.org/10.1056/NEJMoa2310120',
    keywords: ['CRISPR', 'base editing', 'familial hypercholesterolemia'],
    concepts: [
      { id: 'C10', display_name: 'Genetics', level: 1 },
      { id: 'C11', display_name: 'Cardiovascular Medicine', level: 1 }
    ],
    authorships: [
      {
        author: { id: 'A016', display_name: 'Olivia García' },
        institutions: [{ id: 'I012', display_name: 'Broad Institute', country_code: 'US' }]
      }
    ],
    primary_location: {
      source: { id: 'J007', display_name: 'New England Journal of Medicine', type: 'journal' },
      landing_page_url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2310120',
      pdf_url: ''
    },
    citations: []
  },
  {
    id: 'W2022-009',
    title: 'Behavioral Economics of Open Source Contribution',
    abstract:
      'We model open-source contribution as a multi-period game with reputation accumulation, status motives, and intrinsic enjoyment. Calibration against 12 million GitHub events shows reputation explains 38% of long-tail contributor effort.',
    publication_date: '2022-08-17',
    publication_year: 2022,
    cited_by_count: 230,
    related_works_count: 11,
    language: 'en',
    type: 'article',
    open_access: true,
    doi: 'https://doi.org/10.1257/aer.20211123',
    keywords: ['behavioral economics', 'open source', 'reputation', 'incentives'],
    concepts: [
      { id: 'C12', display_name: 'Economics', level: 0 },
      { id: 'C13', display_name: 'Behavioral Science', level: 1 }
    ],
    authorships: [
      {
        author: { id: 'A017', display_name: 'Tobias Brandt' },
        institutions: [{ id: 'I013', display_name: 'University of Chicago', country_code: 'US' }]
      }
    ],
    primary_location: {
      source: { id: 'J008', display_name: 'American Economic Review', type: 'journal' },
      landing_page_url: 'https://www.aeaweb.org/articles?id=10.1257/aer.20211123',
      pdf_url: ''
    },
    citations: []
  },
  {
    id: 'W2024-010',
    title: 'Quantum Error Correction at Logical-Qubit Scale',
    abstract:
      'We demonstrate distance-7 surface-code logical qubits with logical error rates below the break-even threshold, using a 105-qubit superconducting processor. Real-time decoding sustains 1.7 μs cycle times across millions of stabilizer rounds.',
    publication_date: '2024-08-04',
    publication_year: 2024,
    cited_by_count: 78,
    related_works_count: 14,
    language: 'en',
    type: 'article',
    open_access: true,
    is_hot: true,
    doi: 'https://doi.org/10.1038/s41586-024-07107-7',
    keywords: ['quantum computing', 'error correction', 'surface code'],
    concepts: [
      { id: 'C14', display_name: 'Quantum Computing', level: 1 },
      { id: 'C15', display_name: 'Physics', level: 0 }
    ],
    authorships: [
      {
        author: { id: 'A018', display_name: 'Ryan O\'Brien' },
        institutions: [{ id: 'I014', display_name: 'Google Quantum AI', country_code: 'US' }]
      },
      {
        author: { id: 'A019', display_name: 'Mei Lin' },
        institutions: [{ id: 'I014', display_name: 'Google Quantum AI', country_code: 'US' }]
      }
    ],
    primary_location: {
      source: { id: 'J006', display_name: 'Nature', type: 'journal' },
      landing_page_url: 'https://www.nature.com/articles/s41586-024-07107-7',
      pdf_url: ''
    },
    citations: [],
    comparison: {
      method: {
        value: '基于摘要的方法推断：以摘要中关键词 "deep model" 提示为依据；详细方法学未在题录中给出。',
        source: 'abstract',
        confidence: 'low'
      },
      dataset: null,
      metrics: [
        { name: '准确率 (摘要表述)', value: '不详', source: 'abstract' }
      ],
      contribution: {
        value: '声称在某医学影像任务上取得性能提升；具体增量与基线未在可访问内容中说明。',
        source: 'abstract',
        confidence: 'low'
      },
      limitation: null
    }
  },
  {
    id: 'W2024-011',
    title: 'Multimodal Foundation Models for Medical Imaging',
    abstract:
      'A unified multimodal model trained on 4.7M radiology image-report pairs achieves expert-level performance on 14 of 17 diagnostic tasks. The model exposes counterfactual saliency maps that improve clinician trust on adversarial cases.',
    publication_date: '2024-05-19',
    publication_year: 2024,
    cited_by_count: 199,
    related_works_count: 21,
    language: 'en',
    type: 'article',
    open_access: true,
    doi: 'https://doi.org/10.1038/s41591-024-02998-5',
    keywords: ['multimodal', 'medical imaging', 'foundation model'],
    concepts: [
      { id: 'C16', display_name: 'Medical Imaging', level: 1 },
      { id: 'C3', display_name: 'Artificial Intelligence', level: 0 }
    ],
    authorships: [
      {
        author: { id: 'A020', display_name: 'Aisha Patel' },
        institutions: [{ id: 'I015', display_name: 'Imperial College London', country_code: 'GB' }]
      }
    ],
    primary_location: {
      source: { id: 'J009', display_name: 'Nature Medicine', type: 'journal' },
      landing_page_url: 'https://www.nature.com/nm',
      pdf_url: ''
    },
    citations: []
  },
  {
    id: 'W2024-012',
    title: '基于图神经网络的城市交通流预测综合方法研究',
    abstract:
      '本文综述了 2018—2024 年间基于图神经网络的城市交通流预测方法，从数据建模、模型架构、外部因子融合三个角度展开比较分析，并对未来研究方向提出了具体建议。',
    publication_date: '2024-07-02',
    publication_year: 2024,
    cited_by_count: 41,
    related_works_count: 7,
    language: 'zh-cn',
    type: 'article',
    open_access: true,
    doi: 'https://doi.org/10.16383/j.aas.c220213',
    keywords: ['图神经网络', '交通流预测', '深度学习', '综述'],
    concepts: [
      { id: 'C5', display_name: 'Graph Neural Networks', level: 2 },
      { id: 'C17', display_name: 'Transportation Engineering', level: 1 }
    ],
    authorships: [
      {
        author: { id: 'A021', display_name: '张伟' },
        institutions: [{ id: 'I016', display_name: '同济大学', country_code: 'CN' }]
      },
      {
        author: { id: 'A022', display_name: '刘思源' },
        institutions: [{ id: 'I016', display_name: '同济大学', country_code: 'CN' }]
      }
    ],
    primary_location: {
      source: { id: 'J010', display_name: '自动化学报', type: 'journal' },
      landing_page_url: 'http://www.aas.net.cn',
      pdf_url: ''
    },
    citations: [],
    comparison: {
      method: {
        value: '综述分析：从数据建模、模型架构、外部因子融合三个角度比较 2018—2024 年间的图神经网络交通流预测方法。',
        source: 'abstract',
        confidence: 'high'
      },
      dataset: {
        value: 'METR-LA / PEMS-BAY / PeMSD7 等主流公开城市交通数据集；以及部分国内城市数据集。',
        source: 'section_2',
        confidence: 'high'
      },
      metrics: [
        { name: 'MAE (15min)', value: '2.7-3.5 (典型范围)', source: 'section_3' },
        { name: 'RMSE (15min)', value: '5.1-6.8 (典型范围)', source: 'section_3' }
      ],
      contribution: {
        value: '梳理图神经网络在城市交通流预测中的演化脉络，提出"数据-模型-外部因子"三维分类法。',
        source: 'introduction',
        confidence: 'high'
      },
      limitation: {
        value: '作为综述，对各方法的复现验证有限；外部因子融合的对比口径不统一。',
        source: 'conclusion',
        confidence: 'high'
      }
    }
  },
  {
    id: 'W2023-013',
    title: 'Energy-Efficient Inference for Edge Robotics',
    abstract:
      'A neuromorphic inference accelerator processes 20 fps multi-camera SLAM workloads at 1.3 W on-device. The architecture trades sparsity for precision and is fabricated in 14 nm CMOS.',
    publication_date: '2023-06-04',
    publication_year: 2023,
    cited_by_count: 187,
    related_works_count: 9,
    language: 'en',
    type: 'article',
    open_access: false,
    doi: 'https://doi.org/10.1109/JSSC.2023.3274009',
    keywords: ['edge AI', 'neuromorphic', 'robotics'],
    concepts: [
      { id: 'C18', display_name: 'Computer Architecture', level: 1 },
      { id: 'C19', display_name: 'Robotics', level: 1 }
    ],
    authorships: [
      {
        author: { id: 'A023', display_name: 'Lin Zhao' },
        institutions: [{ id: 'I017', display_name: 'ETH Zürich', country_code: 'CH' }]
      }
    ],
    primary_location: {
      source: { id: 'J011', display_name: 'IEEE Journal of Solid-State Circuits', type: 'journal' },
      landing_page_url: 'https://ieeexplore.ieee.org',
      pdf_url: ''
    },
    citations: []
  },
  {
    id: 'W2024-014',
    title: 'Causal Discovery from Observational EHR Data',
    abstract:
      'We propose a constraint-based causal discovery framework specialized for high-dimensional electronic health records. Synthetic and real-world experiments show recovered DAGs that align with clinical guidelines on 78% of edges.',
    publication_date: '2024-02-28',
    publication_year: 2024,
    cited_by_count: 64,
    related_works_count: 8,
    language: 'en',
    type: 'article',
    open_access: true,
    doi: 'https://doi.org/10.1109/TPAMI.2024.3309203',
    keywords: ['causal inference', 'EHR', 'healthcare AI'],
    concepts: [
      { id: 'C20', display_name: 'Causal Inference', level: 2 },
      { id: 'C16', display_name: 'Medical Imaging', level: 1 }
    ],
    authorships: [
      {
        author: { id: 'A024', display_name: 'Priya Iyer' },
        institutions: [{ id: 'I018', display_name: 'NUS', country_code: 'SG' }]
      }
    ],
    primary_location: {
      source: { id: 'J012', display_name: 'IEEE TPAMI', type: 'journal' },
      landing_page_url: 'https://ieeexplore.ieee.org',
      pdf_url: ''
    },
    citations: []
  },
  {
    id: 'W2024-015',
    title: 'Algorithmic Auditing of Recommender Systems',
    abstract:
      'We design a black-box auditing protocol for industrial recommender systems with no model access. Case studies on three major platforms reveal heterogeneous content polarization patterns and propose remedies.',
    publication_date: '2024-04-10',
    publication_year: 2024,
    cited_by_count: 102,
    related_works_count: 13,
    language: 'en',
    type: 'article',
    open_access: true,
    doi: 'https://doi.org/10.1145/3641289.3641312',
    keywords: ['algorithmic auditing', 'recommender', 'fairness'],
    concepts: [
      { id: 'C4', display_name: 'Recommender Systems', level: 2 },
      { id: 'C21', display_name: 'Algorithmic Fairness', level: 2 }
    ],
    authorships: [
      {
        author: { id: 'A025', display_name: 'Carlos Mendes' },
        institutions: [{ id: 'I019', display_name: 'University of Toronto', country_code: 'CA' }]
      }
    ],
    primary_location: {
      source: { id: 'J013', display_name: 'FAccT', type: 'conference' },
      landing_page_url: 'https://facctconference.org',
      pdf_url: ''
    },
    citations: []
  },
  {
    id: 'W2023-016',
    title: 'Geometric Deep Learning over Protein Interaction Graphs',
    abstract:
      'A geometric graph network captures spatial protein-protein interaction motifs and predicts disease-associated mutations with 92% AUC across 11 organisms.',
    publication_date: '2023-10-26',
    publication_year: 2023,
    cited_by_count: 348,
    related_works_count: 15,
    language: 'en',
    type: 'article',
    open_access: true,
    doi: 'https://doi.org/10.1126/science.abq2105',
    keywords: ['geometric deep learning', 'proteins', 'bioinformatics'],
    concepts: [
      { id: 'C5', display_name: 'Graph Neural Networks', level: 2 },
      { id: 'C22', display_name: 'Computational Biology', level: 1 }
    ],
    authorships: [
      {
        author: { id: 'A026', display_name: 'Sophia Lee' },
        institutions: [{ id: 'I020', display_name: 'DeepMind', country_code: 'GB' }]
      }
    ],
    primary_location: {
      source: { id: 'J014', display_name: 'Science', type: 'journal' },
      landing_page_url: 'https://www.science.org',
      pdf_url: ''
    },
    citations: []
  },
  {
    id: 'W2024-017',
    title: 'On-Device LLMs: Memory, Latency, and Privacy Trade-offs',
    abstract:
      'A systematic measurement of 11 quantization and distillation strategies for 7B-parameter language models running on consumer mobile chips. We chart a Pareto frontier between latency, memory, and answer quality.',
    publication_date: '2024-08-22',
    publication_year: 2024,
    cited_by_count: 31,
    related_works_count: 6,
    language: 'en',
    type: 'article',
    open_access: true,
    doi: 'https://doi.org/10.1145/3658644.3658700',
    keywords: ['on-device LLM', 'quantization', 'mobile'],
    concepts: [
      { id: 'C3', display_name: 'Artificial Intelligence', level: 0 }
    ],
    authorships: [
      {
        author: { id: 'A027', display_name: 'Henrik Lundgren' },
        institutions: [{ id: 'I021', display_name: 'KTH', country_code: 'SE' }]
      }
    ],
    primary_location: {
      source: { id: 'J015', display_name: 'USENIX OSDI', type: 'conference' },
      landing_page_url: 'https://usenix.org/conference/osdi24',
      pdf_url: ''
    },
    citations: []
  },
  {
    id: 'W2024-018',
    title: 'Reproducibility Crisis in Machine Learning Research',
    abstract:
      'We attempt to reproduce 312 ML papers published between 2018 and 2023. Only 41% of reported metrics fall within their original 95% confidence intervals when re-evaluated under standardized conditions.',
    publication_date: '2024-01-30',
    publication_year: 2024,
    cited_by_count: 502,
    related_works_count: 22,
    language: 'en',
    type: 'article',
    open_access: true,
    is_hot: true,
    doi: 'https://doi.org/10.1145/3641289.3641340',
    keywords: ['reproducibility', 'machine learning', 'scientific method'],
    concepts: [
      { id: 'C23', display_name: 'Science of Science', level: 1 }
    ],
    authorships: [
      {
        author: { id: 'A028', display_name: 'Camille Lefèvre' },
        institutions: [{ id: 'I022', display_name: 'INRIA', country_code: 'FR' }]
      }
    ],
    primary_location: {
      source: { id: 'J013', display_name: 'FAccT', type: 'conference' },
      landing_page_url: 'https://facctconference.org',
      pdf_url: ''
    },
    citations: [],
    comparison: {
      method: {
        value: '可复现性研究：在标准化硬件、依赖固定版本与统一随机种子的条件下，重新运行 312 篇 ML 论文的开源代码。',
        source: 'section_3',
        confidence: 'high'
      },
      dataset: {
        value: '2018—2023 年发表于 NeurIPS / ICML / ICLR / FAccT 的 312 篇带开源代码的论文。',
        source: 'section_3',
        confidence: 'high'
      },
      metrics: [
        { name: '复现成功率', value: '41%', source: 'abstract' },
        { name: '中位数指标偏差', value: '8.3% (绝对)', source: 'section_5' }
      ],
      contribution: {
        value: '量化大规模 ML 文献的可复现性危机，给出按子领域细分的失败模式分类法。',
        source: 'abstract',
        confidence: 'high'
      },
      limitation: {
        value: '样本偏向开源论文，私有代码论文未覆盖；硬件标准化条件可能与原作者环境不完全匹配。',
        source: 'conclusion',
        confidence: 'high'
      }
    }
  }
]

export const findPaper = (id) => mockPapers.find((p) => p.id === id) || null

export const searchPapers = (params = {}) => {
  let list = [...mockPapers]
  const q = (params.search || '').trim().toLowerCase()
  if (q) {
    list = list.filter((p) => {
      const haystack = [
        p.title,
        p.abstract,
        ...(p.keywords || []),
        ...(p.authorships || []).map((a) => a.author.display_name)
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
    list.forEach((p) => (p.keyword = q))
  }

  const filter = params.filter || ''
  if (filter.includes('publication_year:')) {
    const range = filter.split('publication_year:')[1].split(',')[0]
    const [from, to] = range.split('-').map((n) => Number(n))
    list = list.filter((p) => {
      if (from && p.publication_year < from) return false
      if (to && p.publication_year > to) return false
      return true
    })
  }
  if (filter.includes('language:')) {
    const lang = filter.split('language:')[1].split(',')[0]
    list = list.filter((p) => p.language === lang)
  }
  if (filter.includes('cited_by_count:>')) {
    const min = Number(filter.split('cited_by_count:>')[1].split(',')[0])
    list = list.filter((p) => p.cited_by_count > min)
  }

  const sort = params.sort || ''
  if (sort.startsWith('cited_by_count')) {
    list.sort((a, b) =>
      sort.endsWith('desc') ? b.cited_by_count - a.cited_by_count : a.cited_by_count - b.cited_by_count
    )
  } else if (sort.startsWith('publication_date')) {
    list.sort((a, b) => {
      const da = new Date(a.publication_date).getTime()
      const db = new Date(b.publication_date).getTime()
      return sort.endsWith('desc') ? db - da : da - db
    })
  } else if (sort.startsWith('display_name')) {
    list.sort((a, b) =>
      sort.endsWith('desc') ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title)
    )
  }

  return list
}

export const hotPapers = () => mockPapers.filter((p) => p.is_hot).slice(0, 6)
