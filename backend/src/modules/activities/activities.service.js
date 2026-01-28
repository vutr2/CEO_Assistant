/**
 * Activities Service
 * Business logic for employee activities and tasks
 */

const Activity = require('../../models/Activity');
const logger = require('../../utils/logger');

const activitiesService = {
  /**
   * Create new activity
   */
  createActivity: async (companyId, userId, activityData) => {
    try {
      const activity = await Activity.create({
        companyId,
        userId,
        ...activityData
      });

      await activity.populate('user', 'name email position department');

      return activity;
    } catch (error) {
      logger.error('Error creating activity:', error);
      throw error;
    }
  },

  /**
   * Get all activities with filters
   */
  getActivities: async (companyId, filters = {}) => {
    try {
      const {
        userId,
        status,
        type,
        category,
        priority,
        startDate,
        endDate,
        department,
        limit = 50,
        offset = 0,
        sortBy = 'date',
        sortOrder = 'desc'
      } = filters;

      const query = { companyId, isDeleted: false };

      if (userId) query.userId = userId;
      if (status) query.status = status;
      if (type) query.type = type;
      if (category) query.category = category;
      if (priority) query.priority = priority;
      if (department) query.department = department;

      // Date range filter
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const activities = await Activity.find(query)
        .populate('user', 'name email position department')
        .populate('assignedTo', 'name email position')
        .sort(sort)
        .skip(parseInt(offset))
        .limit(parseInt(limit));

      const total = await Activity.countDocuments(query);

      return {
        data: activities,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
    } catch (error) {
      logger.error('Error getting activities:', error);
      throw error;
    }
  },

  /**
   * Get activity by ID
   */
  getActivityById: async (companyId, activityId) => {
    try {
      const activity = await Activity.findOne({
        _id: activityId,
        companyId,
        isDeleted: false
      }).populate('user', 'name email position department')
        .populate('assignedTo', 'name email position');

      return activity;
    } catch (error) {
      logger.error('Error getting activity by ID:', error);
      throw error;
    }
  },

  /**
   * Update activity
   */
  updateActivity: async (companyId, activityId, userId, updateData) => {
    try {
      const activity = await Activity.findOne({
        _id: activityId,
        companyId,
        isDeleted: false
      });

      if (!activity) {
        throw new Error('Activity not found');
      }

      // Check ownership (only owner or assigned users can update)
      const canUpdate = activity.userId.toString() === userId.toString() ||
                       activity.assignedTo.some(id => id.toString() === userId.toString());

      if (!canUpdate) {
        throw new Error('Unauthorized to update this activity');
      }

      // Update completed date if status changed to completed
      if (updateData.status === 'completed' && activity.status !== 'completed') {
        updateData.completedAt = new Date();
      }

      Object.assign(activity, updateData);
      await activity.save();
      await activity.populate('user', 'name email position department');

      return activity;
    } catch (error) {
      logger.error('Error updating activity:', error);
      throw error;
    }
  },

  /**
   * Delete activity (soft delete)
   */
  deleteActivity: async (companyId, activityId, userId) => {
    try {
      const activity = await Activity.findOne({
        _id: activityId,
        companyId,
        isDeleted: false
      });

      if (!activity) {
        throw new Error('Activity not found');
      }

      // Only owner can delete
      if (activity.userId.toString() !== userId.toString()) {
        throw new Error('Unauthorized to delete this activity');
      }

      activity.isDeleted = true;
      await activity.save();

      return { message: 'Activity deleted successfully' };
    } catch (error) {
      logger.error('Error deleting activity:', error);
      throw error;
    }
  },

  /**
   * Get activity statistics
   */
  getActivityStats: async (companyId, filters = {}) => {
    try {
      const { userId, startDate, endDate, department } = filters;

      const matchQuery = { companyId, isDeleted: false };
      if (userId) matchQuery.userId = userId;
      if (department) matchQuery.department = department;
      if (startDate || endDate) {
        matchQuery.date = {};
        if (startDate) matchQuery.date.$gte = new Date(startDate);
        if (endDate) matchQuery.date.$lte = new Date(endDate);
      }

      const stats = await Activity.aggregate([
        { $match: matchQuery },
        {
          $facet: {
            byStatus: [
              { $group: { _id: '$status', count: { $sum: 1 } } }
            ],
            byType: [
              { $group: { _id: '$type', count: { $sum: 1 } } }
            ],
            byPriority: [
              { $group: { _id: '$priority', count: { $sum: 1 } } }
            ],
            totalDuration: [
              { $group: { _id: null, total: { $sum: '$duration' } } }
            ],
            completedTasks: [
              { $match: { status: 'completed' } },
              { $count: 'count' }
            ]
          }
        }
      ]);

      const result = stats[0];

      return {
        byStatus: result.byStatus,
        byType: result.byType,
        byPriority: result.byPriority,
        totalDuration: result.totalDuration[0]?.total || 0,
        completedCount: result.completedTasks[0]?.count || 0
      };
    } catch (error) {
      logger.error('Error getting activity stats:', error);
      throw error;
    }
  },

  /**
   * Get top performers by activity completion
   */
  getTopPerformers: async (companyId, filters = {}) => {
    try {
      const { startDate, endDate, limit = 10 } = filters;

      const matchQuery = { companyId, isDeleted: false, status: 'completed' };
      if (startDate || endDate) {
        matchQuery.completedAt = {};
        if (startDate) matchQuery.completedAt.$gte = new Date(startDate);
        if (endDate) matchQuery.completedAt.$lte = new Date(endDate);
      }

      const topPerformers = await Activity.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$userId',
            completedTasks: { $sum: 1 },
            totalDuration: { $sum: '$duration' }
          }
        },
        { $sort: { completedTasks: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            userId: '$_id',
            name: '$user.name',
            email: '$user.email',
            position: '$user.position',
            department: '$user.department',
            completedTasks: 1,
            totalDuration: 1
          }
        }
      ]);

      return topPerformers;
    } catch (error) {
      logger.error('Error getting top performers:', error);
      throw error;
    }
  }
};

module.exports = activitiesService;
