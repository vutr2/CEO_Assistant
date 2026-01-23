// API Client for CEO AI Assistant

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

/**
 * Make API request with proper error handling
 */
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Add authorization header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Parse response
    const data = await response.json();

    if (!response.ok) {
      // Handle error responses
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============================================================================
// DASHBOARD API
// ============================================================================

export const dashboardAPI = {
  /**
   * Get dashboard overview data (metrics, activities, insights, top performers)
   */
  getOverview: async () => {
    return apiRequest('/dashboard/overview');
  },

  /**
   * Get key metrics for dashboard
   */
  getMetrics: async () => {
    return apiRequest('/dashboard/metrics');
  },

  /**
   * Get recent activities
   */
  getActivities: async (limit = 10) => {
    return apiRequest(`/dashboard/activities?limit=${limit}`);
  },

  /**
   * Get AI-generated insights
   */
  getInsights: async () => {
    return apiRequest('/dashboard/insights');
  },

  /**
   * Get top performing employees
   */
  getTopPerformers: async (limit = 5) => {
    return apiRequest(`/dashboard/top-performers?limit=${limit}`);
  },
};

// ============================================================================
// FINANCE API
// ============================================================================

export const financeAPI = {
  /**
   * Get financial overview
   */
  getOverview: async (period = 'month') => {
    return apiRequest(`/finance/overview?period=${period}`);
  },

  /**
   * Get revenue data
   */
  getRevenue: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/finance/revenue?${query}`);
  },

  /**
   * Get expenses data
   */
  getExpenses: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/finance/expenses?${query}`);
  },

  /**
   * Get financial metrics
   */
  getMetrics: async (period = 'month') => {
    return apiRequest(`/finance/metrics?period=${period}`);
  },

  /**
   * Get budget data
   */
  getBudget: async (period = 'month') => {
    return apiRequest(`/finance/budget?period=${period}`);
  },

  /**
   * Get cash flow data
   */
  getCashFlow: async (period = 'month') => {
    return apiRequest(`/finance/cashflow?period=${period}`);
  },

  /**
   * Get financial trends
   */
  getTrends: async (period = 'year') => {
    return apiRequest(`/finance/metrics/trends?period=${period}`);
  },

  /**
   * Get recent transactions
   */
  getTransactions: async (limit = 10) => {
    return apiRequest(`/finance/transactions?limit=${limit}`);
  },
};

// ============================================================================
// EMPLOYEE API
// ============================================================================

export const employeeAPI = {
  /**
   * Get all employees
   */
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/employees?${query}`);
  },

  /**
   * Get employee by ID
   */
  getById: async (id) => {
    return apiRequest(`/employees/${id}`);
  },

  /**
   * Create new employee
   */
  create: async (data) => {
    return apiRequest('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update employee
   */
  update: async (id, data) => {
    return apiRequest(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete employee
   */
  delete: async (id) => {
    return apiRequest(`/employees/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get employee statistics
   */
  getStats: async () => {
    return apiRequest('/employees/stats/overview');
  },

  /**
   * Get top performers
   */
  getTopPerformers: async (limit = 5) => {
    return apiRequest(`/employees/top-performers?limit=${limit}`);
  },

  /**
   * Get departments
   */
  getDepartments: async () => {
    return apiRequest('/employees/departments');
  },
};

// ============================================================================
// REPORTS API
// ============================================================================

