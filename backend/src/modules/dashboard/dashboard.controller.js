// Dashboard Controller
// Provides aggregated data for the dashboard overview

/**
 * Get complete dashboard overview
 */
exports.getOverview = async (req, res, next) => {
  try {
    // TODO: Implement with real database queries
    // For now, return sample structure
    res.status(200).json({
      success: true,
      data: {
        metrics: await getMetricsData(),
        activities: await getActivitiesData(),
        insights: await getInsightsData(),
        topPerformers: await getTopPerformersData(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard metrics
 */
exports.getMetrics = async (req, res, next) => {
  try {
    const metrics = await getMetricsData();

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent activities
 */
exports.getActivities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const activities = await getActivitiesData(limit);

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI insights
 */
exports.getInsights = async (req, res, next) => {
  try {
    const insights = await getInsightsData();

    res.status(200).json({
      success: true,
      data: insights,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get top performers
 */
exports.getTopPerformers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const performers = await getTopPerformersData(limit);

    res.status(200).json({
      success: true,
      data: performers,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// Helper Functions - Replace with real database queries
// ============================================================================

async function getMetricsData() {
  // TODO: Query database for actual metrics
  // This is sample data matching the frontend structure
  return [
    {
      title: 'Tổng doanh thu',
      value: '₫2.8B',
      change: '+12.5%',
      trend: 'up',
      iconName: 'DollarSign',
      color: 'blue'
    },
    {
      title: 'Tổng nhân viên',
      value: '248',
      change: '+8',
      trend: 'up',
      iconName: 'Users',
      color: 'green'
    },
    {
      title: 'Mục tiêu đạt được',
      value: '87%',
      change: '+5%',
      trend: 'up',
      iconName: 'Target',
      color: 'purple'
    },
    {
      title: 'Lợi nhuận ròng',
      value: '₫1.6B',
      change: '+18.7%',
      trend: 'up',
      iconName: 'TrendingUp',
      color: 'orange'
    }
  ];
}

async function getActivitiesData(limit = 10) {
  // TODO: Query database for actual activities
  const allActivities = [
    {
      id: 1,
      title: 'Hợp đồng mới với Viettel',
      time: '2 giờ trước',
      type: 'success',
      iconName: 'CheckCircle'
    },
    {
      id: 2,
      title: 'Báo cáo tài chính Q4 cần duyệt',
      time: '4 giờ trước',
      type: 'warning',
      iconName: 'AlertCircle'
    },
    {
      id: 3,
      title: 'Cuộc họp với đội ngũ lãnh đạo',
      time: 'Hôm qua',
      type: 'info',
      iconName: 'Clock'
    },
    {
      id: 4,
      title: 'Hoàn thành mục tiêu doanh thu tháng',
      time: 'Hôm qua',
      type: 'success',
      iconName: 'CheckCircle'
    }
  ];

  return allActivities.slice(0, limit);
}

async function getInsightsData() {
  // TODO: Generate insights using AI or database analytics
  return [
    {
      title: 'Doanh thu tăng mạnh',
      description: 'Doanh thu tháng này tăng 12.5% so với tháng trước, chủ yếu từ sản phẩm A',
      impact: 'positive',
      priority: 'high'
    },
    {
      title: 'Chi phí vận hành cao',
      description: 'Chi phí văn phòng tăng 15% cần xem xét tối ưu hóa',
      impact: 'warning',
      priority: 'medium'
    },
    {
      title: 'Hiệu suất nhân viên xuất sắc',
      description: 'Phòng Sales đạt 120% KPI tháng này',
      impact: 'positive',
      priority: 'medium'
    }
  ];
}

async function getTopPerformersData(limit = 5) {
  // TODO: Query database for top performing employees
  const allPerformers = [
    { name: 'Nguyễn Văn A', department: 'Sales', score: 95, avatar: null },
    { name: 'Trần Thị B', department: 'Marketing', score: 92, avatar: null },
    { name: 'Lê Văn C', department: 'Tech', score: 88, avatar: null }
  ];

  return allPerformers.slice(0, limit);
}
