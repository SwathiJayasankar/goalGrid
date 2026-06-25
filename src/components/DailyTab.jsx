import React from 'react';
import { Plus } from 'lucide-react';
import { formatDate } from '../utils/plannerHelpers';

export default function DailyTab({
  calendarTasks,
  getTasksForDate,
  showTaskForm,
  setShowTaskForm,
  toggleTaskCompletion,
  deleteManualTask,
  startEditingTask,
  categories,
  fixedRoutine,
  setFixedRoutine,
  showRoutineEditor,
  setShowRoutineEditor,
  reminderNotifications = []
}) {
  const today = new Date();
  const todayTasks = getTasksForDate(today);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
      {/* 🔔 IMPROVED PREMIUM REMINDERS UI */}
      {reminderNotifications.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
          animation: 'slideInDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle Ambient Glow */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(124, 58, 237, 0.15)',
              border: '1px solid rgba(124, 58, 237, 0.25)',
              fontSize: '1.2rem'
            }}>
              🔔
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: '700', letterSpacing: '-0.5px', fontFamily: 'Poppins, sans-serif', margin: 0 }}>
                GoalGrid Alerts
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '2px 0 0 0' }}>
                Real-time task reminders and high-priority deadline checks.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {reminderNotifications.map((reminder, index) => {
              const isDeadline = reminder.type === 'deadline';
              return (
                <div key={index} style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: isDeadline ? 'rgba(239, 68, 68, 0.03)' : 'rgba(59, 130, 246, 0.03)',
                  border: `1px solid ${isDeadline ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)'}`,
                  boxShadow: `0 8px 24px rgba(0, 0, 0, 0.12)`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'transform 0.2s ease',
                  cursor: 'default'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: isDeadline ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                      color: isDeadline ? '#f87171' : '#60a5fa',
                      border: `1px solid ${isDeadline ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                    }}>
                      {isDeadline ? '🚨 DEADLINE' : '⏳ UPCOMING'}
                    </span>
                  </div>
                  <div style={{ color: '#f1f5f9', fontSize: '0.9rem', fontWeight: '600', lineHeight: '1.4' }}>
                    {reminder.message}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="daily-todos">
        <div className="today-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="section-icon">📅</div>
            <div>
              <h3>Today</h3>
              <p>{today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
          <button 
            className="add-btn" 
            onClick={() => setShowTaskForm(!showTaskForm)}
            style={{ background: showTaskForm ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', height: '40px' }}
          >
            {showTaskForm ? 'Cancel' : <><Plus size={16} /> Add Task</>}
          </button>
        </div>

        <div className="todos-list">
          {todayTasks.length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>☕</div>
              No tasks for today. You're all set!
            </div>
          ) : (
            todayTasks.map(task => (
              <div key={task.id} className="todo-item" style={{ borderLeft: `4px solid ${categories[task.category || 'casual'].color}` }}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTaskCompletion(today, task.id)}
                  className="todo-checkbox"
                />
                <div style={{ flex: 1 }}>
                  <div className={`todo-text ${task.completed ? 'completed' : ''}`} style={{ fontWeight: '500' }}>
                    {task.text}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {task.startTime && (
                      <span style={{ fontSize: '0.75rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                        🕒 {task.startTime}{task.endTime ? ` - ${task.endTime}` : ''}
                      </span>
                    )}
                    <span style={{ 
                      fontSize: '0.7rem', 
                      color: categories[task.category || 'casual'].color, 
                      background: categories[task.category || 'casual'].bg,
                      padding: '2px 8px',
                      borderRadius: '100px',
                      textTransform: 'uppercase',
                      fontWeight: '700',
                      letterSpacing: '0.5px'
                    }}>
                      {categories[task.category || 'casual'].label}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="todo-delete"
                    onClick={() => startEditingTask(task, formatDate(today))}
                    style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  <button
                    className="todo-delete"
                    onClick={() => deleteManualTask(today, task.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="upcoming-section" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="section-icon">🕒</div>
            <div>
              <h3>Daily Routine</h3>
              <p>Schedule & Timetable</p>
            </div>
          </div>
          <button 
            className="tab-button" 
            onClick={() => setShowRoutineEditor(!showRoutineEditor)}
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            {showRoutineEditor ? 'View Timetable' : 'Edit Routine'}
          </button>
        </div>

        {showRoutineEditor ? (
          <div className="routine-editor" style={{ animation: 'slideInRight 0.3s ease' }}>
            <div style={{ color: '#93c5fd', fontSize: '0.85rem', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase' }}>Add Routine Activity</div>
            <div className="task-input-group" style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
              <input 
                type="time" 
                id="routine-time"
                style={{ width: '130px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: 'white', colorScheme: 'dark' }} 
              />
              <input 
                type="text" 
                id="routine-text"
                placeholder="Activity name..." 
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: 'white' }}
              />
              <button 
                className="add-btn" 
                onClick={() => {
                  const timeVal = document.getElementById('routine-time').value;
                  const textVal = document.getElementById('routine-text').value;
                  if (!textVal.trim()) return;

                  let formattedTime = '12:00 PM';
                  if (timeVal) {
                    let [h, m] = timeVal.split(':');
                    h = parseInt(h);
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    const h12 = h % 12 || 12;
                    formattedTime = `${h12.toString().padStart(2, '0')}:${m} ${ampm}`;
                  }

                  setFixedRoutine([...fixedRoutine, { id: Date.now(), text: textVal, time: formattedTime, category: 'casual' }]);
                  document.getElementById('routine-text').value = '';
                }}
              >
                <Plus size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[...fixedRoutine].sort((a, b) => {
                  const toMinutes = (t) => {
                      const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
                      if (!match) return 1440;
                      let [, h, m, p] = match;
                      h = parseInt(h);
                      if (p.toUpperCase() === 'PM' && h !== 12) h += 12;
                      if (p.toUpperCase() === 'AM' && h === 12) h = 0;
                      return h * 60 + parseInt(m);
                  };
                  return toMinutes(a.time) - toMinutes(b.time);
              }).map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                  <input 
                    type="text" 
                    value={item.time} 
                    onChange={(e) => setFixedRoutine(fixedRoutine.map(r => r.id === item.id ? {...r, time: e.target.value} : r))}
                    style={{ width: '80px', background: 'transparent', border: 'none', color: '#93c5fd', fontWeight: 'bold' }}
                  />
                  <input 
                    type="text" 
                    value={item.text} 
                    onChange={(e) => setFixedRoutine(fixedRoutine.map(r => r.id === item.id ? {...r, text: e.target.value} : r))}
                    style={{ flex: 1, background: 'transparent', border: 'none', color: 'white' }}
                  />
                  <button onClick={() => setFixedRoutine(fixedRoutine.filter(r => r.id !== item.id))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="timetable-view" style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative', paddingLeft: '20px', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
            {(() => {
              const merged = [
                ...fixedRoutine.map(r => ({ ...r, isRoutine: true })),
                ...todayTasks.map(t => ({ ...t, isRoutine: false }))
              ].sort((a, b) => {
                const timeA = a.startTime || a.time || '11:59 PM';
                const timeB = b.startTime || b.time || '11:59 PM';
                const toMinutes = (t) => {
                  const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
                  if (!match) return 1440;
                  let [, h, m, p] = match;
                  h = parseInt(h);
                  if (p.toUpperCase() === 'PM' && h !== 12) h += 12;
                  if (p.toUpperCase() === 'AM' && h === 12) h = 0;
                  return h * 60 + parseInt(m);
                };
                return toMinutes(timeA) - toMinutes(timeB);
              });

              return merged.map((item, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  padding: '12px 0', 
                  position: 'relative',
                  borderBottom: idx === merged.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ position: 'absolute', left: '-26px', top: '18px', width: '10px', height: '10px', borderRadius: '50%', background: item.isRoutine ? '#64748b' : categories[item.category || 'casual'].color, border: '2px solid #0a0e27' }}></div>
                  <div style={{ width: '70px', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', paddingTop: '2px' }}>
                    {item.startTime || item.time || (item.isRoutine ? 'Routine' : '00:00 AM')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      color: item.isRoutine ? '#94a3b8' : 'white', 
                      fontSize: '0.9rem', 
                      fontWeight: item.isRoutine ? '400' : '600',
                      textDecoration: item.completed ? 'line-through' : 'none'
                    }}>
                      {item.text}
                      {item.endTime && <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '8px', fontWeight: 'normal' }}>({item.startTime || 'Start'} - {item.endTime})</span>}
                    </div>
                    {!item.isRoutine && (
                      <div style={{ fontSize: '0.7rem', color: categories[item.category || 'casual'].color, textTransform: 'uppercase', fontWeight: 'bold', marginTop: '4px' }}>
                        {categories[item.category || 'casual'].label}
                      </div>
                    )}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
