import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  change,
  trend = 'up',
  icon: Icon,
  color = 'blue',
  description
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon size={24} />
        </div>
        {change && (
          trend === 'up' ? (
            <span className="flex items-center text-green-600 text-sm font-medium">
              <ArrowUpRight size={16} />
              {change}
            </span>
          ) : (
            <span className="flex items-center text-red-600 text-sm font-medium">
              <ArrowDownRight size={16} />
              {change}
            </span>
          )
        )}
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
}
