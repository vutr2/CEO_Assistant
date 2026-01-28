const activitiesService = require('./activities.service');
const logger = require('../../utils/logger');

const activitiesController = {
  /**
   * Create new activity
   * POST /api/v1/activities
   */
  createActivity: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;

      const activity = await activitiesService.createActivity(companyId, userId, req.body);

      res.status(201).json({
        success: true,
        data: activity
      });
    } catch (error) {
      logger.error('Error in createActivity:', error);
      next(error);
    }
  },

  /**
   * Get all activities
   * GET /api/v1/activities
   */
  getActivities: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const result = await activitiesService.getActivities(companyId, req.query);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('Error in getActivities:', error);
      next(error);
    }
  },

  /**
   * Get activity by ID
   * GET /api/v1/activities/:id
   */
  getActivityById: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const { id } = req.params;

      const activity = await activitiesService.getActivityById(companyId, id);

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activity not found'
        });
      }

      res.status(200).json({
        success: true,
        data: activity
      });
    } catch (error) {
      logger.error('Error in getActivityById:', error);
      next(error);
    }
  },

  /**
   * Update activity
   * PUT /api/v1/activities/:id
   */
  updateActivity: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      const { id } = req.params;

      const activity = await activitiesService.updateActivity(companyId, id, userId, req.body);

      res.status(200).json({
        success: true,
        data: activity
      });
    } catch (error) {
      logger.error('Error in updateActivity:', error);
      next(error);
    }
  },

  /**
   * Delete activity
   * DELETE /api/v1/activities/:id
   */
  deleteActivity: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      const { id } = req.params;

      const result = await activitiesService.deleteActivity(companyId, id, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error('Error in deleteActivity:', error);
      next(error);
    }
  },

  /**
   * Get activity statistics
   * GET /api/v1/activities/stats
   */
  getActivityStats: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const stats = await activitiesService.getActivityStats(companyId, req.query);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error in getActivityStats:', error);
      next(error);
    }
  },

  /**
   * Get top performers
   * GET /api/v1/activities/top-performers
   */
  getTopPerformers: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const performers = await activitiesService.getTopPerformers(companyId, req.query);

      res.status(200).json({
        success: true,
        data: performers
      });
    } catch (error) {
      logger.error('Error in getTopPerformers:', error);
      next(error);
    }
  }
};

module.exports = activitiesController;
