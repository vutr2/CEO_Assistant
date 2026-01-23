/**
 * VNPay Payment Service
 * Handles VNPay payment gateway integration
 * Documentation: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
 */

const crypto = require('crypto');
const querystring = require('querystring');

class VNPayService {
  constructor() {
    this.vnpayConfig = {
      tmnCode: process.env.VNPAY_TMN_CODE,
      hashSecret: process.env.VNPAY_HASH_SECRET,
      url: process.env.VNPAY_URL,
      returnUrl: process.env.VNPAY_RETURN_URL,
      ipnUrl: process.env.VNPAY_IPN_URL
    };
  }

  /**
   * Sort object keys alphabetically
   */
  sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
      sorted[key] = obj[key];
    });
    return sorted;
  }

  /**
   * Create HMAC SHA512 signature
   */
  createSignature(data, secretKey) {
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(data, 'utf-8')).digest('hex');
    return signed;
  }

  /**
   * Create payment URL for VNPay
   * @param {Object} paymentData - Payment information
   * @returns {string} Payment URL
   */
  createPaymentUrl(paymentData) {
    const {
      orderId,
      amount,
      orderDescription,
      orderType = 'other',
      locale = 'vn',
      bankCode = null,
      ipAddress
    } = paymentData;

    // Create date in format: yyyyMMddHHmmss
    const createDate = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

    // VNPay parameters
    let vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnpayConfig.tmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderDescription,
      vnp_OrderType: orderType,
      vnp_Amount: amount * 100, // VNPay requires amount in smallest currency unit (VND * 100)
      vnp_ReturnUrl: this.vnpayConfig.returnUrl,
      vnp_IpAddr: ipAddress,
      vnp_CreateDate: createDate
    };

    // Add bank code if specified
    if (bankCode) {
      vnpParams.vnp_BankCode = bankCode;
    }

    // Sort parameters
    vnpParams = this.sortObject(vnpParams);

    // Create signature data
    const signData = querystring.stringify(vnpParams, { encode: false });
    const signature = this.createSignature(signData, this.vnpayConfig.hashSecret);

    // Add signature to params
    vnpParams.vnp_SecureHash = signature;

    // Create payment URL
    const paymentUrl = this.vnpayConfig.url + '?' + querystring.stringify(vnpParams, { encode: false });

    return paymentUrl;
  }

  /**
   * Verify return URL from VNPay
   * @param {Object} vnpParams - Query parameters from VNPay return URL
   * @returns {Object} Verification result
   */
  verifyReturnUrl(vnpParams) {
    const secureHash = vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    // Sort parameters
    const sortedParams = this.sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const signature = this.createSignature(signData, this.vnpayConfig.hashSecret);

    const isValid = secureHash === signature;
    const responseCode = vnpParams.vnp_ResponseCode;

    return {
      isValid,
      isSuccess: isValid && responseCode === '00',
      responseCode,
      message: this.getResponseMessage(responseCode),
      data: vnpParams
    };
  }

  /**
   * Verify IPN (Instant Payment Notification) from VNPay
   * @param {Object} vnpParams - IPN parameters from VNPay
   * @returns {Object} Verification result
   */
  verifyIPN(vnpParams) {
    return this.verifyReturnUrl(vnpParams);
  }

  /**
   * Query transaction status
   * @param {Object} queryData - Transaction query data
   * @returns {Promise<Object>} Transaction status
   */
  async queryTransaction(queryData) {
    const { orderId, transactionDate, ipAddress } = queryData;

    const requestDate = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

    let vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'querydr',
      vnp_TmnCode: this.vnpayConfig.tmnCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Query transaction ${orderId}`,
      vnp_TransactionDate: transactionDate,
      vnp_CreateDate: requestDate,
      vnp_IpAddr: ipAddress
    };

    // Sort parameters
    vnpParams = this.sortObject(vnpParams);

    // Create signature
    const signData = querystring.stringify(vnpParams, { encode: false });
    const signature = this.createSignature(signData, this.vnpayConfig.hashSecret);

    vnpParams.vnp_SecureHash = signature;

    // In production, make API call to VNPay query endpoint
    // For now, return mock data
    return {
      success: true,
      message: 'Transaction query not implemented in sandbox mode',
      data: vnpParams
    };
  }

  /**
   * Request refund
   * @param {Object} refundData - Refund request data
   * @returns {Promise<Object>} Refund result
   */
  async requestRefund(refundData) {
    const {
      orderId,
      amount,
      transactionNo,
      transactionDate,
      transactionType = '02', // 02: Full refund, 03: Partial refund
      ipAddress,
      user
    } = refundData;

    const requestDate = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

    let vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'refund',
      vnp_TmnCode: this.vnpayConfig.tmnCode,
      vnp_TxnRef: orderId,
      vnp_Amount: amount * 100,
      vnp_OrderInfo: `Refund for transaction ${orderId}`,
      vnp_TransactionNo: transactionNo,
      vnp_TransactionDate: transactionDate,
      vnp_TransactionType: transactionType,
      vnp_CreateBy: user,
      vnp_CreateDate: requestDate,
      vnp_IpAddr: ipAddress
    };

    // Sort parameters
    vnpParams = this.sortObject(vnpParams);

    // Create signature
    const signData = querystring.stringify(vnpParams, { encode: false });
    const signature = this.createSignature(signData, this.vnpayConfig.hashSecret);

    vnpParams.vnp_SecureHash = signature;

    // In production, make API call to VNPay refund endpoint
    // For now, return mock data
    return {
      success: true,
      message: 'Refund request not implemented in sandbox mode',
      data: vnpParams
    };
  }

  /**
   * Get response message based on response code
   */
  getResponseMessage(code) {
    const messages = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định',
      '99': 'Các lỗi khác'
    };

    return messages[code] || 'Lỗi không xác định';
  }

  /**
   * Get list of supported banks
   */
  getSupportedBanks() {
    return [
      { code: 'VNPAYQR', name: 'Thanh toán qua ứng dụng hỗ trợ VNPAYQR' },
      { code: 'VNBANK', name: 'Thanh toán qua ATM/Tài khoản nội địa' },
      { code: 'INTCARD', name: 'Thanh toán qua thẻ quốc tế' },
      { code: 'VIETCOMBANK', name: 'Ngân hàng TMCP Ngoại Thương Việt Nam' },
      { code: 'VIETINBANK', name: 'Ngân hàng TMCP Công Thương Việt Nam' },
      { code: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam' },
      { code: 'AGRIBANK', name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam' },
      { code: 'TECHCOMBANK', name: 'Ngân hàng TMCP Kỹ Thương Việt Nam' },
      { code: 'MBBANK', name: 'Ngân hàng TMCP Quân Đội' },
      { code: 'ACB', name: 'Ngân hàng TMCP Á Châu' },
      { code: 'SACOMBANK', name: 'Ngân hàng TMCP Sài Gòn Thương Tín' },
      { code: 'VPBank', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng' },
      { code: 'SCB', name: 'Ngân hàng TMCP Sài Gòn' },
      { code: 'TPBANK', name: 'Ngân hàng TMCP Tiên Phong' }
    ];
  }
}

module.exports = new VNPayService();
