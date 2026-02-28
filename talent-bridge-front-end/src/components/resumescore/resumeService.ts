import type { ResumeEvaluationDto } from '../../types';

export const DEMO_DATA: ResumeEvaluationDto = {
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
};

// ─────────────────────────────────────────────
// API SERVICE  (comment out / replace as needed)
// ─────────────────────────────────────────────
export async function fetchResumeEvaluation(
  // resumeFile: File,   // ← pass the resume file when calling real API
  // jobId: string,      // ← pass job id if needed
): Promise<ResumeEvaluationDto> {

  // ── UNCOMMENT BELOW TO USE REAL API ──
  //
  // const formData = new FormData();
  // formData.append('resume', resumeFile);
  // formData.append('jobId', jobId);
  //
  // const response = await fetch('/api/resume/evaluate', {
  //   method: 'POST',
  //   body: formData,
  // });
  //
  // if (!response.ok) throw new Error('Failed to evaluate resume');
  // return response.json() as Promise<ResumeEvaluationDto>;

  // ── DEMO: simulate network delay ──
  await new Promise((res) => setTimeout(res, 1400));
  return DEMO_DATA;
}
