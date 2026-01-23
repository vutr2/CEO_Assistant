/**
 * Tenant Middleware
 * Ensures all queries are filtered by companyId for multi-tenant isolation
 */

/**
 * Extract and attach companyId to request
 * Must be used AFTER auth middleware
 */
const tenantMiddleware = (req, res, next) => {
  // User must be authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // User must belong to a company
  if (!req.user.companyId) {
    return res.status(403).json({
      success: false,
      message: 'User is not associated with any company'
    });
  }

  // Attach companyId to request for easy access in controllers/services
  req.companyId = req.user.companyId;

  next();
};

/**
 * Optional tenant middleware - doesn't require auth but attaches companyId if available
 * Useful for public endpoints that can optionally filter by company
 */
const optionalTenantMiddleware = (req, res, next) => {
  if (req.user && req.user.companyId) {
    req.companyId = req.user.companyId;
  }
  next();
};

/**
 * Check if user has permission to access a specific company
 * Used for admin/super-admin scenarios
 */
const checkCompanyAccess = (req, res, next) => {
  const requestedCompanyId = req.params.companyId || req.body.companyId;

  if (!requestedCompanyId) {
    return next();
  }

  // User can only access their own company unless they're super admin
  if (req.user.role !== 'superadmin' &&
      req.user.companyId.toString() !== requestedCompanyId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this company'
    });
  }

  next();
};

/**
 * Helper function to add companyId filter to queries
 * Use in services: const filter = addCompanyFilter(req, { status: 'active' });
 */
const addCompanyFilter = (req, filter = {}) => {
  if (req.companyId) {
    return { ...filter, companyId: req.companyId };
  }
  return filter;
};

module.exports = {
  tenantMiddleware,
  optionalTenantMiddleware,
  checkCompanyAccess,
  addCompanyFilter
};
