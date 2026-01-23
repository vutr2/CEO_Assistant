import React from 'react';

export default function LineChart({ data, title, height = 300 }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Không có dữ liệu
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (item.value / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div>
      {title && <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>}
      <div className="relative" style={{ height: `${height}px` }}>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.2"
            />
          ))}

          {/* Area under the line */}
          <polygon
            points={`0,100 ${points} 100,100`}
            fill="url(#gradient)"
            opacity="0.3"
          />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Labels */}
        <div className="flex justify-between mt-2">
          {data.map((item, index) => (
            <span key={index} className="text-xs text-gray-500">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
