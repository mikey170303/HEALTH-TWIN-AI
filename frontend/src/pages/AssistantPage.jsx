import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Send, User, Sparkles, AlertCircle, Loader2, Trash2,
  HelpCircle, ShieldCheck
} from 'lucide-react';
import { aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SUGGESTED_QUESTIONS = [
  "Explain my recent health trends.",
  "How has my sleep changed this month?",
  "What habits might help me improve my sleep?",
  "Summarize my recent activity.",
  "Explain my BMI calculation.",
  "What information should I discuss with my doctor?",
];

export default function AssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadChatHistory = async () => {
    try {
      const res = await aiAPI.getHistory();
      if (res.data?.messages && res.data.messages.length > 0) {
        setMessages(res.data.messages);
      } else {
        // Default welcoming message
        setMessages([
          {
            id: 0,
            role: 'assistant',
            content: `Hello ${user?.full_name?.split(' ')[0] || 'there'}! I am HealthTwin AI, your personal clinical wellness assistant. You can ask me to explain your recent blood pressure trends, analyze your sleep metrics, or suggest evidence-informed lifestyle habits.`,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setError('');
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat({ message: text });
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      setError('Unable to reach the assistant service. Please retry in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all conversation messages?')) return;
    try {
      await aiAPI.clearHistory();
      setMessages([
        {
          id: Date.now(),
          role: 'assistant',
          content: 'Conversation history cleared. How may I assist with your health biometrics today?',
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      alert('Failed to clear conversation.');
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">HealthTwin AI Assistant</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">
              Personalized health explanations grounded in your database observations
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          title="Clear Conversation"
          className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {fetchingHistory ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            <span>Loading conversation...</span>
          </div>
        ) : (
          messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id || idx}
                className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-teal-600 text-white'
                      : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-tr-none'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none space-y-1.5'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.content}</div>
                </div>
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 text-xs flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
              <span>Analyzing observations and formulating insight...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pill Bar */}
      <div className="px-6 py-2 border-t border-slate-100 overflow-x-auto flex items-center gap-2 bg-slate-50/30">
        <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
          Suggested:
        </span>
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-700 text-slate-600 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your blood pressure, sleep changes, BMI, or trends..."
            disabled={loading}
            className="flex-1 text-xs sm:text-sm rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          HealthTwin AI provides evidence-informed wellness reflections. Never disregard professional clinical medical advice.
        </p>
      </div>
    </div>
  );
}
