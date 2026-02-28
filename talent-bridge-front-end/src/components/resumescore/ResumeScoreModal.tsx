import React, { useCallback, useEffect, useState } from 'react';
import type { ResumeEvaluationDto, PieSegment } from '../../types/index';
import PieChart from './PieChart';
import styles from './ResumeScoreModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: ResumeEvaluationDto | null;
  loading: boolean;
  error: string | null;
}

type TabId = 'overview' | 'improvements' | 'market';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'overview',     label: 'Overview',     icon: '◎' },
  { id: 'improvements', label: 'Improvements',  icon: '↑' },
  { id: 'market',       label: 'Market Fit',    icon: '⊕' },
];

function buildSegments(prob: number): PieSegment[] {
  const skillsGap = Math.round((100 - prob) * 0.6);
  const improvement = 100 - prob - skillsGap;
  return [
    {
      label: 'Match Score',
      value: prob,
      color: '#6fbf8e',
      description: 'Your resume aligns well with the job requirements',
    },
    {
      label: 'Skills Gap',
      value: skillsGap,
      color: '#f87171',
      description: 'Missing or weak skills compared to role expectations',
    },
    {
      label: 'Improvement Room',
      value: improvement,
      color: '#fbbf24',
      description: 'Content & formatting areas that can be optimised',
    },
  ];
}

function parseListText(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
}

function ScoreBar({ value }: { value: number }) {
  const color = value >= 70 ? '#6fbf8e' : value >= 50 ? '#fbbf24' : '#f87171';
  return (
    <div className={styles.scoreBarTrack}>
      <div
        className={styles.scoreBarFill}
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  );
}

const ResumeScoreModal: React.FC<Props> = ({ isOpen, onClose, data, loading, error }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setVisible(false);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const segments = data ? buildSegments(data.probability) : [];

  return (
    <div
      className={`${styles.backdrop} ${visible ? styles.backdropVisible : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={`${styles.modal} ${visible ? styles.modalVisible : ''}`}>
        {/* ── Header ── */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>📊</div>
            <div>
              <h2 className={styles.headerTitle}>Resume Score</h2>
              <p className={styles.headerSubtitle}>AI-powered evaluation</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div className={styles.modalBody}>
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Analysing your resume…</p>
            </div>
          )}

          {error && (
            <div className={styles.errorState}>
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Score hero */}
              <div className={styles.scoreHero}>
                <div className={styles.pieWrapper}>
                  <PieChart segments={segments} size={220} />
                </div>

                <div className={styles.scoreMeta}>
                  <div className={styles.scoreBadge} data-level={
                    data.probability >= 70 ? 'good' : data.probability >= 50 ? 'mid' : 'low'
                  }>
                    <span className={styles.scoreBadgeValue}>{data.probabilityDisplay}</span>
                    <span className={styles.scoreBadgeLabel}>
                      {data.probability >= 70 ? 'Strong Match' : data.probability >= 50 ? 'Moderate Match' : 'Needs Work'}
                    </span>
                  </div>

                  <div className={styles.legendList}>
                    {segments.map((seg) => (
                      <div key={seg.label} className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ background: seg.color }} />
                        <span className={styles.legendLabel}>{seg.label}</span>
                        <span className={styles.legendVal}>{seg.value}%</span>
                        <div style={{ width: '80px' }}>
                          <ScoreBar value={seg.value} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className={styles.tabBar}>
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className={styles.tabIcon}>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className={styles.tabContent}>
                {activeTab === 'overview' && (
                  <div className={styles.fadeIn}>
                    <div className={styles.sectionCard}>
                      <h3 className={styles.sectionTitle}>
                        <span className={styles.sectionDot} style={{ background: '#6fbf8e' }} />
                        Summary
                      </h3>
                      <p className={styles.sectionText}>{data.summary}</p>
                    </div>
                    <div className={styles.sectionCard}>
                      <h3 className={styles.sectionTitle}>
                        <span className={styles.sectionDot} style={{ background: '#818cf8' }} />
                        Reasoning
                      </h3>
                      <p className={styles.sectionText}>{data.reasoning}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'improvements' && (
                  <div className={styles.fadeIn}>
                    <div className={styles.sectionCard}>
                      <h3 className={styles.sectionTitle}>
                        <span className={styles.sectionDot} style={{ background: '#fbbf24' }} />
                        What to Improve
                      </h3>
                      <ul className={styles.bulletList}>
                        {parseListText(data.improvements).map((item, i) => (
                          <li key={i} className={styles.bulletItem}>
                            <span className={styles.bulletArrow}>→</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'market' && (
                  <div className={styles.fadeIn}>
                    <div className={styles.sectionCard}>
                      <h3 className={styles.sectionTitle}>
                        <span className={styles.sectionDot} style={{ background: '#f87171' }} />
                        Market Comparison
                      </h3>
                      <ul className={styles.bulletList}>
                        {parseListText(data.marketComparison).map((item, i) => (
                          <li key={i} className={styles.bulletItem}>
                            <span className={styles.bulletArrow} style={{ color: '#f87171' }}>⚡</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeScoreModal;
