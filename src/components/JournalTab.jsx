import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Brain, Zap, Target, MessageCircle, Send, Loader2, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

export default function JournalTab({
  journalEntries,
  setJournalEntries,
  journalReflections,
  setJournalReflections,
  journalMoods,
  setJournalMoods,
  token,
  goals,
  calendarTasks,
  fixedRoutine,
  API_URL,
  formatDate
}) {
  const [entry, setEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reflection, setReflection] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const moodOptions = [
    { emoji: '🤩', label: 'Energetic', color: '#fbbf24' },
    { emoji: '😊', label: 'Happy', color: '#10b981' },
    { emoji: '😐', label: 'Neutral', color: '#94a3b8' },
    { emoji: '😔', label: 'Low', color: '#6366f1' },
    { emoji: '😫', label: 'Stressed', color: '#ef4444' }
  ];

  // Chat State
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Trends State
  const [showTrends, setShowTrends] = useState(false);
  const [trendData, setTrendData] = useState(null);
  const [isTrendsLoading, setIsTrendsLoading] = useState(false);
  const [trendError, setTrendError] = useState(null);

  const [reflectionMode, setReflectionMode] = useState('balanced');

  const reflectionModes = [
    { id: 'balanced', label: 'Balanced', icon: <Brain size={16} />, desc: 'Coaching on both productivity & well-being.' },
    { id: 'stoic', label: 'Stoic', icon: <Target size={16} />, desc: 'Focus on what was within your control and personal virtue.' },
    { id: 'rose', label: 'ROSE', icon: <Sparkles size={16} />, desc: 'Mention: Rose- Highlight, Thorn- Challenge, and Bud- Opportunity.' },
    { id: 'productivity', label: 'Productivity', icon: <Zap size={16} />, desc: 'Focus on execution blockers, momentum, and energy.' },
    { id: 'eq', label: 'EQ', icon: <MessageCircle size={16} />, desc: 'Focus on emotional triggers and social patterns.' }
  ];

  const dateKey = formatDate(selectedDate);

  useEffect(() => {
    setEntry(journalEntries[dateKey] || '');
    setReflection(journalReflections[dateKey] || null); // Load persisted reflection
    setSelectedMood(journalMoods[dateKey] || null);
    setChatHistory([]); // Clear chat history when date changes
    setShowChat(false);
  }, [dateKey, journalEntries, journalReflections, journalMoods]);

  const fetchTrends = async (force = false) => {
    const isForced = force === true;
    if (!isForced) {
      if (showTrends) {
        setShowTrends(false);
        return;
      }
      setShowTrends(true);
    }
    
    if (trendData && !isForced) return;
    
    setIsTrendsLoading(true);
    setTrendError(null);
    try {
      const url = `${API_URL}/planner/trends`;
      console.log('Fetching trends from:', url);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error (${response.status})`);
      }
      const data = await response.json();
      setTrendData(data);
    } catch (err) {
      console.error('Trends error:', err);
      setTrendError(err.message);
    } finally {
      setIsTrendsLoading(false);
    }
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setJournalMoods(prev => ({
      ...prev,
      [dateKey]: mood
    }));
  };

  const handleSaveEntry = (val) => {
    setEntry(val);
    setJournalEntries(prev => ({
      ...prev,
      [dateKey]: val
    }));
  };

  const handleAnalyze = async () => {
    if (!entry.trim()) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch(`${API_URL}/planner/reflect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          journalEntry: entry,
          mood: selectedMood,
          date: dateKey,
          goals,
          calendarTasks,
          journalEntries,
          journalMoods,
          fixedRoutine,
          reflectionMode
        })
      });

      if (!response.ok) throw new Error('Failed to analyze journal');

      const data = await response.json();
      setReflection(data);
      setJournalReflections(prev => ({
        ...prev,
        [dateKey]: data
      }));
      
      // Auto-refresh Trends to include this new reflection
      fetchTrends(true);
    } catch (err) {
      console.error('Reflection error:', err);
      alert('Could not analyze your journal right now. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateDraft = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(`${API_URL}/planner/generate-journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          date: dateKey,
          goals,
          calendarTasks,
          fixedRoutine
        })
      });

      if (!response.ok) throw new Error('Failed to generate draft');

      const data = await response.json();
      if (data.draft) {
        handleSaveEntry(data.draft);
      }
    } catch (err) {
      console.error('Draft error:', err);
      alert('Could not generate a draft right now.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isChatLoading) return;

    const userMsg = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    setIsChatLoading(true);

    try {
      const response = await fetch(`${API_URL}/planner/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          message: userMsg.content,
          chatHistory,
          journalEntry: entry,
          mood: selectedMood,
          date: dateKey,
          goals,
          calendarTasks,
          journalEntries,
          journalMoods,
          fixedRoutine
        })
      });

      if (!response.ok) throw new Error('Chat failed');

      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="journal-container" style={{ animation: 'slideInUp 0.5s ease-out' }}>
      <div className="animate-fade" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="gradient-text" style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>AI Reflection Space</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.95rem' }}>Reflect on your journey, understand your patterns, and grow.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => fetchTrends()}
            className="premium-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '14px',
              background: showTrends ? 'rgba(124, 58, 237, 0.1)' : 'var(--bg-card)',
              border: `1px solid ${showTrends ? 'var(--primary)' : 'var(--border)'}`,
              color: showTrends ? '#c4b5fd' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
          >
            <TrendingUp size={18} />
            {showTrends ? 'Hide Trends' : 'View Well-Being Trends'}
          </button>
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 18px', borderRadius: '14px' }}>
            <Calendar size={18} style={{ color: 'var(--primary)' }} />
            <input 
              type="date" 
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              style={{ background: 'none', border: 'none', color: 'white', outline: 'none', colorScheme: 'dark', fontVariantNumeric: 'tabular-nums' }}
            />
          </div>
        </div>
      </div>

      {showTrends && (
        <div className="trends-dashboard glass-panel" style={{ marginBottom: '32px', padding: '24px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.1)', animation: 'slideInDown 0.4s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={20} style={{ color: '#a78bfa' }} />
              Well-Being Trend Analytics
            </h3>
            {isTrendsLoading && <Loader2 size={18} className="spinner" style={{ color: '#a78bfa' }} />}
          </div>

          {!isTrendsLoading && trendData ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
              {/* Energy Levels Chart */}
              <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ margin: '0 0 20px 0', color: '#cbd5e1', fontSize: '0.9rem' }}>Weekly Energy Levels</h4>
                <div style={{ height: '150px', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '4%', padding: '0 10px' }}>
                  {trendData.energyTrends?.map((point, idx) => (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '100%', background: 'linear-gradient(to top, #7c3aed, #c4b5fd)', height: `${point.level}%`, borderRadius: '4px 4px 0 0', position: 'relative', transition: 'height 1s ease-out' }}>
                        <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: '#a78bfa' }}>{point.level}%</div>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{point.date.split('-').slice(1).join('/')}</div>
                    </div>
                  ))}
                  {/* Grid Lines */}
                  {[0, 25, 50, 75, 100].map(val => (
                    <div key={val} style={{ position: 'absolute', bottom: `${val}%`, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.05)', zIndex: -1 }}></div>
                  ))}
                </div>
              </div>

              {/* Common Barriers & Mood Insight */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={16} />
                    Common Barriers
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {trendData.commonBarriers?.map((barrier, idx) => (
                      <span key={idx} style={{ padding: '4px 10px', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', borderRadius: '8px', fontSize: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        {barrier}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.1)', flex: 1 }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#6ee7b7', fontSize: '0.85rem' }}>Mood & Productivity Analysis</h4>
                  <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: '1.5', margin: 0 }}>
                    {trendData.moodProductivityInsight}
                  </p>
                </div>
              </div>
            </div>
          ) : trendError ? (
            <div style={{ height: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ef4444', gap: '12px' }}>
              <AlertCircle size={24} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0 }}>{trendError}</p>
                <button onClick={() => { setTrendData(null); fetchTrends(); }} style={{ background: 'none', border: 'none', color: '#a78bfa', textDecoration: 'underline', cursor: 'pointer', marginTop: '8px' }}>Try again</button>
              </div>
            </div>
          ) : (
            <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              {isTrendsLoading ? 'Gathering trend data...' : 'No trend data available yet.'}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
        {/* Editor Section */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={20} style={{ color: '#a78bfa' }} />
              <h3 style={{ margin: 0, color: 'white', fontWeight: 500 }}>Daily Journal</h3>
            </div>
            <button
              onClick={handleGenerateDraft}
              disabled={isAnalyzing}
              style={{
                background: 'rgba(124, 58, 237, 0.1)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                color: '#a78bfa',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Zap size={14} />
              Auto-Draft
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', marginRight: '8px' }}>Today's Mood:</div>
            {moodOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleMoodSelect(opt.label)}
                style={{
                  background: selectedMood === opt.label ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  border: selectedMood === opt.label ? `1px solid ${opt.color}` : '1px solid transparent',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{opt.emoji}</span>
                <span style={{ fontSize: '0.65rem', color: selectedMood === opt.label ? 'white' : '#64748b' }}>{opt.label}</span>
              </button>
            ))}
          </div>

          <textarea
            value={entry}
            onChange={(e) => handleSaveEntry(e.target.value)}
            placeholder="How was your day? What did you learn? Any challenges you faced?"
            style={{
              width: '100%',
              minHeight: '400px',
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              color: '#e2e8f0',
              fontSize: '1.1rem',
              lineHeight: '1.6',
              resize: 'none',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Reflection Focus Mode:</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {reflectionModes.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setReflectionMode(mode.id)}
                  title={mode.desc}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: reflectionMode === mode.id ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${reflectionMode === mode.id ? '#7c3aed' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: reflectionMode === mode.id ? 'white' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {mode.icon}
                  {mode.label}
                </button>
              ))}
            </div>
            {reflectionMode && (
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.7rem' }}>
                {reflectionModes.find(m => m.id === reflectionMode)?.desc}
              </p>
            )}
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || !entry.trim()}
            className="premium-button"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px', 
              padding: '16px 32px', 
              borderRadius: '14px', 
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', 
              color: 'white', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: '0 8px 30px var(--primary-glow)',
              opacity: (isAnalyzing || !entry.trim()) ? 0.6 : 1
            }}
          >
            {isAnalyzing ? <Loader2 size={20} className="spinner" /> : <Sparkles size={20} />}
            {isAnalyzing ? 'Analyzing with AI...' : 'Reflect with AI Assistant'}
          </button>
        </div>

        {/* AI Insight Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {!reflection && !isAnalyzing && (
            <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', background: 'rgba(124, 58, 237, 0.05)', border: '1px dashed rgba(124, 58, 237, 0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '16px', height: '100%' }}>
              <Brain size={48} style={{ color: '#a78bfa', opacity: 0.5 }} />
              <h3 style={{ color: '#e2e8f0', margin: 0 }}>AI Waiting to Assist</h3>
              <p style={{ color: '#94a3b8', maxWidth: '300px' }}>Write your thoughts and click "Reflect" to get personalized coaching and insights based on your activities.</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', height: '100%' }}>
              <div className="pulse-circle" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={30} style={{ color: '#a78bfa' }} className="pulse" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: 'white', margin: '0 0 8px 0' }}>AI Coach is Thinking</h3>
                <p style={{ color: '#94a3b8' }}>Reviewing your goals, tasks, and recent activity...</p>
              </div>
            </div>
          )}

          {reflection && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.5s ease-in' }}>
              <InsightCard
                title="Reflection Summary"
                icon={<BookOpen size={18} />}
                content={reflection.reflectionSummary}
                color="#818cf8"
              />
              <InsightCard
                title="Behavioral Insights"
                icon={<Brain size={18} />}
                content={reflection.behavioralInsights}
                color="#a78bfa"
              />
              <InsightCard
                title="Suggested Adjustments"
                icon={<Zap size={18} />}
                content={reflection.suggestedAdjustments}
                color="#fbbf24"
              />

              <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <MessageCircle size={18} style={{ color: '#10b981' }} />
                  <h4 style={{ margin: 0, color: 'white', fontSize: '0.9rem' }}>Reflection Questions</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {reflection.reflectionQuestions?.map((q, i) => (
                    <div key={i} style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', fontSize: '0.9rem', color: '#cbd5e1', borderLeft: '3px solid #10b981' }}>
                      {q}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Target size={18} style={{ color: '#6366f1' }} />
                  <h4 style={{ margin: 0, color: 'white', fontSize: '0.9rem' }}>Personalized Encouragement</h4>
                </div>
                <p style={{ color: '#e2e8f0', fontSize: '0.95rem', margin: 0, fontStyle: 'italic', lineHeight: '1.5' }}>
                  "{reflection.personalizedEncouragement}"
                </p>
              </div>

              <button
                onClick={() => setShowChat(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '14px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  marginTop: '10px'
                }}
                className="deep-dive-btn"
              >
                <Sparkles size={18} style={{ color: '#a78bfa' }} />
                Deep Dive with AI Coach
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Deep Dive Chat Modal */}
      {showChat && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={() => setShowChat(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} />
          <div className="glass-panel" style={{ position: 'relative', width: '100%', maxWidth: '600px', height: '600px', background: '#111827', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>

            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={20} color="white" />
                </div>
                <div>
                  <h4 style={{ margin: 0, color: 'white' }}>AI Reflection Coach</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Deep Dive Conversation</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}
              >✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ alignSelf: 'flex-start', maxWidth: '85%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', borderBottomLeftRadius: '4px', color: '#cbd5e1', fontSize: '0.95rem' }}>
                Hi! I'm your deep-dive coach. Based on your journal entry today, what would you like to discuss further?
                I can help you pinpoint stressors, optimize your routine, or explore your accomplishments in more detail.
              </div>

              {chatHistory.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '12px 16px',
                  background: msg.role === 'user' ? '#4f46e5' : 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                  borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                  color: msg.role === 'user' ? 'white' : '#cbd5e1',
                  fontSize: '0.95rem',
                  lineHeight: '1.5'
                }}>
                  {msg.content}
                </div>
              ))}

              {isChatLoading && (
                <div style={{ alignSelf: 'flex-start', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', color: '#94a3b8' }}>
                  <Loader2 size={18} className="spinner" />
                </div>
              )}
            </div>

            <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask a follow-up question..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 48px 12px 16px', color: 'white', outline: 'none' }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim() || isChatLoading}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .glass-panel {
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
        
        .spinner {
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function InsightCard({ title, icon, content, color }) {
  return (
    <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{ color }}>{icon}</div>
        <h4 style={{ margin: 0, color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>{title}</h4>
      </div>
      <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>
        {content}
      </p>
    </div>
  );
}
