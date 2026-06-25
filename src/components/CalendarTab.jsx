import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '../utils/plannerHelpers';

export default function CalendarTab({
  currentDate,
  setCurrentDate,
  selectedCalendarDate,
  setSelectedCalendarDate,
  manualTaskInput,
  setManualTaskInput,
  calendarTasks,
  setCalendarTasks,
  calendarNotes,
  setCalendarNotes,
  categories,
  getTasksForDate,
  toggleTaskCompletion,
  deleteManualTask
}) {
  const [isDeadlineTask, setIsDeadlineTask] = useState(false);
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    return (
      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="calendar-day-name">{day}</div>
        ))}
        {days.map((date, idx) => {
          const tasks = date ? getTasksForDate(date) : [];
          const isSelected = selectedCalendarDate && date && 
            formatDate(date) === formatDate(selectedCalendarDate);
          
          return (
            <div
              key={idx}
              className={`calendar-day ${!date ? 'empty' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => date && setSelectedCalendarDate(date)}
            >
              {date && (
                <div className="calendar-day-content">
                  <div className="calendar-day-number">{date.getDate()}</div>
                  <div className="calendar-day-tasks-mini" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                    {tasks.filter(t => (!t.recurrence || t.recurrence === 'once' || t.isDeadlineEntry) && !String(t.id).startsWith('ai-')).slice(0, 3).map((t, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          fontSize: '0.65rem', 
                          background: t.isDeadlineEntry ? 'rgba(239, 68, 68, 0.2)' : categories[t.category || 'casual'].bg, 
                          color: t.isDeadlineEntry ? '#fca5a5' : categories[t.category || 'casual'].color,
                          padding: '2px 4px',
                          borderRadius: '3px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          borderLeft: `2px solid ${t.isDeadlineEntry ? '#ef4444' : categories[t.category || 'casual'].color}`,
                          fontWeight: t.isDeadlineEntry ? '700' : '400'
                        }}
                      >
                        {t.text}
                      </div>
                    ))}
                    {tasks.filter(t => (!t.recurrence || t.recurrence === 'once' || t.isDeadlineEntry) && !String(t.id).startsWith('ai-')).length > 3 && (
                      <div style={{ fontSize: '0.6rem', color: '#94a3b8', paddingLeft: '4px' }}>
                        + {tasks.filter(t => (!t.recurrence || t.recurrence === 'once' || t.isDeadlineEntry) && !String(t.id).startsWith('ai-')).length - 3} more
                      </div>
                    )}
                  </div>
                  <div className="calendar-day-indicators" style={{ marginTop: '4px' }}>
                    {calendarNotes[formatDate(date)] && (
                      <span style={{ fontSize: '0.7rem' }}>📝</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div>
          <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '4px' }}>Calendar</h2>
          <p style={{ color: '#a0aec0', fontSize: '0.95rem', margin: 0 }}>Manage and track your tasks by date</p>
        </div>
        <div className="calendar-nav">
          <button
            className="nav-button"
            aria-label="Previous month"
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setCurrentDate(newDate);
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <div className="calendar-month">
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Viewing</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          <button
            className="nav-button"
            aria-label="Next month"
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setCurrentDate(newDate);
            }}
          >
            <ChevronRight size={18} />
          </button>

          <button
            className="today-button"
            onClick={() => setCurrentDate(new Date())}
            type="button"
          >
            Today
          </button>
        </div>
      </div>

      {renderCalendar()}

      {selectedCalendarDate && (
        <div className="selected-date-tasks" style={{ animation: 'slideInUp 0.4s ease' }}>
          <div className="selected-date-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div className="selected-date-title" style={{ margin: 0, fontSize: '1.4rem' }}>
              <span>📅</span>
              {selectedCalendarDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div className="calendar-form-section">
              <div style={{ color: '#93c5fd', fontSize: '0.85rem', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase' }}>Add Event/Task</div>
              <div className="task-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  value={manualTaskInput}
                  onChange={(e) => setManualTaskInput(e.target.value)}
                  placeholder="Event/Task name..."
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: 'white' }}
                />
                <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
                  <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr auto' }}>
                    <input 
                      type="time" 
                      id="cal-time"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: 'white', colorScheme: 'dark' }} 
                    />
                    <select id="cal-cat" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: 'white' }}>
                      {Object.entries(categories).map(([val, info]) => (
                        <option key={val} value={val} style={{ background: '#1a1f4b' }}>{info.label}</option>
                      ))}
                    </select>
                  </div>

                  <button className="add-btn" onClick={() => {
                    const timeVal = document.getElementById('cal-time').value;
                    const catVal = document.getElementById('cal-cat').value;
                    if (!manualTaskInput.trim()) return;
                    
                    let formattedTime = '';
                    if (timeVal) {
                      let [h, m] = timeVal.split(':');
                      h = parseInt(h);
                      const ampm = h >= 12 ? 'PM' : 'AM';
                      const h12 = h % 12 || 12;
                      formattedTime = `${h12.toString().padStart(2, '0')}:${m} ${ampm}`;
                    }

                    const dateKey = formatDate(selectedCalendarDate);
                    setCalendarTasks(prev => ({
                      ...prev,
                      [dateKey]: [...(prev[dateKey] || []), { 
                        id: Date.now(), 
                        text: manualTaskInput, 
                        startTime: formattedTime,
                        category: catVal,
                        completed: false,
                        isDeadlineEntry: isDeadlineTask,
                        deadline: isDeadlineTask ? dateKey : undefined
                      }]
                    }));
                    setManualTaskInput('');
                    setIsDeadlineTask(false);
                    document.getElementById('cal-time').value = '';
                  }}>
                    <Plus size={16} />
                  </button>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={isDeadlineTask}
                    onChange={(e) => setIsDeadlineTask(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#ef4444' }}
                  />
                  Mark as deadline
                </label>
              </div>

              <div className="tasks-for-date" style={{ marginTop: '24px' }}>
                {getTasksForDate(selectedCalendarDate).filter(t => (!t.recurrence || t.recurrence === 'once' || t.isDeadlineEntry) && !String(t.id).startsWith('ai-')).map(task => (
                  <div key={task.id} className="task-row" style={{ borderLeft: `3px solid ${categories[task.category || 'casual'].color}`, background: 'rgba(255,255,255,0.03)', padding: '10px 14px' }}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(selectedCalendarDate, task.id)}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', color: 'white' }}>{task.text}</div>
                      {task.startTime && <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>🕒 {task.startTime}</div>}
                      {task.isDeadlineEntry && <div style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '4px' }}>⏰ Deadline</div>}
                    </div>
                    <button onClick={() => deleteManualTask(selectedCalendarDate, task.id)} style={{ background: 'none', color: '#fca5a5' }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="calendar-notes-section">
              <div style={{ color: '#86efac', fontSize: '0.85rem', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase' }}>Daily Notes</div>
              <textarea
                placeholder="Add notes for this day..."
                value={calendarNotes[formatDate(selectedCalendarDate)] || ''}
                onChange={(e) => {
                  const dateKey = formatDate(selectedCalendarDate);
                  setCalendarNotes({ ...calendarNotes, [dateKey]: e.target.value });
                }}
                style={{ width: '100%', height: '150px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '15px', color: '#cbd5e1', resize: 'none', fontSize: '0.9rem', lineHeight: '1.5' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
