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
  Loader
} from 'lucide-react';

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
    
    // Add User message
    const updatedMessages = [...messages, { role: 'user', content: userText }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          message: userText,
          chatHistory: updatedMessages.slice(0, -1) // Send history excluding the last message
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error communicating with assistant');
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        steps: data.steps || []
      }]);

      // If database was modified (tasks or goals scheduled/deleted), notify taskPlanner dashboard
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

          return (
            <div key={index} className={`ai-message-row ${isUser ? 'user-aligned' : 'ai-aligned'}`}>
              {!isUser && (
                <div className="ai-avatar pulse-glow">
                  <Sparkles size={14} />
                </div>
              )}
              
              <div className="ai-message-bubble-wrapper">
                <div className={`ai-message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
                  {msg.content}
                </div>

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
              <span>Thinking & running planning loop...</span>
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
              🏋️ Research & Add Routine
            </button>
            <button onClick={() => selectQuickAction("Plan a 4-hour study task for final exams today and add it to my calendar")}>
              📖 Plan Study Tasks
            </button>
            <button onClick={() => selectQuickAction("Draft a quick daily reflection journal entry for today about learning React")}>
              📝 Write Daily Journal
            </button>
            <button onClick={() => selectQuickAction("Add a new long-term goal called 'Launch Startup app'")}>
              🚀 Add High-Level Goal
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
          placeholder="Ask Copilot agent..."
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
          height: 100vh;
          background: rgba(10, 12, 16, 0.95) !important;
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
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
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
          padding: 16px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
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

        /* Input Input-wrapper */
        .ai-input-wrapper {
          padding: 16px 24px 24px;
          display: flex;
          gap: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .ai-input-wrapper input {
          flex: 1;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px 16px;
          color: white;
          font-size: 0.88rem;
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
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
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
