/**
 * Permission utilities
 * Handle role-based access control and permissions
 */

import { ROLES } from './constants';
import { getUserRole, hasRole as checkRole, hasAnyRole as checkAnyRole } from './auth';

/**
 * Permission levels by role (lower number = higher permission)
 */
const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 1,
  [ROLES.MANAGER]: 2,
  [ROLES.EMPLOYEE]: 3,
  [ROLES.VIEWER]: 4,
};

/**
 * Check if user can perform an action
 * @param {string} action - Action to check
 * @returns {boolean} True if user can perform action
 */
export const canPerform = (action) => {
  const userRole = getUserRole();
  if (!userRole) return false;

  const permissions = PERMISSIONS[userRole] || [];
  return permissions.includes(action);
};

/**
 * Check if user has minimum role level
 * @param {string} minimumRole - Minimum required role
 * @returns {boolean} True if user has sufficient role
 */
export const hasMinimumRole = (minimumRole) => {
  const userRole = getUserRole();
  if (!userRole) return false;

  const userLevel = ROLE_HIERARCHY[userRole] || 999;
  const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;

  return userLevel <= requiredLevel;
};

/**
 * Check if user is admin
 * @returns {boolean} True if user is admin
 */
export const isAdmin = () => {
  return checkRole(ROLES.ADMIN);
};

/**
 * Check if user is manager or above
 * @returns {boolean} True if user is manager or admin
 */
export const isManagerOrAbove = () => {
  return checkAnyRole([ROLES.ADMIN, ROLES.MANAGER]);
};

/**
 * Check if user can view financial data
 * @returns {boolean} True if user can view finance
 */
export const canViewFinance = () => {
  return hasMinimumRole(ROLES.MANAGER);
};

/**
 * Check if user can edit financial data
 * @returns {boolean} True if user can edit finance
 */
export const canEditFinance = () => {
  return hasMinimumRole(ROLES.MANAGER);
};

/**
 * Check if user can view employee data
 * @returns {boolean} True if user can view employees
 */
export const canViewEmployees = () => {
  return hasMinimumRole(ROLES.EMPLOYEE);
};

/**
 * Check if user can edit employee data
 * @returns {boolean} True if user can edit employees
 */
export const canEditEmployees = () => {
  return hasMinimumRole(ROLES.MANAGER);
};

/**
 * Check if user can view reports
 * @returns {boolean} True if user can view reports
 */
export const canViewReports = () => {
  return hasMinimumRole(ROLES.EMPLOYEE);
};

/**
 * Check if user can create reports
 * @returns {boolean} True if user can create reports
 */
export const canCreateReports = () => {
  return hasMinimumRole(ROLES.EMPLOYEE);
};

/**
 * Check if user can delete reports
 * @returns {boolean} True if user can delete reports
 */
export const canDeleteReports = () => {
  return hasMinimumRole(ROLES.MANAGER);
};

/**
 * Check if user can manage company settings
 * @returns {boolean} True if user can manage settings
 */
export const canManageSettings = () => {
  return isAdmin();
};

/**
 * Check if user can access AI features
 * @returns {boolean} True if user can use AI
 */
export const canUseAI = () => {
  return hasMinimumRole(ROLES.EMPLOYEE);
};

/**
 * Check if user can view specific resource
 * @param {string} resource - Resource type
 * @param {object} item - Resource item
 * @returns {boolean} True if user can view resource
 */
export const canView = (resource, item = {}) => {
  const userRole = getUserRole();
  if (!userRole) return false;

  // Admin can view everything
  if (isAdmin()) return true;

  switch (resource) {
    case 'finance':
      return canViewFinance();
    case 'employees':
      return canViewEmployees();
    case 'reports':
      return canViewReports();
    case 'settings':
      return canManageSettings();
    default:
      return hasMinimumRole(ROLES.EMPLOYEE);
  }
};

/**
 * Check if user can edit specific resource
 * @param {string} resource - Resource type
 * @param {object} item - Resource item
 * @returns {boolean} True if user can edit resource
 */
export const canEdit = (resource, item = {}) => {
  const userRole = getUserRole();
  if (!userRole) return false;

  // Admin can edit everything
  if (isAdmin()) return true;

  switch (resource) {
    case 'finance':
      return canEditFinance();
    case 'employees':
      return canEditEmployees();
    case 'reports':
      return hasMinimumRole(ROLES.MANAGER);
    case 'settings':
      return canManageSettings();
    default:
      return hasMinimumRole(ROLES.MANAGER);
  }
};

/**
 * Check if user can delete specific resource
 * @param {string} resource - Resource type
 * @param {object} item - Resource item
 * @returns {boolean} True if user can delete resource
 */
export const canDelete = (resource, item = {}) => {
  const userRole = getUserRole();
  if (!userRole) return false;

  // Admin can delete everything
  if (isAdmin()) return true;

  switch (resource) {
    case 'finance':
      return isAdmin();
    case 'employees':
      return isAdmin();
    case 'reports':
      return canDeleteReports();
    default:
      return isAdmin();
  }
};

/**
 * Permission actions by role
 */
const PERMISSIONS = {
  [ROLES.ADMIN]: [
    'view:all',
    'edit:all',
    'delete:all',
    'manage:settings',
    'manage:users',
    'manage:company',
    'view:finance',
    'edit:finance',
    'view:employees',
    'edit:employees',
    'view:reports',
    'create:reports',
    'delete:reports',
    'use:ai',
  ],
  [ROLES.MANAGER]: [
    'view:all',
    'edit:most',
    'view:finance',
    'edit:finance',
    'view:employees',
    'edit:employees',
    'view:reports',
    'create:reports',
    'delete:reports',
    'use:ai',
  ],
  [ROLES.EMPLOYEE]: [
    'view:own',
    'view:employees',
    'view:reports',
    'create:reports',
    'use:ai',
  ],
  [ROLES.VIEWER]: [
    'view:own',
    'view:reports',
  ],
};

/**
 * Get all permissions for current user
 * @returns {string[]} Array of permission strings
 */
export const getUserPermissions = () => {
  const userRole = getUserRole();
  return PERMISSIONS[userRole] || [];
};

/**
 * Check if user has specific permission
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has permission
 */
export const hasPermission = (permission) => {
  const permissions = getUserPermissions();
  return permissions.includes(permission);
};

export default {
  canPerform,
  hasMinimumRole,
  isAdmin,
  isManagerOrAbove,
  canViewFinance,
  canEditFinance,
  canViewEmployees,
  canEditEmployees,
  canViewReports,
  canCreateReports,
  canDeleteReports,
  canManageSettings,
  canUseAI,
  canView,
  canEdit,
  canDelete,
  getUserPermissions,
  hasPermission,
};
