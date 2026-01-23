'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import SuggestedQuestions from './SuggestedQuestions';
import { aiAPI } from '@/lib/api';

export default function ChatPanel({ onClose, showCloseButton = false }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Xin chào! Tôi là trợ lý AI của CEO Assistant. Tôi có thể giúp gì cho bạn hôm nay?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

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
    const questionText = inputValue;
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      // Call real AI API
      const response = await aiAPI.chat(questionText, {
        conversationHistory: messages.slice(-5) // Send last 5 messages for context
      });

      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: response.data.response || response.data.answer || 'Xin lỗi, tôi không thể tạo câu trả lời lúc này.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI chat error:', err);
      setError(err.message);

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
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">AI</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Trợ lý AI</h3>
            <p className="text-xs text-green-600">● Đang hoạt động</p>
          </div>
        </div>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-4">
          <SuggestedQuestions onSelect={handleSuggestedQuestion} />
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition">
            <Paperclip size={20} />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi của bạn..."
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Nhấn Enter để gửi, Shift + Enter để xuống dòng
        </p>
      </div>
    </div>
  );
}
