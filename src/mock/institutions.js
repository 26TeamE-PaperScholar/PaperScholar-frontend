/**
 * Mock institutions dataset.
 */

export const mockInstitutions = [
  {
    id: 'I001',
    display_name: 'Tsinghua University',
    display_name_alt: '清华大学',
    country_code: 'CN',
    country: '中国',
    type: 'education',
    works_count: 38420,
    cited_by_count: 1234580,
    homepage_url: 'https://www.tsinghua.edu.cn',
    ror: 'https://ror.org/03cve4549',
    geo: { city: 'Beijing', latitude: 40.0, longitude: 116.3 },
    counts_by_year: [
      { year: 2021, works_count: 5200, cited_by_count: 124000 },
      { year: 2022, works_count: 5810, cited_by_count: 168000 },
      { year: 2023, works_count: 6320, cited_by_count: 198000 },
      { year: 2024, works_count: 6090, cited_by_count: 211000 }
    ],
    top_concepts: ['Computer Science', 'Materials Science', 'Engineering']
  },
  {
    id: 'I002',
    display_name: 'Stanford University',
    country_code: 'US',
    country: 'United States',
    type: 'education',
    works_count: 42180,
    cited_by_count: 1894310,
    homepage_url: 'https://www.stanford.edu',
    ror: 'https://ror.org/00f54p054',
    geo: { city: 'Stanford, CA', latitude: 37.4, longitude: -122.1 },
    counts_by_year: [],
    top_concepts: ['Computer Science', 'Biology', 'Medicine']
  },
  {
    id: 'I005',
    display_name: 'MIT',
    display_name_alt: 'Massachusetts Institute of Technology',
    country_code: 'US',
    country: 'United States',
    type: 'education',
    works_count: 39870,
    cited_by_count: 1981200,
    homepage_url: 'https://www.mit.edu',
    geo: { city: 'Cambridge, MA', latitude: 42.36, longitude: -71.09 },
    counts_by_year: [],
    top_concepts: ['Computer Science', 'Physics', 'Engineering']
  },
  {
    id: 'I009',
    display_name: '北京大学',
    display_name_alt: 'Peking University',
    country_code: 'CN',
    country: '中国',
    type: 'education',
    works_count: 35920,
    cited_by_count: 1102450,
    homepage_url: 'https://www.pku.edu.cn',
    geo: { city: 'Beijing', latitude: 39.99, longitude: 116.30 },
    counts_by_year: [],
    top_concepts: ['Computer Science', 'Mathematics', 'Medicine']
  },
  {
    id: 'I010',
    display_name: 'UC Berkeley',
    country_code: 'US',
    country: 'United States',
    type: 'education',
    works_count: 36740,
    cited_by_count: 1620830,
    homepage_url: 'https://www.berkeley.edu',
    geo: { city: 'Berkeley, CA', latitude: 37.87, longitude: -122.27 },
    counts_by_year: [],
    top_concepts: ['Computer Science', 'Biology', 'Engineering']
  },
  {
    id: 'I011',
    display_name: 'ETH Zürich',
    country_code: 'CH',
    country: 'Switzerland',
    type: 'education',
    works_count: 28910,
    cited_by_count: 980210,
    homepage_url: 'https://ethz.ch',
    geo: { city: 'Zürich', latitude: 47.37, longitude: 8.55 },
    counts_by_year: [],
    top_concepts: ['Engineering', 'Computer Science', 'Materials Science']
  },
  {
    id: 'I014',
    display_name: 'Google Quantum AI',
    country_code: 'US',
    country: 'United States',
    type: 'company',
    works_count: 1180,
    cited_by_count: 84200,
    homepage_url: 'https://quantumai.google',
    geo: { city: 'Santa Barbara, CA', latitude: 34.42, longitude: -119.70 },
    counts_by_year: [],
    top_concepts: ['Quantum Computing', 'Physics']
  },
  {
    id: 'I015',
    display_name: 'Imperial College London',
    country_code: 'GB',
    country: 'United Kingdom',
    type: 'education',
    works_count: 24210,
    cited_by_count: 712340,
    homepage_url: 'https://www.imperial.ac.uk',
    geo: { city: 'London', latitude: 51.50, longitude: -0.17 },
    counts_by_year: [],
    top_concepts: ['Medicine', 'Engineering']
  },
  {
    id: 'I016',
    display_name: '同济大学',
    display_name_alt: 'Tongji University',
    country_code: 'CN',
    country: '中国',
    type: 'education',
    works_count: 19840,
    cited_by_count: 412130,
    homepage_url: 'https://www.tongji.edu.cn',
    geo: { city: 'Shanghai', latitude: 31.28, longitude: 121.50 },
    counts_by_year: [],
    top_concepts: ['Civil Engineering', 'Transportation', 'Computer Science']
  },
  {
    id: 'I020',
    display_name: 'DeepMind',
    country_code: 'GB',
    country: 'United Kingdom',
    type: 'company',
    works_count: 1920,
    cited_by_count: 198400,
    homepage_url: 'https://deepmind.google',
    geo: { city: 'London', latitude: 51.51, longitude: -0.13 },
    counts_by_year: [],
    top_concepts: ['Artificial Intelligence', 'Reinforcement Learning']
  }
]

export const findInstitution = (id) => mockInstitutions.find((i) => i.id === id) || null

export const searchInstitutions = (params = {}) => {
  let list = [...mockInstitutions]
  const q = (params.search || '').trim().toLowerCase()
  if (q) {
    list = list.filter((i) =>
      [i.display_name, i.display_name_alt, i.country].filter(Boolean).join(' ').toLowerCase().includes(q)
    )
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
    list.sort((a, b) => b.cited_by_count - a.cited_by_count)
  }
  return list
}
