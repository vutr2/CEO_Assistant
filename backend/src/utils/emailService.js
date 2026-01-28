const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('./logger');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST || 'smtp.gmail.com',
  port: config.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    logger.error('Email transporter verification failed:', error);
  } else {
    logger.info('Email server is ready to send messages');
  }
});

/**
 * Send email verification
 */
const sendVerificationEmail = async (email, token, name) => {
  const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"CEO Assistant" <${config.SMTP_USER}>`,
    to: email,
    subject: 'Xác thực email - CEO Assistant',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Chào mừng đến với CEO Assistant!</h1>
          </div>
          <div class="content">
            <p>Xin chào <strong>${name}</strong>,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản CEO Assistant. Để hoàn tất quá trình đăng ký, vui lòng xác thực email của bạn bằng cách nhấp vào nút bên dưới:</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Xác thực Email</a>
            </p>
            <p>Hoặc copy và paste link sau vào trình duyệt:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p><strong>Lưu ý:</strong> Link này sẽ hết hạn sau 24 giờ.</p>
            <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
            <p>Trân trọng,<br>Đội ngũ CEO Assistant</p>
          </div>
          <div class="footer">
            <p>© 2026 CEO Assistant. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, token, name) => {
  const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"CEO Assistant" <${config.SMTP_USER}>`,
    to: email,
    subject: 'Đặt lại mật khẩu - CEO Assistant',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Đặt lại mật khẩu</h1>
          </div>
          <div class="content">
            <p>Xin chào <strong>${name}</strong>,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấp vào nút bên dưới để tạo mật khẩu mới:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
            </p>
            <p>Hoặc copy và paste link sau vào trình duyệt:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Lưu ý bảo mật:</strong>
              <ul>
                <li>Link này sẽ hết hạn sau 1 giờ</li>
                <li>Không chia sẻ link này với bất kỳ ai</li>
                <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
              </ul>
            </div>
            <p>Trân trọng,<br>Đội ngũ CEO Assistant</p>
          </div>
          <div class="footer">
            <p>© 2026 CEO Assistant. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"CEO Assistant" <${config.SMTP_USER}>`,
    to: email,
    subject: 'Chào mừng đến với CEO Assistant! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .features { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .feature-item { margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Chào mừng ${name}!</h1>
          </div>
          <div class="content">
            <p>Cảm ơn bạn đã xác thực email thành công!</p>
            <p>Bạn đã sẵn sàng để bắt đầu quản lý doanh nghiệp của mình một cách thông minh với CEO Assistant.</p>
            <div class="features">
              <h3>🎯 Những gì bạn có thể làm:</h3>
              <div class="feature-item">✅ Quản lý nhân sự và theo dõi hiệu suất</div>
              <div class="feature-item">📊 Theo dõi tài chính và doanh thu</div>
              <div class="feature-item">📈 Tạo báo cáo và phân tích dữ liệu</div>
              <div class="feature-item">🤖 Sử dụng AI để đưa ra quyết định thông minh</div>
            </div>
            <p style="text-align: center;">
              <a href="${config.FRONTEND_URL}/dashboard" class="button">Bắt đầu ngay</a>
            </p>
            <p>Nếu bạn cần hỗ trợ, đừng ngại liên hệ với chúng tôi!</p>
            <p>Chúc bạn thành công,<br>Đội ngũ CEO Assistant</p>
          </div>
          <div class="footer">
            <p>© 2026 CEO Assistant. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    logger.error('Error sending welcome email:', error);
    // Don't throw error for welcome email
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};
