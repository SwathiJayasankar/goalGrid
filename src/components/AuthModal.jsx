import React from 'react';
import { Lock, Mail, AlertCircle, Loader } from 'lucide-react';

export default function AuthModal({
  showAuthModal,
  setShowAuthModal,
  token,
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  authError,
  setAuthError,
  authLoading,
  handleAuthSubmit
}) {
  if (!showAuthModal) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 7, 19, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(17, 24, 39, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.25)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        position: 'relative'
      }}>
        {token && (
          <button 
            onClick={() => setShowAuthModal(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '1.2rem',
              transition: 'color 0.2s ease'
            }}
          >
            ✕
          </button>
        )}

        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '56px', 
            height: '56px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            marginBottom: '16px'
          }}>
            <Lock size={24} style={{ color: '#a78bfa' }} />
          </div>
          <h2 style={{ color: 'white', fontSize: '1.75rem', fontWeight: '800', margin: '0 0 6px 0', fontFamily: "'JetBrains Mono', monospace" }}>
            {authMode === 'login' ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>
            {authMode === 'login' ? 'Sign in to access your cloud-synced planner' : 'Create an account to keep your data secure'}
          </p>
        </div>

        {authError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#6b7280' }} />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '12px 16px 12px 42px',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#6b7280' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '12px 16px 12px 42px',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
              border: 'none',
              color: 'white',
              padding: '14px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px'
            }}
          >
            {authLoading ? (
              <Loader size={18} className="spinner" />
            ) : (
              authMode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#9ca3af', marginTop: '8px' }}>
          {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'signup' : 'login');
              setAuthError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#a78bfa',
              cursor: 'pointer',
              fontWeight: '600',
              padding: 0,
              fontSize: '0.85rem'
            }}
          >
            {authMode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}
