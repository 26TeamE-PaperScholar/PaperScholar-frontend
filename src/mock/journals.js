/**
 * Mock journals (sources).
 */
export const mockJournals = [
  {
    id: 'J001',
    display_name: 'ACM Transactions on Information Systems',
    type: 'journal',
    issn: '1046-8188',
    publisher: 'ACM',
    h_index: 142,
    impact_factor: 5.4,
    works_count: 2120,
    cited_by_count: 184000,
    homepage_url: 'https://dl.acm.org/journal/tois',
    is_oa: true
  },
  {
    id: 'J002',
    display_name: 'arXiv preprint',
    type: 'repository',
    issn: '',
    publisher: 'Cornell University',
    h_index: 720,
    works_count: 2300000,
    cited_by_count: 12800000,
    homepage_url: 'https://arxiv.org',
    is_oa: true
  },
  {
    id: 'J003',
    display_name: 'The Web Conference (WWW)',
    type: 'conference',
    h_index: 198,
    works_count: 8430,
    cited_by_count: 412000,
    homepage_url: 'https://www2024.thewebconf.org',
    is_oa: false
  },
  {
    id: 'J004',
    display_name: 'CHI Conference on Human Factors in Computing Systems',
    type: 'conference',
    h_index: 224,
    works_count: 12480,
    cited_by_count: 612000,
    homepage_url: 'https://chi2024.acm.org',
    is_oa: false
  },
  {
    id: 'J005',
    display_name: '软件学报',
    display_name_alt: 'Journal of Software',
    type: 'journal',
    issn: '1000-9825',
    publisher: '中国计算机学会',
    h_index: 78,
    works_count: 9120,
    cited_by_count: 134000,
    homepage_url: 'https://www.jos.org.cn',
    is_oa: true
  },
  {
    id: 'J006',
    display_name: 'Nature',
    type: 'journal',
    issn: '0028-0836',
    publisher: 'Springer Nature',
    h_index: 1380,
    impact_factor: 64.8,
    works_count: 78420,
    cited_by_count: 9120000,
    homepage_url: 'https://www.nature.com',
    is_oa: false
  },
  {
    id: 'J007',
    display_name: 'New England Journal of Medicine',
    type: 'journal',
    issn: '0028-4793',
    publisher: 'Massachusetts Medical Society',
    h_index: 1240,
    impact_factor: 158.5,
    works_count: 52310,
    cited_by_count: 7820000,
    homepage_url: 'https://www.nejm.org',
    is_oa: false
  },
  {
    id: 'J008',
    display_name: 'American Economic Review',
    type: 'journal',
    issn: '0002-8282',
    publisher: 'American Economic Association',
    h_index: 326,
    impact_factor: 7.6,
    works_count: 4820,
    cited_by_count: 421000,
    homepage_url: 'https://www.aeaweb.org/journals/aer',
    is_oa: false
  },
  {
    id: 'J009',
    display_name: 'Nature Medicine',
    type: 'journal',
    issn: '1078-8956',
    publisher: 'Springer Nature',
    h_index: 612,
    impact_factor: 82.9,
    works_count: 12480,
    cited_by_count: 1820000,
    homepage_url: 'https://www.nature.com/nm',
    is_oa: false
  },
  {
    id: 'J010',
    display_name: '自动化学报',
    display_name_alt: 'Acta Automatica Sinica',
    type: 'journal',
    issn: '0254-4156',
    publisher: '中国自动化学会',
    h_index: 71,
    works_count: 7820,
    cited_by_count: 98000,
    homepage_url: 'http://www.aas.net.cn',
    is_oa: true
  }
]

export const findJournal = (id) => mockJournals.find((j) => j.id === id) || null

export const searchJournals = (params = {}) => {
  let list = [...mockJournals]
  const q = (params.search || '').trim().toLowerCase()
  if (q) {
    list = list.filter((j) =>
      [j.display_name, j.display_name_alt, j.publisher].filter(Boolean).join(' ').toLowerCase().includes(q)
    )
  }
  const filter = params.filter || ''
  if (filter.includes('type:')) {
    const type = filter.split('type:')[1].split(',')[0]
    list = list.filter((j) => j.type === type)
  }
  const sort = params.sort || ''
  if (sort.startsWith('cited_by_count')) {
    list.sort((a, b) =>
      sort.endsWith('desc') ? b.cited_by_count - a.cited_by_count : a.cited_by_count - b.cited_by_count
    )
  } else if (sort.startsWith('works_count')) {
    list.sort((a, b) =>
      sort.endsWith('desc') ? b.works_count - a.works_count : a.works_count - b.works_count
    )
  } else {
    list.sort((a, b) => b.h_index - a.h_index)
  }
  return list
}
