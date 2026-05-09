import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, Sparkles, Trash2, Minimize2 } from 'lucide-react';
import { sendChatMessage, ChatMessage, HealthContext } from '../../lib/aiService';
import { useAuth } from '../../contexts/AuthContext';
import { useSmartBand } from '../../hooks/useSmartBand';
import {
  fetchActivityRecords,
  fetchSleepRecords,
  fetchStressRecords,
  fetchHealthProfile,
} from '../../lib/supabaseDataService';

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  '📊 Analyze my health trends',
  '😴 How can I sleep better?',
  '🏃 Suggest a workout plan',
  '🧘 Stress relief tips',
  '🥗 Diet recommendations',
  '❤️ Heart health check',
];

const AIChat: React.FC = () => {
  const { user } = useAuth();
  const { data: bandData } = useSmartBand();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [healthContext, setHealthContext] = useState<HealthContext>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      loadHealthContext();
    }
  }, [isOpen]);

  // Load health context from Supabase
  const loadHealthContext = async () => {
    if (!user?.id) return;

    try {
      const [actRes, sleepRes, stressRes, profileRes] = await Promise.all([
        fetchActivityRecords(user.id, 7),
        fetchSleepRecords(user.id, 7),
        fetchStressRecords(user.id, 7),
        fetchHealthProfile(user.id),
      ]);

      const ctx: HealthContext = {
        heartRate: bandData?.heartRate,
        bloodOxygen: bandData?.bloodOxygen,
        steps: bandData?.steps,
        calories: bandData?.caloriesBurned,
        stressLevel: bandData?.stressLevel ? Math.round(bandData.stressLevel / 10) : undefined,
      };

      if (profileRes.data) {
        ctx.profile = {
          age: profileRes.data.age,
          weight: profileRes.data.weight,
          height: profileRes.data.height,
          gender: profileRes.data.gender,
        };
      }

      if (actRes.data.length > 0) {
        ctx.recentActivity = actRes.data.map((a: any) => ({
          date: new Date(a.recorded_at).toLocaleDateString(),
          steps: a.steps,
          calories_burned: a.calories_burned,
        }));
      }

      if (sleepRes.data.length > 0) {
        const lastSleep = sleepRes.data[sleepRes.data.length - 1];
        ctx.sleepHours = Math.round((lastSleep?.duration || 0) / 60 * 10) / 10;
        ctx.sleepQuality = lastSleep?.quality;
        ctx.recentSleep = sleepRes.data.map((s: any) => ({
          date: new Date(s.recorded_at).toLocaleDateString(),
          duration: s.duration,
          quality: s.quality,
        }));
      }

      if (stressRes.data.length > 0) {
        ctx.recentStress = stressRes.data.map((s: any) => ({
          date: new Date(s.recorded_at).toLocaleDateString(),
          stress_level: s.stress_level,
        }));
      }

      setHealthContext(ctx);
    } catch (err) {
      console.error('Failed to load health context:', err);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: DisplayMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const chatHistory: ChatMessage[] = messages.slice(-8).map(m => ({
        role: m.role,
        content: m.content,
      }));
      chatHistory.push({ role: 'user', content: text.trim() });

      const response = await sendChatMessage(chatHistory, healthContext);

      const assistantMsg: DisplayMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: DisplayMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Sorry, I couldn\'t process your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
      console.error('AI Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold text
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (processed.startsWith('- ') || processed.startsWith('• ')) {
        processed = '• ' + processed.slice(2);
        return <p key={i} className="ml-3 mb-1" dangerouslySetInnerHTML={{ __html: processed }} />;
      }
      if (processed.trim() === '') return <br key={i} />;
      return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: processed }} />;
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          aria-label="Open AI Health Assistant"
        >
          <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">HealthPulse AI</h3>
                <p className="text-blue-100 text-xs">Powered by GPT-5.4</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Clear chat"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={28} className="text-blue-600" />
                </div>
                <h4 className="font-bold text-slate-800 mb-2">AI Health Assistant</h4>
                <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
                  Ask me anything about your health data, get personalized insights, or try a quick prompt below.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-xs text-left px-3 py-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-lg transition-all text-slate-700"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-slate-100 text-slate-800 rounded-bl-md border border-slate-200'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm prose-slate">
                      {renderContent(msg.content)}
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader className="animate-spin" size={14} />
                    <span>Analyzing your data...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your health..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl transition-colors flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChat;
