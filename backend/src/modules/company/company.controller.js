const companyService = require('./company.service');
const User = require('../../models/User');
const logger = require('../../utils/logger');

const createCompany = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const companyData = req.body;

    if (!companyData.name) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    const company = await companyService.createCompany(companyData, userId);

    // Update user with companyId
    if (userId) {
      await User.findByIdAndUpdate(userId, { companyId: company.id });
    }

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company
    });
  } catch (error) {
    logger.error('Error in createCompany:', error);
    next(error);
  }
};

const getCompanyInfo = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    const company = await companyService.getCompanyInfo(companyId);
    
    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    logger.error('Error in getCompanyInfo:', error);
    next(error);
  }
};

const updateCompanyInfo = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    const updates = req.body;
    
    const company = await companyService.updateCompanyInfo(companyId, updates);
    
    res.status(200).json({
      success: true,
      message: 'Company info updated successfully',
      data: company
    });
  } catch (error) {
    logger.error('Error in updateCompanyInfo:', error);
    next(error);
  }
};

const getCompanyStats = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    const stats = await companyService.getCompanyStats(companyId);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error in getCompanyStats:', error);
    next(error);
  }
};

const getCompanyMetrics = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    const { timeframe } = req.query;

    const metrics = await companyService.getCompanyMetrics(companyId, timeframe);

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Error in getCompanyMetrics:', error);
    next(error);
  }
};

const searchCompanies = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search term must be at least 2 characters'
      });
    }

    const companies = await companyService.searchCompanies(q);

    res.status(200).json({
      success: true,
      data: companies
    });
  } catch (error) {
    logger.error('Error in searchCompanies:', error);
    next(error);
  }
};

const findCompanyByTaxCode = async (req, res, next) => {
  try {
    const { taxCode } = req.query;

    if (!taxCode || taxCode.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tax code is required'
      });
    }

    const company = await companyService.findCompanyByTaxCode(taxCode);

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    logger.error('Error in findCompanyByTaxCode:', error);
    next(error);
  }
};

module.exports = {
  createCompany,
  getCompanyInfo,
  updateCompanyInfo,
  getCompanyStats,
  getCompanyMetrics,
  searchCompanies,
  findCompanyByTaxCode
};
