import React, { useState } from 'react';
import type { User, PageType } from './types/index.ts';
import { storage } from './utils/storage';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';

/**
 * APP ROUTER
 * ──────────
 * Simple client-side page state machine. No external routing library needed.
 * Persists auth state and user data via localStorage.
 *
 * Page flow:
 *   Unauthenticated: landing → signin | signup → dashboard
 *   Authenticated:   dashboard ↔ profile | sign-out → landing
 */
const App: React.FC = () => {
  // Restore session from localStorage on app load
  const [user, setUser] = useState<User | null>(() => storage.getUser());
  const [page, setPage] = useState<PageType>(() => {
    if (storage.isAuthenticated() && storage.getUser()) return 'dashboard';
    return 'landing';
  });

  const isAuthenticated = !!user && storage.isAuthenticated();

  const handleNavigate = (target: PageType) => {
    // Guard authenticated-only pages
    if ((target === 'dashboard' || target === 'profile') && !isAuthenticated) {
      setPage('signin');
      return;
    }
    setPage(target);
  };

  const handleSignInSuccess = (userData: User) => {
    setUser(userData);
    setPage('dashboard');
  };

  const handleSignUpSuccess = (userData: User) => {
    setUser(userData);
    setPage('dashboard');
  };

  const handleSignOut = () => {
    storage.clear();
    setUser(null);
    setPage('landing');
  };

  const handleUserUpdate = (updated: User) => {
    setUser(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        onNavigate={handleNavigate}
        isAuthenticated={isAuthenticated}
        onSignOut={handleSignOut}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {page === 'landing' && (
          <LandingPage onNavigate={handleNavigate} />
        )}

        {page === 'signin' && (
          <SignIn
            onNavigate={handleNavigate}
            onSignInSuccess={handleSignInSuccess}
          />
        )}

        {page === 'signup' && (
          <SignUp
            onNavigate={handleNavigate}
            onSignUpSuccess={handleSignUpSuccess}
          />
        )}

        {page === 'dashboard' && isAuthenticated && user && (
          <Dashboard user={user} />
        )}

        {page === 'profile' && isAuthenticated && user && (
          <Profile user={user} onUserUpdate={handleUserUpdate} />
        )}

        {/* Redirect unauthenticated access to protected pages */}
        {(page === 'dashboard' || page === 'profile') && !isAuthenticated && (
          <SignIn
            onNavigate={handleNavigate}
            onSignInSuccess={handleSignInSuccess}
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default App;
