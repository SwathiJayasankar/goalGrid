import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Trash2, 
  User, 
  Globe, 
  Database,
  ChevronDown,
  ChevronUp,
  Cpu,
  Loader,
  HelpCircle,
  CheckCircle2,
  ClipboardList
} from 'lucide-react';

// Formats inline bold (**text**) and inline code (`code`)
const formatInline = (text) => {
  if (!text) return '';
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.flatMap((part, index) => {
    const isBold = index % 2 === 1;
    const codeParts = part.split(/`([^`]+)`/g);
    const renderedCodeParts = codeParts.map((subPart, subIdx) => {
      const isCode = subIdx % 2 === 1;
      if (isCode) {
        return (
          <code key={`${index}-${subIdx}`} style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '2px 6px',
            borderRadius: '4px',
            color: '#c084fc',
            fontFamily: 'monospace',
            fontSize: '0.85em',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            {subPart}
          </code>
        );
      }
      return subPart;
    });
    if (isBold) {
      return <strong key={index} style={{ fontWeight: 700, color: '#ffffff' }}>{renderedCodeParts}</strong>;
    }
    return renderedCodeParts;
  });
};

// Formats basic markdown lines (headers, lists, horizontal rules, paragraphs)
const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed === '---') {
      return <hr key={idx} style={{ margin: '14px 0', border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} />;
    }
    if (trimmed.startsWith('### ')) {
      return <h4 key={idx} style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '12px', marginBottom: '6px', color: '#ffffff' }}>{formatInline(trimmed.substring(4))}</h4>;
    }
    if (trimmed.startsWith('## ')) {
      return <h3 key={idx} style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '14px', marginBottom: '8px', color: '#ffffff' }}>{formatInline(trimmed.substring(3))}</h3>;
    }
    if (trimmed.startsWith('# ')) {
      return <h2 key={idx} style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '16px', marginBottom: '10px', color: '#ffffff' }}>{formatInline(trimmed.substring(2))}</h2>;
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return (
        <ul key={idx} style={{ margin: '6px 0', paddingLeft: '18px', listStyleType: 'disc' }}>
          <li style={{ color: '#e2e8f0', lineHeight: 1.5 }}>
            {formatInline(trimmed.substring(2))}
          </li>
        </ul>
      );
    }
    const numListMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numListMatch) {
      return (
        <ol key={idx} style={{ margin: '6px 0', paddingLeft: '18px', listStyleType: 'decimal' }}>
          <li value={parseInt(numListMatch[1], 10)} style={{ color: '#e2e8f0', lineHeight: 1.5 }}>
            {formatInline(numListMatch[2])}
          </li>
        </ol>
      );
    }
    if (trimmed === '') {
      return <div key={idx} style={{ height: '6px' }} />;
    }
    return (
      <p key={idx} style={{ margin: '6px 0', lineHeight: 1.5, color: '#e2e8f0' }}>
        {formatInline(line)}
      </p>
    );
  });
};

// ─── Intake Question Card Component ────────────────────────────────────────────
function IntakeQuestionCard({ intake, onSubmit, onSkip, loading }) {
  const [answers, setAnswers] = useState(() => {
    const init = {};
    (intake.questions || []).forEach(q => { init[q.id] = ''; });
    return init;
  });

  const allAnswered = (intake.questions || []).every(q => answers[q.id]?.trim());

  const handleSubmit = () => {
    const answeredList = (intake.questions || []).map(q => ({
      question: q.question,
      answer: answers[q.id]?.trim() || '(not answered)'
    }));
    onSubmit(intake.goalDescription, answeredList);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(79, 70, 229, 0.08) 100%)',
      border: '1px solid rgba(124, 58, 237, 0.25)',
      borderRadius: '14px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <ClipboardList size={14} color="white" />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Quick Setup
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            "{intake.goalDescription}"
          </div>
        </div>
      </div>

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {(intake.questions || []).map((q, idx) => (
          <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: '0.82rem',
              color: '#e2e8f0',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px'
            }}>
              <span style={{
                background: 'rgba(124, 58, 237, 0.2)',
                color: '#a78bfa',
                borderRadius: '4px',
                padding: '1px 6px',
                fontSize: '0.7rem',
                fontWeight: 700,
                flexShrink: 0,
                marginTop: '1px'
              }}>Q{idx + 1}</span>
              {q.question}
            </label>

            {q.type === 'choice' && q.options ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {q.options.map(opt => {
                  const isSelected = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: isSelected ? '1px solid #7c3aed' : '1px solid rgba(255,255,255,0.12)',
                        background: isSelected ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)',
                        color: isSelected ? '#c4b5fd' : '#94a3b8',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        fontWeight: isSelected ? 600 : 400,
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      {isSelected && <CheckCircle2 size={11} style={{ color: '#a78bfa' }} />}
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : q.type === 'syllabus' ? (
              <textarea
                value={answers[q.id]}
                onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                placeholder={q.hint || 'Paste your syllabus, topic list, or any content here...'}
                rows={4}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.25)',
                  border: answers[q.id] ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: '#f1f5f9',
                  fontSize: '0.8rem',
                  resize: 'vertical',
                  outline: 'none',
                  lineHeight: 1.5,
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s ease'
                }}
              />
            ) : (
              <input
                type="text"
                value={answers[q.id]}
                onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                placeholder={q.hint || 'Type your answer...'}
                onKeyDown={e => { if (e.key === 'Enter' && allAnswered) handleSubmit(); }}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.25)',
                  border: answers[q.id] ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  color: '#f1f5f9',
                  fontSize: '0.82rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  fontFamily: 'inherit'
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button
          onClick={handleSubmit}
          disabled={loading || !allAnswered}
          style={{
            flex: 1,
            background: allAnswered
              ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'
              : 'rgba(255,255,255,0.05)',
            border: allAnswered ? 'none' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            padding: '10px',
            color: allAnswered ? 'white' : '#64748b',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: allAnswered ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          {loading ? <Loader size={13} className="spinner" /> : <CheckCircle2 size={13} />}
          Build My Goal
        </button>
        <button
          onClick={onSkip}
          disabled={loading}
          style={{
            padding: '10px 14px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            color: '#64748b',
            fontSize: '0.78rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'color 0.2s ease'
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}

export default function AiAssistantSidebar({
  isOpen,
  onClose,
  token,
  API_URL,
  onMutation
}) {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('goalgrid_ai_chat');
    return saved ? JSON.parse(saved) : [
      {
        role: 'assistant',
        content: "Hi, I'm GoalGrid Copilot! 🎯 I'm your agentic advisor. I can search the web, add tasks, schedule study blocks/routines, log journal reflections, and analyze your productivity. How can I help you optimize your today?",
        steps: []
      }
    ];
  });
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState({});
  // Tracks active intake question session (if any)
  const [activeIntake, setActiveIntake] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('goalgrid_ai_chat', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userText = inputValue;
    setInputValue('');
    
    const updatedMessages = [...messages, { role: 'user', content: userText }];
    setMessages(updatedMessages);
    setLoading(true);
    setActiveIntake(null); // clear any pending intake on new message

    try {
      const response = await fetch(`${API_URL}/assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          message: userText,
          chatHistory: updatedMessages.slice(0, -1)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error communicating with assistant');
      }

      // Handle intake questions returned by the agent
      if (data.intakeQuestions) {
        setActiveIntake(data.intakeQuestions);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        steps: data.steps || [],
        intakeQuestions: data.intakeQuestions || null
      }]);

      if (data.workspaceMutated && onMutation) {
        onMutation();
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an issue: ${err.message}. Please verify your server connection and retry.`,
        steps: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Called when user submits answers to intake questions
  const handleIntakeSubmit = async (goalDescription, answeredList) => {
    setActiveIntake(null);
    setLoading(true);

    // Build a rich follow-up message that includes all answers
    const answerText = answeredList.map(a => `• ${a.question}: ${a.answer}`).join('\n');
    const followUpMessage = `Here are my answers for "${goalDescription}":\n${answerText}\n\nPlease now create this goal and I'll generate a plan for it.`;

    const updatedMessages = [...messages, { role: 'user', content: followUpMessage }];
    setMessages(updatedMessages);

    try {
      const response = await fetch(`${API_URL}/assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          message: followUpMessage,
          chatHistory: updatedMessages.slice(0, -1)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error communicating with assistant');
      }

      if (data.intakeQuestions) {
        setActiveIntake(data.intakeQuestions);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        steps: data.steps || [],
        intakeQuestions: data.intakeQuestions || null
      }]);

      if (data.workspaceMutated && onMutation) {
        onMutation();
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, something went wrong: ${err.message}`,
        steps: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleIntakeSkip = () => {
    setActiveIntake(null);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: "No problem! I'll create the goal with the information I have. You can always refine the plan later from the Planner tab.",
      steps: []
    }]);
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear your chat history?')) {
      const initialMsg = [
        {
          role: 'assistant',
          content: "Hi, I'm GoalGrid Copilot! 🎯 I'm your agentic advisor. I can search the web, add tasks, schedule study blocks/routines, log journal reflections, and analyze your productivity. How can I help you optimize your today?",
          steps: []
        }
      ];
      setMessages(initialMsg);
      setActiveIntake(null);
      localStorage.setItem('goalgrid_ai_chat', JSON.stringify(initialMsg));
    }
  };

  const toggleSteps = (index) => {
    setExpandedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const selectQuickAction = (text) => {
    setInputValue(text);
  };

  const getToolIcon = (toolName) => {
    switch (toolName) {
      case 'search_web':
        return <Globe size={14} className="text-blue-400" />;
      case 'get_user_data':
        return <Database size={14} className="text-emerald-400" />;
      case 'ask_clarifying_questions':
        return <HelpCircle size={14} style={{ color: '#f59e0b' }} />;
      default:
        return <Database size={14} className="text-violet-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="ai-sidebar glass-panel">
      {/* Header */}
      <div className="ai-sidebar-header">
        <div className="ai-title-wrap">
          <Sparkles size={18} className="text-violet animate-pulse" />
          <span>AI Copilot Agent</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="chat-clear-btn" onClick={handleClearChat} title="Clear conversation history">
            <Trash2 size={15} />
          </button>
          <button className="ai-close-btn" onClick={onClose} title="Close sidebar">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="ai-messages-container">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const hasSteps = msg.steps && msg.steps.length > 0;
          const isStepsOpen = expandedSteps[index];
          // Show the intake card attached to this message if it's still active
          const showIntakeHere = msg.intakeQuestions && activeIntake &&
            activeIntake.goalDescription === msg.intakeQuestions.goalDescription;

          return (
            <div key={index} className={`ai-message-row ${isUser ? 'user-aligned' : 'ai-aligned'}`}>
              {!isUser && (
                <div className="ai-avatar pulse-glow">
                  <Sparkles size={14} />
                </div>
              )}
              
              <div className="ai-message-bubble-wrapper">
                <div className={`ai-message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
                  {renderMarkdown(msg.content)}
                </div>

                {/* Intake Question Card — shown directly below the AI message that triggered it */}
                {showIntakeHere && (
                  <IntakeQuestionCard
                    intake={activeIntake}
                    onSubmit={handleIntakeSubmit}
                    onSkip={handleIntakeSkip}
                    loading={loading}
                  />
                )}

                {/* Thinking Log Accordion */}
                {hasSteps && (
                  <div className="agent-steps-widget">
                    <button className="agent-steps-toggle" onClick={() => toggleSteps(index)}>
                      <Cpu size={12} style={{ marginRight: '6px' }} />
                      <span>Agent execution logs ({msg.steps.length} steps)</span>
                      {isStepsOpen ? <ChevronUp size={12} style={{ marginLeft: 'auto' }} /> : <ChevronDown size={12} style={{ marginLeft: 'auto' }} />}
                    </button>
                    
                    {isStepsOpen && (
                      <div className="agent-steps-details">
                        {msg.steps.map((step, idx) => (
                          <div key={idx} className="agent-step-item">
                            <div className="agent-step-title">
                              {getToolIcon(step.tool)}
                              <span style={{ fontWeight: 650, color: '#f1f5f9' }}>{step.tool}</span>
                            </div>
                            <div className="agent-step-desc">
                              {step.stepText}
                            </div>
                            <div className="agent-step-result">
                              {step.result}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="user-avatar">
                  <User size={14} />
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <div className="ai-message-row ai-aligned">
            <div className="ai-avatar pulse-glow">
              <Sparkles size={14} />
            </div>
            <div className="ai-message-bubble ai-bubble thinking-bubble">
              <Loader className="spinner" size={14} style={{ marginRight: '8px' }} />
              <span>Thinking &amp; running planning loop...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Panel */}
      {messages.length <= 1 && !loading && (
        <div className="ai-suggestions-panel">
          <p className="suggest-title">⚡ Quick suggestions</p>
          <div className="ai-suggestions-grid">
            <button onClick={() => selectQuickAction("Research top 3 workout habits and add a Morning Workout routine block at 07:00 AM")}>
              🏋️ Research &amp; Add Routine
            </button>
            <button onClick={() => selectQuickAction("I want to prepare for my exam")}>
              📖 Plan Exam Prep
            </button>
            <button onClick={() => selectQuickAction("Draft a quick daily reflection journal entry for today about learning React")}>
              📝 Write Daily Journal
            </button>
            <button onClick={() => selectQuickAction("I want to achieve a new goal")}>
              🚀 Set a New Goal
            </button>
          </div>
        </div>
      )}

      {/* Input Group */}
      <form onSubmit={handleSend} className="ai-input-wrapper">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={activeIntake ? 'Answer above, or type to continue...' : 'Ask Copilot agent...'}
          disabled={loading}
          autoFocus
        />
        <button type="submit" disabled={loading} className="ai-send-btn">
          <Send size={15} />
        </button>
      </form>

      {/* Custom Styles */}
      <style>{`
        .ai-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          width: 380px;
          height: 100dvh;
          height: 100vh; /* fallback */
          background: rgba(10, 12, 16, 0.98) !important;
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-top: none !important;
          border-bottom: none !important;
          border-right: none !important;
          display: flex;
          flex-direction: column;
          z-index: 1051;
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5) !important;
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          overflow: hidden;
        }

        @media (max-width: 480px) {
          .ai-sidebar {
            width: 100vw !important;
          }
          .ai-suggestions-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 360px) {
          .ai-message-bubble-wrapper {
            max-width: calc(100% - 32px) !important;
          }
        }

        .ai-sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .ai-title-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          color: white;
          font-size: 1.05rem;
          font-family: 'Poppins', sans-serif;
        }

        .text-violet {
          color: #7c3aed;
        }

        .ai-close-btn, .chat-clear-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .ai-close-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.08);
        }

        .chat-clear-btn:hover {
          color: #f87171;
          background: rgba(239, 68, 68, 0.1);
        }

        .ai-messages-container {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          -webkit-overflow-scrolling: touch;
        }

        .ai-message-row {
          display: flex;
          gap: 12px;
          max-width: 100%;
        }

        .user-aligned {
          align-self: flex-end;
          flex-direction: row;
        }

        .ai-aligned {
          align-self: flex-start;
        }

        .ai-avatar {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.4);
        }

        .user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #cbd5e1;
          flex-shrink: 0;
        }

        .ai-message-bubble-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: calc(100% - 40px);
        }

        .ai-message-bubble {
          padding: 12px 16px;
          border-radius: 14px;
          font-size: 0.9rem;
          line-height: 1.5;
          word-break: break-word;
        }

        .ai-bubble {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #f1f5f9;
          border-top-left-radius: 2px;
        }

        .thinking-bubble {
          display: flex;
          align-items: center;
          color: #94a3b8;
          font-style: italic;
        }

        .user-bubble {
          background: linear-gradient(135deg, #7d3aedc4 0%, #4f46e5d0 100%);
          border: 1px solid rgba(124, 58, 237, 0.3);
          color: white;
          border-top-right-radius: 2px;
        }

        /* Agent steps widget */
        .agent-steps-widget {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          overflow: hidden;
          margin-top: 4px;
        }

        .agent-steps-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          letter-spacing: 0.3px;
        }

        .agent-steps-toggle:hover {
          color: white;
          background: rgba(255, 255, 255, 0.02);
        }

        .agent-steps-details {
          padding: 8px 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 0.72rem;
        }

        .agent-step-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          padding-bottom: 8px;
        }

        .agent-step-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .agent-step-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
          font-size: 0.65rem;
          letter-spacing: 0.5px;
        }

        .agent-step-desc {
          color: #94a3b8;
          font-style: italic;
          padding-left: 20px;
        }

        .agent-step-result {
          background: rgba(255, 255, 255, 0.01);
          border-radius: 4px;
          padding: 6px;
          color: #a78bfa;
          font-family: 'JetBrains Mono', monospace;
          white-space: pre-wrap;
          word-break: break-all;
          padding-left: 20px;
          font-size: 0.68rem;
          max-height: 120px;
          overflow-y: auto;
        }

        /* Suggestions Panel */
        .ai-suggestions-panel {
          padding: 12px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          flex-shrink: 0;
        }

        .suggest-title {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-bottom: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ai-suggestions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .ai-suggestions-grid button {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 8px 10px;
          color: #cbd5e1;
          font-size: 0.72rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          justify-content: center;
          line-height: 1.3;
        }

        .ai-suggestions-grid button:hover {
          background: rgba(124, 58, 237, 0.08);
          border-color: rgba(124, 58, 237, 0.3);
          color: white;
          transform: translateY(-1px);
        }

        /* Input wrapper — sticky to bottom, always visible above keyboard */
        .ai-input-wrapper {
          padding: 12px 16px;
          padding-bottom: max(16px, env(safe-area-inset-bottom));
          display: flex;
          gap: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(10, 12, 16, 0.98);
          flex-shrink: 0;
        }

        .ai-input-wrapper input {
          flex: 1;
          min-width: 0;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px 14px;
          color: white;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s ease;
        }

        .ai-input-wrapper input:focus {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(124, 58, 237, 0.4);
          box-shadow: 0 0 12px rgba(124, 58, 237, 0.1);
        }

        .ai-send-btn {
          background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
          border: none;
          color: white;
          border-radius: 12px;
          width: 44px;
          height: 44px;
          min-width: 44px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .ai-send-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .ai-send-btn:disabled {
          background: rgba(255, 255, 255, 0.03);
          color: #64748b;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  );
}
