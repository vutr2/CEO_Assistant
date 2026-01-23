# Payment Integration - VNPay & Momo

Complete backend payment integration for Vietnamese payment gateways (VNPay and Momo).

## 🚀 Features

### VNPay Integration
- ✅ Create payment URLs with bank selection
- ✅ Handle return callbacks from VNPay
- ✅ Handle IPN (Instant Payment Notification) webhooks
- ✅ Transaction verification with HMAC SHA512 signatures
- ✅ Support for all major Vietnamese banks
- ✅ Query transaction status
- ✅ Refund support

### Momo Integration
- ✅ Create payment requests (QR Code, Deeplink, Web URL)
- ✅ Handle return callbacks from Momo
- ✅ Handle IPN webhooks
- ✅ Transaction verification with HMAC SHA256 signatures
- ✅ Query transaction status
- ✅ Refund support
- ✅ Payment confirmation for manual capture

### Subscription Management
- ✅ Create and manage user subscriptions
- ✅ Three-tier pricing (Basic, Premium, Enterprise)
- ✅ Automatic subscription activation after payment
- ✅ Cancel subscriptions (immediate or at period end)
- ✅ Track subscription history

### Transaction Management
- ✅ Store all payment transactions in-memory (ready for MongoDB)
- ✅ Track payment status (pending, processing, completed, failed, cancelled, refunded)
- ✅ Link transactions to user subscriptions
- ✅ Metadata support for custom data
- ✅ User and admin transaction views

## 📋 Prerequisites

Before using the payment integration, you need to:

1. **Register with VNPay**
   - Visit: https://vnpay.vn/
   - Register for a merchant account
   - Get your TMN Code and Hash Secret from sandbox/production environment

2. **Register with Momo**
   - Visit: https://business.momo.vn/
   - Register for a business account
   - Get your Partner Code, Access Key, and Secret Key from developer portal

## ⚙️ Configuration

### 1. Environment Variables

Update your `.env` file with your payment gateway credentials:

```env
# VNPay Configuration
VNPAY_TMN_CODE=your-vnpay-tmn-code
VNPAY_HASH_SECRET=your-vnpay-hash-secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/vnpay/callback
VNPAY_IPN_URL=http://localhost:5000/api/v1/payment/vnpay/ipn

# Momo Configuration
MOMO_PARTNER_CODE=your-momo-partner-code
MOMO_ACCESS_KEY=your-momo-access-key
MOMO_SECRET_KEY=your-momo-secret-key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=http://localhost:3000/payment/momo/callback
MOMO_IPN_URL=http://localhost:5000/api/v1/payment/momo/ipn

# Subscription Plans (in VND)
PLAN_BASIC_PRICE=0
PLAN_PREMIUM_PRICE=2500000
PLAN_ENTERPRISE_PRICE=5000000
```

### 2. Production URLs

For production, update the URLs:

```env
# VNPay Production
VNPAY_URL=https://vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=https://yourdomain.com/payment/vnpay/callback
VNPAY_IPN_URL=https://yourdomain.com/api/v1/payment/vnpay/ipn

# Momo Production
MOMO_ENDPOINT=https://payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=https://yourdomain.com/payment/momo/callback
MOMO_IPN_URL=https://yourdomain.com/api/v1/payment/momo/ipn
```

## 📡 API Endpoints

### Public Endpoints (No Authentication)

#### Get Payment Plans
```http
GET /api/v1/payment/plans
```

Response:
```json
{
  "success": true,
  "plans": [
    {
      "id": "basic",
      "name": "Basic",
      "price": 0,
      "currency": "VND",
      "interval": "month",
      "features": [...]
    },
    {
      "id": "premium",
      "name": "Premium",
      "price": 2500000,
      "currency": "VND",
      "interval": "month",
      "features": [...],
      "recommended": true
    },
    {
      "id": "enterprise",
      "name": "Enterprise",
      "price": 5000000,
      "currency": "VND",
      "interval": "month",
      "features": [...]
    }
  ]
}
```

#### Get VNPay Supported Banks
```http
GET /api/v1/payment/vnpay/banks
```

