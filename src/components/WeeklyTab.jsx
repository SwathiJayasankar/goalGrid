import React from 'react';
import { Plus } from 'lucide-react';
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
  setShowTaskForm
}) {
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    weekDays.push(d);
  }

  return (
    <div className="weekly-todos-container" style={{ animation: 'slideInRight 0.5s ease-out' }}>
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
  );
}
