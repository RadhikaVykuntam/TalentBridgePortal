import React, { useState, useRef } from 'react';
import type { User, ProfileFormState, FormErrors, AlertState } from '../types';
import { apiService } from '../services/apiService';
import { storage } from '../utils/storage';
import { MIN_RESUME_SIZE_BYTES } from '../utils/constants';
import './Profile.css';
import './Auth.css'; // shared form styles

interface ProfileProps {
  user: User;
  onUserUpdate: (updated: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUserUpdate }) => {
  const [form, setForm] = useState<ProfileFormState>({
    firstName: user.firstName,
    lastName: user.lastName,
  });
  const [resume, setResume] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (resume && resume.size < MIN_RESUME_SIZE_BYTES) {
      e.resume = `Resume must be at least ${MIN_RESUME_SIZE_BYTES} bytes`;
    }
    return e;
  };

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    setAlert(null);

    try {
      // @API_CALL — apiService.updateProfile() — see src/services/apiService.ts
      // Triggered on: profile edit save OR resume update
      // const updated = await apiService.updateProfile(
      //   // user.id,
      //   form.firstName,
      //   form.lastName,
      //   resume?.name
      // );
      // storage.setUser(updated);
      // onUserUpdate(updated);
      setAlert({ type: 'success', msg: 'Profile updated successfully!' });
      setResume(null); // reset file input after save
    } catch {
      setAlert({ type: 'error', msg: 'Update failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const initials = `${form.firstName?.[0] ?? ''}${form.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="profile-page-wrapper">
      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-avatar">{initials || '👤'}</div>
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your personal information and resume</p>
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`}>{alert.msg}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Personal Info Card */}
          <div className="profile-card">
            <div className="profile-card-title">Personal Information</div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="p-firstname">First Name *</label>
                <input
                  id="p-firstname"
                  className={`form-input${errors.firstName ? ' error' : ''}`}
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  autoComplete="given-name"
                />
                {errors.firstName && <p className="form-error">{errors.firstName}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="p-lastname">Last Name *</label>
                <input
                  id="p-lastname"
                  className={`form-input${errors.lastName ? ' error' : ''}`}
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  autoComplete="family-name"
                />
                {errors.lastName && <p className="form-error">{errors.lastName}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="p-email">
                Email Address <span className="field-readonly">(cannot be changed)</span>
              </label>
              <input
                id="p-email"
                className="form-input"
                type="email"
                value={user.email}
                disabled
                aria-readonly="true"
              />
            </div>
          </div>

          {/* Resume Card */}
          <div className="profile-card">
            <div className="profile-card-title">Resume</div>

            <div className="form-group">
              <label className="form-label">Current Resume</label>
              <div className="current-resume">
                📎 {user.resume?.name || 'No resume uploaded'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Update Resume</label>
              <div
                className={`upload-area${resume ? ' has-file' : ''}${errors.resume ? ' upload-error' : ''}`}
                onClick={() => fileRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
                aria-label="Upload new resume"
              >
                <div className="upload-icon">{resume ? '✅' : '📤'}</div>
                <div className="upload-text">
                  {resume ? 'New resume selected' : 'Click to upload a new resume'}
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
                  onChange={(e) => setResume(e.target.files?.[0] ?? null)}
                />
              </div>
              {errors.resume && <p className="form-error">{errors.resume}</p>}
              <p className="form-hint">Leave blank to keep your current resume</p>
            </div>
          </div>

          <button
            className={`btn-full sage${loading ? ' loading' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading && <span className="spinner" />}
            {loading ? 'Saving changes…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
