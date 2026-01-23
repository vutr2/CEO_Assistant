// Multi-tenant Reports Service
// Data is stored per company using companyId as key

const dataByCompany = {};
let reportIdCounter = 1;

// Initialize company data if not exists
const initCompanyData = (companyId) => {
  const key = companyId?.toString() || 'default';
  if (!dataByCompany[key]) {
    dataByCompany[key] = {
      reports: [],
      customReports: []
    };
    generateMockReportsForCompany(key);
  }
  return dataByCompany[key];
};

// Generate mock reports for a company
const generateMockReportsForCompany = (companyKey) => {
  const data = dataByCompany[companyKey];

  data.reports = [
    {
      id: reportIdCounter++,
      companyId: companyKey,
      title: 'Báo cáo tài chính Q4 2025',
      type: 'Tài chính',
      author: 'Nguyễn Văn An',
      date: new Date(2025, 11, 15).toISOString(),
      size: '2.4 MB',
      status: 'completed'
    },
    {
      id: reportIdCounter++,
      companyId: companyKey,
      title: 'Phân tích hiệu suất nhân viên',
      type: 'Nhân sự',
      author: 'Trần Thị Bình',
      date: new Date(2025, 11, 10).toISOString(),
      size: '1.8 MB',
      status: 'completed'
    },
    {
      id: reportIdCounter++,
      companyId: companyKey,
      title: 'Báo cáo KPI tháng 12',
      type: 'KPI',
      author: 'Lê Văn Cường',
      date: new Date(2025, 11, 8).toISOString(),
      size: '1.2 MB',
      status: 'processing'
    },
    {
      id: reportIdCounter++,
      companyId: companyKey,
      title: 'Chiến dịch Marketing Q4',
      type: 'Marketing',
      author: 'Phạm Thị Dung',
      date: new Date(2025, 11, 5).toISOString(),
      size: '3.1 MB',
      status: 'completed'
    },
    {
      id: reportIdCounter++,
      companyId: companyKey,
      title: 'Tổng quan doanh thu 2025',
      type: 'Tổng quan',
      author: 'Hoàng Văn Em',
      date: new Date(2025, 10, 28).toISOString(),
      size: '2.7 MB',
      status: 'draft'
    }
  ];
};

