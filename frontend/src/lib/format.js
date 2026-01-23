/**
 * Formatting utilities
 * Functions for formatting numbers, dates, currency, etc.
 */

/**
 * Format number as Vietnamese currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: VND)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'VND') => {
  if (amount === null || amount === undefined) return '₫0';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format number with thousand separators
 * @param {number} number - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0';

  return new Intl.NumberFormat('vi-VN').format(number);
};

/**
 * Format date to Vietnamese format
 * @param {Date|string} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('vi-VN', defaultOptions).format(dateObj);
};

/**
 * Format datetime to Vietnamese format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date) => {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format time only
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - dateObj;

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return 'Vừa xong';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks} tuần trước`;
  } else if (diffMonths < 12) {
    return `${diffMonths} tháng trước`;
  } else {
    return `${diffYears} năm trước`;
  }
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';

  return `${value.toFixed(decimals)}%`;
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as Vietnamese phone number (e.g., 0123 456 789)
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }

  return phone;
};

/**
 * Format text to title case
 * @param {string} text - Text to format
 * @returns {string} Title case text
 */
export const toTitleCase = (text) => {
  if (!text) return '';

  return text.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncate = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;

  return text.substring(0, maxLength) + '...';
};

/**
 * Format compact number (e.g., 1K, 1M)
 * @param {number} number - Number to format
 * @returns {string} Compact number string
 */
export const formatCompactNumber = (number) => {
  if (number === null || number === undefined) return '0';

  if (number < 1000) {
    return number.toString();
  } else if (number < 1000000) {
    return (number / 1000).toFixed(1) + 'K';
  } else if (number < 1000000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else {
    return (number / 1000000000).toFixed(1) + 'B';
  }
};

/**
 * Format Vietnamese currency short (e.g., 2.8B, 1.5M)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrencyShort = (amount) => {
  if (amount === null || amount === undefined) return '₫0';

  if (amount < 1000000) {
    return '₫' + formatNumber(amount);
  } else if (amount < 1000000000) {
    return '₫' + (amount / 1000000).toFixed(1) + 'M';
  } else {
    return '₫' + (amount / 1000000000).toFixed(1) + 'B';
  }
};

export default {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatPercentage,
  formatFileSize,
  formatPhone,
  toTitleCase,
  truncate,
  formatCompactNumber,
  formatCurrencyShort,
};
