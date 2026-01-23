/**
 * Payment Transaction Model
 * Tracks all payment transactions through VNPay and Momo
 */

// In-memory storage (replace with MongoDB when ready)
const transactions = [];
const subscriptions = [];

class PaymentTransaction {
  constructor(data) {
    this.id = data.id || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.userId = data.userId;
    this.orderId = data.orderId;
    this.amount = data.amount; // Amount in VND
    this.currency = data.currency || 'VND';
    this.gateway = data.gateway; // 'vnpay' or 'momo'
    this.status = data.status || 'pending'; // pending, processing, completed, failed, cancelled, refunded
    this.description = data.description;
    this.bankCode = data.bankCode;
    this.transactionNo = data.transactionNo; // Gateway transaction ID
    this.paymentUrl = data.paymentUrl;
    this.ipnData = data.ipnData || null; // IPN callback data
    this.returnData = data.returnData || null; // Return URL data
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.completedAt = data.completedAt || null;
  }
}

class Subscription {
  constructor(data) {
    this.id = data.id || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.userId = data.userId;
    this.plan = data.plan; // 'basic', 'premium', 'enterprise'
    this.status = data.status || 'active'; // active, cancelled, expired, suspended
    this.amount = data.amount; // Monthly amount in VND
    this.billingCycle = data.billingCycle || 'monthly'; // monthly, yearly
    this.currentPeriodStart = data.currentPeriodStart || new Date();
    this.currentPeriodEnd = data.currentPeriodEnd;
    this.cancelAtPeriodEnd = data.cancelAtPeriodEnd || false;
    this.transactions = data.transactions || []; // Array of transaction IDs
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}

// Transaction CRUD operations
const createTransaction = (transactionData) => {
  const transaction = new PaymentTransaction(transactionData);
  transactions.push(transaction);
  return transaction;
};

const getTransactionById = (id) => {
  return transactions.find(txn => txn.id === id);
};

const getTransactionByOrderId = (orderId) => {
  return transactions.find(txn => txn.orderId === orderId);
};

const getTransactionsByUserId = (userId) => {
  return transactions.filter(txn => txn.userId === userId);
};

const updateTransaction = (id, updateData) => {
  const index = transactions.findIndex(txn => txn.id === id);
  if (index !== -1) {
    transactions[index] = {
      ...transactions[index],
      ...updateData,
      updatedAt: new Date()
    };
    return transactions[index];
  }
  return null;
};

const deleteTransaction = (id) => {
  const index = transactions.findIndex(txn => txn.id === id);
  if (index !== -1) {
    const deleted = transactions.splice(index, 1);
    return deleted[0];
  }
  return null;
};

// Subscription CRUD operations
const createSubscription = (subscriptionData) => {
  const subscription = new Subscription(subscriptionData);
  subscriptions.push(subscription);
  return subscription;
};

const getSubscriptionById = (id) => {
  return subscriptions.find(sub => sub.id === id);
};

const getSubscriptionByUserId = (userId) => {
  return subscriptions.find(sub => sub.userId === userId && sub.status === 'active');
};

const updateSubscription = (id, updateData) => {
  const index = subscriptions.findIndex(sub => sub.id === id);
  if (index !== -1) {
    subscriptions[index] = {
      ...subscriptions[index],
      ...updateData,
      updatedAt: new Date()
    };
    return subscriptions[index];
  }
  return null;
};

const cancelSubscription = (id, cancelAtPeriodEnd = true) => {
  const subscription = getSubscriptionById(id);
  if (subscription) {
    if (cancelAtPeriodEnd) {
      subscription.cancelAtPeriodEnd = true;
      subscription.status = 'active'; // Keep active until period ends
    } else {
      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
    }
    subscription.updatedAt = new Date();
    return subscription;
  }
  return null;
};

const getAllTransactions = () => {
  return transactions;
};

const getAllSubscriptions = () => {
  return subscriptions;
};

module.exports = {
  PaymentTransaction,
  Subscription,
  createTransaction,
  getTransactionById,
  getTransactionByOrderId,
  getTransactionsByUserId,
  updateTransaction,
  deleteTransaction,
  createSubscription,
  getSubscriptionById,
  getSubscriptionByUserId,
  updateSubscription,
  cancelSubscription,
  getAllTransactions,
  getAllSubscriptions
};
