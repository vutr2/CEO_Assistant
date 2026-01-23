import React from 'react';
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export default function InsightCard({
  title,
  description,
  impact = 'positive',
  category,
  priority = 'medium',
  action
}) {
  const impactConfig = {
    positive: {
      icon: TrendingUp,
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconColor: 'text-green-600'
    },
    negative: {
      icon: TrendingDown,
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconColor: 'text-red-600'
    },
    neutral: {
      icon: Lightbulb,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconColor: 'text-blue-600'
    },
    warning: {
      icon: AlertCircle,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      iconColor: 'text-yellow-600'
    }
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700'
  };

  const config = impactConfig[impact];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} border ${config.border} rounded-xl p-5 hover:shadow-md transition`}>
      <div className="flex items-start gap-3">
        <div className={`${config.iconColor} mt-1`}>
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-gray-900">{title}</h3>
            {priority && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[priority]}`}>
                {priority === 'low' && 'Thấp'}
                {priority === 'medium' && 'Trung bình'}
                {priority === 'high' && 'Cao'}
                {priority === 'critical' && 'Khẩn cấp'}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 mb-3">{description}</p>
          {category && (
            <span className="inline-block text-xs px-2 py-1 bg-white rounded-full text-gray-600 mb-3">
              {category}
            </span>
          )}
          {action && (
            <button className={`text-sm font-medium ${config.iconColor} hover:underline`}>
              {action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
