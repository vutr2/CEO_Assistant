import { useState, useCallback } from 'react';
import { aiAPI } from '@/lib/api';

/**
 * Custom hook for AI interactions
 * Provides methods to chat with AI, get suggestions, and insights
 */
export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  /**
   * Send a chat message to the AI
   * @param {string} message - The user's message
   * @param {object} context - Additional context for the AI
   * @returns {Promise<object>} AI response
   */
  const chat = useCallback(async (message, context = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await aiAPI.chat(message, context);

      setResponse(result.data);
      return result.data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to get AI response';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get AI-generated insights
   * @param {string} category - Category of insights ('all', 'finance', 'hr', etc.)
   * @returns {Promise<array>} Array of insights
   */
  const getInsights = useCallback(async (category = 'all') => {
    try {
      setLoading(true);
      setError(null);

      const result = await aiAPI.getInsights(category);

      setResponse(result.data);
      return result.data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to get insights';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get suggested questions
   * @returns {Promise<array>} Array of suggested questions
   */
  const getSuggestedQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await aiAPI.getSuggestedQuestions();

      setResponse(result.data);
      return result.data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to get suggestions';
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

  /**
   * Clear response state
   */
  const clearResponse = useCallback(() => {
    setResponse(null);
  }, []);

  return {
    // State
    loading,
    error,
    response,

    // Methods
    chat,
    getInsights,
    getSuggestedQuestions,
    clearError,
    clearResponse,
  };
};

export default useAI;
