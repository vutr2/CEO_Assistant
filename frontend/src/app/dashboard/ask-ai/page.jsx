'use client'
import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  TrendingUp,
  DollarSign,
  Users as UsersIcon,
  FileText,
  Lightbulb,
  Paperclip,
  Image as ImageIcon,
  Mic
} from 'lucide-react';
import { aiAPI } from '@/lib/api';

export default function AskAIDashboard() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Xin chào! Tôi là trợ lý AI thông minh của CEO Assistant. Tôi có thể giúp bạn phân tích dữ liệu kinh doanh, đưa ra gợi ý chiến lược và trả lời các câu hỏi về công ty. Bạn cần hỗ trợ gì hôm nay?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const messagesEndRef = useRef(null);

  // Fetch suggested questions on mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await aiAPI.getSuggestedQuestions();
        setSuggestedQuestions(response.data || []);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestedQuestions([]);
      }
    };

    fetchSuggestions();
  }, []);

  const quickActions = [
    { icon: Lightbulb, text: 'Gợi ý chiến lược', color: 'yellow' },
    { icon: TrendingUp, text: 'Dự báo doanh thu', color: 'blue' },
    { icon: UsersIcon, text: 'Phân tích nhân sự', color: 'green' },
    { icon: DollarSign, text: 'Tối ưu chi phí', color: 'red' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Call AI API
      const response = await aiAPI.chat(currentInput, { history: messages });

      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: response.data?.message || response.message || 'Xin lỗi, tôi không thể trả lời câu hỏi này lúc này.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error getting AI response:', err);

      // Show error message in chat
      const errorMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: 'Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInputValue(question);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 border-b border-blue-700">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Sparkles className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Hỏi AI</h1>
              <p className="text-blue-100 mt-1">Trợ lý thông minh hỗ trợ quyết định kinh doanh</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col" style={{ height: 'calc(100vh - 250px)' }}>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {messages.map((message) => {
                    const isAI = message.type === 'ai';

                    return (
                      <div key={message.id} className={`flex gap-4 ${isAI ? '' : 'flex-row-reverse'}`}>
                        {/* Avatar */}
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            isAI
                              ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                              : 'bg-gray-200'
                          }`}
                        >
                          {isAI ? (
                            <Bot size={20} className="text-white" />
                          ) : (
                            <User size={20} className="text-gray-600" />
                          )}
                        </div>

                        {/* Message Content */}
                        <div className={`flex-1 max-w-[80%] ${isAI ? '' : 'flex flex-col items-end'}`}>
                          <div
                            className={`px-5 py-3 rounded-2xl ${
                              isAI
                                ? 'bg-gray-100 text-gray-900 rounded-tl-none'
                                : 'bg-blue-600 text-white rounded-tr-none'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 px-2">
                            {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Bot size={20} className="text-white" />
                      </div>
                      <div className="bg-gray-100 px-5 py-3 rounded-2xl rounded-tl-none">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions (shown only at start) */}
                {messages.length === 1 && suggestedQuestions.length > 0 && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                      <Lightbulb size={16} />
                      Câu hỏi gợi ý:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {suggestedQuestions.map((item, index) => (
                        <button
                          key={item.id || index}
                          onClick={() => handleSuggestedQuestion(item.question)}
                          className="text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 transition"
                        >
                          {item.question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                  <div className="flex items-end gap-2">
                    <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition">
                      <Paperclip size={20} />
                    </button>
                    <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition">
                      <ImageIcon size={20} />
                    </button>
                    <div className="flex-1 relative">
                      <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Đặt câu hỏi cho AI..."
                        rows={1}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        style={{ minHeight: '48px', maxHeight: '120px' }}
                      />
                    </div>
                    <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition">
                      <Mic size={20} />
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                      className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Nhấn Enter để gửi • Shift + Enter để xuống dòng
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Hành động nhanh</h3>
                <div className="space-y-2">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    const colorClasses = {
                      yellow: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
                      blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
                      green: 'bg-green-50 text-green-600 hover:bg-green-100',
                      red: 'bg-red-50 text-red-600 hover:bg-red-100'
                    };

                    return (
                      <button
                        key={index}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${colorClasses[action.color]}`}
                      >
                        <Icon size={18} />
                        <span className="text-sm font-medium">{action.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Capabilities */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="text-blue-600" size={18} />
                  AI có thể giúp bạn
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Phân tích dữ liệu kinh doanh</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Dự báo xu hướng và doanh thu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Đề xuất chiến lược tối ưu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Tạo báo cáo tự động</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Trả lời câu hỏi về công ty</span>
                  </li>
                </ul>
              </div>

              {/* Tips */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">💡 Mẹo sử dụng</h3>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li>Hỏi câu hỏi cụ thể để nhận câu trả lời chính xác hơn</li>
                  <li>Sử dụng số liệu và thời gian rõ ràng</li>
                  <li>Yêu cầu AI giải thích chi tiết nếu cần</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
