/**
 * Momo Payment Service
 * Handles Momo e-wallet payment gateway integration
 * Documentation: https://developers.momo.vn/
 */

const crypto = require('crypto');
const axios = require('axios');

class MomoService {
  constructor() {
    this.momoConfig = {
      partnerCode: process.env.MOMO_PARTNER_CODE,
      accessKey: process.env.MOMO_ACCESS_KEY,
      secretKey: process.env.MOMO_SECRET_KEY,
      endpoint: process.env.MOMO_ENDPOINT,
      returnUrl: process.env.MOMO_RETURN_URL,
      ipnUrl: process.env.MOMO_IPN_URL
    };
  }

  /**
   * Create HMAC SHA256 signature
   */
  createSignature(data, secretKey) {
    const hmac = crypto.createHmac('sha256', secretKey);
    const signature = hmac.update(data).digest('hex');
    return signature;
  }

  /**
   * Create payment request to Momo
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} Payment response with payment URL
   */
  async createPayment(paymentData) {
    const {
      orderId,
      amount,
      orderInfo,
      extraData = '',
      requestType = 'payWithMethod', // payWithMethod, captureWallet
      autoCapture = true,
      lang = 'vi'
    } = paymentData;

    const requestId = `${orderId}_${Date.now()}`;

    // Prepare request data
    const rawSignature = `accessKey=${this.momoConfig.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${this.momoConfig.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.momoConfig.partnerCode}&redirectUrl=${this.momoConfig.returnUrl}&requestId=${requestId}&requestType=${requestType}`;

    // Create signature
    const signature = this.createSignature(rawSignature, this.momoConfig.secretKey);

    // Request body
    const requestBody = {
      partnerCode: this.momoConfig.partnerCode,
      partnerName: 'CEO AI Assistant',
      storeId: 'CEO_AI_Store',
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: this.momoConfig.returnUrl,
      ipnUrl: this.momoConfig.ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      signature: signature
    };

    try {
      // Send request to Momo
      const response = await axios.post(this.momoConfig.endpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const { resultCode, payUrl, deeplink, qrCodeUrl, message } = response.data;

      if (resultCode === 0) {
        return {
          success: true,
          paymentUrl: payUrl,
          deeplink: deeplink,
          qrCodeUrl: qrCodeUrl,
          orderId: orderId,
          requestId: requestId,
          message: 'Payment URL created successfully'
        };
      } else {
        return {
          success: false,
          resultCode: resultCode,
          message: this.getResponseMessage(resultCode) || message
        };
      }
    } catch (error) {
      console.error('Momo payment error:', error.message);
      return {
        success: false,
        message: 'Failed to create Momo payment',
        error: error.message
      };
    }
  }

  /**
   * Verify IPN (Instant Payment Notification) from Momo
   * @param {Object} ipnData - IPN data from Momo
   * @returns {Object} Verification result
   */
  verifyIPN(ipnData) {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature
    } = ipnData;

    // Reconstruct signature
    const rawSignature = `accessKey=${this.momoConfig.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const calculatedSignature = this.createSignature(rawSignature, this.momoConfig.secretKey);

    const isValid = signature === calculatedSignature;
    const isSuccess = isValid && resultCode === 0;

    return {
      isValid,
      isSuccess,
      resultCode,
      message: this.getResponseMessage(resultCode) || message,
      transactionId: transId,
      data: ipnData
    };
  }

  /**
   * Verify return URL from Momo
   * @param {Object} returnData - Query parameters from Momo return URL
   * @returns {Object} Verification result
   */
  verifyReturnUrl(returnData) {
    return this.verifyIPN(returnData);
  }

  /**
   * Query transaction status
   * @param {Object} queryData - Transaction query data
   * @returns {Promise<Object>} Transaction status
   */
  async queryTransaction(queryData) {
    const { orderId, requestId } = queryData;

    const rawSignature = `accessKey=${this.momoConfig.accessKey}&orderId=${orderId}&partnerCode=${this.momoConfig.partnerCode}&requestId=${requestId}`;

    const signature = this.createSignature(rawSignature, this.momoConfig.secretKey);

    const requestBody = {
      partnerCode: this.momoConfig.partnerCode,
      requestId: requestId,
      orderId: orderId,
      signature: signature,
      lang: 'vi'
    };

    try {
      // In production, send to Momo query endpoint
      const queryEndpoint = this.momoConfig.endpoint.replace('/create', '/query');

      const response = await axios.post(queryEndpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const { resultCode, message } = response.data;

      return {
        success: resultCode === 0,
        resultCode: resultCode,
        message: this.getResponseMessage(resultCode) || message,
        data: response.data
      };
    } catch (error) {
      console.error('Momo query error:', error.message);
      return {
        success: false,
        message: 'Failed to query Momo transaction',
        error: error.message
      };
    }
  }

  /**
   * Request refund
   * @param {Object} refundData - Refund request data
   * @returns {Promise<Object>} Refund result
   */
  async requestRefund(refundData) {
    const { orderId, requestId, amount, transId, description } = refundData;

    const refundRequestId = `${orderId}_REFUND_${Date.now()}`;

    const rawSignature = `accessKey=${this.momoConfig.accessKey}&amount=${amount}&description=${description}&orderId=${orderId}&partnerCode=${this.momoConfig.partnerCode}&requestId=${refundRequestId}&transId=${transId}`;

    const signature = this.createSignature(rawSignature, this.momoConfig.secretKey);

    const requestBody = {
      partnerCode: this.momoConfig.partnerCode,
      orderId: orderId,
      requestId: refundRequestId,
      amount: amount,
      transId: transId,
      lang: 'vi',
      description: description,
      signature: signature
    };

    try {
      // In production, send to Momo refund endpoint
      const refundEndpoint = this.momoConfig.endpoint.replace('/create', '/refund');

      const response = await axios.post(refundEndpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const { resultCode, message } = response.data;

      return {
        success: resultCode === 0,
        resultCode: resultCode,
        message: this.getResponseMessage(resultCode) || message,
        data: response.data
      };
    } catch (error) {
      console.error('Momo refund error:', error.message);
      return {
        success: false,
        message: 'Failed to process Momo refund',
        error: error.message
      };
    }
  }

  /**
   * Confirm transaction (for manual capture)
   * @param {Object} confirmData - Confirm transaction data
   * @returns {Promise<Object>} Confirm result
   */
  async confirmTransaction(confirmData) {
    const { orderId, requestId, amount } = confirmData;

    const confirmRequestId = `${orderId}_CONFIRM_${Date.now()}`;

    const rawSignature = `accessKey=${this.momoConfig.accessKey}&amount=${amount}&orderId=${orderId}&partnerCode=${this.momoConfig.partnerCode}&requestId=${confirmRequestId}&requestType=capture`;

    const signature = this.createSignature(rawSignature, this.momoConfig.secretKey);

    const requestBody = {
      partnerCode: this.momoConfig.partnerCode,
      orderId: orderId,
      requestId: confirmRequestId,
      amount: amount,
      requestType: 'capture',
      signature: signature,
      lang: 'vi'
    };

    try {
      const confirmEndpoint = this.momoConfig.endpoint.replace('/create', '/confirm');

      const response = await axios.post(confirmEndpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const { resultCode, message } = response.data;

      return {
        success: resultCode === 0,
        resultCode: resultCode,
        message: this.getResponseMessage(resultCode) || message,
        data: response.data
      };
    } catch (error) {
      console.error('Momo confirm error:', error.message);
      return {
        success: false,
        message: 'Failed to confirm Momo transaction',
        error: error.message
      };
    }
  }

  /**
   * Get response message based on result code
   */
  getResponseMessage(code) {
    const messages = {
      0: 'Giao dịch thành công',
      9000: 'Giao dịch đã được xác nhận thành công',
      1000: 'Giao dịch đã được khởi tạo, chờ người dùng xác nhận thanh toán',
      1001: 'Giao dịch thất bại do người dùng từ chối thanh toán',
      1002: 'Giao dịch thất bại do người dùng hủy giao dịch',
      1003: 'Giao dịch bị từ chối bởi người dùng',
      1004: 'Giao dịch thất bại do hết hạn thanh toán',
      1005: 'Giao dịch thất bại do lỗi từ hệ thống thanh toán',
      1006: 'Giao dịch thất bại do người dùng đã vượt quá số lần thanh toán cho phép',
      1007: 'Giao dịch bị từ chối vì đang có giao dịch đang chờ xử lý',
      1010: 'Tài khoản không đủ số dư để thực hiện giao dịch',
      1011: 'Giao dịch thất bại do đã vượt quá hạn mức thanh toán',
      1012: 'Tài khoản bị khóa',
      1013: 'OTP không chính xác',
      1014: 'Giao dịch thất bại do thông tin thanh toán không hợp lệ',
      1015: 'Giao dịch thất bại do người dùng chưa hoàn tất xác thực 3DS',
      1016: 'Giao dịch bị từ chối vì người dùng chưa kích hoạt ví',
      1017: 'Giao dịch bị từ chối do người dùng chưa hoàn tất định danh',
      1018: 'Giao dịch bị từ chối do ví chưa được xác thực',
      1019: 'Giao dịch bị từ chối do số tiền giao dịch vượt quá hạn mức',
      1020: 'Giao dịch thất bại do lỗi từ hệ thống ngân hàng',
      1021: 'Giao dịch thất bại do lỗi kết nối đến hệ thống ngân hàng',
      1022: 'Giao dịch thất bại do thẻ không hợp lệ',
      1023: 'Giao dịch thất bại do thẻ đã hết hạn',
      1024: 'Giao dịch thất bại do thông tin thẻ không chính xác',
      1025: 'Giao dịch thất bại do thẻ không hỗ trợ thanh toán online',
      1026: 'Giao dịch thất bại do ngân hàng từ chối',
      1027: 'Giao dịch thất bại do quá thời gian xử lý',
      1028: 'Giao dịch thất bại do merchant không hợp lệ',
      1029: 'Giao dịch thất bại do số tiền không hợp lệ',
      1030: 'Giao dịch thất bại do thông tin merchant không đầy đủ',
      1031: 'Giao dịch thất bại do dữ liệu đầu vào không hợp lệ',
      1032: 'Giao dịch thất bại do thời gian thanh toán không hợp lệ',
      1033: 'Giao dịch thất bại do chữ ký không hợp lệ',
      1034: 'Giao dịch thất bại do orderId đã tồn tại',
      1035: 'Giao dịch thất bại do requestId đã tồn tại',
      1036: 'Giao dịch thất bại do không tìm thấy orderId',
      1037: 'Giao dịch thất bại do số dư không đủ để hoàn tiền',
      1038: 'Giao dịch thất bại do số tiền hoàn không hợp lệ',
      1039: 'Giao dịch hoàn tiền đang được xử lý',
      1040: 'Giao dịch đã được hoàn tiền',
      1041: 'Giao dịch chưa được thanh toán',
      1042: 'Giao dịch chưa thể hoàn tiền',
      1043: 'Giao dịch không hỗ trợ hoàn tiền',
      1044: 'Giao dịch đã hết hạn để hoàn tiền',
      1045: 'Đã quá thời gian cho phép hoàn tiền',
      1046: 'Không thể hoàn tiền do lỗi hệ thống',
      1047: 'Giao dịch không được phép hoàn tiền',
      1048: 'Giao dịch không hỗ trợ xác nhận thanh toán',
      1049: 'Giao dịch đã được xác nhận trước đó',
      1050: 'Không thể xác nhận giao dịch',
      2001: 'Giao dịch thất bại do lỗi hệ thống',
      2007: 'Giao dịch bị từ chối do merchant chưa được kích hoạt',
      2008: 'Giao dịch thất bại do cấu hình merchant không hợp lệ',
      3001: 'Liên kết ví không tồn tại hoặc đã hết hạn',
      3002: 'Liên kết ví thất bại do người dùng từ chối',
      3003: 'Liên kết ví thất bại',
      3004: 'Hủy liên kết ví thất bại',
      4001: 'Merchant không tồn tại',
      4002: 'Giao dịch không hợp lệ cho merchant này',
      4010: 'AccessKey không hợp lệ',
      4011: 'Chữ ký không hợp lệ',
      4015: 'Phiên bản API không được hỗ trợ',
      4100: 'Giao dịch thất bại do lỗi không xác định',
      7000: 'Giao dịch đang được xử lý',
      7001: 'Giao dịch đã được xử lý thành công trước đó',
      7002: 'Giao dịch đang chờ xử lý',
      9999: 'Giao dịch thất bại do lỗi hệ thống'
    };

    return messages[code] || 'Lỗi không xác định';
  }
}

module.exports = new MomoService();
