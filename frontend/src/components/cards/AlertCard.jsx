import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export default function AlertCard({
  title,
  message,
  type = 'info',
  action,
  onActionClick
}) {
  const types = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-600'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-600'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-600'
    }
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`${config.iconColor} flex-shrink-0 mt-0.5`} size={20} />
        <div className="flex-1">
          <h4 className={`font-semibold ${config.text} mb-1`}>{title}</h4>
          <p className={`text-sm ${config.text} opacity-90`}>{message}</p>
          {action && (
            <button
              onClick={onActionClick}
              className={`mt-3 text-sm font-medium ${config.text} hover:underline`}
            >
              {action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
