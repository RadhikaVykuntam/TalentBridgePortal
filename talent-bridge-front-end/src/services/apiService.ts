import type { User, Job } from '../types';
import { DUMMY_USER, DUMMY_JOBS } from '../utils/constants';
import { storage } from '../utils/storage';

// ─────────────────────────────────────────────────────────────────────────────
// API SERVICE LAYER
//
// This file contains ALL API integration points for the application.
// Currently, all methods use dummy data and simulate network latency.
//
// HOW TO INTEGRATE REAL APIs:
//   1. Replace the commented `fetch(...)` blocks with real calls.
//   2. Remove or keep the dummy data fallback for development.
//   3. Add auth token handling (e.g. Bearer token from localStorage).
//   4. Handle HTTP error statuses appropriately.
//
// SEARCH FOR "@API_CALL" across this file to find each integration point.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL =  'https://localhost:7191';
//process.env.REACT_APP_API_BASE_URL

// Helper to get auth token (extend when backend auth is integrated)
const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('tb_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiService = {
  /**
   * @API_CALL — SIGN IN
   * Triggered: On Sign In form submission (application start / session restore).
   * Stores returned user in localStorage.
   *
   * TO INTEGRATE:
   *   const res = await fetch(`${BASE_URL}/api/auth/signin`, {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify({ email, password }),
   *   });
   *   if (!res.ok) throw new Error('Invalid credentials');
   *   const data = await res.json();
   *   localStorage.setItem('tb_token', data.token); // store auth token
   *   return data.user as User;
   */
signIn: async (
  email: string,
  password: string
): Promise<any> => {

  try {
    debugger;
    const res = await fetch(`${BASE_URL}/api/auth/signin`, {
      method: "POST",
        headers: {
    "Content-Type": "application/json"
  },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!res.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await res.json();

     return data;
  } catch (error) {
    console.error("Sign-in error:", error);
    throw error;
  }
},

  /**
   * @API_CALL — SIGN UP
   * Triggered: On Sign Up form submission (resume uploaded).
   * Creates a new user account and returns user data.
   *
   * TO INTEGRATE:
   *   Use FormData to send resume as multipart/form-data:
   *   const formData = new FormData();
   *   formData.append('firstName', firstName);
   *   formData.append('lastName', lastName);
   *   formData.append('email', email);
   *   formData.append('password', password);
   *   formData.append('resume', resume); // File object
   *   const res = await fetch(`${BASE_URL}/api/auth/signup`, {
   *     method: 'POST',
   *     body: formData,
   *   });
   *   if (!res.ok) throw new Error('Sign-up failed');
   *   const data = await res.json();
   *   localStorage.setItem('tb_token', data.token);
   *   return data.user as User;
   */
 signUp: async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  resumeFile: File | null
): Promise<string> => {

  const formData = new FormData();
  formData.append("FirstName", firstName);
  formData.append("LastName", lastName);
  formData.append("Email", email);
  formData.append("Password", password);

  if (resumeFile) {
    formData.append("Resume", resumeFile); 
  }
debugger;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      body: formData,
    });
debugger;
  
    if (!res.ok) {
      const errorText = await res.text(); 
      throw new Error(errorText || "Sign-up failed");
    }

    return res.json();
  } catch (error) {
    console.error("Signup error:", error);
    throw error; 
  }
},
  /**
   * @API_CALL — UPDATE PROFILE
   * Triggered: On Profile edit save (name change) OR resume upload in Profile screen.
   * Updates user details on the server and returns updated user object.
   *
   * TO INTEGRATE:
   *   Use FormData if resume is being changed:
   *   const formData = new FormData();
   *   formData.append('firstName', firstName);
   *   formData.append('lastName', lastName);
   *   if (resumeFile) formData.append('resume', resumeFile);
   *   const res = await fetch(`${BASE_URL}/api/user/profile`, {
   *     method: 'PUT',
   *     headers: { ...getAuthHeader() },
   *     body: formData,
   *   });
   *   if (!res.ok) throw new Error('Profile update failed');
   *   return (await res.json()) as User;
   */
  updateProfile: async (
    _userId: string,
    firstName: string,
    lastName: string,
    resumeName?: string
  ): Promise<User> => {
    // @API_CALL: PUT /api/user/profile (multipart/form-data if resume changes)
    // ─── Uncomment and replace below when backend is ready ───
    // const formData = new FormData();
    // formData.append('firstName', firstName);
    // formData.append('lastName', lastName);
    // if (resumeFile) formData.append('resume', resumeFile);
    // const res = await fetch(`${BASE_URL}/api/user/profile`, {
    //   method: 'PUT',
    //   headers: { ...getAuthHeader() },
    //   body: formData,
    // });
    // if (!res.ok) throw new Error('Profile update failed');
    // return (await res.json()) as User;
    // ─────────────────────────────────────────────────────────

    // DUMMY RESPONSE — remove when real API is integrated
    await new Promise((r) => setTimeout(r, 700));
    const current = storage.getUser();
    return {
      ...(current ?? DUMMY_USER),
      firstName,
      lastName,
      // resume: resumeName ?? current?.resume ?? DUMMY_USER.resume,
    };
  },

  /**
   * @API_CALL — FETCH JOB DETAILS
   * Triggered: When user clicks on a job card in the Dashboard.
   * Fetches full job details (description, qualifications, etc.) from the server.
   *
   * NOTE: Job listing/filtering does NOT trigger API calls — it reads from
   * localStorage (DUMMY_JOBS in development). Only the detail fetch is an API call.
   *
   * TO INTEGRATE:
   *   const res = await fetch(`${BASE_URL}/api/jobs/${jobId}`, {
   *     headers: { ...getAuthHeader() },
   *   });
   *   if (!res.ok) throw new Error('Job not found');
   *   return (await res.json()) as Job;
   */
  fetchJobDetails: async (jobId: string): Promise<Job | null> => {
    // @API_CALL: GET /api/jobs/:jobId
    // ─── Uncomment and replace below when backend is ready ───
    // const res = await fetch(`${BASE_URL}/api/jobs/${jobId}`, {
    //   headers: { ...getAuthHeader() },
    // });
    // if (!res.ok) return null;
    // return (await res.json()) as Job;
    // ─────────────────────────────────────────────────────────

    // DUMMY RESPONSE — remove when real API is integrated
    await new Promise((r) => setTimeout(r, 400));
    return DUMMY_JOBS.find((j) => j.id === jobId) ?? null;
  },
};