export const reportsAPI = {
  /**
   * Get all reports
   */
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/reports?${query}`);
  },

  /**
   * Get report by ID
   */
  getById: async (id) => {
    return apiRequest(`/reports/${id}`);
  },

  /**
   * Create new report
   */
  create: async (data) => {
    return apiRequest('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get report statistics
   */
  getStats: async (period = 'month') => {
    return apiRequest(`/reports/stats?period=${period}`);
  },

  /**
   * Get report templates
   */
  getTemplates: async () => {
    return apiRequest('/reports/templates');
  },

  /**
   * Download report
   */
  download: async (id) => {
    return apiRequest(`/reports/${id}/download`);
  },
};

// ============================================================================
// AI API
// ============================================================================

export const aiAPI = {
  /**
   * Send message to AI assistant
   */
  chat: async (message, context = {}) => {
    return apiRequest('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  },

  /**
   * Get suggested questions
   */
  getSuggestedQuestions: async () => {
    return apiRequest('/ai/suggested-questions');
  },

  /**
   * Get AI insights
   */
  getInsights: async (category = 'all') => {
    return apiRequest(`/ai/insights?category=${category}`);
  },
};

// ============================================================================
// COMPANY API
// ============================================================================

export const companyAPI = {
  /**
   * Get company profile
   */
  getProfile: async () => {
    return apiRequest('/company/profile');
  },

  /**
   * Update company profile
   */
  updateProfile: async (data) => {
    return apiRequest('/company/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get company settings
   */
  getSettings: async () => {
    return apiRequest('/company/settings');
  },

  /**
   * Update company settings
   */
  updateSettings: async (data) => {
    return apiRequest('/company/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// USER/PROFILE API
// ============================================================================

export const userAPI = {
  /**
   * Get current user profile
   */
  getProfile: async () => {
    return apiRequest('/users/profile');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data) => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get user statistics
   */
  getStats: async () => {
    return apiRequest('/users/stats');
  },

  /**
   * Get user activities
   */
  getActivities: async (limit = 10) => {
    return apiRequest(`/users/activities?limit=${limit}`);
  },

  /**
   * Get user performance data
   */
  getPerformance: async (period = 'year') => {
    return apiRequest(`/users/performance?period=${period}`);
  },

  /**
   * Get user skills
   */
  getSkills: async () => {
    return apiRequest('/users/skills');
  },

  /**
   * Get user achievements
   */
  getAchievements: async () => {
    return apiRequest('/users/achievements');
  },
};

// ============================================================================
// NOTIFICATIONS API
// ============================================================================

export const notificationsAPI = {
  /**
   * Get all notifications
   */
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/notifications?${query}`);
  },

  /**
   * Get unread count
   */
  getUnreadCount: async () => {
    return apiRequest('/notifications/unread-count');
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id) => {
    return apiRequest(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  /**
   * Mark all as read
   */
  markAllAsRead: async () => {
    return apiRequest('/notifications/read-all', {
      method: 'PUT',
    });
  },

  /**
   * Delete notification
   */
  delete: async (id) => {
    return apiRequest(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get notification categories
   */
  getCategories: async () => {
    return apiRequest('/notifications/categories');
  },
};

// ============================================================================
// BILLING API
// ============================================================================

export const billingAPI = {
  /**
   * Get payment history
   */
  getPaymentHistory: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/billing/payments?${query}`);
  },

  /**
   * Get payment methods
   */
  getPaymentMethods: async () => {
    return apiRequest('/billing/payment-methods');
  },

  /**
   * Add payment method
   */
  addPaymentMethod: async (data) => {
    return apiRequest('/billing/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update payment method
   */
  updatePaymentMethod: async (id, data) => {
    return apiRequest(`/billing/payment-methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete payment method
   */
  deletePaymentMethod: async (id) => {
    return apiRequest(`/billing/payment-methods/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get subscription info
   */
  getSubscription: async () => {
    return apiRequest('/billing/subscription');
  },
};

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  /**
   * Login user
   */
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Register user
   */
  register: async (data) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Logout user
   */
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Refresh token
   */
  refreshToken: async () => {
    return apiRequest('/auth/refresh');
  },

  /**
   * Forgot password
   */
  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Reset password
   */
  resetPassword: async (token, password) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
};

// Export default API client
export default {
  dashboard: dashboardAPI,
  finance: financeAPI,
  employee: employeeAPI,
  reports: reportsAPI,
  ai: aiAPI,
  company: companyAPI,
  user: userAPI,
  notifications: notificationsAPI,
  billing: billingAPI,
  auth: authAPI,
};
