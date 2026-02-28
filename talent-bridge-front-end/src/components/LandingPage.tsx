import React from 'react';
import type { PageType } from '../types';
import './LandingPage.css';

interface LandingPageProps {
  onNavigate: (page: PageType) => void;
}

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    icon: '🔍',
    title: 'Unified Discovery',
    desc: 'Browse thousands of curated jobs from top platforms in one intelligent dashboard.',
  },
  {
    icon: '🎯',
    title: 'Smart Filters',
    desc: 'Filter by location, job type, skills, company type, and posting date to find your perfect match.',
  },
  {
    icon: '📊',
    title: 'AI Resume Scoring',
    desc: 'Get insights on strengths, gaps, and improvement areas to increase your chances of getting shortlisted.',
  },
  {
    icon: '🤖',
    title: 'AI Career Chatbot',
    desc: 'Chat with an intelligent assistant for personalized guidance.Ask questions, get resume suggestions, career advice, and job-specific tips',
  },
];

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <main className="landing">
      <section className="landing-hero">
        <div className="hero-eyebrow">✦ Your Career, Simplified</div>
        <h1 className="hero-title">
          Stop Searching.<br />
          <em>Get Hired.</em>
        </h1>
        <p className="hero-desc">
          Talent Bridge brings job listings from multiple platforms into one simple dashboard.
          Discover opportunities faster, and stay organised
          throughout your job search.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => onNavigate('signup')}>
            Get Started — It's Free
          </button>
          <button className="btn-secondary" onClick={() => onNavigate('signin')}>
            I Already Have an Account
          </button>
        </div>
      </section>

      <section className="landing-features">
        {FEATURES.map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
};

export default LandingPage;
