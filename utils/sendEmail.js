const nodemailer = require('nodemailer');

// Create Mailtrap transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

// Email templates
const emailTemplates = {
  verifyEmail: (username, verifyLink) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; font-size: 12px; color: #666; padding: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>PLT Shop - Email Verification</h1>
        </div>
        <div class="content">
          <p>Hello ${username},</p>
          <p>Thank you for registering with PLT Shop! Please verify your email address by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="${verifyLink}" class="button">Verify Email</a>
          </p>
          <p>If you did not create an account, please ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 PLT Shop. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  resetPassword: (username, resetLink) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; font-size: 12px; color: #666; padding: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>PLT Shop - Password Reset</h1>
        </div>
        <div class="content">
          <p>Hello ${username},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </p>
          <p>If you did not request this, please ignore this email.</p>
          <p>This link will expire in 30 minutes.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 PLT Shop. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  orderConfirmation: (orderCode, customerName, items, totalAmount) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #e9ecef; }
        .footer { text-align: center; font-size: 12px; color: #666; padding: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation - ${orderCode}</h1>
        </div>
        <div class="content">
          <p>Hello ${customerName},</p>
          <p>Thank you for your order! Your order has been received and is being processed.</p>
          <h3>Order Details:</h3>
          <table>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
            ${items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toLocaleString()} VND</td>
              </tr>
            `).join('')}
            <tr style="font-weight: bold;">
              <td colspan="2">Total</td>
              <td>${totalAmount.toLocaleString()} VND</td>
            </tr>
          </table>
          <p>We will send you a shipping notification with tracking information once your order ships.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 PLT Shop. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  orderStatusUpdate: (orderCode, customerName, newStatus) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; font-size: 12px; color: #666; padding: 20px; }
        .status { font-size: 18px; font-weight: bold; color: #17a2b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Status Update</h1>
        </div>
        <div class="content">
          <p>Hello ${customerName},</p>
          <p>Your order ${orderCode} status has been updated.</p>
          <p>New Status: <span class="status">${newStatus}</span></p>
          <p>We will keep you updated on your order progress.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 PLT Shop. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  contactConfirmation: (customerName, subject, message) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ff6b35; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .message-box { background: white; border-left: 4px solid #ff6b35; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; font-size: 12px; color: #666; padding: 20px; }
        .contact-info { background: #e9ecef; padding: 15px; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>PLT Shop - Xác Nhận Liên Hệ</h1>
        </div>
        <div class="content">
          <p>Xin chào ${customerName},</p>
          <p>Cảm ơn bạn đã liên hệ với PLT Shop! Chúng tôi đã nhận được tin nhắn của bạn và sẽ sớm phản hồi trong thời gian sớm nhất.</p>
          
          <div class="message-box">
            <h3 style="margin-top: 0; color: #ff6b35;">Nội dung liên hệ của bạn:</h3>
            <p><strong>Chủ đề:</strong> ${subject}</p>
            <p><strong>Tin nhắn:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>

          <p>Chúng tôi sẽ phản hồi qua email này trong vòng 24-48 giờ làm việc.</p>

          <div class="contact-info">
            <h4 style="margin-top: 0;">Thông tin liên hệ:</h4>
            <p style="margin: 5px 0;"><strong>📍 Địa chỉ:</strong> 12 Trinh Dinh Thao, Tan Phu, Ho Chi Minh City</p>
            <p style="margin: 5px 0;"><strong>📧 Email:</strong> pltshop@gmail.com</p>
            <p style="margin: 5px 0;"><strong>📞 Điện thoại:</strong> 0978853110</p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2024 PLT Shop. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
};

// Send email function
const sendEmail = async (to, subject, template) => {
  try {
    const mailOptions = {
      from: `${process.env.MAILTRAP_FROM_NAME} <${process.env.MAILTRAP_FROM_EMAIL}>`,
      to,
      subject,
      html: template
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  emailTemplates
};
