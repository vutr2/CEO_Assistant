/**
 * Payment Controller
 * Handles payment requests for VNPay and Momo gateways
 */

const vnpayService = require('./vnpay.service');
const momoService = require('./momo.service');
const {
  createTransaction,
  getTransactionById,
  getTransactionByOrderId,
  getTransactionsByUserId,
  updateTransaction,
  createSubscription,
  getSubscriptionByUserId,
  updateSubscription,
  cancelSubscription,
  getAllTransactions
} = require('./payment.model');

/**
 * Create payment with VNPay
 */
const createVNPayPayment = async (req, res) => {
  try {
    const { amount, orderDescription, bankCode, plan } = req.body;
    const userId = req.user?.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền không hợp lệ'
      });
    }

    // Generate unique order ID
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get client IP
    const ipAddress = req.headers['x-forwarded-for'] ||
                      req.connection.remoteAddress ||
                      req.socket.remoteAddress ||
                      '127.0.0.1';

    // Create payment URL
    const paymentUrl = vnpayService.createPaymentUrl({
      orderId,
      amount,
      orderDescription: orderDescription || `Thanh toán đơn hàng ${orderId}`,
      bankCode,
      ipAddress: ipAddress.split(',')[0].trim()
    });

    // Save transaction to database
    const transaction = createTransaction({
      userId,
      orderId,
      amount,
      gateway: 'vnpay',
      status: 'pending',
      description: orderDescription,
      bankCode,
      paymentUrl,
      metadata: { plan }
    });

    res.json({
      success: true,
      paymentUrl,
      orderId,
      transactionId: transaction.id,
      message: 'Tạo link thanh toán VNPay thành công'
    });
  } catch (error) {
    console.error('VNPay payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo thanh toán VNPay',
      error: error.message
    });
  }
};

/**
 * Handle VNPay return callback
 */
const handleVNPayReturn = async (req, res) => {
  try {
    const vnpParams = req.query;

    // Verify return URL
    const verifyResult = vnpayService.verifyReturnUrl(vnpParams);

    if (!verifyResult.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Chữ ký không hợp lệ'
      });
    }

    const orderId = vnpParams.vnp_TxnRef;
    const transaction = getTransactionByOrderId(orderId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }

    // Update transaction
    const status = verifyResult.isSuccess ? 'completed' : 'failed';
    updateTransaction(transaction.id, {
      status,
      transactionNo: vnpParams.vnp_TransactionNo,
      returnData: vnpParams,
      completedAt: verifyResult.isSuccess ? new Date() : null
    });

    // If payment successful and it's a subscription, create/update subscription
    if (verifyResult.isSuccess && transaction.metadata?.plan) {
      const existingSubscription = getSubscriptionByUserId(transaction.userId);

      if (existingSubscription) {
        // Upgrade subscription
        updateSubscription(existingSubscription.id, {
          plan: transaction.metadata.plan,
          amount: transaction.amount,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          transactions: [...existingSubscription.transactions, transaction.id]
        });
      } else {
        // Create new subscription
        createSubscription({
          userId: transaction.userId,
          plan: transaction.metadata.plan,
          amount: transaction.amount,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          transactions: [transaction.id]
        });
      }
    }

    res.json({
      success: verifyResult.isSuccess,
      message: verifyResult.message,
      responseCode: verifyResult.responseCode,
      orderId,
      transactionId: transaction.id,
      amount: transaction.amount
    });
  } catch (error) {
    console.error('VNPay return error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xử lý callback VNPay',
      error: error.message
    });
  }
};

/**
 * Handle VNPay IPN (Instant Payment Notification)
 */
const handleVNPayIPN = async (req, res) => {
  try {
    const vnpParams = req.query;

    // Verify IPN
    const verifyResult = vnpayService.verifyIPN(vnpParams);

    if (!verifyResult.isValid) {
      return res.status(200).json({
        RspCode: '97',
        Message: 'Invalid Signature'
      });
    }

    const orderId = vnpParams.vnp_TxnRef;
    const transaction = getTransactionByOrderId(orderId);

    if (!transaction) {
      return res.status(200).json({
        RspCode: '01',
        Message: 'Order not found'
      });
    }

    // Check if already processed
    if (transaction.status === 'completed') {
      return res.status(200).json({
        RspCode: '02',
        Message: 'Order already confirmed'
      });
    }

    // Update transaction
    const status = verifyResult.isSuccess ? 'completed' : 'failed';
    updateTransaction(transaction.id, {
      status,
      transactionNo: vnpParams.vnp_TransactionNo,
      ipnData: vnpParams,
      completedAt: verifyResult.isSuccess ? new Date() : null
    });

    // Process subscription if successful
    if (verifyResult.isSuccess && transaction.metadata?.plan) {
      const existingSubscription = getSubscriptionByUserId(transaction.userId);

      if (existingSubscription) {
        updateSubscription(existingSubscription.id, {
          plan: transaction.metadata.plan,
          amount: transaction.amount,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          transactions: [...existingSubscription.transactions, transaction.id]
        });
      } else {
        createSubscription({
          userId: transaction.userId,
          plan: transaction.metadata.plan,
          amount: transaction.amount,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          transactions: [transaction.id]
        });
      }
    }

    // Respond to VNPay
    res.status(200).json({
      RspCode: '00',
      Message: 'Confirm Success'
    });
  } catch (error) {
    console.error('VNPay IPN error:', error);
    res.status(200).json({
      RspCode: '99',
      Message: 'Unknown error'
    });
  }
};

