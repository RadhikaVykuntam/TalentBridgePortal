import React, { useEffect } from 'react';
import type { Job } from '../types';
import './JobModal.css';

interface JobModalProps {
  job: Job;
  onClose: () => void;
}

const JobModal: React.FC<JobModalProps> = ({ job, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`${job.title} at ${job.company}`}
    >
      <div className="modal">
        {/* HEADER */}
        <div className="modal-header">
          <div className="modal-logo">{job.logo}</div>
          <div className="modal-header-info">
            <h2 className="modal-title">{job.title}</h2>
            <p className="modal-company">{job.company}</p>
            <div className="job-meta">
              <span className="job-badge badge-remote">{job.type}</span>
              <span className="job-badge badge-type">{job.jobType}</span>
              <span className="job-badge badge-company">{job.companyType}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          {/* Overview */}
          <div className="modal-section">
            <div className="modal-section-title">Overview</div>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <div className="modal-info-key">Location</div>
                <div className="modal-info-val">📍 {job.location}</div>
              </div>
              <div className="modal-info-item">
                <div className="modal-info-key">Compensation</div>
                <div className="modal-info-val">💰 {job.compensation}</div>
              </div>
              <div className="modal-info-item">
                <div className="modal-info-key">Job Type</div>
                <div className="modal-info-val">🗂️ {job.jobType}</div>
              </div>
              <div className="modal-info-item">
                <div className="modal-info-key">Posted</div>
                <div className="modal-info-val">🕒 {job.postedDate}</div>
              </div>
            </div>
          </div>

          {/* Required Skills */}
          <div className="modal-section">
            <div className="modal-section-title">Required Skills</div>
            <div className="modal-skills">
              {job.skills.map((skill) => (
                <span key={skill} className="modal-skill">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Qualifications */}
          <div className="modal-section">
            <div className="modal-section-title">Qualifications</div>
            <ul className="modal-qual-list">
              {job.qualifications.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>

          {/* Responsibilities */}
          <div className="modal-section">
            <div className="modal-section-title">Responsibilities</div>
            <ul className="modal-resp-list">
              {job.responsibilities.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button
            className="btn-apply"
            onClick={() => window.open(job.applyUrl, '_blank', 'noopener,noreferrer')}
          >
            Apply Now →
          </button>
          <button className="btn-close-modal" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobModal;
