import React from 'react';
import { 
  CheckCircle2, 
  ListTodo, 
  Calendar, 
  BarChart2, 
  BookOpen, 
  TrendingUp, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  User, 
  Cloud, 
  Loader, 
  AlertCircle,
  X,
  FolderOpen
} from 'lucide-react';

export default function SidebarMenu({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  token,
  userEmail,
  handleLogout,
  setShowAuthModal,
  setAuthMode,
  syncStatus
}) {
  const tabs = [
    { id: 'daily', label: 'Daily To-Dos', icon: <CheckCircle2 size={18} />, section: 'standard' },
    { id: 'weeklyToDo', label: 'Weekly Overview', icon: <ListTodo size={18} />, section: 'standard' },
    { id: 'calendar', label: 'Calendar Grid', icon: <Calendar size={18} />, section: 'standard' },
    { id: 'analytics', label: 'Analytics Panel', icon: <BarChart2 size={18} />, section: 'standard' },
    { id: 'journal', label: 'Reflection Journal', icon: <BookOpen size={18} />, section: 'standard' },
    { id: 'files', label: 'File Locker', icon: <FolderOpen size={18} />, section: 'standard' },
    { id: 'planner', label: 'AI Roadmap', icon: <TrendingUp size={18} />, section: 'ai', isAi: true },
    { id: 'weekly', label: 'AI Calendar Schedule', icon: <Sparkles size={18} />, section: 'ai', isAi: true }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const renderTabButton = (tab) => {
    const isActive = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => handleTabClick(tab.id)}
        className={`sidebar-menu-btn ${isActive ? 'active' : ''} ${tab.isAi ? 'ai-btn' : ''}`}
        title={isCollapsed ? tab.label : ''}
      >
        <span className="btn-icon">{tab.icon}</span>
        {!isCollapsed && <span className="btn-label">{tab.label}</span>}
        {isActive && !isCollapsed && <span className="active-indicator" />}
      </button>
    );
  };

  const standardTabs = tabs.filter(t => t.section === 'standard');
  const aiTabs = tabs.filter(t => t.section === 'ai');

  return (
    <>
      {/* Mobile Sidebar backdrop */}
      {isMobileOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`sidebar-container ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Top brand area */}
        <div className="sidebar-brand-wrapper">
          {!isCollapsed ? (
            <div className="brand-logo-area">
              <span className="brand-logo-square">🎯</span>
              <div className="brand-text-nodes">
                <span className="brand-name">GoalGrid.</span>
                <span className="brand-slogan">Focus & Manifest</span>
              </div>
            </div>
          ) : (
            <div className="brand-compact-logo">🎯</div>
          )}

          {/* Mobile close button */}
          <button 
            className="sidebar-mobile-close" 
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Toggle size button (desktop only) */}
        <button 
          className="sidebar-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Categories / Navigation Links */}
        <div className="sidebar-nav-scroll">
          <div className="navigation-group">
            {!isCollapsed && <span className="group-label">WORKSPACE</span>}
            {standardTabs.map(renderTabButton)}
          </div>

          <div className="sidebar-group-divider" />

          <div className="navigation-group">
            {!isCollapsed && (
              <span className="group-label ai-label">
                <Sparkles size={12} style={{ marginRight: '4px', verticalAlign: 'middle', display: 'inline-block' }} /> 
                AI COPILOT
              </span>
            )}
            {aiTabs.map(renderTabButton)}
          </div>
        </div>

        {/* Bottom profile / sync area */}
        <div className="sidebar-footer">
          {/* Cloud Sync indicator */}
          {token && (
            <div className={`sidebar-sync-badge ${isCollapsed ? 'compact' : ''}`}>
              {syncStatus === 'synced' && (
                <>
                  <Cloud size={16} className="text-emerald" />
                  {!isCollapsed && <span>Synced</span>}
                </>
              )}
              {syncStatus === 'saving' && (
                <>
                  <Loader size={16} className="spinner text-primary" />
                  {!isCollapsed && <span>Saving...</span>}
                </>
              )}
              {syncStatus === 'error' && (
                <>
                  <AlertCircle size={16} className="text-error" />
                  {!isCollapsed && <span className="text-error">Sync Error</span>}
                </>
              )}
            </div>
          )}

          {/* User info box */}
          {token ? (
            <div className={`sidebar-profile-box ${isCollapsed ? 'compact' : ''}`}>
              <div className="avatar-square">
                <User size={16} />
              </div>
              {!isCollapsed && (
                <div className="profile-details">
                  <span className="profile-email" title={userEmail}>{userEmail}</span>
                  <span className="profile-role">Pro Account</span>
                </div>
              )}
              <button 
                className="btn-logout" 
                onClick={handleLogout}
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="auth-fallback-box">
              <button 
                className="sidebar-signin-btn"
                onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
                title="Sign In"
              >
                <User size={16} />
                {!isCollapsed && <span>Sign In</span>}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
