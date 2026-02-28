// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES & TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface UserFilters {
  location: string;
  jobTitle: string;
  companyType: string;
  jobType: string; // "All" | "Full-time" | "Internship" | "Part-time" | "Contract"
  skills: string[];
  postedDate: string;
}

export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  resume?: File|null;
  filters?: UserFilters;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;       // "Remote" | "Hybrid" | "On-site"
  jobType: string;    // "Internship" | "Full-time" | "Part-time" | "Contract"
  compensation: string;
  postedDate: string; // human-readable e.g. "Posted 6 days ago"
  postedDaysAgo: number;
  companyType: string;
  skills: string[];
  logo: string;       // emoji used as logo placeholder
  qualifications: string[];
  responsibilities: string[];
  applyUrl: string;
}

export type PageType =
  | 'landing'
  | 'signin'
  | 'signup'
  | 'dashboard'
  | 'profile';

export interface SignInFormState {
  email: string;
  password: string;
}

export interface SignUpFormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ProfileFormState {
  firstName: string;
  lastName: string;
}

export interface AlertState {
  type: 'error' | 'success';
  msg: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface ResumeEvaluationDto {
  probability: number;
  probabilityDisplay: string;
  reasoning: string;
  summary: string;
  improvements: string;
  marketComparison: string;
}

export interface PieSegment {
  label: string;
  value: number;
  color: string;
  description: string;
}
