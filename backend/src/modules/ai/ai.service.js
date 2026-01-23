const axios = require('axios');
const config = require('../../config/env');
const { buildCEOAssistantPrompt, buildAnalysisPrompt, buildSuggestionsPrompt } = require('../../utils/promptBuilder');
const logger = require('../../utils/logger');

// Multi-tenant conversation storage
const conversationsByCompany = {};

// Initialize company conversations if not exists
const initCompanyConversations = (companyId) => {
  const key = companyId?.toString() || 'default';
  if (!conversationsByCompany[key]) {
    conversationsByCompany[key] = {};
  }
  return conversationsByCompany[key];
};

// AI Service - Integrates with Anthropic Claude API
class AIService {
  constructor() {
    this.anthropicApiKey = config.ANTHROPIC_API_KEY;
    this.openaiApiKey = config.OPENAI_API_KEY;
    this.model = config.AI_MODEL || 'claude-sonnet-4-20250514';
    this.maxTokens = config.AI_MAX_TOKENS || 2000;
    this.temperature = config.AI_TEMPERATURE || 0.7;
  }

  /**
   * Generate AI response using Anthropic Claude API
   */
  async generateResponse({ message, conversationHistory = [], context = {} }) {
    try {
      logger.info('Generating AI response', { message: message.substring(0, 50) });

      const prompt = buildCEOAssistantPrompt(message, {
        ...context,
        conversationHistory
      });

      // Build messages array for Anthropic API
      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: prompt.system,
        messages: messages
      }, {
        headers: {
          'x-api-key': this.anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      });

      const aiMessage = response.data.content[0].text;

      logger.success('AI response generated successfully');
      return {
        message: aiMessage,
        conversationId: `conv_${Date.now()}`,
        timestamp: new Date().toISOString(),
        usage: response.data.usage
      };

    } catch (error) {
      logger.error('Error generating AI response:', error.response?.data || error.message);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Analyze business data using Anthropic Claude API
   */
  async analyzeData({ data, analysisType = 'general', parameters = {} }) {
    try {
      logger.info('Analyzing data', { analysisType });

      const prompt = buildAnalysisPrompt(data, analysisType);
      const systemPrompt = this.getAnalysisSystemPrompt(analysisType);

      const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: this.model,
        max_tokens: 4096,
        temperature: parameters.temperature || 0.3,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }, {
        headers: {
          'x-api-key': this.anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      });

      const aiText = response.data.content[0].text;
      const analysis = this.parseAnalysis(aiText, analysisType);

      logger.success('Data analysis completed');
      return {
        ...analysis,
        metadata: {
          analysisType,
          dataPoints: Object.keys(data).length,
          timestamp: new Date().toISOString(),
          model: this.model,
          tokensUsed: response.data.usage
        }
      };

    } catch (error) {
      logger.error('Error analyzing data:', error.response?.data || error.message);
      throw new Error('Failed to analyze data');
    }
  }

  /**
   * Get system prompt for analysis based on type
   */
  getAnalysisSystemPrompt(analysisType) {
    const prompts = {
      general: 'You are a business analyst AI assistant. Analyze the provided data and give clear, actionable insights.',
      financial: 'You are a financial analyst AI assistant. Provide detailed financial analysis with metrics, trends, and recommendations.',
      employee: 'You are an HR analytics AI assistant. Analyze workforce data and provide insights on performance, retention, and HR strategy.',
      market: 'You are a market research AI assistant. Analyze market data and provide competitive insights and strategic recommendations.',
      operations: 'You are an operations analyst AI assistant. Identify efficiency improvements, bottlenecks, and cost optimization opportunities.'
    };
    return prompts[analysisType] || prompts.general;
  }

  /**
   * Parse AI response into structured analysis format
   */
  parseAnalysis(aiText, analysisType) {
    // Simple parsing - in production you might want more sophisticated parsing
    return {
      insights: [aiText],
      recommendations: [],
      rawResponse: aiText
    };
  }