/**
 * Create payment with Momo
 */
const createMomoPayment = async (req, res) => {
  try {
    const { amount, orderInfo, plan } = req.body;
    const userId = req.user?.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền không hợp lệ'
      });
    }

    // Generate unique order ID
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment with Momo
    const paymentResult = await momoService.createPayment({
      orderId,
      amount,
      orderInfo: orderInfo || `Thanh toán đơn hàng ${orderId}`
    });

    if (!paymentResult.success) {
      return res.status(400).json(paymentResult);
    }

    // Save transaction to database
    const transaction = createTransaction({
      userId,
      orderId,
      amount,
      gateway: 'momo',
      status: 'pending',
      description: orderInfo,
      paymentUrl: paymentResult.paymentUrl,
      metadata: {
        plan,
        requestId: paymentResult.requestId,
        deeplink: paymentResult.deeplink,
        qrCodeUrl: paymentResult.qrCodeUrl
      }
    });

    res.json({
      success: true,
      paymentUrl: paymentResult.paymentUrl,
      deeplink: paymentResult.deeplink,
      qrCodeUrl: paymentResult.qrCodeUrl,
      orderId,
      transactionId: transaction.id,
      message: 'Tạo thanh toán Momo thành công'
    });
  } catch (error) {
    console.error('Momo payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo thanh toán Momo',
      error: error.message
    });
  }
};

/**
 * Handle Momo return callback
 */
const handleMomoReturn = async (req, res) => {
  try {
    const returnData = req.query;

    // Verify return URL
    const verifyResult = momoService.verifyReturnUrl(returnData);

    if (!verifyResult.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Chữ ký không hợp lệ'
      });
    }

    const orderId = returnData.orderId;
    const transaction = getTransactionByOrderId(orderId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }

    // Update transaction
    const status = verifyResult.isSuccess ? 'completed' : 'failed';
    updateTransaction(transaction.id, {
      status,
      transactionNo: verifyResult.transactionId,
      returnData: returnData,
      completedAt: verifyResult.isSuccess ? new Date() : null
    });

    // Process subscription if successful
    if (verifyResult.isSuccess && transaction.metadata?.plan) {
      const existingSubscription = getSubscriptionByUserId(transaction.userId);

      if (existingSubscription) {
        updateSubscription(existingSubscription.id, {
          plan: transaction.metadata.plan,
          amount: transaction.amount,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          transactions: [...existingSubscription.transactions, transaction.id]
        });
      } else {
        createSubscription({
          userId: transaction.userId,
          plan: transaction.metadata.plan,
          amount: transaction.amount,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          transactions: [transaction.id]
        });
      }
    }

    res.json({
      success: verifyResult.isSuccess,
      message: verifyResult.message,
      resultCode: verifyResult.resultCode,
      orderId,
      transactionId: transaction.id,
      amount: transaction.amount
    });
  } catch (error) {
    console.error('Momo return error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xử lý callback Momo',
      error: error.message
    });
  }
};

/**
 * Handle Momo IPN
 */
const handleMomoIPN = async (req, res) => {
  try {
    const ipnData = req.body;

    // Verify IPN
    const verifyResult = momoService.verifyIPN(ipnData);

    if (!verifyResult.isValid) {
      return res.status(200).json({
        resultCode: 97,
        message: 'Invalid Signature'
      });
    }

    const orderId = ipnData.orderId;
    const transaction = getTransactionByOrderId(orderId);

    if (!transaction) {
      return res.status(200).json({
        resultCode: 1,
        message: 'Order not found'
      });
    }

    // Check if already processed
    if (transaction.status === 'completed') {
      return res.status(200).json({
        resultCode: 0,
        message: 'Order already confirmed'
      });
    }

    // Update transaction
    const status = verifyResult.isSuccess ? 'completed' : 'failed';
    updateTransaction(transaction.id, {
      status,
      transactionNo: verifyResult.transactionId,
      ipnData: ipnData,
      completedAt: verifyResult.isSuccess ? new Date() : null
    });

    // Process subscription if successful
    if (verifyResult.isSuccess && transaction.metadata?.plan) {
      const existingSubscription = getSubscriptionByUserId(transaction.userId);

      if (existingSubscription) {
        updateSubscription(existingSubscription.id, {
          plan: transaction.metadata.plan,
          amount: transaction.amount,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          transactions: [...existingSubscription.transactions, transaction.id]
        });
      } else {
        createSubscription({
          userId: transaction.userId,
          plan: transaction.metadata.plan,
          amount: transaction.amount,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          transactions: [transaction.id]
        });
      }
    }

    // Respond to Momo
    res.status(200).json({
      resultCode: 0,
      message: 'Confirm Success'
    });
  } catch (error) {
    console.error('Momo IPN error:', error);
    res.status(200).json({
      resultCode: 99,
      message: 'Unknown error'
    });
  }
};

