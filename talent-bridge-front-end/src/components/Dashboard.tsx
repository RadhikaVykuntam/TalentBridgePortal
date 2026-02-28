import React, { useState, useEffect } from 'react';
import type{ User, Job, UserFilters } from '../types';
import { storage } from '../utils/storage';
import { apiService } from '../services/apiService';
import { DUMMY_JOBS, FILTER_LOCATIONS, FILTER_COMPANY_TYPES, FILTER_JOB_TYPES, FILTER_POSTED_DATES, ALL_SKILLS, DEFAULT_FILTERS } from '../utils/constants';
import JobModal from './JobModal';
import './Dashboard.css';
import TalentBridgeChatbot from './chatbot/TalentBridgeChatbot';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [filters, setFilters] = useState<UserFilters>(
    storage.getFilters() ?? DEFAULT_FILTERS
  );
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loadingJob, setLoadingJob] = useState(false);

  // Persist filters to localStorage on every change (no API call needed)
  useEffect(() => {
    storage.setFilters(filters);
  }, [filters]);

  // ── FILTERING LOGIC ────────────────────────────────────────────────────────
  // Jobs are filtered locally from constants (or localStorage cache).
  // NO API call is made for filtering — only the job detail click triggers one.
  const filteredJobs = DUMMY_JOBS.filter((job) => {
    if (
      filters.location &&
      !job.location.toLowerCase().includes(filters.location.toLowerCase()) &&
      job.type !== filters.location
    ) {
      return false;
    }
    if (
      filters.jobTitle &&
      !job.title.toLowerCase().includes(filters.jobTitle.toLowerCase())
    ) {
      return false;
    }
    if (filters.companyType && job.companyType !== filters.companyType) {
      return false;
    }
    if (filters.jobType && filters.jobType !== 'All' && job.jobType !== filters.jobType) {
      return false;
    }
    if (
      filters.skills.length > 0 &&
      !filters.skills.some((s) => job.skills.includes(s))
    ) {
      return false;
    }
    if (filters.postedDate) {
      const dayMap: Record<string, number> = {
        'Last 24 hours': 1,
        'Last 3 days': 3,
        'Last week': 7,
        'Last 2 weeks': 14,
      };
      const maxDays = dayMap[filters.postedDate];
      if (maxDays && job.postedDaysAgo > maxDays) return false;
    }
    return true;
  });

  // ── JOB CLICK ─────────────────────────────────────────────────────────────
  // @API_CALL — apiService.fetchJobDetails() triggered here (on job card click)
  const handleJobClick = async (job: Job) => {
    setLoadingJob(true);
    try {
      const details = await apiService.fetchJobDetails(job.id);
      setSelectedJob(details ?? job);
    } catch {
      setSelectedJob(job); // fallback to card data
    } finally {
      setLoadingJob(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setFilters((f) => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter((s) => s !== skill)
        : [...f.skills, skill],
    }));
  };

  const resetFilters = () => setFilters({ ...DEFAULT_FILTERS });

  return (
    <div className="dashboard">
      {/* ── SIDEBAR FILTERS ── */}
      <aside className="sidebar">
        <div className="sidebar-title">🔍 Filter Jobs</div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="f-location">Location</label>
          <select
            id="f-location"
            className="filter-select"
            value={filters.location}
            onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
          >
            {FILTER_LOCATIONS.map((l) => (
              <option key={l} value={l}>{l || 'All Locations'}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="f-title">Job Title</label>
          <input
            id="f-title"
            className="filter-input"
            type="text"
            placeholder="e.g. Frontend Developer"
            value={filters.jobTitle}
            onChange={(e) => setFilters((f) => ({ ...f, jobTitle: e.target.value }))}
          />
        </div>

        {/* <div className="filter-group">
          <label className="filter-label" htmlFor="f-company">Company Type</label>
          <select
            id="f-company"
            className="filter-select"
            value={filters.companyType}
            onChange={(e) => setFilters((f) => ({ ...f, companyType: e.target.value }))}
          >
            {FILTER_COMPANY_TYPES.map((c) => (
              <option key={c} value={c}>{c || 'All Types'}</option>
            ))}
          </select>
        </div> */}

        <div className="filter-group">
          <label className="filter-label" htmlFor="f-jobtype">Job Type</label>
          <select
            id="f-jobtype"
            className="filter-select"
            value={filters.jobType}
            onChange={(e) => setFilters((f) => ({ ...f, jobType: e.target.value }))}
          >
            {FILTER_JOB_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="f-posted">Posted Date</label>
          <select
            id="f-posted"
            className="filter-select"
            value={filters.postedDate}
            onChange={(e) => setFilters((f) => ({ ...f, postedDate: e.target.value }))}
          >
            {FILTER_POSTED_DATES.map((d) => (
              <option key={d} value={d}>{d || 'Any Time'}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <span className="filter-label">Skills</span>
          <div className="skills-filter">
            {ALL_SKILLS.map((skill) => (
              <button
                key={skill}
                className={`skill-tag${filters.skills.includes(skill) ? ' active' : ''}`}
                onClick={() => toggleSkill(skill)}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <button className="filter-reset" onClick={resetFilters}>
          ✕ Reset Filters
        </button>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content">
        <div className="jobs-header">
          <h2 className="jobs-title">
            {user?.firstName ? `Jobs for ${user.firstName}` : 'Job Listings'}
          </h2>
          <span className="jobs-count">
            {filteredJobs.length} result{filteredJobs.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="no-jobs">
            <div className="no-jobs-icon">🔭</div>
            <div className="no-jobs-title">No matching jobs found</div>
            <p>Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="job-card"
                onClick={() => handleJobClick(job)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleJobClick(job)}
                aria-label={`${job.title} at ${job.company}`}
              >
                <div className="job-card-header">
                  <div className="job-logo">{job.logo}</div>
                  <div>
                    <div className="job-card-title">{job.title}</div>
                    <div className="job-company">{job.company}</div>
                  </div>
                </div>
                <div className="job-meta">
                  <span className="job-badge badge-remote">{job.type}</span>
                  <span className="job-badge badge-type">{job.jobType}</span>
                  <span className="job-badge badge-company">{job.companyType}</span>
                </div>
                <div className="job-compensation">{job.compensation}</div>
                <div className="job-posted">{job.postedDate}</div>
                <div className="job-skills-preview">
                  {job.skills.slice(0, 3).map((s) => (
                    <span key={s} className="skill-preview">{s}</span>
                  ))}
                  {job.skills.length > 3 && (
                    <span className="skill-preview">+{job.skills.length - 3}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
         <TalentBridgeChatbot />
      {/* ── JOB MODAL ── */}
      {loadingJob && (
        <div className="modal-loading-overlay">
          <div className="modal-loading-spinner" />
          <span>Loading job details…</span>
        </div>
      )}

      {selectedJob && !loadingJob && (
        <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
    
  );
};

export default Dashboard;
