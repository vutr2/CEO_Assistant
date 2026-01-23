const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');

// AI Routes
router.get('/suggested-questions', aiController.getSuggestedQuestions);
router.post('/chat', aiController.chat);
router.post('/generate', aiController.generateResponse);
router.post('/analyze', aiController.analyzeData);
router.post('/suggestions', aiController.getSuggestions);
router.post('/process-document', aiController.processDocument);
router.get('/conversations', aiController.getConversationHistory);
router.delete('/conversations/:conversationId', aiController.clearConversation);

module.exports = router;
