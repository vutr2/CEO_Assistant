const Company = require('../../models/Company');
const Employee = require('../../models/Employee');
const logger = require('../../utils/logger');

class CompanyService {
  async getCompanyInfo(companyId) {
    logger.info('Getting company info', { companyId });

    if (!companyId) {
      return null;
    }

    const company = await Company.findById(companyId);

    if (!company) {
      return null;
    }

    return {
      id: company._id,
      name: company.name,
      slug: company.slug,
      industry: company.industry,
      size: company.size,
      founded: company.founded,
      logo: company.logo,
      address: company.address,
      phone: company.phone,
      email: company.email,
      website: company.website,
      description: company.description,
      subscription: company.subscription,
      settings: company.settings,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    };
  }

  async createCompany(companyData, ownerId) {
    logger.info('Creating company', { name: companyData.name, ownerId });

    const company = await Company.create({
      name: companyData.name,
      industry: companyData.industry,
      size: companyData.size || '1-10',
      address: companyData.address,
      phone: companyData.phone,
      email: companyData.email,
      website: companyData.website,
      description: companyData.description,
      owner: ownerId,
      subscription: {
        plan: 'free',
        status: 'active',
        startDate: new Date()
      }
    });

    logger.info('Company created successfully', { id: company._id, name: company.name });

    return {
      id: company._id,
      name: company.name,
      slug: company.slug,
      createdAt: company.createdAt
    };
  }

  async updateCompanyInfo(companyId, updates) {
    logger.info('Updating company info', { companyId });

    if (!companyId) {
      throw new Error('Company ID is required');
    }

    const company = await Company.findByIdAndUpdate(
      companyId,
      { $set: updates },
      { new: true }
    );

    if (!company) {
      throw new Error('Company not found');
    }

    return {
      id: company._id,
      name: company.name,
      slug: company.slug,
      industry: company.industry,
      size: company.size,
      address: company.address,
      phone: company.phone,
      email: company.email,
      website: company.website,
      updatedAt: company.updatedAt
    };
  }

  async getCompanyStats(companyId) {
    logger.info('Getting company stats', { companyId });

    if (!companyId) {
      return {
        totalEmployees: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        growthRate: 0
      };
    }

    // Get employee count
    const totalEmployees = await Employee.countDocuments({
      companyId,
      status: { $ne: 'terminated' }
    });

    // TODO: Calculate revenue, expenses from Finance model when implemented
    return {
      totalEmployees,
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      growthRate: 0
    };
  }

  async getCompanyMetrics(companyId, timeframe = '30d') {
    logger.info('Getting company metrics', { companyId, timeframe });

    // TODO: Implement real metrics calculation from Finance data
    return {
      revenue: [],
      expenses: [],
      profit: [],
      timeframe
    };
  }

  async getCompanySettings(companyId) {
    logger.info('Getting company settings', { companyId });

    if (!companyId) {
      return {
        currency: 'VND',
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        fiscalYearStart: 1
      };
    }

    const company = await Company.findById(companyId).select('settings');

    if (!company) {
      return {
        currency: 'VND',
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        fiscalYearStart: 1
      };
    }

    return company.settings;
  }

  async updateCompanySettings(companyId, settings) {
    logger.info('Updating company settings', { companyId });

    if (!companyId) {
      throw new Error('Company ID is required');
    }

    const company = await Company.findByIdAndUpdate(
      companyId,
      { $set: { settings } },
      { new: true }
    );

    if (!company) {
      throw new Error('Company not found');
    }

    return company.settings;
  }

  async searchCompanies(searchTerm) {
    logger.info('Searching companies', { searchTerm });

    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    const companies = await Company.find({
      isActive: true,
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { taxCode: { $regex: searchTerm, $options: 'i' } },
        { businessCode: { $regex: searchTerm, $options: 'i' } }
      ]
    })
    .select('name taxCode businessCode industry address')
    .limit(10);

    return companies.map(company => ({
      id: company._id,
      name: company.name,
      taxCode: company.taxCode,
      businessCode: company.businessCode,
      industry: company.industry,
      address: company.address
    }));
  }

  async findCompanyByTaxCode(taxCode) {
    logger.info('Finding company by tax code', { taxCode });

    if (!taxCode || taxCode.trim().length === 0) {
      return null;
    }

    const company = await Company.findOne({
      taxCode: taxCode.trim(),
      isActive: true
    }).select('name taxCode businessCode industry address');

    if (!company) {
      return null;
    }

    return {
      id: company._id,
      name: company.name,
      taxCode: company.taxCode,
      businessCode: company.businessCode,
      industry: company.industry,
      address: company.address
    };
  }
}

module.exports = new CompanyService();