Response:
```json
{
  "success": true,
  "banks": [
    { "code": "VNPAYQR", "name": "Thanh toán qua ứng dụng hỗ trợ VNPAYQR" },
    { "code": "VNBANK", "name": "Thanh toán qua ATM/Tài khoản nội địa" },
    { "code": "INTCARD", "name": "Thanh toán qua thẻ quốc tế" },
    { "code": "VIETCOMBANK", "name": "Ngân hàng TMCP Ngoại Thương Việt Nam" },
    ...
  ]
}
```

### Protected Endpoints (Authentication Required)

#### Create VNPay Payment
```http
POST /api/v1/payment/vnpay/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 2500000,
  "orderDescription": "Nâng cấp gói Premium",
  "bankCode": "VNBANK",
  "plan": "premium"
}
```

Response:
```json
{
  "success": true,
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
  "orderId": "ORDER_1234567890_abc123",
  "transactionId": "txn_1234567890_xyz789",
  "message": "Tạo link thanh toán VNPay thành công"
}
```

#### Create Momo Payment
```http
POST /api/v1/payment/momo/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 2500000,
  "orderInfo": "Nâng cấp gói Premium",
  "plan": "premium"
}
```

Response:
```json
{
  "success": true,
  "paymentUrl": "https://test-payment.momo.vn/...",
  "deeplink": "momo://...",
  "qrCodeUrl": "https://...",
  "orderId": "ORDER_1234567890_abc123",
  "transactionId": "txn_1234567890_xyz789",
  "message": "Tạo thanh toán Momo thành công"
}
```

#### Get User Transactions
```http
GET /api/v1/payment/transactions
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "transactions": [...],
  "total": 10
}
```

#### Get Transaction by ID
```http
GET /api/v1/payment/transactions/:id
Authorization: Bearer <token>
```

#### Get User Subscription
```http
GET /api/v1/payment/subscription
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "subscription": {
    "id": "sub_1234567890_abc123",
    "userId": "user123",
    "plan": "premium",
    "status": "active",
    "amount": 2500000,
    "billingCycle": "monthly",
    "currentPeriodStart": "2026-01-13T00:00:00.000Z",
    "currentPeriodEnd": "2026-02-13T00:00:00.000Z",
    "transactions": ["txn_..."],
    "createdAt": "2026-01-13T00:00:00.000Z"
  }
}
```

#### Cancel Subscription
```http
POST /api/v1/payment/subscription/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "cancelAtPeriodEnd": true
}
```

### Callback Endpoints (Called by Payment Gateways)

These endpoints are called by VNPay and Momo - no authentication required.

#### VNPay Return URL
```http
GET /api/v1/payment/vnpay/callback?vnp_Amount=...&vnp_BankCode=...
```

#### VNPay IPN
```http
GET /api/v1/payment/vnpay/ipn?vnp_Amount=...&vnp_BankCode=...
```

#### Momo Return URL
```http
GET /api/v1/payment/momo/callback?orderId=...&resultCode=...
```

#### Momo IPN
```http
POST /api/v1/payment/momo/ipn
Content-Type: application/json

{
  "orderId": "...",
  "resultCode": 0,
  "signature": "...",
  ...
}
```

## 🔄 Payment Flow

### VNPay Payment Flow

1. **User initiates payment**
   ```javascript
   POST /api/v1/payment/vnpay/create
   // Creates transaction with status: 'pending'
   ```

2. **Backend creates payment URL**
   - Generates unique order ID
   - Creates HMAC SHA512 signature
   - Returns payment URL to frontend

3. **User redirected to VNPay**
   - User selects bank and completes payment on VNPay website

4. **VNPay sends IPN to backend**
   ```
   GET /api/v1/payment/vnpay/ipn
   // Backend verifies signature and updates transaction
   // Status: 'pending' -> 'completed' or 'failed'
   // Creates/updates subscription if successful
   ```

5. **VNPay redirects user back**
   ```
   GET /api/v1/payment/vnpay/callback
   // Frontend receives result
   // Shows success/failure message to user
   ```

### Momo Payment Flow

1. **User initiates payment**
   ```javascript
   POST /api/v1/payment/momo/create
   ```

2. **Backend sends request to Momo API**
   - Creates HMAC SHA256 signature
   - Receives payment URL, QR code, deeplink

3. **User completes payment**
   - Scan QR code with Momo app, OR
   - Click deeplink to open Momo app, OR
   - Pay via web URL

