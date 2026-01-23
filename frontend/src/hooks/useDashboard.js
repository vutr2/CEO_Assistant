'use client';

import { useState, useCallback, useEffect } from 'react';
import { dashboardAPI } from '@/lib/api';

/**
 * Custom hook for dashboard data management
 * Provides methods to fetch dashboard metrics, activities, insights, and top performers
 *
 * @returns {Object} Dashboard state and methods
 */
export const useDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [insights, setInsights] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch dashboard metrics (revenue, expenses, employees, growth)
   */
  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getMetrics();
      setMetrics(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch dashboard metrics';
      setError(errorMessage);
      console.error('Error fetching dashboard metrics:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch recent activities
   * @param {number} limit - Maximum number of activities to fetch
   */
  const fetchActivities = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getActivities(limit);
      setActivities(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch activities';
      setError(errorMessage);
      console.error('Error fetching activities:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch AI-powered insights
   */
  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getInsights();
      setInsights(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch insights';
      setError(errorMessage);
      console.error('Error fetching insights:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch top performing employees
   * @param {number} limit - Maximum number of performers to fetch
   */
  const fetchTopPerformers = useCallback(async (limit = 5) => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getTopPerformers(limit);
      setTopPerformers(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch top performers';
      setError(errorMessage);
      console.error('Error fetching top performers:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all dashboard data at once
   * @param {Object} options - Fetch options
   * @param {number} options.activitiesLimit - Limit for activities
   * @param {number} options.performersLimit - Limit for top performers
   */
  const fetchAllData = useCallback(async (options = {}) => {
    const { activitiesLimit = 10, performersLimit = 5 } = options;

    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel for better performance
      const [metricsRes, activitiesRes, insightsRes, performersRes] = await Promise.all([
        dashboardAPI.getMetrics(),
        dashboardAPI.getActivities(activitiesLimit),
        dashboardAPI.getInsights(),
        dashboardAPI.getTopPerformers(performersLimit),
      ]);

      setMetrics(metricsRes.data);
      setActivities(activitiesRes.data);
      setInsights(insightsRes.data);
      setTopPerformers(performersRes.data);

      return {
        metrics: metricsRes.data,
        activities: activitiesRes.data,
        insights: insightsRes.data,
        topPerformers: performersRes.data,
      };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch dashboard data';
      setError(errorMessage);
      console.error('Error fetching dashboard data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh all dashboard data
   */
  const refreshDashboard = useCallback(async () => {
    return fetchAllData();
  }, [fetchAllData]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear all dashboard data
   */
  const clearData = useCallback(() => {
    setMetrics(null);
    setActivities([]);
    setInsights([]);
    setTopPerformers([]);
    setError(null);
  }, []);

  /**
   * Auto-fetch dashboard data on mount
   */
  useEffect(() => {
    fetchAllData().catch(err => {
      console.error('Failed to auto-fetch dashboard data:', err);
    });
  }, [fetchAllData]);

  return {
    // State
    metrics,
    activities,
    insights,
    topPerformers,
    loading,
    error,

    // Methods
    fetchMetrics,
    fetchActivities,
    fetchInsights,
    fetchTopPerformers,
    fetchAllData,
    refreshDashboard,
    clearError,
    clearData,
  };
};

export default useDashboard;
