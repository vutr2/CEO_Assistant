/**
 * Multi-tenant Company Service
 *
 * USE THIS FILE WHEN YOU ENABLE MONGODB
 * Replace company.service.js with this file
 */

const { Company, User, Employee } = require('../../models');
const logger = require('../../utils/logger');

class CompanyServiceMultitenant {
  /**
   * Get company info by ID
   * @param {ObjectId} companyId - Company ID
   */
  async getCompanyInfo(companyId) {
    logger.info('Getting company info', { companyId });

    const company = await Company.findById(companyId).lean();

    if (!company) {
      throw new Error('Công ty không tồn tại');
    }

    return {
      id: company._id,
      name: company.name,
      businessCode: company.businessCode,
      taxCode: company.taxCode,
      industry: company.industry,
      size: company.size,
      founded: company.founded,
      location: company.location,
      phone: company.phone,
      email: company.email,
      website: company.website,
      logo: company.logo,
      description: company.description,
      subscription: company.subscription,
      settings: company.settings,
      createdAt: company.createdAt
    };
  }

  /**
   * Update company info
   * @param {ObjectId} companyId - Company ID
   * @param {Object} updates - Update data
   */
  async updateCompanyInfo(companyId, updates) {
    logger.info('Updating company info', { companyId });

    // Fields that can be updated
    const allowedFields = [
      'name', 'businessCode', 'taxCode', 'industry', 'size',
      'founded', 'location', 'phone', 'email', 'website',
      'logo', 'description'
    ];

    // Filter out non-allowed fields
    const filteredUpdates = {};
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    const company = await Company.findByIdAndUpdate(
      companyId,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    );

    if (!company) {
      throw new Error('Công ty không tồn tại');
    }

    logger.info('Company updated successfully', { companyId, name: company.name });

    return company;
  }

  /**
   * Get company statistics
   * @param {ObjectId} companyId - Company ID
   */
  async getCompanyStats(companyId) {
    logger.info('Getting company stats', { companyId });

    const [
      totalEmployees,
      totalUsers,
      company
    ] = await Promise.all([
      Employee.countDocuments({ companyId, status: { $ne: 'inactive' } }),
      User.countDocuments({ companyId, isActive: true }),
      Company.findById(companyId).lean()
    ]);

    // In a real app, these would come from finance module
    return {
      totalEmployees,
      totalUsers,
      totalRevenue: 5000000000, // 5 billion VND mock
      totalExpenses: 3500000000,
      netProfit: 1500000000,
      growthRate: 15.5,
      plan: company?.subscription?.plan || 'free'
    };
  }

  /**
   * Get company metrics over time
   * @param {ObjectId} companyId - Company ID
   * @param {string} timeframe - Time period
   */
  async getCompanyMetrics(companyId, timeframe = '30d') {
    logger.info('Getting company metrics', { companyId, timeframe });

    // In a real app, aggregate data from finance module
    // This is mock data for now
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];

    return {
      revenue: [
        { month: 'T1', value: 800000000 },
        { month: 'T2', value: 950000000 },
        { month: 'T3', value: 1100000000 },
        { month: 'T4', value: 1050000000 },
        { month: 'T5', value: 1200000000 },
        { month: 'T6', value: 1350000000 }
      ],
      expenses: [
        { month: 'T1', value: 600000000 },
        { month: 'T2', value: 650000000 },
        { month: 'T3', value: 700000000 },
        { month: 'T4', value: 680000000 },
        { month: 'T5', value: 750000000 },
        { month: 'T6', value: 800000000 }
      ],
      timeframe
    };
  }

  /**
   * Update company settings
   * @param {ObjectId} companyId - Company ID
   * @param {Object} settings - Settings to update
   */
  async updateSettings(companyId, settings) {
    logger.info('Updating company settings', { companyId });

    const company = await Company.findByIdAndUpdate(
      companyId,
      { $set: { settings } },
      { new: true }
    );

    if (!company) {
      throw new Error('Công ty không tồn tại');
    }

    return company.settings;
  }

  /**
   * Get team members (users) of company
   * @param {ObjectId} companyId - Company ID
   */
  async getTeamMembers(companyId) {
    logger.info('Getting team members', { companyId });

    const users = await User.find({ companyId, isActive: true })
      .select('name email role avatar lastLogin createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return users;
  }

  /**
   * Update subscription
   * @param {ObjectId} companyId - Company ID
   * @param {Object} subscription - Subscription data
   */
  async updateSubscription(companyId, subscription) {
    logger.info('Updating subscription', { companyId, plan: subscription.plan });

    const company = await Company.findByIdAndUpdate(
      companyId,
      {
        $set: {
          'subscription.plan': subscription.plan,
          'subscription.status': subscription.status || 'active',
          'subscription.startDate': subscription.startDate || new Date(),
          'subscription.endDate': subscription.endDate,
          'subscription.features': subscription.features || []
        }
      },
      { new: true }
    );

    if (!company) {
      throw new Error('Công ty không tồn tại');
    }

    logger.info('Subscription updated', { companyId, plan: company.subscription.plan });

    return company.subscription;
  }

  /**
   * Deactivate company (soft delete)
   * @param {ObjectId} companyId - Company ID
   */
  async deactivateCompany(companyId) {
    logger.info('Deactivating company', { companyId });

    const company = await Company.findByIdAndUpdate(
      companyId,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!company) {
      throw new Error('Công ty không tồn tại');
    }

    // Also deactivate all users
    await User.updateMany(
      { companyId },
      { $set: { isActive: false } }
    );

    logger.info('Company deactivated', { companyId, name: company.name });

    return { success: true };
  }
}

module.exports = new CompanyServiceMultitenant();