const reportsService = {
  /**
   * Get all reports for a company
   * @param {string} companyId - Company ID for multi-tenant filtering
   */
  getAllReports: async (companyId, { limit = 10, sort = '-createdAt' } = {}) => {
    const data = initCompanyData(companyId);
    let reports = [...data.reports];

    // Sort
    if (sort === '-createdAt') {
      reports.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Limit
    return reports.slice(0, limit);
  },

  /**
   * Get report stats for a company
   */
  getReportStats: async (companyId) => {
    const data = initCompanyData(companyId);
    const reports = data.reports;

    const completed = reports.filter(r => r.status === 'completed').length;
    const processing = reports.filter(r => r.status === 'processing').length;
    const draft = reports.filter(r => r.status === 'draft').length;

    return [
      {
        label: 'Đã hoàn thành',
        value: completed.toString(),
        color: 'green',
        iconName: 'CheckCircle'
      },
      {
        label: 'Đang xử lý',
        value: processing.toString(),
        color: 'orange',
        iconName: 'Clock'
      },
      {
        label: 'Tổng số báo cáo',
        value: reports.length.toString(),
        color: 'blue',
        iconName: 'FileText'
      },
      {
        label: 'Bản nháp',
        value: draft.toString(),
        color: 'red',
        iconName: 'XCircle'
      }
    ];
  },

  /**
   * Get report templates
   */
  getReportTemplates: async (companyId) => {
    return [
      {
        id: 1,
        name: 'Báo cáo Tài chính',
        description: 'Doanh thu, chi phí và lợi nhuận',
        color: 'blue',
        iconName: 'DollarSign'
      },
      {
        id: 2,
        name: 'Báo cáo Nhân sự',
        description: 'Hiệu suất và phát triển nhân viên',
        color: 'green',
        iconName: 'Users'
      },
      {
        id: 3,
        name: 'Báo cáo KPI',
        description: 'Theo dõi mục tiêu và chỉ số',
        color: 'purple',
        iconName: 'Target'
      },
      {
        id: 4,
        name: 'Báo cáo Tổng quan',
        description: 'Phân tích toàn diện kinh doanh',
        color: 'orange',
        iconName: 'TrendingUp'
      }
    ];
  },

  /**
   * Get overview report
   */
  getOverviewReport: async (companyId) => {
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    return {
      period: {
        start: lastMonth.toISOString(),
        end: currentDate.toISOString()
      },
      summary: {
        totalRevenue: 4500000000,
        totalExpenses: 2800000000,
        netProfit: 1700000000,
        profitMargin: 37.8,
        employeeCount: 125,
        activeProjects: 18,
        customerSatisfaction: 4.5
      },
      highlights: [
        {
          category: 'Doanh thu',
          value: 4500000000,
          change: 12.5,
          trend: 'up',
          description: 'Doanh thu tăng 12.5% so với kỳ trước'
        },
        {
          category: 'Tỷ suất lợi nhuận',
          value: 37.8,
          change: 3.2,
          trend: 'up',
          description: 'Tỷ suất lợi nhuận tăng 3.2%'
        }
      ]
    };
  },

  /**
   * Get dashboard report (real-time metrics)
   */
  getDashboardReport: async (companyId) => {
    return {
      kpis: {
        revenue: {
          current: 450000000,
          target: 500000000,
          achievement: 90,
          trend: 'up'
        },
        expenses: {
          current: 280000000,
          budget: 300000000,
          utilization: 93.3,
          trend: 'stable'
        }
      }
    };
  },

  /**
   * Get financial summary report
   */
  getFinancialSummary: async (companyId, startDate, endDate) => {
    return {
      period: { startDate, endDate },
      revenue: {
        total: 5400000000,
        byCategory: {
          'Bán hàng': 3200000000,
          'Dịch vụ': 1500000000,
          'Đăng ký': 500000000,
          'Tư vấn': 200000000
        }
      },
      expenses: {
        total: 3200000000,
        byCategory: {
          'Lương': 1800000000,
          'Marketing': 600000000,
          'Công nghệ': 400000000
        }
      }
    };
  },

  /**
   * Get detailed financial report
   */
  getDetailedFinancialReport: async (companyId, startDate, endDate) => {
    return {
      period: { startDate, endDate },
      monthlyBreakdown: [],
      yearOverYear: {
        revenueGrowth: 15.5,
        expenseGrowth: 8.2,
        profitGrowth: 24.3
      }
    };
  },

  /**
   * Get profit and loss report
   */
  getProfitLossReport: async (companyId, startDate, endDate) => {
    return {
      period: { startDate, endDate },
      income: {
        totalIncome: 5480000000
      },
      expenses: {
        totalExpenses: 5280000000
      },
      profitLoss: {
        netProfit: 200000000
      }
    };
  },

  /**
   * Get employee summary
   */
  getEmployeeSummary: async (companyId) => {
    return {
      totalEmployees: 125,
      byDepartment: {
        'Công nghệ': 45,
        'Marketing': 25,
        'Kinh doanh': 30,
        'Nhân sự': 15,
        'Vận hành': 10
      }
    };
  },

  /**
   * Get employee performance report
   */
  getEmployeePerformance: async (companyId) => {
    return {
      averageScore: 85,
      topPerformers: [
        { name: 'Trần Thị Bình', score: 98 },
        { name: 'Phạm Thị Dung', score: 96 },
        { name: 'Nguyễn Văn An', score: 95 }
      ]
    };
  },

  /**
   * Get attendance report
   */
  getAttendanceReport: async (companyId, startDate, endDate) => {
    return {
      period: { startDate, endDate },
      attendance: {
        averageRate: 95.5,
        totalAbsences: 12
      }
    };
  },

  /**
   * Generate custom report
   */
  generateCustomReport: async (companyId, reportData) => {
    const data = initCompanyData(companyId);
    const newReport = {
      id: reportIdCounter++,
      companyId,
      ...reportData,
      createdAt: new Date().toISOString(),
      status: 'completed'
    };
    data.customReports.push(newReport);
    return newReport;
  },

  /**
   * Get custom report by ID
   */
  getCustomReport: async (companyId, id) => {
    const data = initCompanyData(companyId);
    return data.customReports.find(report => report.id === parseInt(id));
  },

  /**
   * List custom reports
   */
  listCustomReports: async (companyId, filters = {}) => {
    const data = initCompanyData(companyId);
    let reports = [...data.customReports];

    if (filters.type) {
      reports = reports.filter(report => report.type === filters.type);
    }

    return reports;
  },

  /**
   * Export report
   */
  exportReport: async (companyId, reportType, reportData, format) => {
    return {
      format,
      url: `/exports/${companyId}/${reportType}-${Date.now()}.${format}`,
      size: '2.4 MB',
      generatedAt: new Date().toISOString()
    };
  }
};

module.exports = reportsService;
