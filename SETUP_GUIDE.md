# CEO AI Assistant - Payment Setup Guide

Complete guide to set up and deploy your CEO AI Assistant with VNPay and Momo payment integration.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Payment Gateway Registration](#payment-gateway-registration)
5. [Testing the Application](#testing-the-application)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Prerequisites

### Required Accounts

1. **VNPay Merchant Account**
   - Register at: https://vnpay.vn/
   - Get sandbox credentials for testing
   - Required: TMN Code, Hash Secret

2. **Momo Business Account**
   - Register at: https://business.momo.vn/
   - Get test credentials from developer portal
   - Required: Partner Code, Access Key, Secret Key

### Development Environment

- Node.js 18.0 or higher
- npm or yarn package manager
- Code editor (VS Code recommended)
- Git for version control

---

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

The payment dependencies are already installed:
- `vnpay` - VNPay integration library
- `crypto-js` - Cryptographic functions
- `axios` - HTTP client for Momo API calls

### 2. Configure Environment Variables

Edit `backend/.env` file with your credentials:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# VNPay Configuration
VNPAY_TMN_CODE=your-actual-tmn-code-here
VNPAY_HASH_SECRET=your-actual-hash-secret-here
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/vnpay/callback
VNPAY_IPN_URL=http://localhost:5000/api/v1/payment/vnpay/ipn

# Momo Configuration
MOMO_PARTNER_CODE=your-actual-partner-code-here
MOMO_ACCESS_KEY=your-actual-access-key-here
MOMO_SECRET_KEY=your-actual-secret-key-here
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=http://localhost:3000/payment/momo/callback
MOMO_IPN_URL=http://localhost:5000/api/v1/payment/momo/ipn

# Subscription Plans (in VND)
PLAN_BASIC_PRICE=0
PLAN_PREMIUM_PRICE=2500000
PLAN_ENTERPRISE_PRICE=5000000

# JWT Configuration (change these!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=30d
```

**Important Security Notes:**
- Replace all `your-actual-*-here` values with real credentials
- Generate strong JWT secrets: `openssl rand -base64 32`
- Never commit `.env` file to version control

### 3. Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
✓ Server started successfully
ℹ Environment: development
ℹ Server running on http://localhost:5000
ℹ Health check: http://localhost:5000/health
ℹ API endpoint: http://localhost:5000/api/v1
```

### 4. Verify Backend Endpoints

Test the payment endpoints:

```bash
# Get payment plans
curl http://localhost:5000/api/v1/payment/plans

# Get VNPay banks
curl http://localhost:5000/api/v1/payment/vnpay/banks
```

---

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure API URL

If your backend is not on `localhost:5000`, update the API URL in:
- `frontend/src/app/payment/page.jsx`
- `frontend/src/app/payment/vnpay/callback/page.jsx`
- `frontend/src/app/payment/momo/callback/page.jsx`

Change `http://localhost:5000` to your backend URL.

### 3. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Expected output:
```
  ▲ Next.js 16.1.1
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.x:3000

 ✓ Ready in 2.5s
```

### 4. Access the Application

Open your browser and navigate to:
- **Home**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Payment**: http://localhost:3000/payment
- **Dashboard**: http://localhost:3000/dashboard/overview

---

## 💳 Payment Gateway Registration

### VNPay Registration

1. **Visit VNPay Website**
   - Go to: https://vnpay.vn/
   - Click "Đăng ký" (Register)

2. **Create Merchant Account**
   - Fill in company information
   - Submit business documents
   - Wait for approval (2-3 days)

3. **Get Sandbox Credentials**
   - Login to merchant portal
   - Go to "Sandbox" section
   - Copy TMN Code and Hash Secret

4. **Test with Demo Cards**
   ```
   Card Number: 9704198526191432198
   Card Holder: NGUYEN VAN A
   Expiry Date: 07/15
   OTP: 123456
   ```

### Momo Registration

1. **Visit Momo Business Portal**
   - Go to: https://business.momo.vn/
   - Click "Đăng ký" (Register)

2. **Create Business Account**
   - Fill in business information
   - Submit required documents
   - Wait for verification

3. **Access Developer Portal**
   - Login to business account
   - Go to "Developer" section
   - Create new application

4. **Get Test Credentials**
   - Copy Partner Code
   - Copy Access Key
   - Copy Secret Key

5. **Configure Webhook URLs**
   - Return URL: `http://localhost:3000/payment/momo/callback`
   - IPN URL: `http://localhost:5000/api/v1/payment/momo/ipn`

---

## 🧪 Testing the Application

### 1. Create a Test Account

```bash
# Register via frontend
Open http://localhost:3000/register

# Or use this test account (if pre-seeded)
Email: test@example.com
Password: Test123456
```

### 2. Test VNPay Payment Flow

1. Login to your account
2. Navigate to http://localhost:3000/payment
3. Select **Premium** plan (2,500,000 VND)
4. Choose **VNPay** as payment method
5. Select a bank (e.g., "Thanh toán qua ATM/Tài khoản nội địa")
6. Click "Thanh toán ngay"
7. On VNPay page:
   - Enter test card: `9704198526191432198`
   - Card holder: `NGUYEN VAN A`
   - Expiry: `07/15`
   - OTP: `123456`
8. Confirm payment
9. You'll be redirected to success page

### 3. Test Momo Payment Flow

1. Navigate to http://localhost:3000/payment
2. Select **Premium** plan
3. Choose **Momo** as payment method
4. Click "Thanh toán ngay"
5. On Momo page:
   - Scan QR code with Momo app (test mode)
   - Or click deeplink to open Momo app
6. Confirm payment in app
7. You'll be redirected to success page

### 4. Verify Transaction

Check transaction in dashboard:
- Go to http://localhost:3000/dashboard/settings/billing
- View transaction history
- Check subscription status

### 5. Test IPN Webhooks

For local testing, you need to expose your local server to the internet:

```bash
# Install ngrok
npm install -g ngrok

# Expose backend
ngrok http 5000

# Update IPN URLs in .env with ngrok URL
VNPAY_IPN_URL=https://your-ngrok-url.ngrok.io/api/v1/payment/vnpay/ipn
MOMO_IPN_URL=https://your-ngrok-url.ngrok.io/api/v1/payment/momo/ipn
```

Then test payment again and check backend logs for IPN calls.

---

## 🚀 Production Deployment

### 1. Prepare for Production

#### Update Environment Variables

```env
# Production URLs
NODE_ENV=production
PORT=5000

# VNPay Production
VNPAY_TMN_CODE=your-production-tmn-code
VNPAY_HASH_SECRET=your-production-hash-secret
VNPAY_URL=https://vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=https://yourdomain.com/payment/vnpay/callback
VNPAY_IPN_URL=https://api.yourdomain.com/api/v1/payment/vnpay/ipn

# Momo Production
MOMO_PARTNER_CODE=your-production-partner-code
MOMO_ACCESS_KEY=your-production-access-key
MOMO_SECRET_KEY=your-production-secret-key
MOMO_ENDPOINT=https://payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=https://yourdomain.com/payment/momo/callback
MOMO_IPN_URL=https://api.yourdomain.com/api/v1/payment/momo/ipn

# Strong Production Secrets
JWT_SECRET=generate-with-openssl-rand-base64-32
JWT_REFRESH_SECRET=generate-with-openssl-rand-base64-32
```

#### Update Frontend API URLs

Replace all `http://localhost:5000` with your production API URL in:
- `frontend/src/app/payment/page.jsx`
- `frontend/src/app/payment/vnpay/callback/page.jsx`
- `frontend/src/app/payment/momo/callback/page.jsx`

Better approach: Create environment variable:
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
```

### 2. Deploy Backend

#### Option A: Deploy to Railway/Render/Heroku

```bash
# Install Railway CLI
npm install -g railway

# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# Set environment variables
railway variables
```

#### Option B: Deploy to VPS (Ubuntu)

```bash
# SSH to your server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone your-repo-url
cd CEO-AI-Assistant/backend

# Install dependencies
npm install --production

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start src/server.js --name ceo-ai-backend
pm2 save
pm2 startup

# Setup Nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/ceo-ai

# Nginx config:
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/ceo-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### 3. Deploy Frontend

#### Option A: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

#### Option B: Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build
cd frontend
npm run build

# Deploy
netlify deploy --prod
```

### 4. Configure Payment Gateways for Production

#### VNPay

1. Login to VNPay merchant portal
2. Submit application for production access
3. Provide business license and documents
4. Update merchant settings with production URLs
5. Get production credentials
6. Configure webhook URL in VNPay dashboard

#### Momo

1. Login to Momo business portal
2. Switch to production environment
3. Update application settings
4. Set Return URL and IPN URL to production
5. Submit for review
6. Get production credentials after approval

### 5. Post-Deployment Checklist

- [ ] SSL certificates installed (HTTPS)
- [ ] Environment variables set correctly
- [ ] Payment gateway webhooks configured
- [ ] Test payment flow end-to-end
- [ ] Monitor server logs for errors
- [ ] Set up error tracking (Sentry)
- [ ] Configure backup strategy
- [ ] Set up monitoring alerts
- [ ] Test IPN webhook delivery
- [ ] Verify email notifications
- [ ] Check transaction storage
- [ ] Test subscription activation
- [ ] Verify all API endpoints
- [ ] Check CORS configuration
- [ ] Test from different devices
- [ ] Verify mobile responsiveness

---

## 🔍 Troubleshooting

### Common Issues

#### 1. "Invalid signature" error

**Problem**: Payment callback returns invalid signature error.

**Solution**:
- Verify Hash Secret / Secret Key is correct
- Check for extra spaces in environment variables
- Ensure using correct algorithm (SHA512 for VNPay, SHA256 for Momo)
- Verify parameter order matches documentation

#### 2. IPN not received

**Problem**: Backend doesn't receive IPN from payment gateway.

**Solution**:
- Check if IPN URL is publicly accessible
- Use ngrok for local testing
- Verify URL is registered in payment gateway dashboard
- Check server firewall settings
- Look at payment gateway logs for failed IPN attempts

#### 3. Payment URL not working

**Problem**: Redirected to payment gateway shows error.

**Solution**:
- Verify TMN Code / Partner Code is correct
- Check if using sandbox vs production URL correctly
- Ensure amount is greater than 0
- Verify all required parameters are provided

#### 4. Transaction not updating after payment

**Problem**: User pays but subscription not activated.

**Solution**:
- Check if IPN handler is working
- Verify transaction ID matches in database
- Check server logs for errors
- Ensure IPN URL is reachable
- Look for race conditions (IPN vs return URL)

#### 5. CORS errors in frontend

**Problem**: Frontend can't call backend API.

**Solution**:
- Update CORS_ORIGIN in backend .env
- Add your frontend URL to allowed origins
- Check backend CORS middleware configuration
- Verify API URL is correct in frontend

#### 6. "Unauthorized" error when creating payment

**Problem**: API returns 401 Unauthorized.

**Solution**:
- Check if JWT token is stored in localStorage
- Verify token is sent in Authorization header
- Ensure token hasn't expired
- Check if user is logged in
- Verify JWT_SECRET matches between environments

### Debug Mode

Enable debug logging:

```env
# Backend .env
LOG_LEVEL=debug
NODE_ENV=development
```

Check logs:
```bash
# Backend console logs
cd backend
npm run dev

# PM2 logs (production)
pm2 logs ceo-ai-backend
```

### Testing Tools

```bash
# Test API endpoints
curl -X POST http://localhost:5000/api/v1/payment/vnpay/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount": 2500000, "plan": "premium"}'

# Check backend health
curl http://localhost:5000/health

# Test IPN endpoint (simulate)
curl -X GET "http://localhost:5000/api/v1/payment/vnpay/ipn?vnp_TxnRef=ORDER_123&vnp_ResponseCode=00"
```

---

## 📚 Additional Resources

### Documentation

- **VNPay**: https://sandbox.vnpayment.vn/apis/docs/
- **Momo**: https://developers.momo.vn/
- **Backend Payment Integration**: See `backend/PAYMENT_INTEGRATION.md`

### Support

- VNPay Support: merchant.care@vnpay.vn / 1900 555 577
- Momo Support: merchant.care@momo.vn / 1900 636 652

### Next Steps

1. **Connect Real Database**
   - Set up MongoDB Atlas
   - Update connection string in `.env`
   - Implement MongoDB schemas

2. **Add Email Notifications**
   - Configure SMTP settings
   - Send payment receipts
   - Send subscription confirmations

3. **Implement Analytics**
   - Track payment conversions
   - Monitor failed payments
   - Analyze subscription metrics

4. **Add More Features**
   - Refund functionality
   - Subscription upgrades/downgrades
   - Payment history export
   - Invoice generation

---

## ✅ Success Checklist

Your application is ready to earn money when:

- [ ] Backend and frontend deployed to production
- [ ] VNPay production credentials configured
- [ ] Momo production credentials configured
- [ ] SSL certificates active (HTTPS)
- [ ] Payment flow tested end-to-end
- [ ] IPN webhooks working correctly
- [ ] Subscriptions activating properly
- [ ] Email notifications sending
- [ ] Terms of Service and Privacy Policy published
- [ ] Customer support system ready
- [ ] Monitoring and alerts configured
- [ ] Backup strategy implemented

**Congratulations!** 🎉 Your CEO AI Assistant is now ready to accept payments and generate revenue!

---

## 📄 License

This project is part of CEO AI Assistant.

For questions or support, please contact your development team.
