// API functions and utilities for CEO Dashboard

// --- API functions (calling local Next.js API routes → Supabase) ---

export async function getDashboardSummary(userId) {
  const res = await fetch('/api/dashboard/summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
}

export async function getTrends(userId, days = 30) {
  const res = await fetch('/api/dashboard/trends', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, days }),
  });
  if (!res.ok) throw new Error('Failed to fetch trends');
  return res.json();
}

export async function getAlerts(userId) {
  const res = await fetch('/api/dashboard/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function chatWithAI(userId, message, chatHistory = []) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, message, chatHistory }),
  });
  if (!res.ok) throw new Error('Failed to send chat message');
  return res.json();
}

// --- Formatting utilities ---

export function formatCurrency(value) {
  if (typeof value !== 'number') {
    value = parseFloat(value) || 0;
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

export function formatNumber(value) {
  if (typeof value !== 'number') {
    value = parseFloat(value) || 0;
  }
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// --- Analysis utilities ---

export function calculateChange(current, previous) {
  if (previous === 0) return 0;
  return (((current - previous) / previous) * 100).toFixed(2);
}

export function getTrendDirection(change) {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'neutral';
}

export function getStatusColor(severity) {
  const colors = {
    high: 'red',
    medium: 'yellow',
    low: 'blue',
  };
  return colors[severity] || 'gray';
}
