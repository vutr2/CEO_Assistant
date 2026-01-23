// Multi-tenant Billing Service
// Data is stored per company using companyId as key

const dataByCompany = {};
let paymentIdCounter = 1;
let methodIdCounter = 1;

// Initialize company data if not exists
const initCompanyData = (companyId) => {
  const key = companyId?.toString() || 'default';
  if (!dataByCompany[key]) {
    dataByCompany[key] = {
      payments: [],
      paymentMethods: [],
      subscription: null
    };
    generateMockBillingDataForCompany(key);
  }
  return dataByCompany[key];
};

// Generate mock billing data for a company
const generateMockBillingDataForCompany = (companyKey) => {
  const data = dataByCompany[companyKey];

  // Payment history
  data.payments = [
    {
      id: paymentIdCounter++,
      companyId: companyKey,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 2500000,
      status: 'completed',
      method: 'VNPay',
      description: 'Gói Premium - Tháng 12/2025',
      transactionId: `VNP${Date.now()}123`
    },
    {
      id: paymentIdCounter++,
      companyId: companyKey,
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 2500000,
      status: 'completed',
      method: 'Momo',
      description: 'Gói Premium - Tháng 11/2025',
      transactionId: `MOMO${Date.now()}456`
    },
    {
      id: paymentIdCounter++,
      companyId: companyKey,
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 2500000,
      status: 'completed',
      method: 'VNPay',
      description: 'Gói Premium - Tháng 10/2025',
      transactionId: `VNP${Date.now()}789`
    }
  ];

  // Payment methods
  data.paymentMethods = [
    {
      id: methodIdCounter++,
      companyId: companyKey,
      type: 'vnpay',
      name: 'VNPay',
      lastFour: null,
      isDefault: true,
      icon: 'Building2'
    },
    {
      id: methodIdCounter++,
      companyId: companyKey,
      type: 'momo',
      name: 'Ví Momo',
      lastFour: null,
      isDefault: false,
      icon: 'Smartphone'
    }
  ];

  // Subscription
  data.subscription = {
    companyId: companyKey,
    plan: 'premium',
    planName: 'Premium',
    status: 'active',
    price: 2500000,
    currency: 'VND',
    interval: 'month',
    currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false,
    features: [
      'Không giới hạn người dùng',
      '500 GB lưu trữ',
      'Trợ lý AI không giới hạn',
      'Hỗ trợ 24/7',
      'API tích hợp'
    ]
  };
};

const billingService = {
  /**
   * Get payment history for a company
   * @param {string} companyId - Company ID for multi-tenant filtering
   */
  getPaymentHistory: async (companyId, params = {}) => {
    const data = initCompanyData(companyId);
    const { limit = 10, offset = 0 } = params;
    const paginatedHistory = data.payments.slice(offset, offset + limit);

    return {
      data: paginatedHistory,
      total: data.payments.length
    };
  },

  /**
   * Get payment methods for a company
   */
  getPaymentMethods: async (companyId) => {
    const data = initCompanyData(companyId);
    return data.paymentMethods;
  },

  /**
   * Add payment method
   */
  addPaymentMethod: async (companyId, methodData) => {
    const data = initCompanyData(companyId);
    const newMethod = {
      id: methodIdCounter++,
      companyId,
      ...methodData,
      isDefault: data.paymentMethods.length === 0
    };
    data.paymentMethods.push(newMethod);
    return newMethod;
  },

  /**
   * Update payment method
   */
  updatePaymentMethod: async (companyId, id, updateData) => {
    const data = initCompanyData(companyId);
    const index = data.paymentMethods.findIndex(m => m.id === parseInt(id));
    if (index !== -1) {
      // If setting as default, unset others
      if (updateData.isDefault) {
        data.paymentMethods.forEach(m => m.isDefault = false);
      }
      data.paymentMethods[index] = { ...data.paymentMethods[index], ...updateData };
      return data.paymentMethods[index];
    }
    return null;
  },

  /**
   * Delete payment method
   */
  deletePaymentMethod: async (companyId, id) => {
    const data = initCompanyData(companyId);
    const index = data.paymentMethods.findIndex(m => m.id === parseInt(id));
    if (index !== -1) {
      data.paymentMethods.splice(index, 1);
      return { success: true };
    }
    return null;
  },

  /**
   * Get subscription info for a company
   */
  getSubscription: async (companyId) => {
    const data = initCompanyData(companyId);
    return data.subscription;
  },

  /**
   * Update subscription
   */
  updateSubscription: async (companyId, subscriptionData) => {
    const data = initCompanyData(companyId);
    data.subscription = {
      ...data.subscription,
      ...subscriptionData,
      updatedAt: new Date().toISOString()
    };
    return data.subscription;
  },

  /**
   * Add payment record
   */
  addPayment: async (companyId, paymentData) => {
    const data = initCompanyData(companyId);
    const newPayment = {
      id: paymentIdCounter++,
      companyId,
      ...paymentData,
      date: new Date().toISOString()
    };
    data.payments.unshift(newPayment);
    return newPayment;
  },

  /**
   * Get invoices for a company
   */
  getInvoices: async (companyId, params = {}) => {
    const data = initCompanyData(companyId);
    const { limit = 10, offset = 0 } = params;

    // Convert payments to invoices format
    const invoices = data.payments.map((payment, index) => ({
      id: `INV-${String(payment.id).padStart(6, '0')}`,
      companyId,
      amount: payment.amount,
      status: payment.status === 'completed' ? 'paid' : 'pending',
      dueDate: payment.date,
      paidDate: payment.status === 'completed' ? payment.date : null,
      description: payment.description,
      paymentMethod: payment.method
    }));

    return {
      data: invoices.slice(offset, offset + limit),
      total: invoices.length
    };
  }
};

module.exports = billingService;
