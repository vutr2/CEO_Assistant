import { useState, useCallback, useEffect } from 'react';
import { companyAPI } from '@/lib/api';

/**
 * Custom hook for company management
 * Provides methods to get and update company data
 */
export const useCompany = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch company profile
   * @returns {Promise<object>} Company data
   */
  const fetchCompany = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await companyAPI.getProfile();
      setCompany(response.data);

      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch company data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update company profile
   * @param {object} companyData - Updated company data
   * @returns {Promise<object>} Updated company data
   */
  const updateCompany = useCallback(async (companyData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await companyAPI.updateProfile(companyData);
      setCompany(response.data);

      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update company';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get company settings
   * @returns {Promise<object>} Company settings
   */
  const getSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await companyAPI.getSettings();
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch settings';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update company settings
   * @param {object} settings - Updated settings
   * @returns {Promise<object>} Updated settings
   */
  const updateSettings = useCallback(async (settings) => {
    try {
      setLoading(true);
      setError(null);

      const response = await companyAPI.updateSettings(settings);
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update settings';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch company on mount
  useEffect(() => {
    fetchCompany().catch((err) => {
      console.error('Error fetching company:', err);
    });
  }, [fetchCompany]);

  return {
    // State
    company,
    loading,
    error,

    // Methods
    fetchCompany,
    updateCompany,
    getSettings,
    updateSettings,
    clearError,
  };
};

export default useCompany;
