import React from 'react';
import { User, Bot } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isAI = message.type === 'ai';

  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isAI
            ? 'bg-gradient-to-br from-blue-500 to-purple-600'
            : 'bg-gray-200'
        }`}
      >
        {isAI ? (
          <Bot size={16} className="text-white" />
        ) : (
          <User size={16} className="text-gray-600" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isAI ? '' : 'flex flex-col items-end'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isAI
              ? 'bg-gray-100 text-gray-900 rounded-tl-none'
              : 'bg-blue-600 text-white rounded-tr-none'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className="text-xs text-gray-500 mt-1 px-2">
          {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
}
