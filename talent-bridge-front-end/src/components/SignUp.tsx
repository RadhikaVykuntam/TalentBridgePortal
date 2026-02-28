import React, { useState, useRef } from 'react';
import type { PageType, User, SignUpFormState, FormErrors, AlertState } from '../types';
import { apiService } from '../services/apiService';
import { storage } from '../utils/storage';
import { readPDF } from "../utils/readPdf";
import { readDocx } from "../utils/readDocx";
import { ALLOWED_EXTENSIONS, ALLOWED_TYPES, DEFAULT_FILTERS, MIN_RESUME_SIZE_BYTES } from '../utils/constants';
import './Auth.css';

interface SignUpProps {
  onNavigate: (page: PageType) => void;
  onSignUpSuccess: (user: User) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onNavigate, onSignUpSuccess }) => {
  const [form, setForm] = useState<SignUpFormState>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [resume, setResume] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Enter a valid email address';
    }
    if (!form.password) {
      e.password = 'Password is required';
    } else if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters';
    }
    if (!resume) {
      e.resume = 'Resume is required';
    } else if (resume.size < MIN_RESUME_SIZE_BYTES) {
      e.resume = `Resume must be at least ${MIN_RESUME_SIZE_BYTES} bytes (${MIN_RESUME_SIZE_BYTES / 1024} KB)`;
    }
    return e;
  };

  const handleFile  = async (file: File | null) => {
    if (!file) return;

    const isValidType =
      ALLOWED_TYPES .includes(file.type) ||
      ALLOWED_EXTENSIONS .some(ext =>
        file.name.toLowerCase().endsWith(ext)
      );

    if (!isValidType) {
      setErrors((e) => ({ ...e, resume: "Only PDF or DOCX files are allowed." }));
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setResume(file);
      try {
    const text = await readResume(file);
    debugger;
    const extractedText=sendTextToAI(text);
    
 debugger;

  } catch (err) {
    console.error(err);
  }

    setErrors((e) => ({ ...e, resume: undefined }));
  };
  const readResume = async (file: File): Promise<string> => {
    debugger;
  if (file.type === "application/pdf") {
    return readPDF(file);
  }

  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return readDocx(file);
  }

  throw new Error("Unsupported file type");
};
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0] ?? null;
    handleFile(file);
  };
const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const e = validate();
  setErrors(e);
  debugger;
  if (Object.keys(e).length > 0) return;

  setLoading(true);
  setAlert(null);
  
  try {
    debugger;
    const id=await apiService.signUp(
      form.firstName,
      form.lastName,
      form.email,
      form.password,
      resume
    );
    debugger;
    if(id){
          const user:User={
        firstName:  form.firstName,
        lastName:  form.lastName,
        email: form.email,
        resume: resume,
    }
  debugger;
    storage.setUser(user);
    storage.setAuth(true);
    // storage.setFilters(user.filters ?? DEFAULT_FILTERS);
    onSignUpSuccess(user);
    }
  } catch {
    setAlert({ type: 'error', msg: 'Something went wrong. Please try again.' });
  } finally {
    setLoading(false);
  }
};
 const sendTextToAI= async (resumeText: string) => {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
         model: "llama-3.1-8b-instant",
           response_format: { type: "json_object" },
        temperature: 0,
      messages: [
  {
    role: "system",
    content: "You are a JSON generator. You must output ONLY valid JSON. No explanations. No markdown. No extra text."
  },
  {
    role: "user",
    content: `
Extract the following details from the resume below:

1. Current role (most recent job title)
2. Total years of professional experience (calculate if possible)
3. Skills

Return ONLY valid JSON in this EXACT format:

{
  "skills": string[],
  "experience": [
    {
      "current_role": string,
      "total_years_experience": string
    }
  ]
}

Rules:
- Do NOT return explanations.
- Do NOT return markdown.
- Do NOT include extra text.
- If something is missing, return empty string or empty array.
- "years" should represent duration worked in that role (example: "2 years", "Jan 2020 - Mar 2022", etc.)

Resume:
${resumeText}
`
  }
],


      }),
    }
  );

  const data = await response.json();
try {
  const raw = data.choices[0].message.content;
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
if (!jsonMatch) return null;
const g=JSON.parse(jsonMatch[0]);
return JSON.parse(jsonMatch[0]);
} catch (err) {
  console.error("Failed to parse JSON:", err);
  return null;
}

};
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">🚀</div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join Talent Bridge and find your next opportunity</p>
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`}>{alert.msg}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="su-firstname">First Name *</label>
              <input
                id="su-firstname"
                className={`form-input${errors.firstName ? ' error' : ''}`}
                type="text"
                placeholder="Arjun"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                autoComplete="given-name"
              />
              {errors.firstName && <p className="form-error">{errors.firstName}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="su-lastname">Last Name *</label>
              <input
                id="su-lastname"
                className={`form-input${errors.lastName ? ' error' : ''}`}
                type="text"
                placeholder="Sharma"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                autoComplete="family-name"
              />
              {errors.lastName && <p className="form-error">{errors.lastName}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="su-email">Email Address *</label>
            <input
              id="su-email"
              className={`form-input${errors.email ? ' error' : ''}`}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              autoComplete="email"
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="su-password">Password *</label>
            <input
              id="su-password"
              className={`form-input${errors.password ? ' error' : ''}`}
              type="password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              autoComplete="new-password"
            />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Resume * (PDF / DOCX)</label>
            <div
              className={`upload-area${dragOver ? ' drag-over' : ''}${resume ? ' has-file' : ''}${errors.resume ? ' upload-error' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
              aria-label="Upload resume"
            >
              <div className="upload-icon">{resume ? '✅' : '📎'}</div>
              <div className="upload-text">
                {resume ? 'Resume uploaded' : 'Click or drag & drop your resume'}
              </div>
              {resume && (
                <div className="upload-filename">
                  {resume.name} ({(resume.size / 1024).toFixed(1)} KB)
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx"
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </div>
            {errors.resume && <p className="form-error">{errors.resume}</p>}
            <p className="form-hint">
              Minimum size: {MIN_RESUME_SIZE_BYTES} bytes · Accepted: PDF, DOCX
            </p>
          </div>

          <button
            className={`btn-full${loading ? ' loading' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading && <span className="spinner" />}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-link">
          Already have an account?{' '}
          <button className="link-btn" onClick={() => onNavigate('signin')}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
