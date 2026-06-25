import React from 'react';
import { Cloud, Loader, AlertCircle, User, LogOut, CheckCircle2, ListTodo, Calendar, TrendingUp, BarChart2, BookOpen } from 'lucide-react';

export default function Header({
  token,
  syncStatus,
  userEmail,
  activeTab,
  setActiveTab,
  handleLogout,
  setShowAuthModal,
  setAuthMode
}) {
  return (
    <>
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div className="header-left animate-fade">
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px' }}>GoalGrid.</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 400 }}>Master your focus, manifest your goals</p>
        </div>
        
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Cloud Sync Status Indicator */}
          {token && (
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                padding: '6px 12px', 
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '0.85rem'
              }}
            >
              {syncStatus === 'synced' && (
                <>
                  <Cloud size={16} style={{ color: '#10b981', filter: 'drop-shadow(0 0 4px #10b981)' }} />
                  <span style={{ color: '#a1a1aa' }}>Cloud Synced</span>
                </>
              )}
              {syncStatus === 'saving' && (
                <>
                  <Loader size={16} className="spinner" style={{ color: '#7c3aed', filter: 'drop-shadow(0 0 4px #7c3aed)' }} />
                  <span style={{ color: '#a1a1aa' }}>Saving...</span>
                </>
              )}
              {syncStatus === 'error' && (
                <>
                  <AlertCircle size={16} style={{ color: '#ef4444', filter: 'drop-shadow(0 0 4px #ef4444)' }} />
                  <span style={{ color: '#ef4444' }}>Sync Error</span>
                </>
              )}
            </div>
          )}
          
          {/* User Session Info & Logout Button */}
          {token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={16} style={{ color: '#a78bfa' }} />
                {userEmail}
              </span>
              <button 
                onClick={handleLogout}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  background: 'rgba(239, 68, 68, 0.2)', 
                  border: '1px solid rgba(239, 68, 68, 0.4)', 
                  color: '#fca5a5', 
                  padding: '6px 14px', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                <LogOut size={14} />
                Log Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)', 
                border: 'none', 
                color: 'white', 
                padding: '8px 18px', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <User size={14} />
              Sign In
            </button>
          )}
        </div>
      </div>

      <div className="tab-navigation animate-slide" style={{ width: '100%', justifyContent: 'space-between', background: 'transparent', border: 'none', padding: 0, marginTop: '20px' }}>
        <div className="glass-panel" style={{ display: 'flex', gap: '8px', padding: '6px', borderRadius: '16px' }}>
          <button
            className={`tab-button premium-button ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
            style={{ borderRadius: '12px' }}
          >
            <CheckCircle2 size={16} />
            Daily
          </button>
          <button
            className={`tab-button premium-button ${activeTab === 'weeklyToDo' ? 'active' : ''}`}
            onClick={() => setActiveTab('weeklyToDo')}
            style={{ borderRadius: '12px' }}
          >
            <ListTodo size={16} />
            Weekly
          </button>
          <button
            className={`tab-button premium-button ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
            style={{ borderRadius: '12px' }}
          >
            <Calendar size={16} />
            Calendar
          </button>
          <button
            className={`tab-button premium-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
            style={{ borderRadius: '12px' }}
          >
            <BarChart2 size={16} />
            Analytics
          </button>
          <button
            className={`tab-button premium-button ${activeTab === 'journal' ? 'active' : ''}`}
            onClick={() => setActiveTab('journal')}
            style={{ borderRadius: '12px' }}
          >
            <BookOpen size={16} />
            Journaling
          </button>
        </div>

        <div className="glass-panel" style={{ display: 'flex', gap: '8px', padding: '6px', borderRadius: '16px', border: '1px solid var(--primary-glow)', background: 'rgba(124, 58, 237, 0.05)' }}>
          <button
            className={`tab-button ai-tab premium-button ${activeTab === 'planner' ? 'active' : ''}`}
            onClick={() => setActiveTab('planner')}
            style={{ color: activeTab === 'planner' ? 'white' : '#c4b5fd', borderRadius: '12px' }}
          >
            <TrendingUp size={16} />
            AI Roadmap
          </button>
          <button
            className={`tab-button ai-tab premium-button ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
            style={{ color: activeTab === 'weekly' ? 'white' : '#c4b5fd', borderRadius: '12px' }}
          >
            <Calendar size={16} />
            AI Schedule
          </button>
        </div>
      </div>
    </>
  );
}
