import React from 'react';
import { Menu, Cloud, Loader, AlertCircle, User, Sparkles } from 'lucide-react';

export default function Header({
  token,
  syncStatus,
  userEmail,
  activeTab,
  handleLogout,
  setShowAuthModal,
  setAuthMode,
  onMobileMenuOpen,
  isAiOpen,
  onAiToggle
}) {
  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'daily':
        return { group: 'Dashboard', page: 'Daily Goals & Routine' };
      case 'weeklyToDo':
        return { group: 'Dashboard', page: 'Weekly To-Do List' };
      case 'calendar':
        return { group: 'Dashboard', page: 'Interactive Calendar' };
      case 'analytics':
        return { group: 'Performance Tracker', page: 'Insights & Analytics' };
      case 'journal':
        return { group: 'AI Coaching Space', page: 'Daily Reflection Journal' };
      case 'planner':
        return { group: 'AI Copilot', page: 'Goal Roadmap Planner', isAi: true };
      case 'weekly':
        return { group: 'AI Copilot', page: 'Weekly Smart Schedule', isAi: true };
      default:
        return { group: 'Workspace', page: 'Overview' };
    }
  };

  const { group, page, isAi } = getBreadcrumb();

  return (
    <header className="top-navbar-header glass-panel">
      {/* Left side: Hamburger button + Breadcrumbs title */}
      <div className="navbar-left">
        <button 
          className="navbar-mobile-toggle"
          onClick={onMobileMenuOpen}
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="navbar-breadcrumb">
          <span className="breadcrumb-group">{group}</span>
          <span className="breadcrumb-separator">/</span>
          <span className={`breadcrumb-current ${isAi ? 'ai-glow-text' : ''}`}>
            {isAi && <Sparkles size={12} style={{ display: 'inline-block', marginRight: '6px', color: '#ffb5a7' }} />}
            {page}
          </span>
        </div>
      </div>

      {/* Right side: Sync indicators + secondary Sign In if needed */}
      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Compact Sync status (mostly for mobile/smaller screens where sidebar is hidden) */}
        {token && (
          <div className="navbar-sync-icon" title={`Database sync: ${syncStatus}`}>
            {syncStatus === 'synced' && <Cloud size={18} className="text-emerald" />}
            {syncStatus === 'saving' && <Loader size={18} className="spinner text-primary" />}
            {syncStatus === 'error' && <AlertCircle size={18} className="text-error" />}
          </div>
        )}

        {/* AI Assistant Copilot Toggle */}
        {token && (
          <button
            onClick={onAiToggle}
            title="Toggle AI Copilot"
            style={{
              background: isAiOpen ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: isAiOpen ? '1px solid rgba(124, 58, 237, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '999px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isAiOpen ? '#c084fc' : '#94a3b8',
              transition: 'all 0.3s ease',
              boxShadow: isAiOpen ? '0 0 12px rgba(124, 58, 237, 0.3)' : 'none',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#c084fc';
              e.currentTarget.style.background = 'rgba(124, 58, 237, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(124, 58, 237, 0.2)';
            }}
            onMouseLeave={(e) => {
              if (!isAiOpen) {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = 'none';
              } else {
                e.currentTarget.style.color = '#c084fc';
                e.currentTarget.style.background = 'rgba(124, 58, 237, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.4)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(124, 58, 237, 0.3)';
              }
            }}
          >
            <Sparkles size={16} className={isAiOpen ? 'animate-pulse' : ''} />
          </button>
        )}

        {/* Display profile indicator/Sign-in in top navigation on smaller viewports */}
        {!token ? (
          <button 
            className="navbar-signin-btn"
            onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
          >
            Sign In
          </button>
        ) : (
          <div className="navbar-user-indicator">
            <User size={14} style={{ color: '#a78bfa' }} />
            <span className="user-email-narrow">{userEmail.split('@')[0]}</span>
          </div>
        )}
      </div>
    </header>
  );
}