4. **Momo sends IPN to backend**
   ```
   POST /api/v1/payment/momo/ipn
   // Backend verifies signature and updates transaction
   // Creates/updates subscription if successful
   ```

5. **Momo redirects user back**
   ```
   GET /api/v1/payment/momo/callback
   // Frontend shows result to user
   ```

## 💳 Testing

### Test with VNPay Sandbox

1. Use sandbox credentials from VNPay
2. Create payment with test amount
3. Use test card numbers provided by VNPay:
   - Card Number: `9704198526191432198`
   - Card Holder: `NGUYEN VAN A`
   - Expiry: `07/15`
   - OTP: `123456`

### Test with Momo Sandbox

1. Use sandbox credentials from Momo
2. Create payment request
3. Use Momo test app to scan QR or follow deeplink
4. Complete payment in test environment

## 🔒 Security

### Signature Verification

All payment callbacks are verified using:
- **VNPay**: HMAC SHA512 with Hash Secret
- **Momo**: HMAC SHA256 with Secret Key

Never process payments without verifying signatures!

### Best Practices

1. **Always verify signatures** in IPN and return URL handlers
2. **Use HTTPS** in production for all callback URLs
3. **Keep secrets secure** - never expose in frontend code
4. **Validate amounts** before creating payments
5. **Check transaction status** before fulfilling orders
6. **Log all payment events** for debugging and auditing
7. **Handle duplicate IPNs** - check if transaction already processed
8. **Set proper timeouts** for API calls to payment gateways

## 📊 Database Schema

### Transaction Model

```javascript
{
  id: "txn_1234567890_abc123",
  userId: "user123",
  orderId: "ORDER_1234567890_abc123",
  amount: 2500000,
  currency: "VND",
  gateway: "vnpay" | "momo",
  status: "pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded",
  description: "Payment description",
  bankCode: "VNBANK",
  transactionNo: "14123456",
  paymentUrl: "https://...",
  ipnData: { ... },
  returnData: { ... },
  metadata: { plan: "premium" },
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date
}
```

### Subscription Model

```javascript
{
  id: "sub_1234567890_abc123",
  userId: "user123",
  plan: "basic" | "premium" | "enterprise",
  status: "active" | "cancelled" | "expired" | "suspended",
  amount: 2500000,
  billingCycle: "monthly" | "yearly",
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: false,
  transactions: ["txn_...", "txn_..."],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Troubleshooting

### Payment URL not working
- Check if TMN Code / Partner Code is correct
- Verify Hash Secret / Secret Key matches sandbox/production
- Ensure amount is greater than 0
- Check if signature is generated correctly

### IPN not received
- Verify IPN URL is accessible from internet (use ngrok for local testing)
- Check if IPN URL is registered in payment gateway dashboard
- Ensure IPN URL uses HTTPS in production
- Check server logs for incoming IPN requests

### Signature verification fails
- Ensure secret keys match exactly (no extra spaces)
- Check if parameter order is correct for signature generation
- Verify encoding (UTF-8) for signature calculation
- Use correct hash algorithm (SHA512 for VNPay, SHA256 for Momo)

### Transaction not updating
- Check if orderId matches between create and callback
- Verify IPN handler is updating transaction correctly
- Check for race conditions (IPN arrives before return URL)
- Look for errors in IPN handler logs

## 🚀 Production Deployment

### Checklist

- [ ] Update all URLs to production domains
- [ ] Replace sandbox credentials with production credentials
- [ ] Enable HTTPS for all callback URLs
- [ ] Test payment flow end-to-end in production
- [ ] Set up monitoring for failed payments
- [ ] Configure payment gateway webhooks/IPN URLs
- [ ] Implement retry logic for failed API calls
- [ ] Set up alerting for payment issues
- [ ] Test refund functionality
- [ ] Prepare customer support documentation

### MongoDB Integration

Currently using in-memory storage. To integrate MongoDB:

1. Create MongoDB schemas based on models
2. Update model functions to use MongoDB queries
3. Add proper indexes for orderId, userId, transactionNo
4. Implement transaction history pagination
5. Add proper error handling for database operations

## 📞 Support

For payment gateway specific issues:

- **VNPay**: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
- **Momo**: https://developers.momo.vn/

For integration issues, check server logs and ensure all environment variables are set correctly.

## 📝 License

This payment integration is part of the CEO-AI Assistant project.
