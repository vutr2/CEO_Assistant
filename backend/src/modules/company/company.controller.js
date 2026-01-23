const companyService = require('./company.service');
const logger = require('../../utils/logger');

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

module.exports = {
  getCompanyInfo,
  updateCompanyInfo,
  getCompanyStats,
  getCompanyMetrics
};
