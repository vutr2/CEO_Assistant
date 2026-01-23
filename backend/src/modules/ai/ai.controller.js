// ============================================================================
// AI CONTROLLER - Step-by-Step Instructions
// ============================================================================
// This controller handles all AI-related API endpoints for the CEO AI Assistant
// It processes requests from clients and interacts with AI services

// ----------------------------------------------------------------------------
// STEP 1: Import Required Dependencies
// ----------------------------------------------------------------------------
// Import the AI service that contains the business logic for AI operations
// Import any validation schemas or middleware needed for request handling
// Import error handling utilities

const aiService = require('./ai.service');

// ----------------------------------------------------------------------------
// STEP 2: Define Controller Methods
// ----------------------------------------------------------------------------
// Each method corresponds to a specific API endpoint
// Methods follow the pattern: async (req, res, next) => { ... }

/**
 * STEP 2.1: Generate AI Response
 * Purpose: Handle requests to generate AI-powered responses
 *
 * Flow:
 * 1. Extract the user's message/prompt from request body
 * 2. Optionally extract conversation history or context
 * 3. Validate the input data
 * 4. Call the AI service to generate a response
 * 5. Return the AI response to the client
 * 6. Handle any errors that occur during the process
 */
const generateResponse = async (req, res, next) => {
  try {
    // STEP 2.1.1: Extract data from request body
    const { message, conversationHistory, context } = req.body;

    // STEP 2.1.2: Validate required fields
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // STEP 2.1.3: Call the AI service to generate response
    // Pass the message and any additional context to the service layer
    const aiResponse = await aiService.generateResponse({
      message,
      conversationHistory: conversationHistory || [],
      context: context || {}
    });

    // STEP 2.1.4: Send successful response back to client
    res.status(200).json({
      success: true,
      data: {
        response: aiResponse.message,
        conversationId: aiResponse.conversationId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    // STEP 2.1.5: Handle errors and pass to error handling middleware
    console.error('Error in generateResponse:', error);
    next(error);
  }
};

/**
 * STEP 2.2: Analyze Business Data
 * Purpose: Analyze business metrics, reports, or data using AI
 *
 * Flow:
 * 1. Extract the data to be analyzed from request
 * 2. Extract analysis type or parameters
 * 3. Validate input data
 * 4. Call AI service for analysis
 * 5. Return structured analysis results
 */
const analyzeData = async (req, res, next) => {
  try {
    // STEP 2.2.1: Extract analysis parameters
    const { data, analysisType, parameters } = req.body;

    // STEP 2.2.2: Validate required fields
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data to analyze is required'
      });
    }

    // STEP 2.2.3: Call AI service for data analysis
    const analysis = await aiService.analyzeData({
      data,
      analysisType: analysisType || 'general',
      parameters: parameters || {}
    });

    // STEP 2.2.4: Return analysis results
    res.status(200).json({
      success: true,
      data: {
        analysis: analysis.insights,
        recommendations: analysis.recommendations,
        metadata: analysis.metadata
      }
    });

  } catch (error) {
    // STEP 2.2.5: Error handling
    console.error('Error in analyzeData:', error);
    next(error);
  }
};

/**
 * STEP 2.3: Get AI Suggestions
 * Purpose: Get AI-powered suggestions for business decisions
 *
 * Flow:
 * 1. Extract the context for which suggestions are needed
 * 2. Extract any constraints or preferences
 * 3. Call AI service to generate suggestions
 * 4. Return prioritized suggestions
 */
const getSuggestions = async (req, res, next) => {
  try {
    // STEP 2.3.1: Extract request parameters
    const { context, category, constraints } = req.body;

    // STEP 2.3.2: Validate input
    if (!context) {
      return res.status(400).json({
        success: false,
        error: 'Context is required for generating suggestions'
      });
    }

    // STEP 2.3.3: Generate AI suggestions
    const suggestions = await aiService.generateSuggestions({
      context,
      category: category || 'general',
      constraints: constraints || {}
    });

    // STEP 2.3.4: Return suggestions
    res.status(200).json({
      success: true,
      data: {
        suggestions: suggestions.items,
        priority: suggestions.priority,
        confidence: suggestions.confidence
      }
    });

  } catch (error) {
    // STEP 2.3.5: Error handling
    console.error('Error in getSuggestions:', error);
    next(error);
  }
};

/**
 * STEP 2.4: Process Document
 * Purpose: Process and extract insights from uploaded documents
 *
 * Flow:
 * 1. Get the uploaded file from request
 * 2. Validate file type and size
 * 3. Extract text/data from document
 * 4. Process through AI service
 * 5. Return extracted insights
 */
const processDocument = async (req, res, next) => {
  try {
    // STEP 2.4.1: Get uploaded file
    const file = req.file;
    const { processingType } = req.body;

    // STEP 2.4.2: Validate file exists
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // STEP 2.4.3: Process document through AI service
    const result = await aiService.processDocument({
      filePath: file.path,
      fileName: file.originalname,
      mimeType: file.mimetype,
      processingType: processingType || 'extraction'
    });

    // STEP 2.4.4: Return processing results
    res.status(200).json({
      success: true,
      data: {
        extractedData: result.data,
        summary: result.summary,
        keyPoints: result.keyPoints
      }
    });

  } catch (error) {
    // STEP 2.4.5: Error handling
    console.error('Error in processDocument:', error);
    next(error);
  }
};

