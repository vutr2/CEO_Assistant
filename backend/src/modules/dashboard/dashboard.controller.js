// Dashboard Controller
// Provides aggregated data for the dashboard overview

const User = require('../../models/User');
const Employee = require('../../models/Employee');
const Company = require('../../models/Company');
const Activity = require('../../models/Activity');
const Sale = require('../../models/Sale');
const CompanyExpense = require('../../models/CompanyExpense');

/**
 * Get complete dashboard overview
 */
exports.getOverview = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;

    res.status(200).json({
      success: true,
      data: {
        metrics: await getMetricsData(companyId),
        activities: await getActivitiesData(companyId),
        insights: await getInsightsData(companyId),
        topPerformers: await getTopPerformersData(companyId),
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
    const companyId = req.user?.companyId;
    const metrics = await getMetricsData(companyId);

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
    const companyId = req.user?.companyId;
    const limit = parseInt(req.query.limit) || 10;
    const activities = await getActivitiesData(companyId, limit);

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
    const companyId = req.user?.companyId;
    const insights = await getInsightsData(companyId);

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
    const companyId = req.user?.companyId;
    const limit = parseInt(req.query.limit) || 5;
    const performers = await getTopPerformersData(companyId, limit);

    res.status(200).json({
      success: true,
      data: performers,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// Helper Functions - Query real data from MongoDB
// ============================================================================

async function getMetricsData(companyId) {
  try {
    if (!companyId) {
      return [];
    }

    // Get date ranges for comparison
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Calculate total revenue (won sales)
    const totalRevenue = await Sale.aggregate([
      { $match: { companyId, status: 'won', isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const thisMonthRevenue = await Sale.aggregate([
      {
        $match: {
          companyId,
          status: 'won',
          isDeleted: false,
          saleDate: { $gte: thisMonthStart }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const lastMonthRevenue = await Sale.aggregate([
      {
        $match: {
          companyId,
          status: 'won',
          isDeleted: false,
          saleDate: { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Calculate revenue change
    const currentRevenue = thisMonthRevenue[0]?.total || 0;
    const previousRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueChange = previousRevenue > 0
      ? (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
      : 0;

    // Count employees
    const employeeCount = await User.countDocuments({ companyId, isActive: true });
    const lastMonthEmployees = employeeCount; // TODO: Track historical data
    const employeeChange = 0; // TODO: Calculate from historical data

    // Calculate expenses
    const totalExpenses = await CompanyExpense.aggregate([
      { $match: { companyId, isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const thisMonthExpenses = await CompanyExpense.aggregate([
      {
        $match: {
          companyId,
          isDeleted: false,
          expenseDate: { $gte: thisMonthStart }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get last month expenses
    const lastMonthExpenses = await CompanyExpense.aggregate([
      {
        $match: {
          companyId,
          isDeleted: false,
          expenseDate: { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Calculate profit
    const revenue = totalRevenue[0]?.total || 0;
    const expenses = totalExpenses[0]?.total || 0;
    const profit = revenue - expenses;
    const thisMonthProfit = currentRevenue - (thisMonthExpenses[0]?.total || 0);
    const lastMonthProfit = previousRevenue - (lastMonthExpenses[0]?.total || 0);
    const profitChange = lastMonthProfit > 0
      ? (((thisMonthProfit - lastMonthProfit) / lastMonthProfit) * 100).toFixed(1)
      : 0;

    // Calculate completed tasks percentage
    const totalActivities = await Activity.countDocuments({ companyId, isDeleted: false });
    const completedActivities = await Activity.countDocuments({
      companyId,
      isDeleted: false,
      status: 'completed'
    });
    const completionRate = totalActivities > 0
      ? ((completedActivities / totalActivities) * 100).toFixed(0)
      : 0;

    // Format currency
    const formatVND = (amount) => {
      if (amount >= 1000000000) {
        return `₫${(amount / 1000000000).toFixed(1)}B`;
      } else if (amount >= 1000000) {
        return `₫${(amount / 1000000).toFixed(1)}M`;
      } else if (amount >= 1000) {
        return `₫${(amount / 1000).toFixed(0)}K`;
      }
      return `₫${amount}`;
    };

    return [
      {
        title: 'Tổng doanh thu',
        value: formatVND(currentRevenue),
        change: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`,
        trend: revenueChange > 0 ? 'up' : revenueChange < 0 ? 'down' : 'neutral',
        iconName: 'DollarSign',
        color: 'blue'
      },
      {
        title: 'Tổng nhân viên',
        value: String(employeeCount),
        change: `${employeeChange >= 0 ? '+' : ''}${employeeChange}`,
        trend: employeeChange > 0 ? 'up' : employeeChange < 0 ? 'down' : 'neutral',
        iconName: 'Users',
        color: 'green'
      },
      {
        title: 'Hoàn thành công việc',
        value: `${completionRate}%`,
        change: `${completedActivities}/${totalActivities} tasks`,
        trend: completionRate >= 80 ? 'up' : completionRate >= 50 ? 'neutral' : 'down',
        iconName: 'Target',
        color: 'purple'
      },
      {
        title: 'Lợi nhuận ròng',
        value: formatVND(thisMonthProfit),
        change: `${profitChange >= 0 ? '+' : ''}${profitChange}%`,
        trend: profitChange > 0 ? 'up' : profitChange < 0 ? 'down' : 'neutral',
        iconName: 'TrendingUp',
        color: 'orange'
      }
    ];
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return [];
  }
}

async function getActivitiesData(companyId, limit = 10) {
  try {
    if (!companyId) {
      return [];
    }

    // Get recent activities from all sources
    const activities = await Activity.find({
      companyId,
      isDeleted: false
    })
      .populate('user', 'name position')
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    const sales = await Sale.find({
      companyId,
      isDeleted: false
    })
      .populate('user', 'name position')
      .sort({ saleDate: -1 })
      .limit(limit)
      .lean();

    const expenses = await CompanyExpense.find({
      companyId,
      isDeleted: false
    })
      .populate('user', 'name position')
      .sort({ expenseDate: -1 })
      .limit(limit)
      .lean();

    // Combine and format activities
    const formattedActivities = [];

    activities.forEach(act => {
      formattedActivities.push({
        type: 'activity',
        title: act.title,
        description: act.description || `${act.type} activity`,
        user: act.user?.name || 'Unknown',
        position: act.user?.position,
        timestamp: act.date,
        status: act.status,
        icon: getActivityIcon(act.type)
      });
    });

    sales.forEach(sale => {
      formattedActivities.push({
        type: 'sale',
        title: sale.title,
        description: `${sale.status} - ${formatCurrency(sale.amount)}`,
        user: sale.user?.name || 'Unknown',
        position: sale.user?.position,
        timestamp: sale.saleDate,
        status: sale.status,
        icon: 'DollarSign'
      });
    });

    expenses.forEach(exp => {
      formattedActivities.push({
        type: 'expense',
        title: exp.title,
        description: `${exp.category} - ${formatCurrency(exp.amount)}`,
        user: exp.user?.name || 'Unknown',
        position: exp.user?.position,
        timestamp: exp.expenseDate,
        status: exp.status,
        icon: 'CreditCard'
      });
    });

    // Sort by timestamp and return top N
    return formattedActivities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}

function getActivityIcon(type) {
  const icons = {
    task: 'CheckSquare',
    meeting: 'Calendar',
    call: 'Phone',
    email: 'Mail',
    project: 'Folder'
  };
  return icons[type] || 'Activity';
}

function formatCurrency(amount) {
  if (amount >= 1000000000) {
    return `₫${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `₫${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `₫${(amount / 1000).toFixed(0)}K`;
  }
  return `₫${amount}`;
}

async function getInsightsData(companyId) {
  try {
    if (!companyId) {
      return [];
    }

    const insights = [];

    // Sales insights
    const wonSales = await Sale.countDocuments({
      companyId,
      status: 'won',
      isDeleted: false
    });
    const totalSales = await Sale.countDocuments({
      companyId,
      isDeleted: false
    });
    const winRate = totalSales > 0 ? ((wonSales / totalSales) * 100).toFixed(0) : 0;

    if (winRate < 50 && totalSales > 10) {
      insights.push({
        type: 'warning',
        title: 'Tỷ lệ chốt deal thấp',
        message: `Tỷ lệ chốt deal hiện tại là ${winRate}%. Nên cải thiện quy trình bán hàng.`,
        priority: 'high'
      });
    } else if (winRate >= 70) {
      insights.push({
        type: 'success',
        title: 'Hiệu suất bán hàng tốt',
        message: `Tỷ lệ chốt deal đạt ${winRate}%. Duy trì phong độ!`,
        priority: 'low'
      });
    }

    // Expense insights
    const pendingExpenses = await CompanyExpense.countDocuments({
      companyId,
      status: 'submitted',
      isDeleted: false
    });

    if (pendingExpenses > 5) {
      insights.push({
        type: 'info',
        title: 'Chi phí chờ duyệt',
        message: `Có ${pendingExpenses} khoản chi đang chờ phê duyệt.`,
        priority: 'medium'
      });
    }

    // Activity insights
    const pendingTasks = await Activity.countDocuments({
      companyId,
      status: 'pending',
      isDeleted: false
    });
    const overdueTasks = await Activity.countDocuments({
      companyId,
      status: { $in: ['pending', 'in_progress'] },
      date: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      isDeleted: false
    });

    if (overdueTasks > 0) {
      insights.push({
        type: 'warning',
        title: 'Công việc quá hạn',
        message: `${overdueTasks} công việc đã quá hạn. Cần xem xét lại ưu tiên.`,
        priority: 'high'
      });
    }

    // Revenue trend insight
    const thisMonth = new Date();
    const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1);
    const thisMonthRevenue = await Sale.aggregate([
      {
        $match: {
          companyId,
          status: 'won',
          saleDate: {
            $gte: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
          },
          isDeleted: false
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const lastMonthRevenue = await Sale.aggregate([
      {
        $match: {
          companyId,
          status: 'won',
          saleDate: {
            $gte: lastMonth,
            $lt: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
          },
          isDeleted: false
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const current = thisMonthRevenue[0]?.total || 0;
    const previous = lastMonthRevenue[0]?.total || 0;

    if (current > previous * 1.2) {
      insights.push({
        type: 'success',
        title: 'Doanh thu tăng trưởng',
        message: `Doanh thu tháng này tăng ${(((current - previous) / previous) * 100).toFixed(0)}% so với tháng trước.`,
        priority: 'low'
      });
    } else if (current < previous * 0.8 && previous > 0) {
      insights.push({
        type: 'warning',
        title: 'Doanh thu giảm',
        message: `Doanh thu giảm ${(((previous - current) / previous) * 100).toFixed(0)}% so với tháng trước.`,
        priority: 'high'
      });
    }

    return insights;
  } catch (error) {
    console.error('Error fetching insights:', error);
    return [];
  }
}

async function getTopPerformersData(companyId, limit = 5) {
  try {
    if (!companyId) {
      return [];
    }

    // Get top performers based on sales
    const topSellers = await Sale.aggregate([
      {
        $match: {
          companyId,
          status: 'won',
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$userId',
          totalRevenue: { $sum: '$amount' },
          dealCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ]);

    // Get top performers based on completed activities
    const topWorkers = await Activity.aggregate([
      {
        $match: {
          companyId,
          status: 'completed',
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$userId',
          completedTasks: { $sum: 1 },
          totalDuration: { $sum: '$duration' }
        }
      },
      { $sort: { completedTasks: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ]);

    // Combine and score performers
    const performerMap = new Map();

    topSellers.forEach(seller => {
      const userId = seller._id.toString();
      performerMap.set(userId, {
        userId: seller._id,
        name: seller.user.name,
        email: seller.user.email,
        position: seller.user.position,
        department: seller.user.department,
        revenue: seller.totalRevenue,
        deals: seller.dealCount,
        tasks: 0,
        score: 0
      });
    });

    topWorkers.forEach(worker => {
      const userId = worker._id.toString();
      if (performerMap.has(userId)) {
        performerMap.get(userId).tasks = worker.completedTasks;
      } else {
        performerMap.set(userId, {
          userId: worker._id,
          name: worker.user.name,
          email: worker.user.email,
          position: worker.user.position,
          department: worker.user.department,
          revenue: 0,
          deals: 0,
          tasks: worker.completedTasks,
          score: 0
        });
      }
    });

    // Calculate composite score
    const performers = Array.from(performerMap.values());
    const maxRevenue = Math.max(...performers.map(p => p.revenue), 1);
    const maxTasks = Math.max(...performers.map(p => p.tasks), 1);

    performers.forEach(p => {
      const revenueScore = (p.revenue / maxRevenue) * 50;
      const taskScore = (p.tasks / maxTasks) * 50;
      p.score = Math.round(revenueScore + taskScore);
    });

    return performers
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(p => ({
        name: p.name,
        department: p.department,
        position: p.position,
        score: p.score,
        revenue: formatCurrency(p.revenue),
        deals: p.deals,
        tasks: p.tasks
      }));
  } catch (error) {
    console.error('Error fetching top performers:', error);
    return [];
  }
}
