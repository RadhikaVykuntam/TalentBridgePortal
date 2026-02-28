import React, { useState } from 'react';
import type { PageType, User, SignInFormState, FormErrors, AlertState } from '../types';
import { apiService } from '../services/apiService';
import { storage } from '../utils/storage';
import { DEFAULT_FILTERS } from '../utils/constants';
import './Auth.css';

interface SignInProps {
  onNavigate: (page: PageType) => void;
  onSignInSuccess: (user: User) => void;
}

const SignIn: React.FC<SignInProps> = ({ onNavigate, onSignInSuccess }) => {
  const [form, setForm] = useState<SignInFormState>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Enter a valid email address';
    }
    if (!form.password) {
      e.password = 'Password is required';
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
      debugger;
      // @API_CALL — apiService.signIn() — see src/services/apiService.ts
      const data = await apiService.signIn(form.email, form.password);
      if(data){
    const user:User={
              id:data.id,
              firstName:  data.firstName,
              lastName:  data.lastName,
              email: form.email,
              // resume: resume,
          }
            storage.setUser(user);
      storage.setAuth(true);
         onSignInSuccess(user);
      }

      // if (!storage.getFilters()) {
      //   storage.setFilters(user.filters ?? DEFAULT_FILTERS);
      // }
    } catch {
      setAlert({ type: 'error', msg: 'Invalid credentials. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">🔐</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your Talent Bridge account</p>
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`}>{alert.msg}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="signin-email">
              Email Address *
            </label>
            <input
              id="signin-email"
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
            <label className="form-label" htmlFor="signin-password">
              Password *
            </label>
            <input
              id="signin-password"
              className={`form-input${errors.password ? ' error' : ''}`}
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
            />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <button
            className={`btn-full${loading ? ' loading' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading && <span className="spinner" />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer-link">
          Don't have an account?{' '}
          <button className="link-btn" onClick={() => onNavigate('signup')}>
            Create one
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
