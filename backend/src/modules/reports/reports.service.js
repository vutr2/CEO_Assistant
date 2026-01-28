// Multi-tenant Reports Service using MongoDB

const Report = require('../../models/Report');
const Employee = require('../../models/Employee');
const { Revenue, Expense } = require('../finance/finance.model');
const logger = require('../../utils/logger');

const reportsService = {
  /**
   * Get all reports for a company
   */
  getAllReports: async (companyId, { limit = 10, sort = '-createdAt' } = {}) => {
    logger.info('Getting all reports', { companyId, limit });

    if (!companyId) {
      return [];
    }

    const sortOption = sort === '-createdAt' ? { createdAt: -1 } : { createdAt: 1 };

    const reports = await Report.find({ companyId })
      .sort(sortOption)
      .limit(limit);

    return reports.map(r => ({
      id: r._id,
      title: r.title,
      type: r.type,
      author: r.authorName,
      date: r.createdAt,
      size: r.fileSize || 'N/A',
      status: r.status
    }));
  },

  /**
   * Get report stats for a company
   */
  getReportStats: async (companyId, period = 'month') => {
    logger.info('Getting report stats', { companyId, period });

    if (!companyId) {
      return [
        { label: 'Đã hoàn thành', value: '0', color: 'green', iconName: 'CheckCircle' },
        { label: 'Đang xử lý', value: '0', color: 'orange', iconName: 'Clock' },
        { label: 'Tổng số báo cáo', value: '0', color: 'blue', iconName: 'FileText' },
        { label: 'Bản nháp', value: '0', color: 'red', iconName: 'XCircle' }
      ];
    }

    const [completed, processing, total, draft] = await Promise.all([
      Report.countDocuments({ companyId, status: 'completed' }),
      Report.countDocuments({ companyId, status: 'processing' }),
      Report.countDocuments({ companyId }),
      Report.countDocuments({ companyId, status: 'draft' })
    ]);

    return [
      { label: 'Đã hoàn thành', value: completed.toString(), color: 'green', iconName: 'CheckCircle' },
      { label: 'Đang xử lý', value: processing.toString(), color: 'orange', iconName: 'Clock' },
      { label: 'Tổng số báo cáo', value: total.toString(), color: 'blue', iconName: 'FileText' },
      { label: 'Bản nháp', value: draft.toString(), color: 'red', iconName: 'XCircle' }
    ];
  },

  /**
   * Get report templates
   */
  getReportTemplates: async (companyId) => {
    return [
      { id: 1, name: 'Báo cáo Tài chính', description: 'Doanh thu, chi phí và lợi nhuận', color: 'blue', iconName: 'DollarSign' },
      { id: 2, name: 'Báo cáo Nhân sự', description: 'Hiệu suất và phát triển nhân viên', color: 'green', iconName: 'Users' },
      { id: 3, name: 'Báo cáo KPI', description: 'Theo dõi mục tiêu và chỉ số', color: 'purple', iconName: 'Target' },
      { id: 4, name: 'Báo cáo Tổng quan', description: 'Phân tích toàn diện kinh doanh', color: 'orange', iconName: 'TrendingUp' }
    ];
  },

  /**
   * Get overview report
   */
  getOverviewReport: async (companyId) => {
    logger.info('Getting overview report', { companyId });

    if (!companyId) {
      return {
        period: { start: new Date().toISOString(), end: new Date().toISOString() },
        summary: { totalRevenue: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0, employeeCount: 0 },
        highlights: []
      };
    }

    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    // Get real data from database
    const [revenueResult, expenseResult, employeeCount] = await Promise.all([
      Revenue.aggregate([
        { $match: { companyId, date: { $gte: lastMonth, $lte: currentDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { companyId, date: { $gte: lastMonth, $lte: currentDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Employee.countDocuments({ companyId, status: 'active' })
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const totalExpenses = expenseResult[0]?.total || 0;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      period: { start: lastMonth.toISOString(), end: currentDate.toISOString() },
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin: parseFloat(profitMargin.toFixed(2)),
        employeeCount
      },
      highlights: []
    };
  },

  /**
   * Get dashboard report (real-time metrics)
   */
  getDashboardReport: async (companyId) => {
    logger.info('Getting dashboard report', { companyId });

    if (!companyId) {
      return {
        kpis: {
          revenue: { current: 0, target: 0, achievement: 0, trend: 'stable' },
          expenses: { current: 0, budget: 0, utilization: 0, trend: 'stable' }
        }
      };
    }

    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const [revenueResult, expenseResult] = await Promise.all([
      Revenue.aggregate([
        { $match: { companyId, date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { companyId, date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    return {
      kpis: {
        revenue: {
          current: revenueResult[0]?.total || 0,
          target: 0,
          achievement: 0,
          trend: 'stable'
        },
        expenses: {
          current: expenseResult[0]?.total || 0,
          budget: 0,
          utilization: 0,
          trend: 'stable'
        }
      }
    };
  },

  /**
   * Get financial summary report
   */
  getFinancialSummary: async (companyId, startDate, endDate) => {
    logger.info('Getting financial summary', { companyId, startDate, endDate });

    if (!companyId) {
      return { period: { startDate, endDate }, revenue: { total: 0, byCategory: {} }, expenses: { total: 0, byCategory: {} } };
    }

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    const [revenueBySource, expenseByCategory] = await Promise.all([
      Revenue.aggregate([
        { $match: { companyId, date: { $gte: start, $lte: end } } },
        { $group: { _id: '$source', total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { companyId, date: { $gte: start, $lte: end } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
      ])
    ]);

    const revenueByCategory = {};
    let totalRevenue = 0;
    revenueBySource.forEach(r => {
      revenueByCategory[r._id || 'Khác'] = r.total;
      totalRevenue += r.total;
    });

    const expensesByCat = {};
    let totalExpenses = 0;
    expenseByCategory.forEach(e => {
      expensesByCat[e._id || 'Khác'] = e.total;
      totalExpenses += e.total;
    });

    return {
      period: { startDate: start.toISOString(), endDate: end.toISOString() },
      revenue: { total: totalRevenue, byCategory: revenueByCategory },
      expenses: { total: totalExpenses, byCategory: expensesByCat }
    };
  },

  /**
   * Get detailed financial report
   */
  getDetailedFinancialReport: async (companyId, startDate, endDate) => {
    return {
      period: { startDate, endDate },
      monthlyBreakdown: [],
      yearOverYear: { revenueGrowth: 0, expenseGrowth: 0, profitGrowth: 0 }
    };
  },

  /**
   * Get profit and loss report
   */
  getProfitLossReport: async (companyId, startDate, endDate) => {
    logger.info('Getting P&L report', { companyId });

    if (!companyId) {
      return {
        period: { startDate, endDate },
        income: { totalIncome: 0 },
        expenses: { totalExpenses: 0 },
        profitLoss: { netProfit: 0 }
      };
    }

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    const [revenueResult, expenseResult] = await Promise.all([
      Revenue.aggregate([
        { $match: { companyId, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { companyId, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const totalIncome = revenueResult[0]?.total || 0;
    const totalExpenses = expenseResult[0]?.total || 0;

    return {
      period: { startDate: start.toISOString(), endDate: end.toISOString() },
      income: { totalIncome },
      expenses: { totalExpenses },
      profitLoss: { netProfit: totalIncome - totalExpenses }
    };
  },

  /**
   * Get employee summary
   */
  getEmployeeSummary: async (companyId) => {
    logger.info('Getting employee summary', { companyId });

    if (!companyId) {
      return { totalEmployees: 0, byDepartment: {} };
    }

    const [totalEmployees, byDepartment] = await Promise.all([
      Employee.countDocuments({ companyId, status: 'active' }),
      Employee.aggregate([
        { $match: { companyId, status: 'active' } },
        { $group: { _id: '$department', count: { $sum: 1 } } }
      ])
    ]);

    const deptCounts = {};
    byDepartment.forEach(d => {
      deptCounts[d._id || 'Khác'] = d.count;
    });

    return { totalEmployees, byDepartment: deptCounts };
  },

  /**
   * Get employee performance report
   */
  getEmployeePerformance: async (companyId) => {
    logger.info('Getting employee performance', { companyId });

    if (!companyId) {
      return { averageScore: 0, topPerformers: [] };
    }

    const [avgResult, topPerformers] = await Promise.all([
      Employee.aggregate([
        { $match: { companyId, status: 'active' } },
        { $group: { _id: null, avg: { $avg: '$performance.score' } } }
      ]),
      Employee.find({ companyId, status: 'active' })
        .sort({ 'performance.score': -1 })
        .limit(5)
        .select('name performance.score')
    ]);

    return {
      averageScore: Math.round(avgResult[0]?.avg || 0),
      topPerformers: topPerformers.map(e => ({
        name: e.name,
        score: e.performance?.score || 0
      }))
    };
  },

  /**
   * Get attendance report
   */
  getAttendanceReport: async (companyId, startDate, endDate) => {
    // TODO: Implement with Attendance model
    return {
      period: { startDate, endDate },
      attendance: { averageRate: 0, totalAbsences: 0 }
    };
  },

  /**
   * Generate custom report
   */
  generateCustomReport: async (companyId, reportData) => {
    logger.info('Generating custom report', { companyId });

    if (!companyId) {
      throw new Error('Company ID is required');
    }

    const report = await Report.create({
      companyId,
      author: reportData.userId,
      authorName: reportData.authorName,
      title: reportData.name,
      type: reportData.type || 'custom',
      description: reportData.description,
      data: reportData.parameters,
      period: reportData.period,
      status: 'completed'
    });

    return {
      id: report._id,
      title: report.title,
      type: report.type,
      status: report.status,
      createdAt: report.createdAt
    };
  },

  /**
   * Get custom report by ID
   */
  getCustomReport: async (companyId, id) => {
    const query = { _id: id };
    if (companyId) query.companyId = companyId;

    return await Report.findOne(query);
  },

  /**
   * List custom reports
   */
  listCustomReports: async (companyId, userId, filters = {}) => {
    logger.info('Listing custom reports', { companyId, userId, filters });

    if (!companyId) {
      return [];
    }

    const query = { companyId };
    if (filters.type) query.type = filters.type;

    const reports = await Report.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    return reports.map(r => ({
      _id: r._id,
      id: r._id,
      name: r.title,
      title: r.title,
      type: r.type,
      status: r.status,
      author: r.authorName,
      createdBy: r.author,
      parameters: r.data,
      description: r.description,
      createdAt: r.createdAt,
      date: r.createdAt
    }));
  },

  /**
   * Export report
   */
  exportReport: async (companyId, reportType, reportData, format) => {
    // TODO: Implement actual file generation
    return {
      format,
      url: `/exports/${companyId}/${reportType}-${Date.now()}.${format}`,
      size: 'N/A',
      generatedAt: new Date().toISOString()
    };
  }
};

module.exports = reportsService;
