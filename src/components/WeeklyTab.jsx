import React, { useState } from 'react';
import { Plus, Target, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/plannerHelpers';

export default function WeeklyTab({
  currentWeekStart,
  setCurrentWeekStart,
  getTasksForDate,
  categories,
  toggleTaskCompletion,
  deleteManualTask,
  startEditingTask,
  setTaskForm,
  taskForm,
  setShowTaskForm,
  calendarNotes = {},
  setCalendarNotes
}) {
  const [newGoalText, setNewGoalText] = useState('');
  
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    weekDays.push(d);
  }

  // key structure: weeklyGoals-YYYY-MM-DD
  const weekKey = `weeklyGoals-${formatDate(currentWeekStart)}`;
  const rawGoals = calendarNotes[weekKey];
  let weeklyGoals = [];
  try {
    if (rawGoals) {
      weeklyGoals = typeof rawGoals === 'string' ? JSON.parse(rawGoals) : rawGoals;
    }
  } catch (e) {
    console.error("Failed to parse weekly goals:", e);
  }
  if (!Array.isArray(weeklyGoals)) {
    weeklyGoals = [];
  }

  const addWeeklyGoal = () => {
    const trimmed = newGoalText.trim();
    if (!trimmed) return;
    const updated = [...weeklyGoals, { id: Date.now().toString(), text: trimmed, completed: false }];
    setCalendarNotes({
      ...calendarNotes,
      [weekKey]: JSON.stringify(updated)
    });
    setNewGoalText('');
  };

  const toggleWeeklyGoal = (goalId) => {
    const updated = weeklyGoals.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g);
    setCalendarNotes({
      ...calendarNotes,
      [weekKey]: JSON.stringify(updated)
    });
  };

  const deleteWeeklyGoal = (goalId) => {
    const updated = weeklyGoals.filter(g => g.id !== goalId);
    setCalendarNotes({
      ...calendarNotes,
      [weekKey]: JSON.stringify(updated)
    });
  };

  const totalGoals = weeklyGoals.length;
  const completedGoals = weeklyGoals.filter(g => g.completed).length;
  const progressPercent = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <div className="weekly-todos-container" style={{ animation: 'slideInRight 0.5s ease-out' }}>
      <style>{`
        .weekly-layout-wrapper {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          width: 100%;
        }

        .weekly-goals-sidebar {
          width: 300px;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 24.0px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        .weekly-main-area {
          flex: 1;
          min-width: 0;
        }

        .weekly-goal-input-wrapper {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }

        .weekly-goal-input {
          flex: 1;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 8px 12px;
          color: white;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }

        .weekly-goal-input:focus {
          border-color: rgba(99, 102, 241, 0.5);
          outline: none;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }

        .weekly-goal-add-btn {
          background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
          border: none;
          border-radius: 8px;
          color: white;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .weekly-goal-add-btn:hover {
          transform: translateY(-1.0px);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .weekly-goals-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 380px;
          overflow-y: auto;
          padding-right: 4.0px;
        }

        .weekly-goals-list::-webkit-scrollbar {
          width: 4px;
        }

        .weekly-goals-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .weekly-goals-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .weekly-goal-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .weekly-goal-item:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .weekly-goal-checkbox {
          width: 14.0px;
          height: 14.0px;
          accent-color: #7c3aed;
          cursor: pointer;
          margin-top: 2.0px;
        }

        .weekly-goal-text {
          flex: 1;
          font-size: 0.85rem;
          color: #e2e8f0;
          line-height: 1.4;
          transition: all 0.2s ease;
        }

        .weekly-goal-text.completed {
          color: #64748b;
          text-decoration: line-through;
        }

        .weekly-goal-delete-btn {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          opacity: 0;
          font-size: 0.8rem;
          padding: 2.0px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .weekly-goal-item:hover .weekly-goal-delete-btn {
          opacity: 0.8;
        }

        .weekly-goal-delete-btn:hover {
          opacity: 1.0 !important;
          transform: scale(1.1);
        }

        @media (max-width: 1100px) {
          .weekly-layout-wrapper {
            flex-direction: column;
          }

          .weekly-goals-sidebar {
            width: 100%;
          }
        }
      `}</style>

      <div className="calendar-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'white', fontSize: '1.6rem', marginBottom: '4px' }}>Weekly To-Do</h2>
          <p style={{ color: '#a0aec0', fontSize: '0.95rem' }}>Manage your tasks across the week</p>
        </div>
        
        <div className="calendar-nav" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={() => {
              const newWeek = new Date(currentWeekStart);
              newWeek.setDate(newWeek.getDate() - 7);
              setCurrentWeekStart(newWeek);
            }}
            style={{ 
              background: 'rgba(59, 130, 246, 0.2)', 
              color: '#93c5fd', 
              border: '1px solid rgba(59, 130, 246, 0.5)',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ← Previous Week
          </button>
          <span className="calendar-month" style={{ color: 'white', fontWeight: '600', minWidth: '180px', textAlign: 'center' }}>
            {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button 
            onClick={() => {
              const newWeek = new Date(currentWeekStart);
              newWeek.setDate(newWeek.getDate() + 7);
              setCurrentWeekStart(newWeek);
            }}
            style={{ 
              background: 'rgba(59, 130, 246, 0.2)', 
              color: '#93c5fd', 
              border: '1px solid rgba(59, 130, 246, 0.5)',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Next Week →
          </button>
        </div>
      </div>

      <div className="weekly-layout-wrapper">
        {/* Left Side: Weekly Goals Card */}
        <div className="weekly-goals-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Target size={18} style={{ color: '#a78bfa' }} />
            <h3 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>This Week's Goals</h3>
          </div>

          {/* Progress */}
          {totalGoals > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, marginBottom: '6px' }}>
                <span>Progress</span>
                <span>{completedGoals} of {totalGoals} ({progressPercent}%)</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed 0%, #3b82f6 100%)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          )}

          {/* Goal Action Field */}
          <div className="weekly-goal-input-wrapper">
            <input 
              type="text"
              className="weekly-goal-input"
              placeholder="Add a focus for this week..."
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addWeeklyGoal();
                }
              }}
            />
            <button className="weekly-goal-add-btn" onClick={addWeeklyGoal} aria-label="Add Goal">
              <Plus size={16} />
            </button>
          </div>

          {/* Goals Output list */}
          <div className="weekly-goals-list">
            {totalGoals === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '0.8rem' }}>
                No goals added for this week yet
              </div>
            ) : (
              weeklyGoals.map((goal) => (
                <div key={goal.id} className="weekly-goal-item">
                  <input 
                    type="checkbox"
                    className="weekly-goal-checkbox"
                    checked={goal.completed}
                    onChange={() => toggleWeeklyGoal(goal.id)}
                  />
                  <span className={`weekly-goal-text ${goal.completed ? 'completed' : ''}`}>
                    {goal.text}
                  </span>
                  <button className="weekly-goal-delete-btn" onClick={() => deleteWeeklyGoal(goal.id)} aria-label="Delete Goal">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Standard 7-Day Grid */}
        <div className="weekly-main-area">
          <div className="weekly-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '20px' 
          }}>
            {weekDays.map((date, idx) => {
              const tasks = getTasksForDate(date);
              const isToday = new Date().toDateString() === date.toDateString();
              
              return (
                <div key={idx} className={`day-section ${isToday ? 'today' : ''}`} style={{
                  background: isToday ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  border: isToday ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div className="day-header" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingBottom: '10px'
                  }}>
                    <div>
                      <h4 style={{ color: isToday ? '#60a5fa' : 'white', margin: 0, fontSize: '1rem' }}>
                        {date.toLocaleDateString('en-US', { weekday: 'long' })}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        setTaskForm({
                          ...taskForm,
                          deadline: formatDate(date)
                        });
                        setShowTaskForm(true);
                      }}
                      style={{ 
                        background: 'rgba(34, 197, 94, 0.2)', 
                        border: 'none', 
                        borderRadius: '50%', 
                        width: '26px', 
                        height: '26px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#4ade80',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="tasks-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '80px' }}>
                    {tasks.length === 0 ? (
                      <div style={{ color: '#475569', fontSize: '0.8rem', textAlign: 'center', padding: '15px' }}>
                        No tasks
                      </div>
                    ) : (
                      (() => {
                        const toMinutes = (t) => {
                          if (!t) return 1440;
                          const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
                          if (!match) return 1440;
                          let [, h, m, p] = match;
                          h = parseInt(h);
                          if (p.toUpperCase() === 'PM' && h !== 12) h += 12;
                          if (p.toUpperCase() === 'AM' && h === 12) h = 0;
                          return h * 60 + parseInt(m);
                        };
                        return [...tasks].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
                      })().map(task => (
                        <div key={task.id} className="todo-item" style={{ 
                          padding: '8px', 
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderLeft: `3px solid ${categories[task.category || 'casual'].color}`,
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          borderRadius: '4px'
                        }}>
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTaskCompletion(date, task.id)}
                            style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ 
                              color: task.completed ? '#64748b' : 'white', 
                              textDecoration: task.completed ? 'line-through' : 'none',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {task.text}
                            </div>
                            {task.startTime && (
                              <div style={{ fontSize: '0.65rem', color: '#93c5fd', marginTop: '2px' }}>
                                🕒 {task.startTime}{task.endTime ? ` - ${task.endTime}` : ''}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              onClick={() => startEditingTask(task, formatDate(date))}
                              style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => deleteManualTask(date, task.id)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', padding: '2px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
