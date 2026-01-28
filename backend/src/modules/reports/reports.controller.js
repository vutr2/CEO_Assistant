const reportsService = require('./reports.service');
const logger = require('../../utils/logger');

const reportsController = {
  /**
   * Get all reports
   * GET /api/v1/reports?limit=5&sort=-createdAt
   */
  getAllReports: async (req, res) => {
    try {
      const companyId = req.companyId;
      const { limit = 10, sort = '-createdAt' } = req.query;
      const reports = await reportsService.getAllReports(companyId, { limit: parseInt(limit), sort });

      res.status(200).json({
        success: true,
        data: reports
      });
    } catch (error) {
      logger.error('Get all reports error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get report stats
   * GET /api/v1/reports/stats?period=month
   */
  getReportStats: async (req, res) => {
    try {
      const companyId = req.companyId;
      const { period = 'month' } = req.query;
      const stats = await reportsService.getReportStats(companyId, period);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get report stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get report templates
   * GET /api/v1/reports/templates
   */
  getReportTemplates: async (req, res) => {
    try {
      const companyId = req.companyId;
      const templates = await reportsService.getReportTemplates(companyId);

      res.status(200).json({
        success: true,
        data: templates
      });
    } catch (error) {
      logger.error('Get report templates error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get overview report
   * GET /api/v1/reports/overview
   */
  getOverviewReport: async (req, res) => {
    try {
      const companyId = req.companyId;
      const report = await reportsService.getOverviewReport(companyId);

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Get overview report error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get dashboard report
   * GET /api/v1/reports/dashboard
   */
  getDashboardReport: async (req, res) => {
    try {
      const companyId = req.companyId;
      const report = await reportsService.getDashboardReport(companyId);

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Get dashboard report error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get financial summary
   * GET /api/v1/reports/financial/summary
   */
  getFinancialSummary: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const companyId = req.companyId;
      const report = await reportsService.getFinancialSummary(companyId, startDate, endDate);

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Get financial summary error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get detailed financial report
   * GET /api/v1/reports/financial/detailed
   */
  getDetailedFinancialReport: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const companyId = req.companyId;
      const report = await reportsService.getDetailedFinancialReport(companyId, startDate, endDate);

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Get detailed financial report error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get profit and loss report
   * GET /api/v1/reports/financial/profit-loss
   */
  getProfitLossReport: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const companyId = req.companyId;
      const report = await reportsService.getProfitLossReport(companyId, startDate, endDate);

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Get profit and loss report error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get employee summary
   * GET /api/v1/reports/employees/summary
   */
  getEmployeeSummary: async (req, res) => {
    try {
      const companyId = req.companyId;
      const report = await reportsService.getEmployeeSummary(companyId);

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Get employee summary error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get employee performance report
   * GET /api/v1/reports/employees/performance
   */
  getEmployeePerformance: async (req, res) => {
    try {
      const companyId = req.companyId;
      const report = await reportsService.getEmployeePerformance(companyId);

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Get employee performance error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get attendance report
   * GET /api/v1/reports/employees/attendance
   */
  getAttendanceReport: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const companyId = req.companyId;
      const report = await reportsService.getAttendanceReport(companyId, startDate, endDate);

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Get attendance report error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Generate custom report
   * POST /api/v1/reports/custom
   */
  generateCustomReport: async (req, res) => {
    try {
      const { name, type, parameters } = req.body;

      if (!name || !type) {
        return res.status(400).json({
          success: false,
          message: 'Report name and type are required'
        });
      }

      const companyId = req.companyId;
      const report = await reportsService.generateCustomReport(companyId, {
        name,
        type,
        parameters: parameters || {},
        userId: req.user?.id,
        authorName: req.user?.name
      });

      logger.info(`Custom report generated: ${report.id}`);

      res.status(201).json({
        success: true,
        message: 'Custom report generated successfully',
        data: report
      });
    } catch (error) {
      logger.error('Generate custom report error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get custom report by ID
   * GET /api/v1/reports/custom/:id
   */
  getCustomReport: async (req, res) => {
    try {
      const companyId = req.companyId;
      const { id } = req.params;
      const report = await reportsService.getCustomReport(companyId, id);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Get custom report error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * List custom reports
   * GET /api/v1/reports/custom
   */
  listCustomReports: async (req, res) => {
    try {
      const companyId = req.companyId;
      const { type, startDate } = req.query;
      const userId = req.user?.id;

      const reports = await reportsService.listCustomReports(companyId, userId, {
        type,
        startDate
      });

      res.status(200).json({
        success: true,
        data: reports,
        count: reports.length
      });
    } catch (error) {
      logger.error('List custom reports error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Export report
   * POST /api/v1/reports/export
   */
  exportReport: async (req, res) => {
    try {
      const { reportType, reportData, format = 'json' } = req.body;

      if (!reportType || !reportData) {
        return res.status(400).json({
          success: false,
          message: 'Report type and data are required'
        });
      }

      // Validate format
      const validFormats = ['json', 'csv', 'pdf', 'xlsx'];
      if (!validFormats.includes(format.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid format. Supported formats: json, csv, pdf, xlsx'
        });
      }

      const companyId = req.companyId;
      const exportData = await reportsService.exportReport(companyId, reportType, reportData, format);

      logger.info(`Report exported: ${reportType} in ${format} format`);

      res.status(200).json({
        success: true,
        message: 'Report exported successfully',
        data: exportData
      });
    } catch (error) {
      logger.error('Export report error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = reportsController;
