import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function SuggestedQuestions({ onSelect }) {
  const questions = [
    'Doanh thu tháng này như thế nào?',
    'Hiệu suất nhân viên nào cao nhất?',
    'Phân tích chi phí vận hành',
    'Dự báo doanh thu quý tới'
  ];

  return (
    <div>
      <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
        <MessageSquare size={16} />
        Câu hỏi gợi ý:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelect(question)}
            className="text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 transition"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
