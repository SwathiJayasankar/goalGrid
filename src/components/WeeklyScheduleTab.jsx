import React from 'react';
import { Trash2, Loader, TrendingUp } from 'lucide-react';

export default function WeeklyScheduleTab({
  goals,
  selectedGoal,
  integrationFilter,
  setIntegrationFilter,
  integratePlanToSchedule,
  clearGoalTasksFromSchedule,
  addedAiTasks,
  removeSingleAiTaskFromSchedule,
  addSingleAiTaskToSchedule,
  calculatePlanDate,
  planFeedback,
  setPlanFeedback,
  generatePlan,
  loadingPlan
}) {
  if (selectedGoal === null) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📅</div>
        <p>Select a goal and generate a plan to see your weekly goal schedule</p>
      </div>
    );
  }

  const goal = goals.find(g => g.id === selectedGoal);
  const plan = goal?.plan;
  
  if (!plan) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📅</div>
        <p>Generate a plan first to see your weekly goal schedule</p>
      </div>
    );
  }

  if (plan.error) {
    return (
      <div style={{ color: '#f87171', padding: '24px', textAlign: 'center' }}>
        Cannot show weekly overview: {plan.error}. Try generating the plan again.
      </div>
    );
  }

  if (!plan.weeklySchedule || plan.weeklySchedule.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📅</div>
        <p>No weekly schedule available. Generate a plan first.</p>
      </div>
    );
  }

  return (
    <div className="weekly-overview">
      <div style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        background: 'rgba(16, 185, 129, 0.05)', 
        borderRadius: '12px', 
        border: '1px solid rgba(16, 185, 129, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        <div style={{ color: '#6ee7b7', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>🚀 Quick Add to Schedule</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text"
            value={integrationFilter}
            onChange={(e) => setIntegrationFilter(e.target.value)}
            placeholder="Describe what to add (e.g. 'Mondays', 'Morning', 'Week 1')..."
            style={{ 
              flex: 1, 
              minWidth: '240px',
              background: 'rgba(0,0,0,0.2)', 
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '8px 12px',
              borderRadius: '6px',
              color: 'white',
              fontSize: '0.9rem'
            }}
          />
          <button 
            className="generate-btn" 
            onClick={() => integratePlanToSchedule(goal, integrationFilter)}
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', whiteSpace: 'nowrap' }}
          >
            Add Selected
          </button>
          <button 
            onClick={() => integratePlanToSchedule(goal, '')}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              padding: '0 15px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              height: '40px'
            }}
          >
            Add Everything
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Mornings', 'Evenings', 'Mornings and Evenings', 'Week 1', 'Week 1 Mornings'].map(tag => (
              <span 
                key={tag}
                onClick={() => setIntegrationFilter(tag)}
                style={{ 
                  fontSize: '0.7rem', 
                  background: 'rgba(110, 231, 183, 0.1)', 
                  color: '#6ee7b7', 
                  padding: '4px 12px', 
                  borderRadius: '100px', 
                  cursor: 'pointer',
                  border: integrationFilter === tag ? '1px solid #6ee7b7' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <button 
            onClick={() => clearGoalTasksFromSchedule(goal.id)}
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: 'none', 
              color: '#f87171', 
              fontSize: '0.75rem', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '4px'
            }}
          >
            <Trash2 size={12} /> Clear Scheduled Tasks
          </button>
        </div>
      </div>

      {plan.weeklySchedule.map((week, weekIdx) => (
        <div key={weekIdx} className="week-section">
          <div className="week-header">
            <h3 className="week-title">Week {week.week}</h3>
            <p className="week-focus">{week.focus}</p>
          </div>

          <div className="days-grid">
            {week.days.map((dayData, dayIdx) => (
              <div key={dayIdx} className="day-schedule">
                <div className="day-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    {dayData.day}
                    <span style={{ fontSize: '0.8rem', opacity: 0.6, marginLeft: '8px', fontWeight: '400' }}>
                      ({calculatePlanDate(week.week, dayData.day, goal.generatedAt)})
                    </span>
                  </div>
                  <button 
                    onClick={() => integratePlanToSchedule(goal, calculatePlanDate(week.week, dayData.day, goal.generatedAt))}
                    style={{ 
                      background: 'rgba(16, 185, 129, 0.2)', 
                      border: 'none', 
                      color: '#6ee7b7', 
                      fontSize: '0.7rem', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    + Add Day
                  </button>
                </div>
                
                <div className="time-blocks">
                  {dayData.morning && dayData.morning.length > 0 && (
                    <div className="time-period">
                      <div className="time-period-label">☀️ Morning</div>
                      <div className="time-slots">
                        {dayData.morning.map((task, idx) => {
                          const isAdded = addedAiTasks[`${week.week}-${dayData.day}-${task}`];
                          return (
                            <div key={idx} className="time-slot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: isAdded ? '#64748b' : 'white', flex: 1, marginRight: '8px' }}>{task}</span>
                              <button 
                                onClick={() => isAdded 
                                  ? removeSingleAiTaskFromSchedule(task, week.week, dayData.day, goal.generatedAt, goal.id)
                                  : addSingleAiTaskToSchedule(task, week.week, dayData.day, goal.generatedAt, goal.id)
                                }
                                style={{ 
                                  background: isAdded ? 'rgba(59, 130, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)', 
                                  border: isAdded ? '1px solid rgba(59, 130, 246, 0.3)' : 'none', 
                                  borderRadius: '4px', 
                                  color: isAdded ? '#93c5fd' : '#4ade80', 
                                  padding: '2px 6px', 
                                  fontSize: '0.7rem', 
                                  cursor: 'pointer',
                                  minWidth: '50px',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {isAdded ? 'Added' : 'Add'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {dayData.afternoon && dayData.afternoon.length > 0 && (
                    <div className="time-period">
                      <div className="time-period-label">🌤️ Afternoon</div>
                      <div className="time-slots">
                        {dayData.afternoon.map((task, idx) => {
                          const isAdded = addedAiTasks[`${week.week}-${dayData.day}-${task}`];
                          return (
                            <div key={idx} className="time-slot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: isAdded ? '#64748b' : 'white', flex: 1, marginRight: '8px' }}>{task}</span>
                              <button 
                                onClick={() => isAdded 
                                  ? removeSingleAiTaskFromSchedule(task, week.week, dayData.day, goal.generatedAt, goal.id)
                                  : addSingleAiTaskToSchedule(task, week.week, dayData.day, goal.generatedAt, goal.id)
                                }
                                style={{ 
                                  background: isAdded ? 'rgba(59, 130, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)', 
                                  border: isAdded ? '1px solid rgba(59, 130, 246, 0.3)' : 'none', 
                                  borderRadius: '4px', 
                                  color: isAdded ? '#93c5fd' : '#4ade80', 
                                  padding: '2px 6px', 
                                  fontSize: '0.7rem', 
                                  cursor: 'pointer',
                                  minWidth: '50px',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {isAdded ? 'Added' : 'Add'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {dayData.evening && dayData.evening.length > 0 && (
                    <div className="time-period">
                      <div className="time-period-label">🌙 Evening</div>
                      <div className="time-slots">
                        {dayData.evening.map((task, idx) => {
                          const isAdded = addedAiTasks[`${week.week}-${dayData.day}-${task}`];
                          return (
                            <div key={idx} className="time-slot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: isAdded ? '#64748b' : 'white', flex: 1, marginRight: '8px' }}>{task}</span>
                              <button 
                                onClick={() => isAdded 
                                  ? removeSingleAiTaskFromSchedule(task, week.week, dayData.day, goal.generatedAt, goal.id)
                                  : addSingleAiTaskToSchedule(task, week.week, dayData.day, goal.generatedAt, goal.id)
                                }
                                style={{ 
                                  background: isAdded ? 'rgba(59, 130, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)', 
                                  border: isAdded ? '1px solid rgba(59, 130, 246, 0.3)' : 'none', 
                                  borderRadius: '4px', 
                                  color: isAdded ? '#93c5fd' : '#4ade80', 
                                  padding: '2px 6px', 
                                  fontSize: '0.7rem', 
                                  cursor: 'pointer',
                                  minWidth: '50px',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {isAdded ? 'Added' : 'Add'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {week.weeklyTasks && week.weeklyTasks.length > 0 && dayIdx === 0 && (
                  <div className="weekly-goals">
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#86efac', marginBottom: '8px' }}>
                      WEEK'S GOALS
                    </div>
                    {week.weeklyTasks.map((task, idx) => (
                      <div key={idx} className="weekly-goal-item">✓ {task}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div id="weekly-enhance-plan-section" style={{ marginTop: '40px', padding: '24px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '12px', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
        <div style={{ color: '#c4b5fd', fontSize: '0.9rem', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase' }}>✨ Enhance or Modify This Plan</div>
        <p style={{ color: '#a78bfa', fontSize: '0.85rem', marginBottom: '16px' }}>Want to adjust the intensity, specify certain free times, or add more details? Tell the AI how to refine the plan.</p>
        <div className="input-group">
          <textarea
            value={planFeedback}
            onChange={(e) => setPlanFeedback(e.target.value)}
            placeholder="e.g., 'Make it more intensive', 'I only want to work on this in the mornings', 'Include more breaks'..."
            style={{ height: '80px', background: 'rgba(0,0,0,0.2)', marginBottom: '12px', color: 'white' }}
          />
          <button 
            className="generate-btn" 
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', width: '100%' }}
            onClick={() => {
              generatePlan(selectedGoal, planFeedback);
              setPlanFeedback('');
            }}
            disabled={loadingPlan !== null}
          >
            {loadingPlan !== null ? <Loader className="spin" size={16} /> : <TrendingUp size={16} />}
            Update & Refine Plan
          </button>
        </div>
      </div>
    </div>
  );
}
