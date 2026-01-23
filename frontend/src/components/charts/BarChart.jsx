import React from 'react';

export default function BarChart({ data, title, height = 300, color = 'blue' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Không có dữ liệu
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));

  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    red: 'bg-red-500 hover:bg-red-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    orange: 'bg-orange-500 hover:bg-orange-600'
  };

  return (
    <div>
      {title && <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>}
      <div className="space-y-3" style={{ height: `${height}px`, overflowY: 'auto' }}>
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;

          return (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-20 text-right truncate">
                {item.label}
              </span>
              <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                <div
                  className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500 flex items-center justify-end pr-3`}
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 20 && (
                    <span className="text-xs text-white font-medium">
                      {item.value.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              {percentage <= 20 && (
                <span className="text-xs text-gray-600 w-16">
                  {item.value.toLocaleString()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
