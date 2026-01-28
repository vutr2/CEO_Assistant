const express = require('express');
const router = express.Router();
const salesController = require('./sales.controller');
const { authenticate, requireCompany, authorize } = require('../../middlewares/auth');

// Apply authentication to all routes
router.use(authenticate);
router.use(requireCompany);

// Sales routes
router.post('/', salesController.createSale);
router.get('/', salesController.getSales);
router.get('/stats', salesController.getSalesStats);
router.get('/top-performers', salesController.getTopSalesPerformers);
router.get('/trends', salesController.getRevenueTrends);
router.get('/pending', salesController.getPendingSales);
router.get('/:id', salesController.getSaleById);
router.put('/:id', salesController.updateSale);
router.delete('/:id', salesController.deleteSale);

// Approval routes (managers/admins only) - syncs to Finance when approved
router.post('/:id/approve', authorize('owner', 'admin', 'manager'), salesController.approveSale);
router.post('/:id/reject', authorize('owner', 'admin', 'manager'), salesController.rejectSale);

module.exports = router;
