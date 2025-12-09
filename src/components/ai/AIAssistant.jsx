import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles, HelpCircle, Calendar, Package, AlertCircle } from 'lucide-react';
import { sendChatMessage } from '../../services/ai.service.js';
import '../../styles/experimental/ai-interface.css';

/**
 * AIAssistant - Floating chat assistant FAB
 *
 * Features:
 * - Expandable chat interface
 * - Quick action suggestions
 * - AI thinking indicator
 * - Message history
 *
 * @param {Object} props
 * @param {Function} props.onSendMessage - Message send callback
 * @param {Array} props.messages - Chat messages
 * @param {boolean} props.isThinking - AI thinking state
 * @param {number} props.unreadCount - Unread message count
 * @param {Array} props.quickActions - Quick action buttons
 */
export function AIAssistant({
  onSendMessage,
  messages = [],
  isThinking = false,
  unreadCount = 0,
  quickActions = [],
  position = 'bottom-right',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [localMessages, setLocalMessages] = useState(messages);

  const chatBodyRef = useRef(null);
  const inputRef = useRef(null);

  // Default quick actions
  const defaultQuickActions = [
    { id: 'help', label: 'How do I book?', icon: HelpCircle },
    { id: 'availability', label: 'Check availability', icon: Calendar },
    { id: 'recommend', label: 'Recommend equipment', icon: Package },
    { id: 'issue', label: 'Report an issue', icon: AlertCircle },
  ];

  const actions = quickActions.length > 0 ? quickActions : defaultQuickActions;

  // Update local messages when prop changes
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [localMessages, isThinking]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // Add to local messages immediately
    setLocalMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Notify parent
    onSendMessage?.(inputValue.trim());
  }, [inputValue, onSendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action) => {
    const message = action.label;
    setInputValue('');

    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    setLocalMessages(prev => [...prev, newMessage]);
    onSendMessage?.(message);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  // Welcome message if no messages
  const displayMessages = localMessages.length === 0
    ? [{
        id: 'welcome',
        type: 'assistant',
        content: "Hi there! I'm your NCAD equipment assistant. I can help you find equipment, check availability, or answer questions about the booking process. How can I help you today?",
        timestamp: new Date(),
      }]
    : localMessages;

  return (
    <div className={`ai-assistant-fab ${position}`}>
      {/* Chat Panel */}
      <div
        className={`ai-chat-panel ${isOpen ? 'visible' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="AI Assistant Chat"
      >
        <div className="ai-chat-header">
          <div className="ai-chat-header-title">
            <Sparkles className="ai-chat-header-icon" size={20} />
            <div>
              <div>Equipment Assistant</div>
              <div className="ai-chat-header-status">
                {isThinking ? 'Thinking...' : 'Online'}
              </div>
            </div>
          </div>
          <button
            className="ai-chat-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>

        <div className="ai-chat-body" ref={chatBodyRef}>
          {displayMessages.map((message) => (
            <div
              key={message.id}
              className={`ai-chat-message ${message.type}`}
            >
              {message.content}
              {message.timestamp && (
                <div style={{
                  fontSize: '10px',
                  opacity: 0.6,
                  marginTop: '4px',
                  textAlign: message.type === 'user' ? 'right' : 'left',
                }}>
                  {formatTime(message.timestamp)}
                </div>
              )}
            </div>
          ))}

          {/* AI Thinking Indicator */}
          {isThinking && (
            <div className="ai-chat-message assistant thinking">
              <div className="ai-typing">
                <div className="ai-typing-dot" />
                <div className="ai-typing-dot" />
                <div className="ai-typing-dot" />
              </div>
            </div>
          )}
        </div>

        <div className="ai-chat-footer">
          <div className="ai-chat-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="ai-chat-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              aria-label="Type your message"
            />
            <button
              className="ai-chat-send"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isThinking}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>

          {/* Quick Actions */}
          {localMessages.length <= 1 && (
            <div className="ai-chat-quick-actions">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    className="ai-chat-quick-action"
                    onClick={() => handleQuickAction(action)}
                  >
                    {Icon && <Icon size={12} style={{ marginRight: '4px' }} />}
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FAB Trigger */}
      <button
        className={`ai-assistant-trigger ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        aria-label={isOpen ? 'Close assistant' : 'Open AI assistant'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="ai-assistant-trigger-icon" size={24} />
        ) : (
          <MessageCircle className="ai-assistant-trigger-icon" size={24} />
        )}

        {/* Unread Badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="ai-assistant-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

/**
 * useAIAssistant - Hook to manage AI assistant state
 * Integrates with Ollama backend for real AI responses
 */
export function useAIAssistant() {
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const sendMessage = useCallback(async (content) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);

    try {
      // Get conversation history for context (last 10 messages)
      const history = messages.slice(-10);

      // Call the AI service
      const result = await sendChatMessage(content, history);

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: result.message,
        timestamp: new Date(),
        source: result.source, // 'ollama', 'demo', or 'fallback'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('[AIAssistant] Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again or contact support if the issue persists.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setUnreadCount(0);
  }, []);

  const addSystemMessage = useCallback((content) => {
    const systemMessage = {
      id: Date.now(),
      type: 'assistant',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, systemMessage]);
    setUnreadCount(prev => prev + 1);
  }, []);

  return {
    messages,
    isThinking,
    unreadCount,
    sendMessage,
    clearMessages,
    addSystemMessage,
    setUnreadCount,
  };
}

export default AIAssistant;
