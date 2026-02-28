import React, { useCallback, useState } from "react";
import type { PageType, ResumeEvaluationDto } from "../types";
import image from "../assets/image.png"
import "./Header.css";
import { storage } from "../utils/storage";
import ResumeScoreModal from "./resumescore/ResumeScoreModal";
import { fetchResumeEvaluation } from "./resumescore/resumeService";

interface HeaderProps {
  onNavigate: (page: PageType) => void;
  isAuthenticated: boolean;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onNavigate,
  isAuthenticated,
  onSignOut,
}) => {
  const [page, setPage] = useState<PageType>(() => {
    if (storage.isAuthenticated() && storage.getUser()) return "dashboard";
    return "landing";
  });
  const [showConfirm, setShowConfirm] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
  const [evalData, setEvalData] = useState<ResumeEvaluationDto | null>({
  probability: 75,
  probabilityDisplay: '75%',
  reasoning:
    'The candidate has a strong background in front-end development with relevant experience in UI technologies and a good understanding of the SDLC process and Agile development methodology. However, the resume could be improved with more details on achievements and impact in previous projects.',
  summary:
    'The candidate has 2+ years of experience in web-based applications with a focus on front-end technologies and good communication skills. The candidate also has experience in working with various Angular versions and has a strong foundation in HTML, CSS, and JavaScript.',
  improvements:
    '- Adding more specific numbers and metrics to demonstrate the impact of the candidate\'s work in previous projects.\n- Providing more details on the candidate\'s role in the team and leadership experience.\n- Including relevant certifications or online courses to enhance the candidate\'s technical skills.',
  marketComparison:
    '* The resume lacks a clear career objective or summary statement at the beginning to highlight the candidate\'s goals and job aspirations.\n* The format and design of the resume could be improved to make it more visually appealing and easy to scan.\n* The candidate\'s education and qualifications section could be more concise and focused on relevant degrees and certifications.\n* The resume does not include any relevant technical skills or tools that are currently in-demand in the industry, such as React or Vue.js.',
}
);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const [hasLoaded, setHasLoaded] = useState(false);
  const closeModal = useCallback(() => setModalOpen(false), []);
   const openModal = useCallback(async () => {
    setModalOpen(true);

   
    if (hasLoaded) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchResumeEvaluation();
      setEvalData(result);
      setHasLoaded(true);
    } catch (err) {
      setError('Failed to load resume evaluation. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [hasLoaded]);

  return (
    <header className="header">
      <div
        className="header-logo"
        onClick={() => onNavigate(isAuthenticated ? "dashboard" : "landing")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          e.key === "Enter" &&
          onNavigate(isAuthenticated ? "dashboard" : "landing")
        }
      >
        <img src={image} alt="logo" height={60} width={60}></img> Talent<span>Bridge</span>
      </div>

      <nav className="header-nav">
        {isAuthenticated ? (
          <>
                
          <button
            className="resumeScoreBtn"
            onClick={openModal}
            title="Check your resume score"
          >
            <span className="resumeScoreBtnIcon">📋</span>
            Resume Score
            {hasLoaded && evalData && (
              <span className="styles.scorePill">{evalData.probabilityDisplay}</span>
            )}
          </button>
            <button
              className={`nav-btn nav-btn-icon ${page === "dashboard" ? "nav-button-click" : ""}`}
              onClick={() => {
                onNavigate("dashboard");
                setPage("dashboard");
              }}
            >
              Dashboard
            </button>

            <button
              className={`nav-btn nav-btn-icon ${page === "profile" ? "nav-button-click" : ""}`}
              onClick={() => {
                onNavigate("profile");
                setPage("profile");
              }}
            >
              Profile
            </button>

            <button
              className="nav-btn nav-btn-ghost"
              onClick={() => setShowConfirm(true)}
            >
              Sign Out
            </button>
            {showConfirm && (
              <div className="confirm-overlay">
                <div className="confirm-box">
                  <h3>Are you sure you want to sign out?</h3>

                  <div className="confirm-actions">
                    <button
                      className="btn-cancel"
                      onClick={() => setShowConfirm(false)}
                    >
                      Cancel
                    </button>

                    <button
                      className="btn-ok"
                      onClick={() => {
                        setShowConfirm(false);
                        onSignOut();
                      }}
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <button
              className="nav-btn nav-btn-ghost"
              onClick={() => onNavigate("signin")}
            >
              Sign In
            </button>
            <button
              className="nav-btn nav-btn-solid"
              onClick={() => onNavigate("signup")}
            >
              Sign Up
            </button>
          </>
        )}
      </nav>
      <ResumeScoreModal
        isOpen={modalOpen}
        onClose={closeModal}
        data={evalData}
        loading={loading}
        error={error}
      />
    </header>
    
  );
};

export default Header;
