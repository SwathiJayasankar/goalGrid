import React from 'react';
import { Plus, Trash2, TrendingUp } from 'lucide-react';

export default function Sidebar({
  goals,
  selectedGoal,
  setSelectedGoal,
  inputValue,
  setInputValue,
  inputRef,
  addGoal,
  deleteGoal,
  setActiveTab,
  handleKeyPress,
  goalError,
  setGoalError
}) {
  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <div className="section-title">Add New Goal</div>
        <div className="input-group">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (goalError) setGoalError('');
            }}
            onKeyDown={handleKeyPress}
            placeholder="E.g., study schedule for exams in a week, workout plan for a month..."
          />
          <button className="add-btn" onClick={addGoal}>
            <Plus size={16} />
            Add Goal
          </button>
        </div>
        {goalError && (
          <div style={{ color: '#f87171', marginTop: '8px', fontSize: '0.85rem' }}>
            {goalError}
          </div>
        )}
      </div>

      <div className="sidebar-section">
        <div className="section-title">Your Goals</div>
        <div className="goals-list">
          {goals.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>
              No goals yet
            </div>
          ) : (
            goals.map(goal => (
              <div
                key={goal.id}
                className={`goal-item ${selectedGoal === goal.id ? 'active' : ''}`}
                onClick={() => setSelectedGoal(goal.id)}
              >
                <div>
                  <div className="goal-text">{goal.goal}</div>
                  {goal.plan && <div className="goal-status">✓ Plan ready</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {goal.plan && (
                    <button
                      className="delete-btn"
                      title="Enhance Plan"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGoal(goal.id);
                        setActiveTab('planner');
                        setTimeout(() => {
                          document.getElementById('enhance-plan-section')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                      style={{ color: '#a78bfa' }}
                    >
                      <TrendingUp size={14} />
                    </button>
                  )}
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGoal(goal.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
