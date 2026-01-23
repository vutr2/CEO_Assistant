import React from 'react';

export default function Spinner({ size = 'md', color = 'blue', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colors = {
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600',
    green: 'border-green-600',
    red: 'border-red-600'
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-t-transparent ${sizes[size]} ${colors[color]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
