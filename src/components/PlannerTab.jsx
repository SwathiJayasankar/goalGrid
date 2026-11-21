import React, { useState, useCallback } from 'react';
import { AlertCircle, Loader, TrendingUp, CheckCircle2, ClipboardList, Sparkles } from 'lucide-react';

// ─── Intake Question Card (inline, for Planner tab) ────────────────────────
function PlanIntakeCard({ questions, goalDescription, onSubmit, onSkip, loading }) {
  const [answers, setAnswers] = useState(() => {
    const init = {};
    (questions || []).forEach(q => { init[q.id] = ''; });
    return init;
  });

  const allAnswered = (questions || []).every(q => answers[q.id]?.trim());

  const sharedInputStyle = {
    width: '100%',
    background: 'rgba(0,0,0,0.25)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '10px 12px',
    color: '#f1f5f9',
    fontSize: '0.85rem',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease'
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(124,58,237,0.07) 0%, rgba(79,70,229,0.07) 100%)',
      border: '1px solid rgba(124,58,237,0.22)',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <ClipboardList size={16} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#c4b5fd', fontSize: '0.9rem', marginBottom: '2px' }}>
            Before we generate your plan...
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            {questions.length} quick question{questions.length !== 1 ? 's' : ''} to make the plan actually useful for you
          </div>
        </div>
      </div>

      {/* questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {(questions || []).map((q, idx) => (
          <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <label style={{
              fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600,
              display: 'flex', alignItems: 'flex-start', gap: '7px'
            }}>
              <span style={{
                background: 'rgba(124,58,237,0.2)', color: '#a78bfa',
                borderRadius: '4px', padding: '2px 7px', fontSize: '0.72rem',
                fontWeight: 700, flexShrink: 0, marginTop: '1px'
              }}>Q{idx + 1}</span>
              {q.question}
            </label>

            {q.type === 'choice' && q.options ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {q.options.map(opt => {
                  const sel = answers[q.id] === opt;
                  return (
                    <button key={opt} onClick={() => setAnswers(p => ({ ...p, [q.id]: opt }))}
                      style={{
                        padding: '7px 14px', borderRadius: '20px',
                        border: sel ? '1px solid #7c3aed' : '1px solid rgba(255,255,255,0.12)',
                        background: sel ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)',
                        color: sel ? '#c4b5fd' : '#94a3b8',
                        fontSize: '0.8rem', cursor: 'pointer',
                        fontWeight: sel ? 600 : 400,
                        display: 'flex', alignItems: 'center', gap: '5px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {sel && <CheckCircle2 size={12} style={{ color: '#a78bfa' }} />}
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : q.type === 'syllabus' ? (
              <textarea
                value={answers[q.id]}
                onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))}
                placeholder={q.hint || 'Paste your syllabus, topic list, or notes here...'}
                rows={5}
                style={{ ...sharedInputStyle, resize: 'vertical', lineHeight: 1.5,
                  border: answers[q.id] ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.12)'
                }}
              />
            ) : (
              <input
                type="text"
                value={answers[q.id]}
                onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))}
                placeholder={q.hint || 'Type your answer...'}
                style={{ ...sharedInputStyle,
                  border: answers[q.id] ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.12)'
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* actions */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <button
          onClick={() => {
            const ctx = (questions || []).map(q => ({ question: q.question, answer: answers[q.id]?.trim() || '(not specified)' }));
            onSubmit(ctx);
          }}
          disabled={loading || !allAnswered}
          className="generate-btn"
          style={{
            flex: 1,
            background: allAnswered ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : 'rgba(255,255,255,0.05)',
            opacity: allAnswered ? 1 : 0.7,
            cursor: allAnswered ? 'pointer' : 'not-allowed'
          }}
        >
          {loading ? <Loader className="spin" size={16} /> : <Sparkles size={16} />}
          Generate Personalized Plan
        </button>
        <button
          onClick={onSkip}
          disabled={loading}
          style={{
            padding: '10px 16px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            color: '#64748b',
            fontSize: '0.82rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Skip &amp; Generate
        </button>
      </div>
    </div>
  );
}

export default function PlannerTab({
  goals,
  selectedGoal,
  setSelectedGoal,
  loadingPlan,
  apiError,
  generatePlan,
  completedRoadmapTasks,
  setCompletedRoadmapTasks,
  integratePlanToSchedule,
  planFeedback,
  setPlanFeedback,
  categories,
  token,
  API_URL,
  fixedRoutine,
  calendarTasks
}) {
  const goal = goals.find(g => g.id === selectedGoal);

  // Pre-plan intake state
  const [intakeState, setIntakeState] = useState({}); // keyed by goal.id
  // intakeState[goalId] = { status: 'idle'|'loading'|'ready'|'skipped', questions: [] }

  const startIntake = useCallback(async (goalId) => {
    const g = goals.find(x => x.id === goalId);
    if (!g) return;

    setIntakeState(prev => ({ ...prev, [goalId]: { status: 'loading', questions: [] } }));

    try {
      const res = await fetch(`${API_URL}/planner/pre-plan-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ goal: g, fixedRoutine: fixedRoutine || [], calendarTasks: calendarTasks || {} })
      });
      const data = await res.json();
      const qs = data.questions || [];
      if (qs.length === 0) {
        // No questions returned — go straight to generation
        setIntakeState(prev => ({ ...prev, [goalId]: { status: 'skipped', questions: [] } }));
        generatePlan(goalId);
      } else {
        setIntakeState(prev => ({ ...prev, [goalId]: { status: 'ready', questions: qs } }));
      }
    } catch (err) {
      // On error, skip intake and generate directly
      setIntakeState(prev => ({ ...prev, [goalId]: { status: 'skipped', questions: [] } }));
      generatePlan(goalId);
    }
  }, [goals, API_URL, token, fixedRoutine, calendarTasks, generatePlan]);

  const handleIntakeSubmit = useCallback((goalId, userContext) => {
    setIntakeState(prev => ({ ...prev, [goalId]: { status: 'skipped', questions: [] } }));
    generatePlan(goalId, '', userContext);
  }, [generatePlan]);

  const handleIntakeSkip = useCallback((goalId) => {
    setIntakeState(prev => ({ ...prev, [goalId]: { status: 'skipped', questions: [] } }));
    generatePlan(goalId);
  }, [generatePlan]);


  return (
    <div className="planner-tab-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Mobile-Friendly Goal Switcher Bar */}
      {goals.length > 0 && (
        <div className="goal-selector-bar glass-panel" style={{ padding: '14px 18px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              🎯 Your Active Goals ({goals.length})
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', webkitOverflowScrolling: 'touch' }}>
            {goals.map((g) => {
              const isSelected = selectedGoal === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGoal(g.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '999px',
                    border: isSelected ? '1px solid #7c3aed' : '1px solid rgba(255,255,255,0.1)',
                    background: isSelected ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.4) 0%, rgba(79, 70, 229, 0.4) 100%)' : 'rgba(255,255,255,0.03)',
                    color: isSelected ? '#fff' : '#cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: isSelected ? '600' : '400',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {g.goal}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedGoal === null ? (
        <div className="empty-state" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎯</div>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>Select or Create a Goal</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            {goals.length > 0 
              ? 'Tap any goal pill above to view its AI roadmap and daily execution plan.'
              : 'Add your first target goal from the sidebar menu to unlock AI Roadmap Planning.'}
          </p>
        </div>
      ) : (
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
      ) : (() => {
        const intake = intakeState[selectedGoal];
        // Phase 1: intake loading
        if (intake?.status === 'loading') {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '28px 0' }}>
              <Loader className="spin" size={22} style={{ color: '#7c3aed' }} />
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Preparing personalized questions...</p>
            </div>
          );
        }
        // Phase 2: questions ready
        if (intake?.status === 'ready' && intake.questions.length > 0) {
          return (
            <PlanIntakeCard
              questions={intake.questions}
              goalDescription={goal.goal}
              onSubmit={(ctx) => handleIntakeSubmit(selectedGoal, ctx)}
              onSkip={() => handleIntakeSkip(selectedGoal)}
              loading={loadingPlan === selectedGoal}
            />
          );
        }
        // Phase 3: generating (after intake or after skip)
        if (loadingPlan === selectedGoal) {
          return (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p style={{ color: '#cbd5e1' }}>Generating your personalized plan...</p>
            </div>
          );
        }
        // Default: show the start button that triggers intake first
        return (
          <button className="generate-btn" onClick={() => startIntake(selectedGoal)} disabled={loadingPlan !== null}>
            <Sparkles size={16} />
            Generate AI Plan
          </button>
        );
      })()
      }
    </div>
    )}
    </div>
  );
}
