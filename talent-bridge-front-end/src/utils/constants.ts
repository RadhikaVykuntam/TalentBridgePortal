import type { User, Job, UserFilters } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const MIN_RESUME_SIZE_BYTES = 1024; // 1 KB minimum resume size

// ─────────────────────────────────────────────────────────────────────────────
// DUMMY DATA — Replace with real API responses when integrating
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_FILTERS: UserFilters = {
  location: '',
  jobTitle: '',
  companyType: '',
  jobType: 'All',
  skills: [],
  postedDate: '',
};

export const DUMMY_USER: User = {
  id: 'usr_001',
  firstName: 'Arjun',
  lastName: 'Sharma',
  email: 'arjun.sharma@example.com',
  // resume: 'ArjunSharma_Resume.pdf',
  filters: { ...DEFAULT_FILTERS },
};

export const DUMMY_JOBS: Job[] = [
  {
    id: 'job_001',
    title: 'Content Writer Intern',
    company: 'Testbook',
    location: 'Remote',
    type: 'Remote',
    jobType: 'Internship',
    compensation: '₹10,000–₹12,000 per month',
    postedDate: 'Posted 6 days ago',
    postedDaysAgo: 6,
    companyType: 'EdTech',
    skills: ['Content Writing', 'SEO', 'Research', 'MS Word'],
    logo: '📝',
    qualifications: [
      "Bachelor's degree in English, Journalism, or related field",
      'Strong written communication skills',
      'Basic understanding of SEO principles',
      'Ability to meet deadlines consistently',
    ],
    responsibilities: [
      'Write engaging, SEO-optimised articles for educational platforms',
      'Research and fact-check content on exam preparation topics',
      'Collaborate with the editorial team to maintain content quality',
      'Assist in creating social media posts and newsletters',
      'Edit and proofread content before publishing',
    ],
    applyUrl: '#',
  },
  {
    id: 'job_002',
    title: 'Frontend Developer',
    company: 'Razorpay',
    location: 'Bengaluru',
    type: 'Hybrid',
    jobType: 'Full-time',
    compensation: '₹8L–₹14L per annum',
    postedDate: 'Posted 2 days ago',
    postedDaysAgo: 2,
    companyType: 'Fintech',
    skills: ['React', 'TypeScript', 'CSS', 'REST APIs', 'Git'],
    logo: '💳',
    qualifications: [
      '2+ years of frontend development experience',
      'Proficiency in React and TypeScript',
      'Strong understanding of web performance optimisation',
      'Experience with design systems and component libraries',
    ],
    responsibilities: [
      'Build and maintain scalable frontend components using React and TypeScript',
      'Collaborate with designers to implement pixel-perfect UIs',
      'Optimise application performance and core web vitals',
      'Write unit and integration tests for frontend components',
      'Participate in code reviews and technical discussions',
    ],
    applyUrl: '#',
  },
  {
    id: 'job_003',
    title: 'Data Analyst',
    company: 'Flipkart',
    location: 'Hyderabad',
    type: 'On-site',
    jobType: 'Full-time',
    compensation: '₹6L–₹10L per annum',
    postedDate: 'Posted 1 day ago',
    postedDaysAgo: 1,
    companyType: 'E-commerce',
    skills: ['Python', 'SQL', 'Tableau', 'Excel', 'Statistics'],
    logo: '📊',
    qualifications: [
      "Bachelor's or Master's in Statistics, Mathematics, or CS",
      'Proficiency in Python and SQL',
      'Experience with data visualisation tools',
      'Strong analytical and problem-solving skills',
    ],
    responsibilities: [
      'Analyse large datasets to extract actionable business insights',
      'Build and maintain dashboards using Tableau',
      'Collaborate with product and business teams to define KPIs',
      'Automate reporting pipelines using Python scripts',
      'Present findings to stakeholders in a clear, concise manner',
    ],
    applyUrl: '#',
  },
  {
    id: 'job_004',
    title: 'UI/UX Design Intern',
    company: 'Swiggy',
    location: 'Remote',
    type: 'Remote',
    jobType: 'Internship',
    compensation: '₹15,000–₹20,000 per month',
    postedDate: 'Posted 10 days ago',
    postedDaysAgo: 10,
    companyType: 'Food-tech',
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    logo: '🎨',
    qualifications: [
      'Pursuing or completed degree in Design or related field',
      'Strong portfolio demonstrating UI/UX projects',
      'Proficiency in Figma or Adobe XD',
      'Understanding of user-centered design principles',
    ],
    responsibilities: [
      'Create wireframes, prototypes, and high-fidelity mockups',
      'Conduct user research and usability testing sessions',
      'Collaborate with product managers and engineers',
      'Maintain and contribute to the design system',
      'Present designs and gather feedback from stakeholders',
    ],
    applyUrl: '#',
  },
  {
    id: 'job_005',
    title: 'Backend Engineer',
    company: 'CRED',
    location: 'Bengaluru',
    type: 'Hybrid',
    jobType: 'Full-time',
    compensation: '₹15L–₹25L per annum',
    postedDate: 'Posted 3 days ago',
    postedDaysAgo: 3,
    companyType: 'Fintech',
    skills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'AWS'],
    logo: '⚡',
    qualifications: [
      '3+ years of backend development experience',
      'Strong knowledge of Java and Spring Boot',
      'Experience building distributed systems',
      'Familiarity with cloud platforms (AWS/GCP)',
    ],
    responsibilities: [
      'Design and develop scalable microservices for financial products',
      'Implement event-driven architectures using Kafka',
      'Ensure high availability and performance of backend systems',
      'Collaborate with cross-functional teams to ship features',
      'Write technical documentation and conduct code reviews',
    ],
    applyUrl: '#',
  },
  {
    id: 'job_006',
    title: 'Product Manager',
    company: 'Meesho',
    location: 'Bengaluru',
    type: 'On-site',
    jobType: 'Full-time',
    compensation: '₹18L–₹30L per annum',
    postedDate: 'Posted 7 days ago',
    postedDaysAgo: 7,
    companyType: 'E-commerce',
    skills: ['Product Strategy', 'Agile', 'SQL', 'User Research', 'Roadmapping'],
    logo: '🛒',
    qualifications: [
      '3–5 years of product management experience',
      'Strong analytical and data-driven decision-making skills',
      'Experience working with engineering and design teams',
      'Excellent communication and stakeholder management skills',
    ],
    responsibilities: [
      'Define product vision, strategy, and roadmap for key features',
      'Work closely with engineering, design, and business teams',
      'Analyse user behaviour data to inform product decisions',
      'Prioritise backlog and manage sprint planning',
      'Track KPIs and measure impact of product initiatives',
    ],
    applyUrl: '#',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FILTER OPTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const FILTER_LOCATIONS: string[] = [
  '', 'Remote', 'Bengaluru', 'Hyderabad', 'Mumbai', 'Delhi', 'Pune',
];

export const FILTER_COMPANY_TYPES: string[] = [
  '', 'EdTech', 'Fintech', 'E-commerce', 'Food-tech', 'SaaS', 'HealthTech',
];

export const FILTER_JOB_TYPES: string[] = [
  'All', 'Full-time', 'Internship', 'Part-time', 'Contract',
];

export const FILTER_POSTED_DATES: string[] = [
  '', 'Last 24 hours', 'Last 3 days', 'Last week', 'Last 2 weeks',
];

export const ALL_SKILLS: string[] = [
  'React', 'TypeScript', 'Python', 'Java', 'SQL', 'Figma',
  'Content Writing', 'SEO', 'Data Analysis', 'Node.js',
  'AWS', 'Kafka', 'Spring Boot', 'Tableau', 'Excel',
];
export const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const ALLOWED_EXTENSIONS = [".pdf", ".docx"];