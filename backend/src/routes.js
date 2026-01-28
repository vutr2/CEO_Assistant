const express = require('express');
const router = express.Router();

// Import all module routes
const aiRoutes = require('./modules/ai/ai.routes');
const authRoutes = require('./modules/auth/auth.routes');
const companyRoutes = require('./modules/company/company.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const employeeRoutes = require('./modules/employee/employee.routes');
const financeRoutes = require('./modules/finance/finance.routes');
const reportsRoutes = require('./modules/reports/reports.routes');
const paymentRoutes = require('./modules/payment/payment.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');
const usersRoutes = require('./modules/users/users.routes');
const billingRoutes = require('./modules/billing/billing.routes');
const activitiesRoutes = require('./modules/activities/activities.routes');
const salesRoutes = require('./modules/sales/sales.routes');
const expensesRoutes = require('./modules/expenses/expenses.routes');

// API Info endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CEO AI Assistant API v1',
    version: '1.0.0',
    endpoints: {
      ai: '/api/v1/ai',
      auth: '/api/v1/auth',
      company: '/api/v1/company',
      dashboard: '/api/v1/dashboard',
      employees: '/api/v1/employees',
      finance: '/api/v1/finance',
      reports: '/api/v1/reports',
      payment: '/api/v1/payment',
      notifications: '/api/v1/notifications',
      activities: '/api/v1/activities',
      sales: '/api/v1/sales',
      expenses: '/api/v1/expenses',
    },
    documentation: 'https://docs.ceoai-assistant.com',
  });
});

// Mount routes
router.use('/ai', aiRoutes);
router.use('/auth', authRoutes);
router.use('/company', companyRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/employees', employeeRoutes);
router.use('/finance', financeRoutes);
router.use('/reports', reportsRoutes);
router.use('/payment', paymentRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/users', usersRoutes);
router.use('/billing', billingRoutes);
router.use('/activities', activitiesRoutes);
router.use('/sales', salesRoutes);
router.use('/expenses', expensesRoutes);

module.exports = router;
