import React, { useState, useEffect, useMemo } from 'react';
import { Award, Zap, Flame, Trophy, CheckCircle2, TrendingUp } from 'lucide-react';
import { formatDate } from '../utils/plannerHelpers';

export default function AnalyticsTab({ goals, calendarTasks, completedRoadmapTasks }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiBurst, setConfettiBurst] = useState([]);

  // Trigger Confetti Burst
  const triggerConfetti = () => {
    const colors = ['#a78bfa', '#818cf8', '#34d399', '#fbbf24', '#f87171', '#60a5fa'];
    const particles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // random screen width percentage
      y: -10 - Math.random() * 20, // start above screen
      size: 6 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      duration: 2.5 + Math.random() * 2,
      rotation: Math.random() * 360,
      spinSpeed: 0.5 + Math.random() * 1.5
    }));
    setConfettiBurst(particles);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 4500);
  };

  // Compute Gamified Stats
  const stats = useMemo(() => {
    // 1. Calculate XP from calendar tasks, roadmap tasks, and goals
    let calendarTasksXP = 0;
    let completedCalendarCount = 0;
    let totalCalendarCount = 0;

    Object.keys(calendarTasks).forEach(dateKey => {
      const dayTasks = calendarTasks[dateKey] || [];
      dayTasks.forEach(task => {
        totalCalendarCount++;
        if (task.completed) {
          completedCalendarCount++;
          calendarTasksXP += 15; // 15 XP per calendar task
        }
      });
    });

    let completedRoadmapCount = 0;
    let totalRoadmapCount = 0;
    let roadmapXP = 0;

    goals.forEach(goal => {
      if (goal.plan && goal.plan.roadmap) {
        goal.plan.roadmap.forEach((phase, phaseIdx) => {
          if (phase.tasks) {
            phase.tasks.forEach((task, taskIdx) => {
              totalRoadmapCount++;
              const taskKey = `${goal.id}-${phaseIdx}-${taskIdx}`;
              if (completedRoadmapTasks[taskKey]) {
                completedRoadmapCount++;
                roadmapXP += 50; // 50 XP per roadmap milestone checklist item
              }
            });
          }
        });
      }
    });

    // Completed Goals: goals where the roadmap exists and is 100% checked off
    let completedGoalsCount = 0;
    goals.forEach(goal => {
      if (goal.plan && goal.plan.roadmap) {
        let allFinished = true;
        let hasTasks = false;
        goal.plan.roadmap.forEach((phase, phaseIdx) => {
          if (phase.tasks) {
            phase.tasks.forEach((task, taskIdx) => {
              hasTasks = true;
              const taskKey = `${goal.id}-${phaseIdx}-${taskIdx}`;
              if (!completedRoadmapTasks[taskKey]) {
                allFinished = false;
              }
            });
          }
        });
        if (hasTasks && allFinished) {
          completedGoalsCount++;
        }
      }
    });

    const goalsXP = completedGoalsCount * 200; // 200 XP per fully completed goal
    const totalXP = calendarTasksXP + roadmapXP + goalsXP;

    // Level calculation (100 XP per level)
    const level = Math.floor(totalXP / 100) + 1;
    const currentLevelXP = totalXP % 100;
    const progressPercent = Math.min(100, Math.round((currentLevelXP / 100) * 100));

    // 2. Streaks calculation (calendar tasks completion streaks)
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const streakDays = [];

    // Loop past 30 days to build history
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = formatDate(d);
      const dayTasks = calendarTasks[dateKey] || [];
      const hasCompleted = dayTasks.length > 0 && dayTasks.some(t => t.completed);
      
      if (hasCompleted) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
      
      streakDays.push({
        dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completedCount: dayTasks.filter(t => t.completed).length,
        hasCompleted
      });
    }
    
    // Calculate current active streak checking backwards from today
    let checkDate = new Date();
    let active = true;
    while (active) {
      const dateKey = formatDate(checkDate);
      const dayTasks = calendarTasks[dateKey] || [];
      const hasCompleted = dayTasks.length > 0 && dayTasks.some(t => t.completed);
      
      if (hasCompleted) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Allow streak to continue if we are checking today and they haven't completed a task *yet*,
        // but only if they completed one yesterday.
        const todayKey = formatDate(new Date());
        if (formatDate(checkDate) === todayKey) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesTasks = calendarTasks[formatDate(yesterday)] || [];
          if (yesTasks.length > 0 && yesTasks.some(t => t.completed)) {
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        active = false;
      }
    }

    return {
      totalXP,
      level,
      progressPercent,
      currentLevelXP,
      completedCalendarCount,
      totalCalendarCount,
      calendarPercentage: totalCalendarCount > 0 ? Math.round((completedCalendarCount / totalCalendarCount) * 100) : 0,
      completedRoadmapCount,
      totalRoadmapCount,
      roadmapPercentage: totalRoadmapCount > 0 ? Math.round((completedRoadmapCount / totalRoadmapCount) * 100) : 0,
      completedGoalsCount,
      currentStreak,
      longestStreak,
      streakDays
    };
  }, [goals, calendarTasks, completedRoadmapTasks]);

  // Trigger celebration on level up (watch level changes)
  useEffect(() => {
    if (stats.level > 1) {
      triggerConfetti();
    }
  }, [stats.level]);

  // Calculate coordinates for the Sparkline custom SVG Chart
  const svgPathData = useMemo(() => {
    const data = stats.streakDays;
    const width = 500;
    const height = 150;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    if (data.length === 0) return '';
    
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      // y is inverted in SVG coordinates. Map completed task count (e.g. max 5) to height
      const maxCount = Math.max(...data.map(item => item.completedCount), 3);
      const y = height - padding - (d.completedCount / maxCount) * chartHeight;
      return { x, y };
    });
    
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    // Create fill path closing the polygon at the bottom
    const fillPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    
    return { linePath, fillPath, points };
  }, [stats.streakDays]);

  return (
    <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* CSS Confetti Overlay */}
      {showConfetti && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          overflow: 'hidden'
        }}>
          {confettiBurst.map(p => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                borderRadius: p.id % 3 === 0 ? '50%' : p.id % 3 === 1 ? '4px' : '0',
                transform: `rotate(${p.rotation}deg)`,
                animation: `float-down-${p.id} ${p.duration}s linear infinite`,
                animationDelay: `${p.delay}s`,
                opacity: 0.8
              }}
            />
          ))}
          <style>{`
            ${confettiBurst.map(p => `
              @keyframes float-down-${p.id} {
                0% {
                  top: -5%;
                  transform: translateX(0) rotate(0deg);
                  opacity: 1;
                }
                50% {
                  transform: translateX(${p.id % 2 === 0 ? '30px' : '-30px'}) rotate(${p.rotation + 180}deg);
                  opacity: 0.9;
                }
                100% {
                  top: 105%;
                  transform: translateX(${p.id % 2 === 0 ? '60px' : '-60px'}) rotate(${p.rotation + 360}deg);
                  opacity: 0;
                }
              }
            `).join('\n')}
          `}</style>
        </div>
      )}

      {/* Gamification Level Dashboard */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
        border: '1px solid rgba(124, 58, 237, 0.3)',
        borderRadius: '16px',
        padding: '30px',
        backdropFilter: 'blur(16px)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Effects */}
        <div style={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          background: 'rgba(124, 58, 237, 0.3)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          top: '-20px',
          left: '-20px',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)',
            border: '2px solid rgba(255,255,255,0.2)',
            flexShrink: 0,
            cursor: 'pointer'
          }}
          onClick={triggerConfetti}
          title="Click to celebrate!"
          >
            <Trophy size={38} style={{ color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '2rem', fontWeight: '800', color: 'white', fontFamily: "'JetBrains Mono', monospace" }}>LEVEL {stats.level}</span>
              <span style={{ fontSize: '0.8rem', background: 'rgba(139, 92, 246, 0.3)', color: '#c4b5fd', padding: '3px 8px', borderRadius: '20px', fontWeight: '600', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
                {stats.totalXP} Total XP
              </span>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
              Complete milestones, calendar tasks, and roadmaps to rank up!
            </p>
          </div>
        </div>

        {/* Progress Bar next level */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#a0aec0', fontWeight: '600' }}>
            <span>PROGRESS TO LEVEL {stats.level + 1}</span>
            <span style={{ color: '#a78bfa' }}>{stats.currentLevelXP} / 100 XP ({stats.progressPercent}%)</span>
          </div>
          <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{
              width: `${stats.progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #7c3aed 0%, #3b82f6 100%)',
              borderRadius: '10px',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 0 12px rgba(59, 130, 246, 0.5)'
            }} />
          </div>
        </div>
      </div>

      {/* Grid of Key Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Streak Card */}
        <div className="card glass-card" style={{ display: 'flex', padding: '20px', gap: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.25)', color: '#f59e0b', flexShrink: 0 }}>
            <Flame size={24} style={{ filter: 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.4))' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Streak</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', margin: '2px 0 0 0', fontFamily: "'JetBrains Mono', monospace" }}>
              {stats.currentStreak} {stats.currentStreak === 1 ? 'Day' : 'Days'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Longest: {stats.longestStreak} days</div>
          </div>
        </div>

        {/* Roadmap Milestones Completed */}
        <div className="card glass-card" style={{ display: 'flex', padding: '20px', gap: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.25)', color: '#c4b5fd', flexShrink: 0 }}>
            <Zap size={24} style={{ filter: 'drop-shadow(0 0 4px rgba(124, 58, 237, 0.4))' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Roadmap Milestones</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', margin: '2px 0 0 0', fontFamily: "'JetBrains Mono', monospace" }}>
              {stats.completedRoadmapCount} / {stats.totalRoadmapCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{stats.roadmapPercentage}% Completion</div>
          </div>
        </div>

        {/* Goals Checklist Card */}
        <div className="card glass-card" style={{ display: 'flex', padding: '20px', gap: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#10b981', flexShrink: 0 }}>
            <Award size={24} style={{ filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completed Goals</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', margin: '2px 0 0 0', fontFamily: "'JetBrains Mono', monospace" }}>
              {stats.completedGoalsCount} / {goals.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Fully checked milestones</div>
          </div>
        </div>

        {/* Tasks Logged Card */}
        <div className="card glass-card" style={{ display: 'flex', padding: '20px', gap: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.25)', color: '#3b82f6', flexShrink: 0 }}>
            <CheckCircle2 size={24} style={{ filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.4))' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Task Completions</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', margin: '2px 0 0 0', fontFamily: "'JetBrains Mono', monospace" }}>
              {stats.completedCalendarCount} / {stats.totalCalendarCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{stats.calendarPercentage}% Completion</div>
          </div>
        </div>

      </div>

      {/* Main Charts & Visualizations Container */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* Streak History Sparkline Graph */}
        <div className="card glass-card" style={{ padding: '24px', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ color: 'white', fontSize: '1.1rem', margin: 0, fontWeight: '600' }}>Productivity Streak History</h3>
              <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '4px 0 0 0' }}>Daily task completion trends over past 30 days</p>
            </div>
            <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: '#a78bfa', background: 'rgba(124, 58, 237, 0.1)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
              <TrendingUp size={12} />
              Active Trends
            </div>
          </div>

          {/* SVG Custom Interactive Line Chart */}
          <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
            <svg 
              viewBox="0 0 500 150" 
              style={{ width: '100%', height: 'auto', overflow: 'visible' }}
            >
              {/* Gradients */}
              <defs>
                <linearGradient id="chart-fill-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="chart-stroke-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="20" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="20" y1="65" x2="480" y2="65" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="20" y1="110" x2="480" y2="110" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="20" y1="130" x2="480" y2="130" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

              {/* Area Fill */}
              {svgPathData.fillPath && (
                <path d={svgPathData.fillPath} fill="url(#chart-fill-grad)" />
              )}

              {/* Stroke Line */}
              {svgPathData.linePath && (
                <path 
                  d={svgPathData.linePath} 
                  fill="none" 
                  stroke="url(#chart-stroke-grad)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: 'drop-shadow(0 4px 6px rgba(124, 58, 237, 0.3))' }}
                />
              )}

              {/* Interactive Dots for non-zero points */}
              {svgPathData.points && svgPathData.points.map((p, i) => {
                const item = stats.streakDays[i];
                if (item.completedCount === 0) return null;
                return (
                  <g key={i}>
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r="4.5" 
                      fill="#7c3aed" 
                      stroke="white" 
                      strokeWidth="1.5" 
                      style={{ cursor: 'pointer' }}
                    />
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r="9" 
                      fill="none" 
                      stroke="#8b5cf6" 
                      strokeWidth="1" 
                      opacity="0.5"
                      className="pulse-ring"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Sparkline Custom Tooltip / X Axis */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '10px', padding: '0 4px' }}>
              <span>{stats.streakDays[0]?.dateLabel}</span>
              <span>15 Days Ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Goal Completion Circle Ring Cards */}
        <div className="card glass-card" style={{ padding: '24px', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ color: 'white', fontSize: '1.1rem', margin: 0, fontWeight: '600' }}>Overall Milestone Metrics</h3>
            <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '4px 0 0 0' }}>Breakdown of planning vs execution percentages</p>
          </div>

          <div style={{ display: 'flex', gap: '30px', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', flexGrow: 1, padding: '10px 0' }}>
            
            {/* Circle 1: AI Roadmap Completion */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    stroke="url(#circle-purple-grad)" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - stats.roadmapPercentage / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  <defs>
                    <linearGradient id="circle-purple-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#c4b5fd" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white', fontFamily: "'JetBrains Mono', monospace" }}>{stats.roadmapPercentage}%</span>
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600' }}>Roadmap Tasks</span>
            </div>

            {/* Circle 2: Calendar Tasks Completion */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    stroke="url(#circle-green-grad)" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - stats.calendarPercentage / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  <defs>
                    <linearGradient id="circle-green-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white', fontFamily: "'JetBrains Mono', monospace" }}>{stats.calendarPercentage}%</span>
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600' }}>Calendar Schedule</span>
            </div>

          </div>
        </div>

      </div>

      {/* Goal Checklists detail block */}
      <div className="card glass-card" style={{ padding: '24px', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
        <h3 style={{ color: 'white', fontSize: '1.1rem', margin: '0 0 16px 0', fontWeight: '600' }}>Goal Milestones & Achievements</h3>
        
        {goals.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '20px', fontSize: '0.9rem' }}>
            No goals found. Create a goal in the sidebar to start gaining XP!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {goals.map(goal => {
              // Calculate completion percentage for this single goal
              let goalTotal = 0;
              let goalCompleted = 0;
              if (goal.plan && goal.plan.roadmap) {
                goal.plan.roadmap.forEach((phase, phaseIdx) => {
                  if (phase.tasks) {
                    phase.tasks.forEach((t, taskIdx) => {
                      goalTotal++;
                      const taskKey = `${goal.id}-${phaseIdx}-${taskIdx}`;
                      if (completedRoadmapTasks[taskKey]) {
                        goalCompleted++;
                      }
                    });
                  }
                });
              }

              const pct = goalTotal > 0 ? Math.round((goalCompleted / goalTotal) * 100) : 0;
              const isGoalCompleted = goalTotal > 0 && goalCompleted === goalTotal;

              return (
                <div 
                  key={goal.id} 
                  style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '16px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: `1px solid ${isGoalCompleted ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '8px',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ color: isGoalCompleted ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center' }}>
                      <CheckCircle2 size={18} style={{ fill: isGoalCompleted ? 'rgba(16, 185, 129, 0.15)' : 'transparent' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: isGoalCompleted ? '#a7f3d0' : 'white' }}>{goal.goal}</span>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        {goal.plan ? `Plan active • ${goalCompleted}/${goalTotal} milestones finished` : 'No roadmap generated yet'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {isGoalCompleted && (
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', background: 'rgba(16,185,129,0.1)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.2)' }}>
                        🏆 Completed (+200 XP)
                      </span>
                    )}
                    <div style={{ width: '100px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                        <span>Progress</span>
                        <span>{pct}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: isGoalCompleted ? '#10b981' : 'linear-gradient(90deg, #7c3aed 0%, #3b82f6 100%)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