/**
 * Get transaction by ID
 */
const getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = getTransactionById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }

    // Check if user owns this transaction
    if (req.user?.id !== transaction.userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập giao dịch này'
      });
    }

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin giao dịch',
      error: error.message
    });
  }
};

/**
 * Get user's transactions
 */
const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user?.id;
    const transactions = getTransactionsByUserId(userId);

    res.json({
      success: true,
      transactions,
      total: transactions.length
    });
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách giao dịch',
      error: error.message
    });
  }
};

/**
 * Get all transactions (Admin only)
 */
const getAllTransactionsController = async (req, res) => {
  try {
    const transactions = getAllTransactions();

    res.json({
      success: true,
      transactions,
      total: transactions.length
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách giao dịch',
      error: error.message
    });
  }
};

/**
 * Get user's subscription
 */
const getUserSubscription = async (req, res) => {
  try {
    const userId = req.user?.id;
    const subscription = getSubscriptionByUserId(userId);

    if (!subscription) {
      return res.json({
        success: true,
        subscription: null,
        message: 'Chưa có gói đăng ký'
      });
    }

    res.json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin đăng ký',
      error: error.message
    });
  }
};

/**
 * Cancel user's subscription
 */
const cancelUserSubscription = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { cancelAtPeriodEnd = true } = req.body;

    const subscription = getSubscriptionByUserId(userId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy gói đăng ký'
      });
    }

    const updatedSubscription = cancelSubscription(subscription.id, cancelAtPeriodEnd);

    res.json({
      success: true,
      subscription: updatedSubscription,
      message: cancelAtPeriodEnd
        ? 'Gói đăng ký sẽ bị hủy vào cuối kỳ thanh toán'
        : 'Gói đăng ký đã bị hủy'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hủy gói đăng ký',
      error: error.message
    });
  }
};

/**
 * Get supported banks for VNPay
 */
const getVNPayBanks = async (req, res) => {
  try {
    const banks = vnpayService.getSupportedBanks();
    res.json({
      success: true,
      banks
    });
  } catch (error) {
    console.error('Get banks error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách ngân hàng',
      error: error.message
    });
  }
};

/**
 * Get payment plans
 */
const getPaymentPlans = async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Miễn phí',
        price: 0,
        currency: 'VND',
        interval: 'month',
        features: [
          '5 người dùng',
          '10 GB lưu trữ',
          'Báo cáo cơ bản',
          'Trợ lý AI (100 câu hỏi/tháng)',
          'Hỗ trợ email'
        ]
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 1500000,
        currency: 'VND',
        interval: 'month',
        features: [
          '20 người dùng',
          '100 GB lưu trữ',
          'Báo cáo nâng cao',
          'Trợ lý AI (1000 câu hỏi/tháng)',
          'Phân tích dự đoán',
          'Hỗ trợ ưu tiên',
          'API tích hợp',
          'Tùy chỉnh báo cáo',
          'Export dữ liệu không giới hạn'
        ],
        recommended: true
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 2500000,
        currency: 'VND',
        interval: 'month',
        features: [
          'Không giới hạn người dùng',
          '500 GB lưu trữ',
          'Tất cả tính năng Professional',
          'Trợ lý AI không giới hạn',
          'AI tùy chỉnh theo ngành',
          'Hỗ trợ 24/7',
          'Dedicated account manager',
          'White-label option',
          'SLA 99.9%'
        ]
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: null,
        currency: 'VND',
        interval: 'custom',
        features: [
          'Tất cả tính năng Premium',
          'Lưu trữ không giới hạn',
          'Triển khai on-premise',
          'Tùy chỉnh hoàn toàn',
          'Security & compliance',
          'Training & onboarding',
          'Dedicated infrastructure',
          'Custom integrations',
          'SLA tùy chỉnh'
        ]
      }
    ];

    res.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách gói',
      error: error.message
    });
  }
};

module.exports = {
  createVNPayPayment,
  handleVNPayReturn,
  handleVNPayIPN,
  createMomoPayment,
  handleMomoReturn,
  handleMomoIPN,
  getTransaction,
  getUserTransactions,
  getAllTransactionsController,
  getUserSubscription,
  cancelUserSubscription,
  getVNPayBanks,
  getPaymentPlans
};