/**
 * STEP 2.5: Get Conversation History
 * Purpose: Retrieve past AI conversation history
 *
 * Flow:
 * 1. Extract user ID or conversation ID from request
 * 2. Extract pagination parameters
 * 3. Query conversation history from service
 * 4. Return paginated history
 */
const getConversationHistory = async (req, res, next) => {
  try {
    // STEP 2.5.1: Extract query parameters
    const { conversationId, userId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    // STEP 2.5.2: Validate required parameters
    if (!conversationId && !userId) {
      return res.status(400).json({
        success: false,
        error: 'Either conversationId or userId is required'
      });
    }

    // STEP 2.5.3: Retrieve conversation history
    const history = await aiService.getConversationHistory({
      conversationId,
      userId,
      page,
      limit
    });

    // STEP 2.5.4: Return history with pagination info
    res.status(200).json({
      success: true,
      data: {
        conversations: history.items,
        pagination: {
          currentPage: page,
          totalPages: history.totalPages,
          totalItems: history.totalItems,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    // STEP 2.5.5: Error handling
    console.error('Error in getConversationHistory:', error);
    next(error);
  }
};

/**
 * STEP 2.6: Clear Conversation
 * Purpose: Delete or clear a conversation history
 *
 * Flow:
 * 1. Extract conversation ID from request
 * 2. Verify user has permission to delete
 * 3. Call service to delete conversation
 * 4. Return confirmation
 */
const clearConversation = async (req, res, next) => {
  try {
    // STEP 2.6.1: Extract conversation ID
    const { conversationId } = req.params;

    // STEP 2.6.2: Validate conversation ID
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID is required'
      });
    }

    // STEP 2.6.3: Delete conversation
    await aiService.deleteConversation(conversationId);

    // STEP 2.6.4: Return success confirmation
    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    // STEP 2.6.5: Error handling
    console.error('Error in clearConversation:', error);
    next(error);
  }
};

/**
 * STEP 2.7: Get Suggested Questions
 * Purpose: Get suggested questions for the AI chat interface
 *
 * Flow:
 * 1. Return a list of pre-defined suggested questions
 * 2. Questions help users get started with AI assistant
 */
const getSuggestedQuestions = async (req, res, next) => {
  try {
    // STEP 2.7.1: Define suggested questions
    const suggestedQuestions = [
      {
        id: 1,
        question: 'Phân tích hiệu suất kinh doanh tháng này',
        category: 'business'
      },
      {
        id: 2,
        question: 'Đề xuất chiến lược tăng doanh thu',
        category: 'strategy'
      },
      {
        id: 3,
        question: 'Tổng hợp báo cáo nhân sự',
        category: 'hr'
      },
      {
        id: 4,
        question: 'Dự báo tài chính quý tới',
        category: 'finance'
      },
      {
        id: 5,
        question: 'Phân tích xu hướng thị trường',
        category: 'market'
      },
      {
        id: 6,
        question: 'Đánh giá hiệu quả marketing',
        category: 'marketing'
      }
    ];

    // STEP 2.7.2: Return suggested questions
    res.status(200).json({
      success: true,
      data: suggestedQuestions
    });

  } catch (error) {
    // STEP 2.7.3: Error handling
    console.error('Error in getSuggestedQuestions:', error);
    next(error);
  }
};

/**
 * STEP 2.8: Chat with AI
 * Purpose: Handle chat messages from the AI assistant interface
 *
 * Flow:
 * 1. Extract message and context from request
 * 2. Process the message and generate AI response using Anthropic API
 * 3. Return the response to the client
 */
const chat = async (req, res, next) => {
  try {
    // STEP 2.8.1: Extract message and context
    const { message, context = {} } = req.body;

    // STEP 2.8.2: Validate message
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Tin nhắn không được để trống'
      });
    }

    // STEP 2.8.3: Generate AI response using the AI service
    const aiResponse = await aiService.generateResponse({
      message,
      conversationHistory: context.conversationHistory || [],
      context: {
        companyData: context.companyData || {},
        recentMetrics: context.recentMetrics || {},
        userRole: context.userRole || 'CEO'
      }
    });

    // STEP 2.8.4: Return response
    res.status(200).json({
      success: true,
      data: {
        message: aiResponse.message,
        conversationId: aiResponse.conversationId,
        timestamp: aiResponse.timestamp
      }
    });

  } catch (error) {
    // STEP 2.8.5: Error handling
    console.error('Error in chat:', error);
    next(error);
  }
};

// ----------------------------------------------------------------------------
// STEP 3: Export Controller Methods
// ----------------------------------------------------------------------------
// Export all controller methods so they can be used in route definitions
module.exports = {
  generateResponse,
  analyzeData,
  getSuggestions,
  processDocument,
  getConversationHistory,
  clearConversation,
  getSuggestedQuestions,
  chat
};

// ============================================================================
// USAGE NOTES:
// ============================================================================
// 1. These controller methods should be connected to routes in ai.routes.js
// 2. Add authentication middleware before sensitive endpoints
// 3. Add rate limiting for AI endpoints to prevent abuse
// 4. Implement request validation middleware for better error handling
// 5. Add logging for monitoring and debugging purposes
// 6. Consider implementing caching for frequently requested AI operations
// 7. Add CORS configuration if frontend is on a different domain
// 8. Implement proper error responses with appropriate HTTP status codes
// ============================================================================
