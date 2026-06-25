import React from 'react';
import { AlertCircle, Loader, TrendingUp } from 'lucide-react';

export default function PlannerTab({
  goals,
  selectedGoal,
  loadingPlan,
  apiError,
  generatePlan,
  completedRoadmapTasks,
  setCompletedRoadmapTasks,
  integratePlanToSchedule,
  planFeedback,
  setPlanFeedback,
  categories
}) {
  if (selectedGoal === null) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎯</div>
        <p>Select a goal from the sidebar to generate an AI plan</p>
      </div>
    );
  }

  const goal = goals.find(g => g.id === selectedGoal);
  if (!goal) return null;

  return (
    <div className="plan-section">
      {apiError && (
        <div className="error-message">
          <AlertCircle size={16} />
          {apiError}
        </div>
      )}

      <h2 className="plan-title">{goal.goal}</h2>

      {loadingPlan === selectedGoal ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p style={{ color: '#cbd5e1' }}>Generating your personalized plan...</p>
        </div>
      ) : goal.plan ? (
        (() => {
          const plan = goal.plan;
          
          if (plan.error) {
            return (
              <div className="error-message">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '8px' }}>Formatting Error</div>
                  <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>The AI response couldn't be automatically formatted. You can see the raw plan below or try generating it again.</p>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '4px', fontSize: '0.8rem', whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {plan.content}
                  </div>
                  <button 
                    className="generate-btn" 
                    style={{ marginTop: '16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                    onClick={() => generatePlan(selectedGoal)}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            );
          }
          
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {plan.timeline && (
                <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '12px 16px', borderRadius: '6px', color: '#93c5fd', fontSize: '0.9rem', borderLeft: '3px solid #3b82f6' }}>
                  ⏱️ <strong>Timeline:</strong> {plan.timeline}
                </div>
              )}
              
              {plan.title && plan.title !== goal.goal && (
                <div style={{ color: '#86efac', fontSize: '1.1rem', fontWeight: '600' }}>
                  {plan.title}
                </div>
              )}
              
              {plan.overview && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem', fontStyle: 'italic', flex: 1, minWidth: '280px' }}>
                    {plan.overview}
                  </p>
                  <button 
                    className="generate-btn" 
                    onClick={() => integratePlanToSchedule(goal)}
                    style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', whiteSpace: 'nowrap' }}
                  >
                    📅 Add to My Schedule
                  </button>
                </div>
              )}

              {/* Goal Execution Roadmap */}
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🗺️</span>
                  <h3 style={{ color: '#cbd5e1', fontSize: '1.2rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                    Goal Execution Roadmap
                  </h3>
                </div>
                
                {!plan.roadmap || plan.roadmap.length === 0 ? (
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    padding: '24px', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                    textAlign: 'center' 
                  }}>
                    💡 <strong>Old plan loaded:</strong> This plan was generated before the Roadmap feature. 
                    <button 
                      onClick={() => generatePlan(goal.id)}
                      style={{ 
                        display: 'block', 
                        margin: '12px auto 0 auto', 
                        background: 'rgba(59, 130, 246, 0.2)', 
                        border: '1px solid rgba(59, 130, 246, 0.4)', 
                        color: '#93c5fd', 
                        padding: '8px 20px', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Regenerate Plan to see Roadmap
                    </button>
                  </div>
                ) : (
                  <div className="roadmap-timeline" style={{ position: 'relative', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '10px' }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '7px', 
                      top: '12px', 
                      bottom: '12px', 
                      width: '2px', 
                      background: 'linear-gradient(to bottom, #7c3aed, #3b82f6)', 
                      opacity: 0.5 
                    }}></div>
                    
                    {plan.roadmap.map((phaseData, phaseIdx) => {
                      const totalPhaseTasks = phaseData.tasks?.length || 0;
                      const completedPhaseTasksCount = phaseData.tasks?.filter((_, tIdx) => completedRoadmapTasks[`${goal.id}-${phaseIdx}-${tIdx}`]).length || 0;
                      const isPhaseComplete = totalPhaseTasks > 0 && completedPhaseTasksCount === totalPhaseTasks;
                      
                      return (
                        <div key={phaseIdx} className="roadmap-step" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ 
                            position: 'absolute', 
                            left: '-24px', 
                            top: '6px', 
                            width: '16px', 
                            height: '16px', 
                            borderRadius: '50%', 
                            background: isPhaseComplete ? '#10b981' : '#7c3aed', 
                            border: '3px solid #0a0e27', 
                            boxShadow: isPhaseComplete ? '0 0 8px #10b981' : '0 0 8px #7c3aed',
                            zIndex: 2,
                            transition: 'all 0.3s ease'
                          }}></div>
                          
                          <div style={{ 
                            background: isPhaseComplete ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.04)',
                            border: isPhaseComplete ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '10px',
                            padding: '16px 20px',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                              <h4 style={{ color: '#c4b5fd', margin: 0, fontSize: '1rem', fontWeight: '700' }}>
                                {phaseData.phase}
                              </h4>
                              {totalPhaseTasks > 0 && (
                                <span style={{ 
                                  fontSize: '0.75rem', 
                                  background: isPhaseComplete ? 'rgba(16, 185, 129, 0.15)' : 'rgba(124, 58, 237, 0.15)', 
                                  color: isPhaseComplete ? '#34d399' : '#a78bfa',
                                  padding: '2px 8px',
                                  borderRadius: '100px',
                                  fontWeight: '600'
                                }}>
                                  {completedPhaseTasksCount}/{totalPhaseTasks} Tasks
                                </span>
                              )}
                            </div>
                            
                            {phaseData.milestone && (
                              <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <span>🎯</span>
                                <strong>Milestone:</strong> {phaseData.milestone}
                              </div>
                            )}
                            
                            {phaseData.tasks && phaseData.tasks.length > 0 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                                {phaseData.tasks.map((taskText, taskIdx) => {
                                  const taskKey = `${goal.id}-${phaseIdx}-${taskIdx}`;
                                  const isTaskDone = !!completedRoadmapTasks[taskKey];
                                  
                                  return (
                                    <label 
                                      key={taskIdx} 
                                      style={{ 
                                        display: 'flex', 
                                        alignItems: 'flex-start', 
                                        gap: '10px', 
                                        cursor: 'pointer',
                                        padding: '6px 8px',
                                        borderRadius: '6px',
                                        background: isTaskDone ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                                        transition: 'all 0.2s ease',
                                        userSelect: 'none'
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isTaskDone}
                                        onChange={() => {
                                          setCompletedRoadmapTasks(prev => ({
                                            ...prev,
                                            [taskKey]: !prev[taskKey]
                                          }));
                                        }}
                                        style={{ 
                                          marginTop: '3px',
                                          width: '16px', 
                                          height: '16px', 
                                          accentColor: '#10b981',
                                          cursor: 'pointer' 
                                        }}
                                      />
                                      <span style={{ 
                                        fontSize: '0.85rem', 
                                        color: isTaskDone ? '#64748b' : '#e2e8f0',
                                        textDecoration: isTaskDone ? 'line-through' : 'none',
                                        transition: 'all 0.2s ease',
                                        lineHeight: '1.4'
                                      }}>
                                        {taskText}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div id="enhance-plan-section" style={{ marginBottom: '30px', padding: '24px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '12px', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
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

              {plan.weeklySchedule && plan.weeklySchedule.length > 0 && (
                <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                  <div style={{ color: '#fbbf24', fontSize: '0.9rem', fontWeight: '600', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📅 First Week Overview</div>
                  {plan.weeklySchedule[0]?.days && plan.weeklySchedule[0].days.slice(0, 3).map((day, idx) => (
                    <div key={idx} style={{ marginBottom: idx < 2 ? '16px' : 0, paddingBottom: idx < 2 ? '16px' : 0, borderBottom: idx < 2 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none' }}>
                      <div style={{ color: '#93c5fd', fontWeight: '600', marginBottom: '8px', fontSize: '0.95rem' }}>
                        {day.day}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {day.morning && day.morning.map((task, i) => (
                          <div key={i} style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '6px 10px', borderRadius: '4px', color: '#cbd5e1', fontSize: '0.85rem', borderLeft: '2px solid #fbbf24' }}>
                            ☀️ {task}
                          </div>
                        ))}
                        {day.afternoon && day.afternoon.map((task, i) => (
                          <div key={i} style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '6px 10px', borderRadius: '4px', color: '#cbd5e1', fontSize: '0.85rem', borderLeft: '2px solid #3b82f6' }}>
                            🌤️ {task}
                          </div>
                        ))}
                        {day.evening && day.evening.map((task, i) => (
                          <div key={i} style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '6px 10px', borderRadius: '4px', color: '#cbd5e1', fontSize: '0.85rem', borderLeft: '2px solid #8b5cf6' }}>
                            🌙 {task}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{ color: '#a0aec0', fontSize: '0.8rem', marginTop: '12px', padding: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                    👉 View the "Weekly Goal Schedule" tab for the complete day-by-day plan for all weeks
                  </div>
                </div>
              )}
              
              {plan.dailyCheckpoints && plan.dailyCheckpoints.length > 0 && (
                <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                  <div style={{ color: '#86efac', fontSize: '0.85rem', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>✓ Daily Checkpoints</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    {plan.dailyCheckpoints.map((checkpoint, idx) => (
                      <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '10px', borderRadius: '6px', color: '#cbd5e1', fontSize: '0.85rem', borderLeft: '3px solid #86efac' }}>
                        ✓ {checkpoint}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {plan.keyMetrics && plan.keyMetrics.length > 0 && (
                <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                  <div style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>📊 Key Metrics</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    {plan.keyMetrics.map((metric, idx) => (
                      <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '10px', borderRadius: '6px', color: '#cbd5e1', fontSize: '0.85rem', borderLeft: '3px solid #fbbf24' }}>
                        📊 {metric}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {plan.tips && plan.tips.length > 0 && (
                <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                  <div style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>💡 Pro Tips</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {plan.tips.map((tip, idx) => (
                      <div key={idx} style={{ color: '#cbd5e1', fontSize: '0.9rem', paddingLeft: '20px', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#22c55e', fontWeight: 'bold' }}>✓</span>
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()
      ) : (
        <button className="generate-btn" onClick={() => generatePlan(selectedGoal)} disabled={loadingPlan !== null}>
          {loadingPlan !== null ? <Loader className="spin" size={16} /> : <TrendingUp size={16} />}
          Generate AI Plan
        </button>
      )}
    </div>
  );
}