  /**
   * Generate AI-powered suggestions using Anthropic Claude API
   */
  async generateSuggestions({ context, category = 'general', constraints = {} }) {
    try {
      logger.info('Generating AI suggestions', { category });

      const prompt = buildSuggestionsPrompt(context, category);
      const systemPrompt = `You are a strategic business advisor AI. Generate actionable suggestions based on the provided context.

Return your response as a JSON object with this structure:
{
  "items": [
    {
      "title": "Brief title",
      "description": "Detailed description",
      "impact": "High/Medium/Low",
      "difficulty": "High/Medium/Low",
      "timeline": "Estimated timeline",
      "priority": "High/Medium/Low"
    }
  ],
  "priority": "Overall priority level",
  "confidence": 0.0-1.0
}

Only return valid JSON, no additional text.`;

      const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: this.model,
        max_tokens: 2048,
        temperature: 0.5,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }, {
        headers: {
          'x-api-key': this.anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      });

      const aiText = response.data.content[0].text;

      // Parse JSON response from AI
      let suggestions;
      try {
        suggestions = JSON.parse(aiText);
      } catch (parseError) {
        // If JSON parsing fails, return a structured response with the raw text
        logger.warn('Failed to parse AI suggestions as JSON, using raw response');
        suggestions = {
          items: [{
            title: 'AI Recommendation',
            description: aiText,
            impact: 'Medium',
            difficulty: 'Medium',
            timeline: 'To be determined',
            priority: 'Medium'
          }],
          priority: 'Medium',
          confidence: 0.7
        };
      }

      logger.success('Suggestions generated successfully');
      return suggestions;

    } catch (error) {
      logger.error('Error generating suggestions:', error.response?.data || error.message);
      throw new Error('Failed to generate suggestions');
    }
  }

  async processDocument({ filePath, fileName, mimeType, processingType = 'extraction' }) {
    try {
      logger.info('Processing document', { fileName, mimeType });

      // TODO: Implement document processing
      // - Extract text from document (PDF, DOCX, etc.)
      // - Send to AI for analysis
      // - Return structured data

      // Mock document processing response
      const mockResult = {
        data: {
          fileName,
          type: mimeType,
          extractedText: 'Sample extracted text from document...',
          entities: ['Revenue', 'Q4 2024', '$1.5M'],
          dates: ['2024-12-31'],
          financialFigures: ['$1.5M', '$2.3M']
        },
        summary: 'This document contains quarterly financial report with key performance indicators.',
        keyPoints: [
          'Revenue increased by 20%',
          'Operating expenses decreased by 5%',
          'Net profit margin improved to 15%'
        ]
      };

      logger.success('Document processed successfully');
      return mockResult;

    } catch (error) {
      logger.error('Error processing document:', error);
      throw new Error('Failed to process document');
    }
  }

  /**
   * Get conversation history for a company
   * @param {string} companyId - Company ID for multi-tenant filtering
   */
  async getConversationHistory({ companyId, conversationId, userId, page = 1, limit = 50 }) {
    try {
      logger.info('Retrieving conversation history', { companyId, conversationId, userId, page });

      const conversations = initCompanyConversations(companyId);
      const conversation = conversations[conversationId];

      if (!conversation) {
        // Return mock data if no conversation exists
        return {
          items: [
            {
              id: 'msg_1',
              conversationId: conversationId || 'conv_123',
              userId: userId || 'user_456',
              role: 'user',
              content: 'Dự báo doanh thu Q4 của chúng ta như thế nào?',
              timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: 'msg_2',
              conversationId: conversationId || 'conv_123',
              userId: userId || 'user_456',
              role: 'assistant',
              content: 'Dựa trên xu hướng hiện tại, doanh thu Q4 dự kiến đạt 2.5 tỷ VND...',
              timestamp: new Date(Date.now() - 3500000).toISOString()
            }
          ],
          totalPages: 1,
          totalItems: 2,
          currentPage: page
        };
      }

      // Paginate results
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = conversation.messages.slice(startIndex, endIndex);

      logger.success('Conversation history retrieved');
      return {
        items: paginatedItems,
        totalPages: Math.ceil(conversation.messages.length / limit),
        totalItems: conversation.messages.length,
        currentPage: page
      };

    } catch (error) {
      logger.error('Error retrieving conversation history:', error);
      throw new Error('Failed to retrieve conversation history');
    }
  }

  /**
   * Save message to conversation
   * @param {string} companyId - Company ID for multi-tenant filtering
   */
  async saveMessage({ companyId, conversationId, userId, role, content }) {
    try {
      const conversations = initCompanyConversations(companyId);

      if (!conversations[conversationId]) {
        conversations[conversationId] = {
          id: conversationId,
          companyId,
          userId,
          messages: [],
          createdAt: new Date().toISOString()
        };
      }

      const message = {
        id: `msg_${Date.now()}`,
        conversationId,
        userId,
        role,
        content,
        timestamp: new Date().toISOString()
      };

      conversations[conversationId].messages.push(message);
      conversations[conversationId].updatedAt = new Date().toISOString();

      return message;
    } catch (error) {
      logger.error('Error saving message:', error);
      throw new Error('Failed to save message');
    }
  }

  /**
   * Delete conversation for a company
   * @param {string} companyId - Company ID for multi-tenant filtering
   */
  async deleteConversation(companyId, conversationId) {
    try {
      logger.info('Deleting conversation', { companyId, conversationId });

      const conversations = initCompanyConversations(companyId);

      if (conversations[conversationId]) {
        delete conversations[conversationId];
        logger.success('Conversation deleted successfully');
        return { success: true };
      }

      return { success: false, message: 'Conversation not found' };

    } catch (error) {
      logger.error('Error deleting conversation:', error);
      throw new Error('Failed to delete conversation');
    }
  }

  /**
   * List all conversations for a company
   * @param {string} companyId - Company ID for multi-tenant filtering
   */
  async listConversations(companyId, userId = null) {
    try {
      const conversations = initCompanyConversations(companyId);
      let conversationList = Object.values(conversations);

      // Filter by userId if provided
      if (userId) {
        conversationList = conversationList.filter(c => c.userId === userId);
      }

      // Sort by updatedAt descending
      conversationList.sort((a, b) =>
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );

      return conversationList.map(c => ({
        id: c.id,
        userId: c.userId,
        messageCount: c.messages.length,
        lastMessage: c.messages[c.messages.length - 1]?.content?.substring(0, 100),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      }));

    } catch (error) {
      logger.error('Error listing conversations:', error);
      throw new Error('Failed to list conversations');
    }
  }
}

module.exports = new AIService();
