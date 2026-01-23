/**
 * Application constants
 * Central place for all constant values used across the application
 */

// Application Information
export const APP_NAME = 'CEO AI Assistant';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'AI-powered business intelligence assistant for CEOs';

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
export const API_TIMEOUT = 30000; // 30 seconds

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  VIEWER: 'viewer',
};

// User Role Labels
export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Quản trị viên',
  [ROLES.MANAGER]: 'Quản lý',
  [ROLES.EMPLOYEE]: 'Nhân viên',
  [ROLES.VIEWER]: 'Người xem',
};

// Employee Status
export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  LEAVE: 'leave',
  TERMINATED: 'terminated',
};

// Employee Status Labels
export const EMPLOYEE_STATUS_LABELS = {
  [EMPLOYEE_STATUS.ACTIVE]: 'Đang làm việc',
  [EMPLOYEE_STATUS.INACTIVE]: 'Nghỉ việc',
  [EMPLOYEE_STATUS.LEAVE]: 'Nghỉ phép',
  [EMPLOYEE_STATUS.TERMINATED]: 'Đã nghỉ việc',
};

// Departments
export const DEPARTMENTS = {
  TECHNOLOGY: 'Technology',
  SALES: 'Sales',
  MARKETING: 'Marketing',
  HR: 'HR',
  DESIGN: 'Design',
  FINANCE: 'Finance',
  OPERATIONS: 'Operations',
  OTHER: 'Other',
};

// Department Labels
export const DEPARTMENT_LABELS = {
  [DEPARTMENTS.TECHNOLOGY]: 'Công nghệ',
  [DEPARTMENTS.SALES]: 'Kinh doanh',
  [DEPARTMENTS.MARKETING]: 'Marketing',
  [DEPARTMENTS.HR]: 'Nhân sự',
  [DEPARTMENTS.DESIGN]: 'Thiết kế',
  [DEPARTMENTS.FINANCE]: 'Tài chính',
  [DEPARTMENTS.OPERATIONS]: 'Vận hành',
  [DEPARTMENTS.OTHER]: 'Khác',
};

// Report Types
export const REPORT_TYPES = {
  FINANCE: 'Tài chính',
  HR: 'Nhân sự',
  KPI: 'KPI',
  MARKETING: 'Marketing',
  OVERVIEW: 'Tổng quan',
  OTHER: 'Khác',
};

// Report Status
export const REPORT_STATUS = {
  DRAFT: 'draft',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Report Status Labels
export const REPORT_STATUS_LABELS = {
  [REPORT_STATUS.DRAFT]: 'Bản nháp',
  [REPORT_STATUS.PROCESSING]: 'Đang xử lý',
  [REPORT_STATUS.COMPLETED]: 'Hoàn thành',
  [REPORT_STATUS.CANCELLED]: 'Đã hủy',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  REPORT: 'report',
  TASK: 'task',
  MEETING: 'meeting',
  PAYMENT: 'payment',
  ALERT: 'alert',
  SYSTEM: 'system',
  ANNOUNCEMENT: 'announcement',
};

// Notification Categories
export const NOTIFICATION_CATEGORIES = {
  FINANCE: 'finance',
  HR: 'hr',
  GENERAL: 'general',
  ANALYTICS: 'analytics',
  SYSTEM: 'system',
};

// Notification Priority
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

// Transaction Types
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Expense Categories
export const EXPENSE_CATEGORIES = {
  HR: 'Nhân sự',
  OPERATIONS: 'Vận hành',
  MARKETING: 'Marketing',
  RND: 'R&D',
  OTHER: 'Khác',
};

// Revenue Categories
export const REVENUE_CATEGORIES = {
  SALES: 'Sales',
  SERVICES: 'Services',
  INVESTMENT: 'Investment',
  OTHER: 'Other',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  CREDIT_CARD: 'Credit Card',
  OTHER: 'Other',
};

// Time Periods
export const TIME_PERIODS = {
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
};

// Time Period Labels
export const TIME_PERIOD_LABELS = {
  [TIME_PERIODS.WEEK]: 'Tuần',
  [TIME_PERIODS.MONTH]: 'Tháng',
  [TIME_PERIODS.QUARTER]: 'Quý',
  [TIME_PERIODS.YEAR]: 'Năm',
};

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
};

// Subscription Plan Labels
export const SUBSCRIPTION_PLAN_LABELS = {
  [SUBSCRIPTION_PLANS.FREE]: 'Miễn phí',
  [SUBSCRIPTION_PLANS.BASIC]: 'Cơ bản',
  [SUBSCRIPTION_PLANS.PREMIUM]: 'Premium',
  [SUBSCRIPTION_PLANS.ENTERPRISE]: 'Enterprise',
};

// Company Sizes
export const COMPANY_SIZES = {
  SMALL: '1-10',
  MEDIUM: '11-50',
  LARGE: '51-200',
  VERY_LARGE: '201-500',
  ENTERPRISE: '501-1000',
  MEGA: '1000+',
};

// Company Size Labels
export const COMPANY_SIZE_LABELS = {
  [COMPANY_SIZES.SMALL]: '1-10 nhân viên',
  [COMPANY_SIZES.MEDIUM]: '11-50 nhân viên',
  [COMPANY_SIZES.LARGE]: '51-200 nhân viên',
  [COMPANY_SIZES.VERY_LARGE]: '201-500 nhân viên',
  [COMPANY_SIZES.ENTERPRISE]: '501-1000 nhân viên',
  [COMPANY_SIZES.MEGA]: '1000+ nhân viên',
};

// Currency
export const CURRENCY = {
  VND: 'VND',
  USD: 'USD',
  EUR: 'EUR',
};

// Locales
export const LOCALES = {
  VI: 'vi',
  EN: 'en',
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD/MM/YYYY HH:mm',
  FULL: 'dddd, DD MMMM YYYY',
  TIME: 'HH:mm',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZES = [10, 20, 50, 100];

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#06B6D4',
  PURPLE: '#8B5CF6',
  PINK: '#EC4899',
  ORANGE: '#F97316',
};

// UI Colors
export const UI_COLORS = {
  BLUE: 'blue',
  GREEN: 'green',
  RED: 'red',
  YELLOW: 'yellow',
  PURPLE: 'purple',
  ORANGE: 'orange',
  PINK: 'pink',
};

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard/overview',
  FINANCE: '/dashboard/finance',
  PEOPLE: '/dashboard/people',
  REPORTS: '/dashboard/reports',
  NOTIFICATIONS: '/dashboard/notifications',
  PROFILE: '/dashboard/profile',
  SETTINGS: '/dashboard/settings',
  ASK_AI: '/dashboard/ask-ai',
};

export default {
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  API_BASE_URL,
  API_TIMEOUT,
  ROLES,
  ROLE_LABELS,
  EMPLOYEE_STATUS,
  EMPLOYEE_STATUS_LABELS,
  DEPARTMENTS,
  DEPARTMENT_LABELS,
  REPORT_TYPES,
  REPORT_STATUS,
  REPORT_STATUS_LABELS,
  NOTIFICATION_TYPES,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITY,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  EXPENSE_CATEGORIES,
  REVENUE_CATEGORIES,
  PAYMENT_METHODS,
  TIME_PERIODS,
  TIME_PERIOD_LABELS,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_PLAN_LABELS,
  COMPANY_SIZES,
  COMPANY_SIZE_LABELS,
  CURRENCY,
  LOCALES,
  DATE_FORMATS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZES,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  CHART_COLORS,
  UI_COLORS,
  ROUTES,
};
